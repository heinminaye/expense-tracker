import React, { useState, useMemo, useRef, useEffect } from "react";
import useStore from "../../store";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import Chart from "./linechart";
import DashboardCard from "./dashboard-card";

const IncomeTracker = ({ onDataPointSelect }) => {

  // State to manage the selected filter (yearly)
  const [filter, setFilter] = useState("year");

  // State to manage the active bar
  const [activeBar, setActiveBar] = useState(null);
  const [currentValue, setCurrentValue] = useState({
    income: null,
    outcome: null,
  });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const options = [{ value: "year", label: "This Year" }];

  // Sample data for demonstration (12 months)
  const data = {
    year: {
      income: {
        Jan: 0,
        Feb: 20000000,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 1,
        Dec: 0,
      },
      outcome: {
        Jan: 20,
        Feb: 0,
        Mar: 20,
        Apr: 0,
        May: 20,
        Jun: 0,
        Jul: 20,
        Aug: 0,
        Sep: 20,
        Oct: 0,
        Nov: 20,
        Dec: 0,
      },
    },
  };

  // Fake history data
  const history = [
    { date: "2025-02-28", category: "Food", amount: 25.99 },
    { date: "2025-02-27", category: "Transport", amount: 12.5 },
    { date: "2025-02-26", category: "Entertainment", amount: 40.0 },
    { date: "2025-02-25", category: "Groceries", amount: 55.75 },
    { date: "2025-02-24", category: "Utilities", amount: 120.0 },
    { date: "2025-02-28", category: "Food", amount: 25.99 },
    { date: "2025-02-27", category: "Transport", amount: 12.5 },
    { date: "2025-02-26", category: "Entertainment", amount: 40.0 },
    { date: "2025-02-25", category: "Groceries", amount: 55.75 },
    { date: "2025-02-24", category: "Utilities", amount: 120.0 },
  ];

  const currentData = data[filter];
  const minValue = 0;

  const paddingX = 20;
  const chartWidth = 900 - paddingX * 2;

  const months = useMemo(
    () => Object.keys(currentData.income),
    [currentData.income]
  );
  const incomeValues = useMemo(
    () => Object.values(currentData.income),
    [currentData.income]
  );
  const outcomeValues = useMemo(
    () => Object.values(currentData.outcome),
    [currentData.outcome]
  );
  const maxIncomeValue = useMemo(
    () => Math.max(...incomeValues),
    [incomeValues]
  );
  const maxOutcomeValue = useMemo(
    () => Math.max(...outcomeValues),
    [outcomeValues]
  );
  const maxValue = useMemo(
    () => Math.max(maxIncomeValue, maxOutcomeValue),
    [maxIncomeValue, maxOutcomeValue]
  );
  const step = useMemo(
    () => (months.length > 1 ? chartWidth / (months.length - 1) : chartWidth),
    [months, chartWidth]
  );

  // Handle filter change (yearly)
  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    const today = new Date();
    const todayMonth = today.toLocaleString("en-US", { month: "short" });
    setActiveBar(todayMonth);
  };

  // Handle chart type change (bar or line)
  const handleChartTypeChange = (selectedChartType) => {
    setChartType(selectedChartType);
    const today = new Date();
    const todayMonth = today.toLocaleString("en-US", { month: "short" });
    setActiveBar(todayMonth);
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1e9)
      return (num % 1e9 === 0 ? num / 1e9 : (num / 1e9).toFixed(1)) + "B"; // Billion
    if (num >= 1e6)
      return (num % 1e6 === 0 ? num / 1e6 : (num / 1e6).toFixed(1)) + "M"; // Million
    if (num >= 1e3)
      return (num % 1e3 === 0 ? num / 1e3 : (num / 1e3).toFixed(1)) + "K"; // Thousand
    return num.toString();
  };

  // Set default active bar to the current month
  useEffect(() => {
    const today = new Date();
    const todayMonth = today.toLocaleString("en-US", { month: "short" });
    setActiveBar(todayMonth);
    const todayIncome = currentData.income[todayMonth];
    const todayOutcome = currentData.outcome[todayMonth];
    setCurrentValue({ income: todayIncome, outcome: todayOutcome });

    // Calculate tooltip position for the active bar
    const activeIndex = months.indexOf(todayMonth);
    if (activeIndex !== -1) {
      const x = paddingX + activeIndex * step;
      const y = 190 - ((todayIncome - minValue) / (maxValue - minValue)) * 190; // Adjust y based on chart height
      setTooltipPosition({ x, y });
    }
  }, [filter]);

  return (
    <div className="w-full h-full flex flex-row justify-center gap-4">
      <div className="w-full flex flex-col">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <DashboardCard
            header="Total Income"
            icon={<RiMoneyDollarCircleLine />}
            value={100000000000000000}
            percentage={10}
            plusOrMinus={false}
            incomeOrOutcome={true}
            incomeData={Object.values(data.year.income)}
            expenseData={Object.values(data.year.outcome)}
          />
          <DashboardCard
            header="Total Expense"
            icon={<RiMoneyDollarCircleLine />}
            value={100000000000000000}
            percentage={10}
            plusOrMinus={true}
            incomeOrOutcome={false}
            incomeData={Object.values(data.year.income)}
            expenseData={Object.values(data.year.outcome)}
          />
        </div>

        <div className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-300 p-4 rounded-lg w-full shadow-md dark:shadow-sm dark:shadow-slate-700">
          <Chart
            currentData={data.year}
            onDataPointSelect={(data) => console.log(data)}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeTracker;
