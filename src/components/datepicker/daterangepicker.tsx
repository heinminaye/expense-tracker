import React, { useState, useRef, useEffect } from "react";

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [activePreset, setActivePreset] = useState<string | null>("today");
  const pickerRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Set default to today's date on initial load
  useEffect(() => {
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);
    setStartDate(todayStr);
    setEndDate(todayStr);
    onChange(`${formatDisplayDate(todayStr)} to ${formatDisplayDate(todayStr)}`);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const today = new Date();
  const isToday = (day: number) => {
    const currentDate = new Date(currentYear, currentMonth, day);
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const setDateRange = (start: Date, end: Date, presetName: string) => {
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    setStartDate(startStr);
    setEndDate(endStr);
    setActivePreset(presetName);
    // onChange(`${formatDisplayDate(startStr)} to ${formatDisplayDate(endStr)}`);
  };

  const presets = [
    { label: "Today", key: "today" },
    { label: "Yesterday", key: "yesterday" },
    { label: "Last 7 Days", key: "last7days" },
    { label: "Last 30 Days", key: "last30days" },
    { label: "Last Month", key: "lastMonth" },
    { label: "Last Year", key: "lastYear" },
  ];

  const applyPresetRange = (preset: string) => {
    today.setHours(0, 0, 0, 0);

    switch (preset) {
      case "today": {
        setDateRange(today, today, "today");
        break;
      }
      case "yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateRange(yesterday, yesterday, "yesterday");
        break;
      }
      case "last7days": {
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 6);
        setDateRange(last7Days, today, "last7days");
        break;
      }
      case "last30days": {
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 29);
        setDateRange(last30Days, today, "last30days");
        break;
      }
      case "lastMonth": {
        const firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        setDateRange(firstDayLastMonth, lastDayLastMonth, "lastMonth");
        break;
      }
      case "lastYear": {
        const firstDayLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastDayLastYear = new Date(today.getFullYear() - 1, 11, 31);
        setDateRange(firstDayLastYear, lastDayLastYear, "lastYear");
        break;
      }
      default: {
        setActivePreset("custom");
      }
    }
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const formattedDate = formatDate(date);

    if (!startDate || (startDate && endDate)) {
      setStartDate(formattedDate);
      setEndDate(null);
      setActivePreset("custom");
    } else if (formattedDate >= startDate) {
      setEndDate(formattedDate);
      setActivePreset("custom");
    } else {
      setStartDate(formattedDate);
      setEndDate(null);
      setActivePreset("custom");
    }
  };

  const applyDateRange = () => {
    if (startDate && endDate) {
      onChange(`${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`);
      setIsOpen(false);
    }
  };

  const cancelSelection = () => {
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);
    setStartDate(todayStr);
    setEndDate(todayStr);
    setActivePreset("today");
    onChange(`${formatDisplayDate(todayStr)} to ${formatDisplayDate(todayStr)}`);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderDays = () => {
    const days: JSX.Element[] = [];

    // Empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = formatDate(date);
      const isStart = dateStr === startDate;
      const isEnd = dateStr === endDate;
      const isInRange =
        startDate && endDate && dateStr >= startDate && dateStr <= endDate;

      days.push(
        <div
  key={`day-${day}`}
  className={`
    w-full py-2 h-full flex items-center justify-center 
    text-sm cursor-pointer rounded-lg relative
    transition-colors duration-100 ease-in-out
    ${isStart || isEnd 
      ? "bg-blue-600 text-white font-medium" 
      : ""}
    ${isInRange && !(isStart || isEnd)
      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
      : ""}
    ${isToday(day) && !isStart && !isEnd
      ? "border border-blue-400 dark:border-blue-500"
      : ""}
    ${
      !isStart && !isEnd && !isInRange
        ? "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        : ""
    }
    ${
      (isStart || isEnd) && isToday(day)
        ? "border dark:border-blue-500"
        : ""
    }
  `}
  onClick={() => handleDateClick(day)}
>
  <div className="z-10 text-sm">{day}</div>
  {/* Range indicator for middle dates */}
  {isInRange && !isStart && !isEnd && (
    <div className="absolute inset-y-0 rounded-lg w-full bg-blue-100 dark:bg-blue-900/30 -z-10"></div>
  )}
</div>
      );
    }

    return days;
  };

  return (
    <div className={`relative w-full z-20 ${className}`} ref={pickerRef}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={value || "Select date range"}
          onClick={() => setIsOpen(!isOpen)}
          className={`py-2 pl-3 pr-10 border rounded-md text-sm cursor-pointer w-full text-left 
            bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
            text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 
            focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
        />
        {/* Calendar icon */}
        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 dark:text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-10 mt-1 bg-white dark:bg-gray-800 border 
          border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-full 
          sm:w-[580px] max-w-[calc(100vw-2rem)]`}>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Preset buttons column */}
            <div className="sm:w-1/3 sm:border-r sm:border-gray-200 dark:sm:border-gray-700 sm:pr-4">
              <h3 className="font-medium mb-3 text-sm text-gray-700 dark:text-gray-300">Quick Select</h3>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                {presets.map((preset) => (
                  <PresetButton
                    key={preset.key}
                    label={preset.label}
                    presetKey={preset.key}
                    activePreset={activePreset}
                    onClick={applyPresetRange}
                  />
                ))}
              </div>
            </div>

            {/* Calendar column */}
            <div className="sm:w-2/3">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="text-md font-medium text-gray-800 dark:text-gray-200">
                  {months[currentMonth]} {currentYear}
                </div>

                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm w-full pb-2 font-medium text-gray-500 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-row justify-between items-center gap-0 px-2">
            <div className="text-sm flex  flex-row gap-4 text-gray-700 dark:text-gray-300">
              {startDate && <div>Start: <span className="font-medium">{formatDisplayDate(startDate)}</span></div>}
              {endDate && <div>End: <span className="font-medium">{formatDisplayDate(endDate)}</span></div>}
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={cancelSelection}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={applyDateRange}
                disabled={!startDate || !endDate}
                className={`px-4 py-2 text-sm rounded-md ${
                  !startDate || !endDate
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PresetButtonProps {
  label: string;
  presetKey: string;
  activePreset: string | null;
  onClick: (preset: string) => void;
}

const PresetButton: React.FC<PresetButtonProps> = ({
  label,
  presetKey,
  activePreset,
  onClick,
}) => (
  <button
    onClick={() => onClick(presetKey)}
    className={`w-full p-2 text-left text-sm rounded-md transition-colors
      ${
        activePreset === presetKey
          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      }`}
  >
    {label}
  </button>
);

export default DateRangePicker;