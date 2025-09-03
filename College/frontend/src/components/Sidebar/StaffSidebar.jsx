import React from "react";
import { Link } from "react-router-dom";

const StaffSidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-5">
      <h2 className="text-2xl font-bold mb-6">Staff Panel</h2>
      <ul className="space-y-3">
        <li>
          <Link to="/staff/dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/staff/my-courses" className="hover:text-blue-400">
            My Courses
          </Link>
        </li>
        <li>
          <Link to="/staff/attendance" className="hover:text-blue-400">
            Attendance
          </Link>
        </li>
        <li>
          <Link to="/staff/marks-allocation" className="hover:text-blue-400">
            Marks Allocation
          </Link>
        </li>
        <li>
          <Link to="/staff/reports" className="hover:text-blue-400">
            Reports
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default StaffSidebar;
