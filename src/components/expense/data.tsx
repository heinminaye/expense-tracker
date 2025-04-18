import React, { useEffect, useState } from "react";
import DateRangePicker from "../datepicker/daterangepicker";
import ExpenseModal from "./expensemodal";
import SinglePrintReceipt from "./singleprintreceipt";
import PrintAllReceipts from "./printallreceipts";
import { ExpenseItem } from "../types/expense";
import {
  FaChevronDown,
  FaChevronRight,
  FaFilter,
  FaPrint,
  FaPlus,
  FaSearch,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const initialDataItems: ExpenseItem[] = [
  {
    id: 1,
    category: "Food",
    expense: 20,
    date: "2025-04-01",
    detail: "Lunch at a restaurant with colleagues",
    breakdownItems: [
      {
        name: "Burger",
        price: 10,
        quantity: 2,
      },
      { name: "Drink", price: 5, quantity: 2 },
    ],
  },
  {
    id: 2,
    category: "General",
    expense: 10,
    date: "2025-04-02",
    detail: "ဟယ်လို",
    breakdownItems: [{ name: "Bus ticket", price: 5, quantity: 2 }],
  },
  {
    id: 3,
    category: "General",
    expense: 50,
    date: "2025-04-03",
    detail: "Weekly groceries",
    breakdownItems: [
      { name: "Vegetables", price: 20, quantity: 1 },
      { name: "Meat", price: 30, quantity: 1 },
    ],
  },
  {
    id: 4,
    category: "Fuel",
    expense: 15,
    date: "2025-04-04",
    detail: "Movie ticket for new release",
    breakdownItems: [{ name: "Ticket", price: 15, quantity: 1 }],
  },
  {
    id: 5,
    category: "Fuel",
    expense: 120,
    date: "2025-04-05",
    detail: "Electricity bill payment",
  },
];

const Data: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialDataItems);
  const [dateRange, setDateRange] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [itemToPrint, setItemToPrint] = useState<ExpenseItem | null>(null);
  const [showPrintAll, setShowPrintAll] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = expenses.filter((item) => {
    // Filter by date range
    if (dateRange) {
      const [startDateStr, endDateStr] = dateRange.split(" to ");

      // Create date objects at the start and end of the day
      const startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);

      const itemDate = new Date(item.date);
      itemDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

      return itemDate >= startDate && itemDate <= endDate;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesMain =
        item.category.toLowerCase().includes(term) ||
        item.detail?.toLowerCase().includes(term) ||
        item.id.toString().includes(term);

      const matchesBreakdown = item.breakdownItems?.some((breakdown) =>
        breakdown.name.toLowerCase().includes(term)
      );

      return matchesMain || matchesBreakdown;
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange, filteredItems.length]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalAmount = filteredItems.reduce(
    (sum, item) => sum + item.expense,
    0
  );
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

  const handleAddExpense = (newExpense: Omit<ExpenseItem, "id">) => {
    const newItem: ExpenseItem = {
      id: expenses.length + 1,
      ...newExpense,
    };
    setExpenses((prev) => [...prev, newItem]);
    setShowModal(false);
  };

  const handleUpdateExpense = (updatedExpense: ExpenseItem) => {
    setExpenses(
      expenses.map((item) =>
        item.id === updatedExpense.id ? updatedExpense : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter((item) => item.id !== id));
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
  };

  const toggleSelectItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  const handlePrintSelected = () => {
    if (selectedItems.length === 0) return;
    const itemsToPrint = expenses.filter((item) =>
      selectedItems.includes(item.id)
    );
    setShowPrintAll(true);
  };

  const toggleRowExpand = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="flex flex-col h-full md:min-h-[550px] min-h-[850px]  p-4 bg-gray-50">
      <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b bg-white dark:bg-zinc-900 dark:border-zinc-700">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-64">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
             {/* Filter Button */}
            <button className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm text-gray-700 dark:text-white dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800">
              <FaFilter className="h-4 w-4" />
              <span className="sm:inline">Filters</span>
            </button>
            <div className="relative w-full sm:w-52">
              <FaSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-md text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Right section: Action buttons */}
          <div className="flex flex-wrap items-center gap-2 justify-end w-full lg:w-auto">
            {/* Add Expense */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-all"
            >
              <FaPlus className="h-4 w-4" />
              <span className="sm:inline">Add</span>
            </button>

            {/* Print All */}
            <button
              onClick={() => setShowPrintAll(true)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-all"
            >
              <FaPrint className="h-4 w-4" />
              <span className="sm:inline">Print All</span>
            </button>

            {/* Print Selected */}
            {selectedItems.length > 0 && (
              <button
                onClick={handlePrintSelected}
                className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-all"
              >
                <FaPrint className="h-4 w-4" />
                <span className="sm:inline">
                  Selected ({selectedItems.length})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition duration-300">
            <div className="text-xs font-semibold text-blue-700 mb-1">
              Total Expenses
            </div>
            <div className="text-xl font-bold text-blue-600">
              ${totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition duration-300">
            <div className="text-xs font-semibold text-green-700 mb-1">
              Remaining
            </div>
            <div className="text-xl font-bold text-green-600">
              ${(100000).toFixed(2)}
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition duration-300">
            <div className="text-xs font-semibold text-purple-700 mb-1">
              Number of Items
            </div>
            <div className="text-xl font-bold text-purple-600">
              {filteredItems.length}
            </div>
          </div>
        </div>

        {/* Enhanced Nested Table */}
        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white mx-4 mb-4 shadow-sm">
          <div className={`h-full overflow-auto ${paginatedItems.length > 0 ? "pb-14" : ""}`}>
            <table className={`w-full ${paginatedItems.length > 0 ? "h-auto" : "h-full"}`}>
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="w-12 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"></th>
                  <th className="w-12 px-4 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="w-14 px-4 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Expense
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <React.Fragment key={item.id}>
                      {/* Main Row */}
                      <tr
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          expandedRows[item.id] ? "bg-blue-50" : "bg-white"
                        }`}
                        onClick={() => toggleRowExpand(item.id)}
                      >
                        <td className="whitespace-nowrap text-center items-center px-4">
                          <button
                            onClick={() => toggleRowExpand(item.id)}
                            className="text-gray-500 h-3 w-4 text-sm cursor-pointer"
                          >
                            {expandedRows[item.id] ? (
                              <FaChevronDown />
                            ) : (
                              <FaChevronRight />
                            )}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => toggleSelectItem(item.id, e)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          {item.id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {item.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <span className="font-medium text-sm text-gray-800">
                            ${item.expense.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(item);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-100 transition-colors"
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToPrint(item);
                              }}
                              className="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-100 transition-colors"
                              title="Print"
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
                                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExpense(item.id);
                              }}
                              className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-100 transition-colors"
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

                      {/* Expanded Content */}
                      {expandedRows[item.id] && (
                        <tr className="bg-blue-50">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="ml-8 mr-14 pl-3">
                              <div className="px-3 py-2 mb-2 text-sm font-medium rounded-sm bg-gray-50 border-l-4 border-blue-600 italic text-gray-800 shadow-sm">
                                <strong>Notes:</strong> {item.detail || "-"}
                              </div>
                              {/* Breakdown Items */}
                              {item.breakdownItems &&
                              item.breakdownItems.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                          ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                          Item
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                          Qty
                                        </th>
                                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                      {item.breakdownItems.map(
                                        (breakdown, idx) => (
                                          <tr
                                            key={idx}
                                            className="hover:bg-gray-50 transition-colors"
                                          >
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                              {idx + 1}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                              <div className="flex items-center">
                                                <div className="">
                                                  {breakdown.name}
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {breakdown.quantity}
                                              </span>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                              ${breakdown.price.toFixed(2)}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                      {/* Subtotal Row */}
                                      <tr className="bg-gray-50">
                                        <td
                                          colSpan={3}
                                          className="px-4 py-2 text-right text-sm font-medium text-gray-700"
                                        >
                                          Subtotal:
                                        </td>
                                        <td className="px-3 py-2 text-right text-sm font-bold text-gray-900">
                                          $
                                          {item.breakdownItems
                                            .reduce(
                                              (sum, item) => sum + item.price,
                                              0
                                            )
                                            .toFixed(2)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-sm text-gray-500 italic">
                                  No breakdown items available
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-400"
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
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No expenses found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm || dateRange
                            ? "Try adjusting your search or filter criteria"
                            : "Get started by adding a new expense"}
                        </p>
                        {!(searchTerm || dateRange) && (
                          <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                            Add Expense
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
            <div className="sticky bottom-0 z-20 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 px-4 py-3 sm:px-6 shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                <div className="inline-flex flex-wrap items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 py-2 rounded-md text-md text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 border hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
                          className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700"
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
                    className="px-2 py-2 rounded-md text-md text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 border hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaAngleRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal (Add) */}
      <ExpenseModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddExpense}
      />

      {/* Expense Modal (Edit) */}
      {editingItem && (
        <ExpenseModal
          show={true}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateExpense}
          initialData={editingItem}
          isEditMode={true}
        />
      )}

      {/* Print Single Receipt */}
      {itemToPrint && (
        <SinglePrintReceipt
          expense={itemToPrint}
          onClose={() => setItemToPrint(null)}
        />
      )}

      {/* Print All Receipts */}
      {showPrintAll && (
        <PrintAllReceipts
          expenses={
            selectedItems.length > 0
              ? expenses.filter((item) => selectedItems.includes(item.id))
              : filteredItems
          }
          dateRange={dateRange}
          totalAmount={
            selectedItems.length > 0
              ? expenses
                  .filter((item) => selectedItems.includes(item.id))
                  .reduce((sum, item) => sum + item.expense, 0)
              : totalAmount
          }
          onClose={() => {
            setShowPrintAll(false);
            setSelectedItems([]);
          }}
        />
      )}
    </div>
  );
};

export default Data;
