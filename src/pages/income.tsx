// src/pages/IncomePage.tsx
import React, { useState, useEffect } from "react";
import DateRangePicker from "../components/datepicker/daterangepicker";
import IncomeModal from "../components/income/incomemodal";
import {
  fetchIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
} from "../libs/api";

interface IncomeItem {
  id: number;
  payer: string;
  amount: number;
  date: string;
  note?: string;
}

const IncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [dateRange, setDateRange] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentIncome, setCurrentIncome] = useState<IncomeItem | null>(null);
  const [remainingBalance] = useState<number>(5000); // Static remaining balance

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const incomesData = await fetchIncomes();
      setIncomes(incomesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  const filteredIncomes = incomes.filter((item) => {
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(" to ");
      const itemDate = new Date(item.date);
      if (itemDate < new Date(startDate) || itemDate > new Date(endDate)) {
        return false;
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.payer.toLowerCase().includes(term) ||
        item.note?.toLowerCase().includes(term) ||
        item.id.toString().includes(term)
      );
    }

    return true;
  });

  const totalIncomes = filteredIncomes.reduce((sum, item) => sum + item.amount, 0);

  const handleDelete = async (id: number) => {
    try {
      await deleteIncome(id);
      await loadIncomes(); // Refresh data after deletion
    } catch (error) {
      console.error("Failed to delete income:", error);
    }
  };

  const handleEdit = (income: IncomeItem) => {
    setCurrentIncome(income);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentIncome(null);
    setIsModalOpen(true);
  };

  const handleSubmitIncome = async (income: IncomeItem) => {
    try {
      if (income.id && incomes.some(item => item.id === income.id)) {
        await updateIncome(income);
      } else {
        await addIncome(income);
      }
      await loadIncomes(); 
    } catch (error) {
      console.error("Failed to save income:", error);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-50 dark:bg-gray-900">
      <IncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitIncome}
        initialData={currentIncome}
      />

      <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b dark:border-gray-700 gap-4">
          <div className="w-full md:w-64">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
          <div className="flex space-x-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search incomes..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-300"
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
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 border-b dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg border border-blue-100 dark:border-gray-600">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Incomes
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalIncomes.toFixed(2)}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg border border-green-100 dark:border-gray-600">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Remaining Balance
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${remainingBalance.toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-gray-700 p-6 rounded-lg border border-purple-100 dark:border-gray-600">
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Number of Items
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {filteredIncomes.length}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
              </div>
            ) : filteredIncomes.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-500 dark:text-gray-400">No data available</div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                  <tr className="border-b dark:border-gray-600">
                    <th className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredIncomes.length > 0 &&
                          filteredIncomes.every((income) =>
                            selectedItems.includes(income.id)
                          )
                        }
                        onChange={() => {
                          if (
                            filteredIncomes.length > 0 &&
                            filteredIncomes.every((income) =>
                              selectedItems.includes(income.id)
                            )
                          ) {
                            setSelectedItems([]);
                          } else {
                            setSelectedItems(
                              filteredIncomes.map((income) => income.id)
                            );
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Payer
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="p-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="p-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredIncomes.map((income) => (
                    <tr
                      key={income.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(income.id)}
                          onChange={() => {
                            if (selectedItems.includes(income.id)) {
                              setSelectedItems(
                                selectedItems.filter((id) => id !== income.id)
                              );
                            } else {
                              setSelectedItems([...selectedItems, income.id]);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="p-4 dark:text-white">{income.id}</td>
                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        {income.payer}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {new Date(income.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right font-medium text-gray-900 dark:text-white">
                        ${income.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 italic">
                        {income.note || "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(income)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Edit"
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
                            onClick={() => handleDelete(income.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Delete"
                            title="Delete"
                          >
                            <svg
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
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomePage;