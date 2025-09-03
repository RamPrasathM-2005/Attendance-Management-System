import React from "react";
import AdminLayout from "../../layouts/AdminLayout";

const Dashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">Welcome, Admin 👋</h1>
      <p className="text-gray-700">Use the sidebar to manage semesters, courses, staff, students, and timetable.</p>
    </AdminLayout>
  );
};

export default Dashboard;
