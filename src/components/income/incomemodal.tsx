import React, { useState, useEffect } from "react";
import { IncomeItem } from "../types/income";
import SingleDatePicker from "../datepicker/singledatepicker";

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (income: IncomeItem) => Promise<void>;
  initialData?: IncomeItem | null;
}

const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<IncomeItem, "id">>({
    payer: "",
    amount: NaN,
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setFormData(rest);
    } else {
      setFormData({
        payer: "",
        amount: NaN,
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.payer.trim()) newErrors.payer = "Payer is required";
    if (isNaN(formData.amount)) newErrors.amount = "Amount is required";
    else if (formData.amount <= 0) newErrors.amount = "Amount must be positive";
    if (!formData.date) newErrors.date = "Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        amount: value === "" ? NaN : parseFloat(value),
      }));
      // Clear error when user starts typing
      if (errors.amount) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.amount;
          return newErrors;
        });
      }
    }
  };

  const handleDateChange = (newDate: string) => {
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
    if (errors.date) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.date;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id || Date.now(),
        ...formData,
        amount: parseFloat(formData.amount.toString()),
      });
      onClose();
    } catch (error) {
      console.error("Failed to save income:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {initialData ? "Edit Income" : "Add New Income"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              disabled={isSubmitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payer *
                </label>
                <input
                  type="text"
                  name="payer"
                  value={formData.payer}
                  onChange={handleChange}
                  placeholder="Who gave the money?"
                  className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.payer 
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.payer && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.payer}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-700 dark:text-gray-300">$</span>
                  <input
                    type="text"
                    name="amount"
                    value={isNaN(formData.amount) ? "" : formData.amount.toString()}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className={`w-full pl-8 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.amount 
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <SingleDatePicker
                  value={formData.date}
                  onChange={handleDateChange}
                />
                {errors.date && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  disabled={isSubmitting}
                  placeholder="Additional information (optional)"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-blue-900 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {initialData ? "Updating..." : "Adding..."}
                  </span>
                ) : initialData ? "Update Income" : "Add Income"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncomeModal;