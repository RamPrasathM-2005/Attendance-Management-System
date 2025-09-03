import React from "react";
import AdminLayout from "../../layouts/AdminLayout";

const Timetable = () => {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Timetable</h2>
      <p className="text-gray-600">Here you can create a 6-day, 8-hour timetable with breaks and lunch.</p>
    </AdminLayout>
  );
};

export default Timetable;
