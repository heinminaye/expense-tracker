import React, { useState } from "react";
import DateRangePicker from "../datepicker/daterangepicker";
import ExpenseModal from "./expensemodal";
import SinglePrintReceipt from "./singleprintreceipt";
import PrintAllReceipts from "./printallreceipts";
import { ExpenseItem } from "../types/expense";

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
        notes: "With cheese and bacon",
      },
      { name: "Drink", price: 5, quantity: 2, notes: "Iced tea with lemon" },
    ],
  },
  {
    id: 2,
    category: "General",
    expense: 10,
    date: "2025-04-02",
    detail: "Bus fare to client meeting",
    breakdownItems: [
      { name: "Bus ticket", price: 5, quantity: 2, notes: "Round trip" },
    ],
  },
  {
    id: 3,
    category: "General",
    expense: 50,
    date: "2025-04-03",
    detail: "Weekly groceries",
    breakdownItems: [
      { name: "Vegetables", price: 20, quantity: 1, notes: "Organic produce" },
      { name: "Meat", price: 30, quantity: 1, notes: "Chicken breast" },
    ],
  },
  {
    id: 4,
    category: "Fuel",
    expense: 15,
    date: "2025-04-04",
    detail: "Movie ticket for new release",
    breakdownItems: [
      { name: "Ticket", price: 15, quantity: 1, notes: "Evening show" },
    ],
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
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredItems = expenses.filter((item) => {
    // Filter by date range
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(" to ");
      const itemDate = new Date(item.date);
      if (itemDate < new Date(startDate) || itemDate > new Date(endDate)) {
        return false;
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesMain =
        item.category.toLowerCase().includes(term) ||
        item.detail?.toLowerCase().includes(term) ||
        item.id.toString().includes(term);

      const matchesBreakdown = item.breakdownItems?.some(
        (breakdown) =>
          breakdown.name.toLowerCase().includes(term) ||
          breakdown.notes?.toLowerCase().includes(term)
      );

      return matchesMain || matchesBreakdown;
    }

    return true;
  });

  const totalAmount = filteredItems.reduce(
    (sum, item) => sum + item.expense,
    0
  );
  const breakdownTotal = filteredItems.reduce((sum, item) => {
    if (item.breakdownItems) {
      return (
        sum +
        item.breakdownItems.reduce(
          (itemSum, breakdown) =>
            itemSum + breakdown.price * breakdown.quantity,
          0
        )
      );
    }
    return sum + item.expense;
  }, 0);

  const handleAddExpense = (newExpense: Omit<ExpenseItem, "id">) => {
    const newItem: ExpenseItem = {
      id: expenses.length + 1,
      ...newExpense,
    };
    setExpenses([...expenses, newItem]);
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
    setExpandedItems(expandedItems.filter((itemId) => itemId !== id));
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
  };

  const toggleDropdown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const toggleExpandItem = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
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

  return (
    <div className="flex flex-col h-full p-4 bg-gray-50">
      <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b gap-4">
          <div className="w-full md:w-64">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search expenses..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Expense
            </button>
            <button
              onClick={() => setShowPrintAll(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                  clipRule="evenodd"
                />
              </svg>
              Print All
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={handlePrintSelected}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Print Selected ({selectedItems.length})
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="text-sm font-medium text-blue-800">
              Total Expenses
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${totalAmount.toFixed(2)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="text-sm font-medium text-green-800">
              Breakdown Total
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${breakdownTotal.toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="text-sm font-medium text-purple-800">
              Number of Items
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {filteredItems.length}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b">
                  <th className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="p-4 text-right text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="p-4 text-center text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      onClick={() => toggleExpandItem(item.id)}
                    >
                      <td
                        className="p-4 text-center"
                        onClick={(e) => toggleSelectItem(item.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => toggleSelectItem(item.id, e)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {item.category}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right font-medium text-gray-900">
                        ${item.expense.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
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
                    {expandedItems.includes(item.id) && (
                      <tr className="border-b">
                        <td colSpan={6} className="p-6 bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            {/* Expense Details */}
                            <div className="bg-white p-6 rounded-xl shadow border border-gray-200 min-h-48">
                              <h3 className="text-lg font-semibold text-blue-700 flex items-center mb-4 border-b pb-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2 text-blue-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Expense Details
                              </h3>
                              <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-700">
                                <div className="font-medium">Description:</div>
                                <div>{item.detail || "N/A"}</div>
                                <div className="font-medium">Date:</div>
                                <div>
                                  {new Date(item.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                                <div className="font-medium">Total Amount:</div>
                                <div className="font-semibold text-gray-900">
                                  ${item.expense.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Item Breakdown */}
                            {item.breakdownItems && (
                              <div className="bg-white p-6 rounded-xl shadow border border-gray-200 min-h-48">
                                <h3 className="text-lg font-semibold text-green-700 flex items-center mb-4 border-b pb-2">
                                  <svg
                                    className="h-5 w-5 mr-2 text-green-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Item Breakdown
                                </h3>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                      <tr>
                                        <th className="px-3 py-2 text-left">
                                          Item
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                          Qty
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                          Price
                                        </th>
                                        <th className="px-3 py-2 text-right">
                                          Subtotal
                                        </th>
                                        <th className="px-3 py-2 text-left">
                                          Notes
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                      {item.breakdownItems.map(
                                        (breakdown, idx) => (
                                          <tr
                                            key={idx}
                                            className="hover:bg-gray-50"
                                          >
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                              {breakdown.name}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                              {breakdown.quantity}
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-700">
                                              ${breakdown.price.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                              $
                                              {(
                                                breakdown.price *
                                                breakdown.quantity
                                              ).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600 italic">
                                              {breakdown.notes || "-"}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
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
