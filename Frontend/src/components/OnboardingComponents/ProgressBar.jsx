import React from "react";

const ProgressBar = ({ percentage }) => {
  return (
    <>
      <div className="flex items-center justify-between text-sm">
        <span className="text-base-content/60">Profile Completion</span>
        <span className="font-medium text-[#0a8dff]">{percentage}%</span>
      </div>
      <div className="h-1.5 lg:h-2 bg-base-300 rounded-full overflow-hidden mt-1.5 lg:mt-2">
        <div 
          className="h-full bg-[#0a8dff] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </>
  );
};

export default ProgressBar;