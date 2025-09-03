import React from "react";
import AdminLayout from "../../layouts/AdminLayout";

const ManageCourses = () => {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Manage Courses</h2>
      <p className="text-gray-600">Here you can add, edit, and delete courses.</p>
    </AdminLayout>
  );
};

export default ManageCourses;
