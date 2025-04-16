import React, { useState, useRef, useEffect } from "react";

interface SingleDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  darkMode?: boolean;
  className?: string;
}

const SingleDatePicker: React.FC<SingleDatePickerProps> = ({
  value,
  onChange,
  darkMode = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!value) {
      const todayStr = formatDate(new Date());
      setSelectedDate(todayStr);
      onChange(todayStr);
    } else {
      setSelectedDate(value);
    }
  }, [value, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDayClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const formattedDate = formatDate(date);
    setSelectedDate(formattedDate);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    }
  };

  return (
    <div className={`relative text-sm ${className}`} ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2 px-3 border rounded-md text-left flex items-center justify-between transition-colors duration-200 ${
          darkMode
            ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        } ${className}`}
      >
        <span>{selectedDate ? formatDisplayDate(selectedDate) : "Select a date"}</span>
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
      </button>

      {isOpen && (
        <div
          className={`absolute z-20 mt-1 rounded-lg shadow-lg px-2 py-3 w-64 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`flex justify-between items-center mb-2 mx-1 ${
              darkMode ? "text-white" : "text-gray-700"
            }`}
          >
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1 text-sm items-center flex justify-center rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              &lt;
            </button>
            <span className="font-medium  text-sm">
              {new Date(currentYear, currentMonth).toLocaleString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => navigateMonth("next")}
              className="p-1 text-sm items-center flex justify-center rounded-md hover:bg-gray-200  transition-colors duration-200"
            >
              &gt;
            </button>
          </div>

          <div
            className={`grid grid-cols-7 gap-1 text-xs mb-2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="w-6 h-6 mx-2"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(currentYear, currentMonth, day);
              const dateStr = formatDate(date);
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`w-6 h-6 mx-1 flex items-center text-xs justify-center rounded-full cursor-pointer transition-colors duration-200 ${
                    darkMode
                      ? isSelected
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-700 text-white"
                      : isSelected
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200 text-gray-700"
                  } ${isToday(day) ? "border border-blue-400" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleDatePicker;