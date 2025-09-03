// src/routes.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "./utils/auth";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageSemesters from "./pages/admin/ManageSemsters"
import ManageCourses from "./pages/admin/ManageCourses";
import ManageStaff from "./pages/admin/ManageStaff";
import ManageStudents from "./pages/admin/ManageStudents";
import Timetable from "./pages/admin/Timetable";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";
import Attendance from "./pages/staff/Attendance";
import MarksAllocation from "./pages/staff/MarksAllocation";
import Reports from "./pages/staff/Reports";
import Options from "./pages/staff/Options";


// NotFound
import NotFound from "./pages/NotFound";
import MarkAllocation from "./pages/staff/MarksAllocation";

// Inline ProtectedRoute
// eslint-disable-next-line react-refresh/only-export-components
const ProtectedRoute = ({ children, role }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role && getUserRole() !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const routes = [
  // Root redirects to login
  { path: "/", element: <Navigate to="/login" replace /> },

  // Auth
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // Admin Routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> }, // /admin default
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "manage-semesters", element: <ManageSemesters /> },
      { path: "manage-courses", element: <ManageCourses /> },
      { path: "manage-staff", element: <ManageStaff /> },
      { path: "manage-students", element: <ManageStudents /> },
      { path: "timetable", element: <Timetable /> },
      { path: "*", element: <NotFound /> } // catch-all admin
    ]
  },

  // Staff Routes
  {
    path: "/staff",
    element: (
      <ProtectedRoute role="staff">
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StaffDashboard /> },
      { path: "dashboard", element: <StaffDashboard /> },
      { path: "attendance", element: <Attendance /> },
      { path: "marks-allocation", element: <MarksAllocation /> },
      { path: "reports", element: <Reports /> },
      { path: "options/:courseId", element: <Options /> },
      { path: "marks-allocation/:courseId", element: <MarksAllocation /> },
      
      { path: "*", element: <NotFound /> }
    ]
  },

  // Catch-all
  { path: "*", element: <NotFound /> }
];

export default routes;
