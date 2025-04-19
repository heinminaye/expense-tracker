import React, { useState, useEffect, useRef } from "react";
import { ExpenseItem, BreakdownItem } from "../types/expense";
import SingleDatePicker from "../datepicker/singledatepicker";

interface ExpenseModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseItem, "id">) => void;
  initialData?: Omit<ExpenseItem, "id">;
  isEditMode?: boolean;
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
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
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
  }, [show, onClose]);

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
    const total = items.reduce((sum, item) => sum + item.price, 0);
    setNewExpense((prev) => ({ ...prev, expense: total }));
  };

  const handleBreakdownItemChange = (
    index: number,
    field: keyof BreakdownItem,
    value: string | number
  ) => {
    if (field === "quantity") {
      const stringValue = String(value);

      if (
        !/^\d+[\u1000-\u109Fa-zA-Z]*$/.test(stringValue) &&
        stringValue !== ""
      ) {
        // If invalid, don't update the state
        return;
      }
    }

    if (field === "price") {
      if (typeof value === "string") {
        value = parseFloat(value) || 0;
      }
    }

    const updatedItems = [...breakdownItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "price"
          ? Number(value)
          : field === "quantity"
          ? value
          : value,
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

  // Format number with commas (e.g., 1234567.89 → "1,234,567.89")
  const formatNumberWithCommas = (num: number): string => {
    return num.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 transition-opacity duration-300 bg-black bg-opacity-70">
      <div
        className="rounded-xl fixed shadow-xl z-40 w-full max-w-4xl flex flex-col min-h-[80vh] max-h-[80vh] overflow-hidden transition-all duration-300 transform bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
        ref={modalRef}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-bold">
            {isEditMode ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
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
          className="flex-1 flex flex-col sm:overflow-hidden overflow-auto"
        >
          <div className="flex-1 flex flex-col overflow-visible p-4">
            <div className="grid sm:grid-cols-3 grid-col-1 gap-4 h-full">
              {/* Left Side - Basic Information */}
              <div className="flex flex-col sm:col-span-1 col-span-2  h-full space-y-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                          : "border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <SingleDatePicker
                    value={newExpense.date}
                    onChange={(date) => setNewExpense({ ...newExpense, date })}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                  )}
                </div>

                {/* Notes - Takes remaining space */}
                <div className="flex-1 flex flex-col min-h-[150px]">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    General Notes
                  </label>
                  <div className="flex-1">
                    <textarea
                      value={newExpense.detail}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, detail: e.target.value })
                      }
                      className="w-full h-full resize-none py-2 px-3 rounded-md border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Additional notes about this expense"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Items Breakdown */}
              <div className="flex flex-col col-span-2 h-full">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Items Breakdown
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBreakdownItem}
                    disabled={!newExpense.category}
                    className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      newExpense.category
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
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
                    <table className="min-w-full divide-y dark:divide-gray-500 text-md">
                      <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            ID
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Item
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Qty
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Price
                          </th>
                          <th className="text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {breakdownItems.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                          >
                            <td className="px-1 py-1 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </td>
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
                                className={`w-full p-2 leading-3 rounded border dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm ${
                                  errors.breakdown && !item.name
                                    ? "border-red-400 focus:ring-red-300"
                                    : "border-gray-300 focus:border-blue-500 dark:border-gray-600"
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
                                className="w-20 md:w-24 p-2 leading-3 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                disabled={!newExpense.category}
                              />
                            </td>
                            <td className="px-1 py-1 whitespace-nowrap">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    $
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={
                                    item.price !== undefined &&
                                    item.price !== null &&
                                    !isNaN(item.price)
                                      ? formatNumberWithCommas(item.price)
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^0-9.]/g,
                                      ""
                                    );
                                    const parsedValue =
                                      parseFloat(rawValue) || 0;
                                    handleBreakdownItemChange(
                                      index,
                                      "price",
                                      parsedValue
                                    );
                                  }}
                                  className={`block w-full pl-6 pr-1 py-2 leading-3 rounded border dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm ${
                                    errors.breakdown && item.price <= 0
                                      ? "border-red-400 focus:ring-red-300"
                                      : "border-gray-300 focus:border-blue-500 dark:border-gray-600"
                                  }`}
                                  placeholder="0"
                                  disabled={!newExpense.category}
                                />
                              </div>
                            </td>
                            <td className="px-1 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveBreakdownItem(index)}
                                disabled={!newExpense.category}
                                className={`p-1 pr-2 rounded transition-all duration-200 ${
                                  !newExpense.category
                                    ? "text-gray-300 cursor-not-allowed dark:text-gray-600"
                                    : "text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-gray-700"
                                }`}
                                aria-label="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zm3-9a1 1 0 012 0v6a1 1 0 01-2 0V10zm4 0a1 1 0 012 0v6a1 1 0 01-2 0V10z" />
                                  <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
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
          <div className="sticky bottom-0 z-20 bg-white">
            <div className="p-3 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="p-2 rounded border mb-3 bg-blue-50 border-blue-200 dark:bg-gray-700 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                    Total
                  </span>
                  <span className="text-base font-bold text-blue-700 dark:text-blue-400">
                    {newExpense.expense.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all duration-200 text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-500 dark:focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all duration-200 text-sm bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  {isEditMode ? "Save Expense" : "Add Expense"}
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