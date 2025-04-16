import React, { ReactNode } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import MiniLineChart from "./minilinchart"; // Import the MiniLineChart component

interface ExpenseCardProps {
  header: string;
  icon: ReactNode;
  value: number;
  percentage: number;
  plusOrMinus: boolean;
  incomeOrOutcome: boolean;
}

function DashboardCard({
  header,
  icon,
  value,
  percentage,
  plusOrMinus,
  incomeOrOutcome
}: ExpenseCardProps) {
  return (
    <div className="rounded-lg w-full p-4 shadow-md flex justify-between items-center bg-white dark:bg-slate-800 dark:text-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Left Section: Icon, Header, and Value */}
      <div className="flex flex-col space-y-2">
        {/* Header and Icon */}
        <div className="flex items-center space-x-2">
          <div className={`text-3xl text-blue-600`}>{icon}</div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {header}
          </h2>
        </div>

        {/* Value and Percentage */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {new Intl.NumberFormat().format(value)}
          </span>
          <span
            className={`rounded-md inline-flex justify-center items-center px-2 py-1 text-xs ring-1 ring-inset font-medium ${
              !plusOrMinus
                ? "bg-red-500/10 backdrop-blur-lg ring-red-500/25 text-red-500"
                : "bg-green-500/10 ring-green-500/25 backdrop-blur-lg text-green-500"
            }`}
          >
            <div className="inline-flex items-center text-xs">
              <div className="text-[6px]">
                {!plusOrMinus ? <FaMinus /> : <FaPlus />}
              </div>
              {percentage}%
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;