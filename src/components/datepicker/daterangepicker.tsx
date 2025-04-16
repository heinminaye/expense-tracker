import React, { useState, useRef, useEffect } from "react";

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
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
    onChange(`${formatDisplayDate(startStr)} to ${formatDisplayDate(endStr)}`);
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
          className={`w-8 h-8 flex items-center text-sm justify-center rounded-full cursor-pointer
            ${isStart || isEnd ? "bg-blue-600 text-white border-none" : ""}
            ${isInRange ? "bg-blue-100 border-none" : ""}
            ${isToday(day) ? "border border-blue-300" : ""}
            hover:bg-gray-200 hover:text-black`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="relative w-full z-20" ref={pickerRef}>
      <div className="relative">
        <input
          type="text"
          readOnly
          // {new Date(income.date).toLocaleDateString("en-US", {
          //   month: "short",
          //   day: "numeric",
          //   year: "numeric",
          // })}
          value={value || "Select date range"}
          onClick={() => setIsOpen(!isOpen)}
          className="py-1 pr-5 border rounded cursor-pointer w-full text-center"
        />
        {/* Calendar icon */}
        <div
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
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
        <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg p-4 w-[600px]">
          <div className="flex gap-6">
            {/* Preset buttons column */}
            <div className="w-1/3 border-r">
              <h3 className="font-medium mb-3 text-sm">Quick Select</h3>
              <div className="space-y-2 mr-2">
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
            <div className="w-2/3">
              <div className="flex items-center justify-between mb-3 pr-4">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  &lt;
                </button>

                <div className="text-md font-medium">
                  {months[currentMonth]} {currentYear}
                </div>

                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  &gt;
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm w-8 pb-2 font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center px-2">
            <div className="text-sm flex">
              {startDate && <div className="pr-2">Start: {formatDisplayDate(startDate)}</div>}
              {endDate && <div>End: {formatDisplayDate(endDate)}</div>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelSelection}
                className="px-4 py-1 text-sm border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={applyDateRange}
                disabled={!startDate || !endDate}
                className={`px-4 py-1 text-sm rounded ${
                  !startDate || !endDate
                    ? "bg-gray-200"
                    : "bg-blue-500 text-white hover:bg-blue-600"
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
    className={`w-full p-2 text-left text-sm rounded ${
      activePreset === presetKey
        ? "bg-blue-100 text-blue-700"
        : "hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default DateRangePicker;