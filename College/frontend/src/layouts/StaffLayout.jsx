import React from "react";
import StaffSidebar from "../components/Sidebar/StaffSidebar";
import { Outlet } from "react-router-dom";

const StaffLayout = () => {
  return (
    <div className="flex">
      <StaffSidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default StaffLayout;
