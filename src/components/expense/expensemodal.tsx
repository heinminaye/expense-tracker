import React, { useState, useEffect, useRef } from "react";
import { ExpenseItem, BreakdownItem } from "../types/expense";
import SingleDatePicker from "../datepicker/singledatepicker";

interface ExpenseModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseItem, "id">) => void;
  initialData?: Omit<ExpenseItem, "id">;
  isEditMode?: boolean;
  darkMode?: boolean;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  show,
  onClose,
  onSave,
  initialData = {
    category: "",
    expense: 0,
    date: new Date().toISOString().split("T")[0],
    detail: "",
    breakdownItems: [{ name: "", price: 0, quantity: 1 }],
  },
  isEditMode = false,
  darkMode = false,
}) => {
  const [newExpense, setNewExpense] =
    useState<Omit<ExpenseItem, "id">>(initialData);
  const [breakdownItems, setBreakdownItems] = useState<BreakdownItem[]>(
    initialData.breakdownItems || [{ name: "", price: 0, quantity: 1 }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, [show,onClose]);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newExpense.category) {
      newErrors.category = "Category is required";
    }

    if (!newExpense.date) {
      newErrors.date = "Date is required";
    }

    if (breakdownItems.some((item) => !item.name)) {
      newErrors.breakdown = "All items must have a name";
    }

    if (breakdownItems.some((item) => item.price <= 0)) {
      newErrors.breakdown = "All items must have a valid price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBreakdownItem = () => {
    setBreakdownItems([...breakdownItems, { name: "", price: 0, quantity: 1 }]);
  };

  const handleRemoveBreakdownItem = (index: number) => {
    const updatedItems = [...breakdownItems];
    updatedItems.splice(index, 1);
    setBreakdownItems(updatedItems);
    updateTotal(updatedItems);
  };

  const updateTotal = (items: BreakdownItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.price,
      0
    );
    setNewExpense((prev) => ({ ...prev, expense: total }));
  };

  const handleBreakdownItemChange = (
    index: number,
    field: keyof BreakdownItem,
    value: string | number
  ) => {
    if (field === 'quantity') {
      const stringValue = String(value);
      
      if (!/^\d+[\u1000-\u109Fa-zA-Z]*$/.test(stringValue) && stringValue !== '') {
        // If invalid, don't update the state
        return;
      }
  
    }

    if (field === "price") {
      const stringValue = String(value);
      if (!/^\d*\.?\d{0,2}$/.test(stringValue)) return;
      value = stringValue === "" ? 0 : parseFloat(stringValue);
    }

    const updatedItems = [...breakdownItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
      field === "price" ? Number(value) : 
      (field === "quantity" ? value : value),
    };

    setBreakdownItems(updatedItems);
    updateTotal(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const expenseToSave = {
      ...newExpense,
      breakdownItems: breakdownItems.filter((item) => item.name),
    };
    onSave(expenseToSave);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center p-4 transition-opacity duration-300 ${
        darkMode ? "bg-black bg-opacity-70" : "bg-black bg-opacity-70"
      }`}
    >
      <div
        className={`rounded-xl fixed shadow-xl z-40 w-full max-w-4xl flex flex-col min-h-[80vh] max-h-[80vh] overflow-hidden transition-all duration-300 transform ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`} ref={modalRef}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex justify-between items-center sticky top-0 ${
            darkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2 className="text-xl font-bold">
            {isEditMode ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors duration-200 ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
            aria-label="Close modal"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 flex flex-col overflow-visible p-4">
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Left Side - Basic Information */}
              <div className="flex flex-col col-span-1 h-full space-y-4">
                {/* Category */}
                <div className="space-y-1">
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={newExpense.category}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          category: e.target.value,
                        })
                      }
                      className={`appearance-none w-full py-2 px-3 rounded-md border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm ${
                        errors.category
                          ? "border-red-400 focus:ring-red-300"
                          : darkMode
                          ? "border-gray-600 bg-gray-700 focus:border-blue-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    >
                      <option value="">Select a category</option>
                      <option value="Food">Food</option>
                      <option value="General">General</option>
                      <option value="Fuel">Fuel</option>
                      <option value="Transport">Transport</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Utilities">Utilities</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="z-50 space-y-1">
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <SingleDatePicker
                    value={newExpense.date}
                    onChange={(date) => setNewExpense({ ...newExpense, date })}
                    darkMode={darkMode}
                    size="small"
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                  )}
                </div>

                {/* Notes - Takes remaining space */}
                <div className="flex-1 flex flex-col min-h-[150px]">
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    General Notes
                  </label>
                  <div className="flex-1">
                    <textarea
                      value={newExpense.detail}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, detail: e.target.value })
                      }
                      className={`w-full h-full resize-none p-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 focus:border-blue-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Additional notes about this expense"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Items Breakdown */}
              <div className="flex flex-col col-span-2 h-full">
                <div className="flex justify-between items-center mb-1">
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Items Breakdown
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBreakdownItem}
                    disabled={!newExpense.category}
                    className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      newExpense.category
                        ? darkMode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        : darkMode
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Item
                  </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="overflow-auto max-h-[280px] flex-1">
                    <table className="min-w-full divide-y text-md">
                      <thead
                        className={`sticky top-0 ${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        }`}
                      >
                        <tr>
                          <th
                            className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                              darkMode ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            Item
                          </th>
                          <th
                            className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                              darkMode ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            Qty
                          </th>
                          <th
                            className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                              darkMode ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            Price
                          </th>
                          <th
                            className={`text-right text-xs font-medium uppercase tracking-wider ${
                              darkMode ? "text-gray-300" : "text-gray-500"
                            }`}
                          ></th>
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y ${
                          darkMode
                            ? "divide-gray-700 bg-gray-800"
                            : "divide-gray-200 bg-white"
                        }`}
                      >
                        {breakdownItems.map((item, index) => (
                          <tr
                            key={index}
                            className={`${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-50"
                            } transition-colors duration-150`}
                          >
                            <td className="px-1 py-1 whitespace-nowrap">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  handleBreakdownItemChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 leading-3 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm ${
                                  errors.breakdown && !item.name
                                    ? "border-red-400 focus:ring-red-300"
                                    : darkMode
                                    ? "border-gray-600 bg-gray-700 focus:border-blue-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                                placeholder="Item name"
                                disabled={!newExpense.category}
                              />
                            </td>
                            <td className="px-1 py-1 whitespace-nowrap">
                              <input
                                type="text"
                                value={item.quantity || ""}
                                onChange={(e) =>
                                  handleBreakdownItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                pattern="^\d+[\u1000-\u109Fa-zA-Z]*$"
                                className={`w-full p-2 leading-3 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm ${
                                  darkMode
                                    ? "border-gray-600 bg-gray-700 focus:border-blue-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                                disabled={!newExpense.category}
                              />
                            </td>
                            <td className="px-1 py-1 whitespace-nowrap">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                  <span
                                    className={`text-sm ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    $
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={item.price || ""}
                                  onChange={(e) =>
                                    handleBreakdownItemChange(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  className={`block w-full pl-6 pr-1 py-2 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm ${
                                    errors.breakdown && item.price <= 0
                                      ? "border-red-400 focus:ring-red-300"
                                      : darkMode
                                      ? "border-gray-600 bg-gray-700 focus:border-blue-500"
                                      : "border-gray-300 focus:border-blue-500"
                                  }`}
                                  placeholder="0.00"
                                  disabled={!newExpense.category}
                                />
                              </div>
                            </td>
                            <td className="px-1 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveBreakdownItem(index)}
                                disabled={!newExpense.category}
                                className={`p-1 rounded transition-all duration-200 ${
                                  !newExpense.category
                                    ? darkMode
                                      ? "text-gray-600 cursor-not-allowed"
                                      : "text-gray-300 cursor-not-allowed"
                                    : darkMode
                                    ? "text-red-400 hover:text-red-300 hover:bg-gray-700"
                                    : "text-red-600 hover:text-red-800 hover:bg-red-50"
                                }`}
                                aria-label="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2h10a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0010 2H9zM5 8a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V8z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {errors.breakdown && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.breakdown}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Total and Submit/Cancel */}
          <div className="sticky bottom-0">
            <div
              className={`p-3 border-t ${
                darkMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`p-2 rounded border mb-3 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    Total
                  </span>
                  <span
                    className={`text-base font-bold ${
                      darkMode ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    ${newExpense.expense.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all duration-200 text-sm ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500 focus:ring-offset-gray-800"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all duration-200 text-sm ${
                    darkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-800"
                      : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                  }`}
                >
                  {isEditMode ? "Save" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
