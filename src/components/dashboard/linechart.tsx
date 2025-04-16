import React, { useState, useEffect, useRef } from "react";

const LineChart = ({ currentData, theme, onDataPointSelect }) => {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });
  const [nearestIndex, setNearestIndex] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Update chart width based on container size using ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setChartWidth(container.offsetWidth);
    };

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  const incomeData = currentData.income;
  const outcomeData = currentData.outcome;
  const months = Object.keys(incomeData);
  const incomeValues = Object.values(incomeData);
  const outcomeValues = Object.values(outcomeData);
  const paddingX = 20;
  const step =
    months.length > 1 ? chartWidth / (months.length - 1) : chartWidth;
  const chartHeight = 200;

  const minValue = 0;
  const maxValue = Math.max(1, ...incomeValues, ...outcomeValues);

  // Generate horizontal axis labels (e.g., 10k, 20k, etc.)
  const generateAxisLabels = () => {
    const labels = [];
    const steps = 5; // Number of steps for the axis
    const stepValue = maxValue / steps;

    for (let i = 0; i <= steps; i++) {
      const value = i * stepValue;
      const y =
        chartHeight -
        10 -
        ((value - minValue) / (maxValue - minValue)) * (chartHeight - 10);
      labels.push({ value, y });
    }

    return labels;
  };

  const axisLabels = generateAxisLabels();

  const getSmoothPath = (values) => {
    return values
      .map((value, idx) => {
        const x = paddingX + idx * step;
        const y =
          chartHeight -
          10 -
          ((value - minValue) / (maxValue - minValue)) * (chartHeight - 10);

        if (idx === 0) return `M${x},${y}`;

        const prevX = paddingX + (idx - 1) * step;
        const prevY =
          chartHeight -
          10 -
          ((values[idx - 1] - minValue) / (maxValue - minValue)) *
            (chartHeight - 10);

        const c1X = prevX + (x - prevX) / 2;
        const c1Y = prevY;
        const c2X = x - (x - prevX) / 2;
        const c2Y = y;

        return `C${c1X},${c1Y} ${c2X},${c2Y} ${x},${y}`;
      })
      .join(" ");
  };

  const handleMouseMove = (event) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - containerRect.left + 30;
    const y = event.clientY - containerRect.top;

    setMousePosition({ x, y });

    // Estimate the index of the closest data point
    let index = Math.round((x - paddingX) / step);
    index = Math.max(0, Math.min(index, months.length - 1));

    const nearestX = paddingX + index * step;
    const isLastItem = index === months.length - 1;
    const isFirstItem = index === 0;

    // Increase the threshold slightly to detect the item earlier
    const snapThreshold = isLastItem || isFirstItem ? step : 0.6 * step;

    // If cursor is approaching the nearestX, show tooltip earlier
    if (Math.abs(x - nearestX) < snapThreshold) {
      setNearestIndex(index);

      // Adjust Y position to be **above** the cursor
      const tooltipOffset = 40;
      setTooltipPosition({ x, y: y - tooltipOffset });
    } else {
      setNearestIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: null, y: null });
    setNearestIndex(null);
  };

  const formatNumber = (value: number) => {
    if (value < 1000) {
      return value.toString(); // No suffix for numbers less than 1,000
    }

    const suffixes = ["", "k", "M", "B", "T"]; // Suffixes for thousand, million, billion, trillion
    const suffixNum = Math.floor(Math.log10(value) / 3); // Determine the suffix index
    const shortValue = (value / Math.pow(1000, suffixNum)).toFixed(1); // Scale the number

    // Remove .0 if it exists (e.g., 2.0k -> 2k)
    return shortValue.replace(/\.0$/, "") + suffixes[suffixNum];
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-64 flex flex-col relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* SVG Chart */}
      <svg
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${chartWidth + paddingX * 2} ${chartHeight}`}
      >
        <defs>
          <linearGradient id="lineGradientBlue" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="lineGradientRed" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Horizontal Axis Line */}
        <line
          x1={paddingX}
          y1={chartHeight - 10}
          x2={chartWidth + paddingX}
          y2={chartHeight - 10}
          stroke="#ccc"
          strokeWidth={1}
        />

        {/* Horizontal Axis Labels */}
        {axisLabels.map((label, idx) => (
          <g key={idx}>
            <line
              x1={paddingX}
              y1={label.y}
              x2={chartWidth + paddingX}
              y2={label.y}
              stroke="#c4c4c4"
              strokeWidth={0.5}
              strokeDasharray="4 4"
              className="fill-slate-800"
            />
          </g>
        ))}

        {/* Outcome Line */}
        <path
          fill="none"
          stroke="url(#lineGradientRed)"
          strokeWidth={3}
          d={getSmoothPath(outcomeValues)}
        />

        {/* Income Line */}
        <path
          fill="none"
          stroke="url(#lineGradientBlue)"
          strokeWidth={3}
          d={getSmoothPath(incomeValues)}
        />

        {/* Hover Line */}
        {nearestIndex !== null && (
          <line
            x1={paddingX + nearestIndex * step}
            y1={0}
            x2={paddingX + nearestIndex * step}
            y2={chartHeight - 10}
            stroke="#ccc"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}

        {/* Circles on Hover */}
        {nearestIndex !== null && (
          <>
            <circle
              cx={paddingX + nearestIndex * step}
              cy={
                chartHeight -
                10 -
                ((incomeValues[nearestIndex] - minValue) /
                  (maxValue - minValue)) *
                  (chartHeight - 10)
              }
              r={6}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth={2}
              style={{
                transition: "all 0.3s ease",
                pointerEvents: "none",
              }}
            />
            <circle
              cx={paddingX + nearestIndex * step}
              cy={
                chartHeight -
                10 -
                ((outcomeValues[nearestIndex] - minValue) /
                  (maxValue - minValue)) *
                  (chartHeight - 10)
              }
              r={6}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={2}
              style={{
                transition: "all 0.3s ease",
                pointerEvents: "none",
              }}
            />
          </>
        )}

        {/* Month Labels Inside SVG */}
        {months.map((month, idx) => (
          <text
            key={idx}
            x={paddingX + idx * step}
            y={chartHeight + 20} // Positioned below the chart
            textAnchor="middle"
            className="text-sm fill-gray-500 dark:fill-gray-400"
          >
            {month}
          </text>
        ))}
      </svg>


      {/* Tooltip */}
      {nearestIndex !== null && (
        <div
          className="absolute bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg text-sm"
          style={{
            left: `${Math.min(
              Math.max(tooltipPosition.x + 40), // Ensure tooltip stays within chart bounds
              chartWidth - 120 // Adjust for tooltip width (e.g., 100px)
            )}px`,
            top: `${tooltipPosition.y - 50}px`,
            pointerEvents: "none",
          }}
        >
          <div className="font-semibold">{months[nearestIndex]}</div>
          <div>Income: ${formatNumber(incomeValues[nearestIndex])}</div>
          <div>Outcome: ${formatNumber(outcomeValues[nearestIndex])}</div>
        </div>
      )}
    </div>
  );
};

export default LineChart;
