import React from "react";
import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-5">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <ul className="space-y-3">
        <li>
          <Link to="/admin/dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin/manage-semesters" className="hover:text-blue-400">
            Manage Semesters
          </Link>
        </li>
        <li>
          <Link to="/admin/manage-courses" className="hover:text-blue-400">
            Manage Courses
          </Link>
        </li>
        <li>
          <Link to="/admin/manage-staff" className="hover:text-blue-400">
            Manage Staff
          </Link>
        </li>
        <li>
          <Link to="/admin/manage-students" className="hover:text-blue-400">
            Manage Students
          </Link>
        </li>
        <li>
          <Link to="/admin/timetable" className="hover:text-blue-400">
            Timetable
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
