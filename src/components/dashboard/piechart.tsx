import React, { useState, useEffect, useMemo } from "react";

// Define the type for the data items
type ChartData = {
  label: string;
  value: number;
  color: string;
};

const DonutChart: React.FC = () => {
  // Define the data with types
  const data: ChartData[] = useMemo(
    () => [
      { label: "Utilities", value: 300, color: "bg-blue-400" },
      { label: "Milk", value: 100, color: "bg-green-400" },
      { label: "Clothing", value: 200, color: "bg-yellow-400" },
      { label: "Other", value: 50, color: "bg-purple-400" },
    ],
    []
  );

  // Calculate the total value
  const total = data.reduce((acc, item) => acc + item.value, 0);

  // Donut chart constants
  const radius = 40; // Radius of the donut chart
  const circumference = 2 * Math.PI * radius;

  // State for animated data
  const [animatedData, setAnimatedData] = useState<ChartData[]>(data);

  // Trigger animation on data change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300); // Adjust time for smoother transition effect
    return () => clearTimeout(timer);
  }, [data]);

  // Helper function to format money values
  const formatMoneyValue = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`; // Default
  };

  return (
    <div className="bg-white h-full p-3 overflow-hidden dark:bg-slate-800 dark:text-white shadow-md dark:shadow-sm dark:shadow-slate-600 rounded-lg">
      {/* Donut Chart */}
      <div className="flex justify-center items-center mb-6 relative">
        <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
          {animatedData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const offset = animatedData
              .slice(0, index)
              .reduce((acc, curr) => acc + (curr.value / total) * circumference, 0);

            return (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                className={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-offset}
                style={{
                  transition: "stroke-dasharray 0.5s ease-out, stroke-dashoffset 0.5s ease-out",
                }}
              />
            );
          })}
        </svg>
        <div className="absolute text-center">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {formatMoneyValue(total)}
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-400">Total</span>
        </div>
      </div>

      {/* Legend with Percentage Bars and Money Amounts */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto px-1 py-2 space-y-4">
        {animatedData
          .sort((a, b) => b.value - a.value) // Sort by value (highest to lowest)
          .map((item) => {
            const percentage = (item.value / total) * 100;
            return (
              <div key={item.label} className="space-y-2">
                {/* Label, Money Amount, and Percentage Text */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    ({percentage.toFixed(0)}%)
                  </span>
                </div>

                {/* Percentage Bar with Animation */}
                <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      animation: `category-percent 0.5s ease-out`,
                      width: `${percentage}%`,
                      transformOrigin: "left",
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default DonutChart;