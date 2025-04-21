import React, { useState, useEffect, useRef } from "react";
import { IncomeItem } from "../types/income";
import SingleDatePicker from "../datepicker/singledatepicker";

interface IncomeModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (income: Omit<IncomeItem, "id">) => void;
  initialData?: Omit<IncomeItem, "id">;
  isEditMode?: boolean;
}

const IncomeModal: React.FC<IncomeModalProps> = ({
  show,
  onClose,
  onSave,
  initialData = {
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    note: "",
  },
  isEditMode = false,
}) => {
  const [newIncome, setNewIncome] = useState<Omit<IncomeItem, "id">>(initialData);
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
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
  
    if (!newIncome.date) {
      newErrors.date = "Date is required";
    }
  
    if (newIncome.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave(newIncome);
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
        className="rounded-xl fixed shadow-xl z-40 w-full max-w-lg flex flex-col min-h-[60vh] max-h-[80vh] overflow-hidden transition-all duration-300 transform bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
        ref={modalRef}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-bold">
            {isEditMode ? "Edit Income" : "Add New Income"}
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
          <div className="flex-1 flex flex-col overflow-visible p-4 space-y-4">
    {/* Date */}
    <div className="z-50 space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Date <span className="text-red-500">*</span>
      </label>
      <SingleDatePicker
        value={newIncome.date}
        onChange={(date) => setNewIncome({ ...newIncome, date })}
      />
      {errors.date && (
        <p className="mt-1 text-xs text-red-500">{errors.date}</p>
      )}
    </div>

    {/* Amount */}
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Amount <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            $
          </span>
        </div>
        <input
          type="text"
          value={
            newIncome.amount !== undefined &&
            newIncome.amount !== null &&
            !isNaN(newIncome.amount)
              ? formatNumberWithCommas(newIncome.amount)
              : ""
          }
          onChange={(e) => {
            const rawValue = e.target.value.replace(/[^0-9.]/g, "");
            const parsedValue = parseFloat(rawValue) || 0;
            setNewIncome({
              ...newIncome,
              amount: parsedValue,
            });
          }}
          className={`block w-full pl-6 pr-1 py-2 leading-3 rounded border dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm ${
            errors.amount
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600"
          }`}
          placeholder="0"
        />
      </div>
      {errors.amount && (
        <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
      )}
    </div>

    {/* Notes */}
    <div className="space-y-1 flex-1">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Notes
  </label>
  <div className="min-h-[150px]"> {/* Add min-h here */}
    <textarea
      value={newIncome.note || ''}
      onChange={(e) =>
        setNewIncome({ ...newIncome, note: e.target.value })
      }
      className="w-full h-full min-h-[150px] resize-none py-2 px-3 rounded-md border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
      placeholder="Additional notes about this income"
    />
  </div>
</div>
  </div>

          {/* Submit/Cancel */}
          <div className="sticky bottom-0 z-20 bg-white">
            <div className="p-3 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
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
                  {isEditMode ? "Save Income" : "Add Income"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;