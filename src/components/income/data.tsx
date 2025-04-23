import React, { useEffect, useState } from "react";
import DateRangePicker from "../datepicker/daterangepicker";
import IncomeModal from "./incomemodal";
import {
  FaFilter,
  FaPlus,
  FaSearch,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

interface IncomeItem {
  id: number;
  amount: number;
  date: string;
  note?: string;
  selected?: boolean;
}

const initialIncomeItems: IncomeItem[] = [
  {
    id: 1,
    amount: 1000,
    date: "2025-04-01",
    note: "Project completion payment",
  },
  {
    id: 2,
    amount: 500,
    date: "2025-04-05",
  },
  {
    id: 3,
    amount: 200,
    date: "2025-04-10",
    note: "Quarterly dividends",
  },
  {
    id: 4,
    amount: 1200,
    date: "2025-04-15",
  },
  {
    id: 5,
    amount: 800,
    date: "2025-04-20",
  },
];

const Income: React.FC = () => {
  const [incomes, setIncomes] = useState<IncomeItem[]>(initialIncomeItems);
  const [dateRange, setDateRange] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const filteredItems = incomes.filter((item) => {
    // Filter by date range
    if (dateRange) {
      const [startDateStr, endDateStr] = dateRange.split(" to ");
      const startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
      const itemDate = new Date(item.date);
      itemDate.setHours(12, 0, 0, 0);
      return itemDate >= startDate && itemDate <= endDate;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        item.source.toLowerCase().includes(term) ||
        (item.givenBy || "").toLowerCase().includes(term) ||
        (item.note || "").toLowerCase().includes(term)
      );
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
    const allSelected =
      filteredItems.length > 0 &&
      filteredItems.every((item) => selectedItems.includes(item.id));
    setIsAllSelected(allSelected);
  }, [
    searchTerm,
    dateRange,
    filteredItems.length,
    filteredItems,
    selectedItems,
  ]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleMultiDelete = () => {
    setIncomes((prev) =>
      prev.filter((item) => !selectedItems.includes(item.id))
    );
    setSelectedItems([]);
    setIsAllSelected(false);
  };

  const totalAmount = filteredItems.reduce((sum, item) => sum + item.amount, 0);

  const DOTS = "...";

  function getPaginationRange({ currentPage, totalPages }) {
    const siblingCount = 1;
    const totalNumbers = 5;

    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const range = Array.from(
        { length: 3 + 2 * siblingCount },
        (_, i) => i + 1
      );
      return [...range, DOTS, totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const range = Array.from(
        { length: 3 + 2 * siblingCount },
        (_, i) => totalPages - (3 + 2 * siblingCount) + 1 + i
      );
      return [1, DOTS, ...range];
    }

    if (showLeftDots && showRightDots) {
      const range = Array.from(
        { length: 2 * siblingCount + 1 },
        (_, i) => leftSibling + i
      );
      return [1, DOTS, ...range, DOTS, totalPages];
    }

    return [];
  }

  const handleAddIncome = (newIncome: Omit<IncomeItem, "id">) => {
    const newItem: IncomeItem = {
      id:
        incomes.length > 0
          ? Math.max(...incomes.map((item) => item.id)) + 1
          : 1,
      ...newIncome,
    };
    setIncomes((prev) => [newItem, ...prev]);
    setShowModal(false);
    setCurrentPage(1);
  };

  const handleUpdateIncome = (updatedIncome: IncomeItem) => {
    setIncomes(
      incomes.map((item) =>
        item.id === updatedIncome.id ? updatedIncome : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteIncome = (id: number) => {
    setIncomes(incomes.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  return (
    <div className="flex flex-col h-full md:min-h-[550px] min-h-[900px] p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b bg-white dark:bg-slate-800 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-64">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
            <div className="relative w-full sm:w-52">
              <FaSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 " />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <FaFilter className="h-4 w-4 text-gray-400 " />
              <span className="sm:inline">Filters</span>
            </button>
          </div>

          {/* Right section: Action buttons */}
          <div className="flex flex-wrap items-center gap-2 justify-end w-full lg:w-auto">
            {selectedItems.length > 0 && (
              <button
                onClick={handleMultiDelete}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="sm:inline">
                  Delete ({selectedItems.length})
                </span>
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-all"
            >
              <FaPlus className="h-4 w-4" />
              <span className="sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition duration-300">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
              Total Income
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {totalAmount.toLocaleString()}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition duration-300">
            <div className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
              Expected
            </div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {(150000).toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition duration-300">
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
              Number of Items
            </div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {filteredItems.length}
            </div>
          </div>
        </div>

        {/* Income Table */}
        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 mx-4 mb-4 shadow-sm">
          <div
            className={`h-full overflow-auto ${
              paginatedItems.length > 0 ? "sm:pb-14 md:pb-15 pb-24" : ""
            }`}
          >
            <table
              className={`w-full ${
                paginatedItems.length > 0 ? "h-auto" : "h-full"
              }`}
            >
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="w-10 px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </th>
                  <th className="w-14 px-4 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-slate-800">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {item.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="font-medium text-sm text-gray-800 dark:text-white">
                          {item.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 dark:text-blue-400 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(item.id)}
                            className="text-red-600 dark:text-red-400 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-400 "
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                          No Income found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {searchTerm || dateRange
                            ? "Try adjusting your search or filter criteria"
                            : "Get started by adding a new income record"}
                        </p>
                        {!(searchTerm || dateRange) && (
                          <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                            Add Income
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="sticky bottom-0 z-20 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 shadow">
              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Pagination Info */}
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredItems.length
                    )}
                  </span>{" "}
                  of <span className="font-medium">{filteredItems.length}</span>{" "}
                  results
                </div>

                {/* Pagination Buttons */}
                <div className="inline-flex flex-wrap justify-center sm:justify-normal items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 py-2 rounded-md text-md dark:border-gray-400 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaAngleLeft />
                  </button>

                  {getPaginationRange({ currentPage, totalPages }).map(
                    (page, idx) =>
                      page === "..." ? (
                        <span
                          key={idx}
                          className="px-2 py-1.5 text-sm text-gray-400 dark:text-gray-500"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium border dark:border-gray-400 ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2 py-2 rounded-md text-md dark:border-gray-400 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaAngleRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Income Modal (Add) */}
      <IncomeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddIncome}
      />

      {/* Income Modal (Edit) */}
      {editingItem && (
        <IncomeModal
          show={true}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateIncome}
          initialData={editingItem}
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default Income;
