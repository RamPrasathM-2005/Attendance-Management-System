import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import StaffDashboard from "./pages/staff/Dashboard";
import NotFound from "./pages/NotFound";
import { getRole } from "./utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = getRole();

  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;

  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Login */}
    <Route path="/login" element={<Login />} />

    {/* Admin Routes */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
    </Route>

    {/* Staff Routes */}
    <Route
      path="/staff/*"
      element={
        <ProtectedRoute allowedRoles={["STAFF"]}>
          <StaffLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<StaffDashboard />} />
    </Route>

    {/* Default Redirect */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
