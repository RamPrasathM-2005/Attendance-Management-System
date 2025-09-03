import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
import ManageSemesters from "../pages/admin/ManageSemsters";
import ManageCourses from "../pages/admin/ManageCourses";
import ManageStaff from "../pages/admin/ManageStaff";
import ManageStudents from "../pages/admin/ManageStudents";
import Timetable from "../pages/admin/Timetable";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="semesters" element={<ManageSemesters />} />
      <Route path="courses" element={<ManageCourses />} />
      <Route path="staff" element={<ManageStaff />} />
      <Route path="students" element={<ManageStudents />} />
      <Route path="timetable" element={<Timetable />} />
    </Routes>
  );
};

export default AdminRoutes;
