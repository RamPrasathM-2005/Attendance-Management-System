import React from "react";
import AdminLayout from "../../layouts/AdminLayout";

const ManageStudents = () => {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Manage Students</h2>
      <p className="text-gray-600">Here you can add students and assign them to batches.</p>
    </AdminLayout>
  );
};

export default ManageStudents;
