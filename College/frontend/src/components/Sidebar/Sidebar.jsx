import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold text-blue-700 mb-6">Admin Panel</h2>
      <ul className="space-y-3">
        <li><Link to="/admin/dashboard" className="block p-2 rounded hover:bg-blue-100">Dashboard</Link></li>
        <li><Link to="/admin/semesters" className="block p-2 rounded hover:bg-blue-100">Manage Semesters</Link></li>
        <li><Link to="/admin/courses" className="block p-2 rounded hover:bg-blue-100">Manage Courses</Link></li>
        <li><Link to="/admin/staff" className="block p-2 rounded hover:bg-blue-100">Manage Staff</Link></li>
        <li><Link to="/admin/students" className="block p-2 rounded hover:bg-blue-100">Manage Students</Link></li>
        <li><Link to="/admin/timetable" className="block p-2 rounded hover:bg-blue-100">Timetable</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
