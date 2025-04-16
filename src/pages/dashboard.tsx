import React, { useState } from "react";
import IncomeTracker from "../components/dashboard/tracker";

function Dashboard() {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const handleDataPointSelect = (dataPoint) => {
    console.log(selectedDataPoint)
    setSelectedDataPoint(dataPoint);
  };

  return (
    <div className="flex flex-row relative h-full p-3">
      {/* Main Content (Left Side) */}
      <div className="h-full w-full flex flex-col overflow-y-auto items-center">
        <IncomeTracker onDataPointSelect={handleDataPointSelect} />
        {/* <FewHistoryTable /> */}
      </div>

      {/* Donut Chart (Right Side, Sticky and Scrollable) */}
      {/* <div className="ml-auto z-10 w-80 relative top-0 h-full pr-2 pl-1">
        <DonutChart selectedDataPoint={selectedDataPoint} />
      </div> */}
    </div>
  );
}

export default Dashboard;