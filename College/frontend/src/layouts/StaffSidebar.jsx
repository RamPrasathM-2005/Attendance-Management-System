import { NavLink } from "react-router-dom";
import { BookOpen, ClipboardList, Users, BarChart3, Home } from "lucide-react";

const StaffSidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/staff", icon: <Home size={18} /> },
    { name: "My Courses", path: "/staff/courses", icon: <BookOpen size={18} /> },
    { name: "Attendance", path: "/staff/attendance", icon: <ClipboardList size={18} /> },
    { name: "Marks Allocation", path: "/staff/marks", icon: <Users size={18} /> },
    { name: "Reports", path: "/staff/reports", icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 text-gray-100 h-screen shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold">Staff Panel</h2>
      </div>

      <nav className="mt-6">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default StaffSidebar;
