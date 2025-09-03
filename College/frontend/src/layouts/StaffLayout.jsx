import { Outlet } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";

const StaffLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <StaffSidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        <header className="bg-gradient-to-r from-green-600 to-green-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-white">Staff Panel</h1>
            <p className="text-green-100 text-sm mt-1">Manage Courses, Attendance & Marks</p>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
