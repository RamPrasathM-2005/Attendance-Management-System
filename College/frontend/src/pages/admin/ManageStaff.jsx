import React from "react";
import AdminLayout from "../../layouts/AdminLayout";

const ManageStaff = () => {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Manage Staff</h2>
      <p className="text-gray-600">Here you can add staff and assign them to courses.</p>
    </AdminLayout>
  );
};

export default ManageStaff;
