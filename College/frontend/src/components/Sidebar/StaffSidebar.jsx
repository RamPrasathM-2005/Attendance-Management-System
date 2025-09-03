import React, { useState } from 'react';
import { Home, BookMarked, UserCheck, Award, BarChart3, X, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const StaffSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarItems = [
    { to: "/staff/dashboard", icon: Home, label: "Dashboard" },
    { to: "/staff/my-courses", icon: BookMarked, label: "My Courses" },
    { to: "/staff/attendance", icon: UserCheck, label: "Attendance" },
    { to: "/staff/marks-allocation", icon: Award, label: "Marks Allocation" },
    { to: "/staff/reports", icon: BarChart3, label: "Reports" }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-800 text-white min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Staff Panel</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4">
          <ul className="space-y-2 px-3">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-3 rounded-lg
                      hover:bg-gray-700 hover:text-blue-400 transition-all duration-200
                      ${isActive ? 'bg-gray-700 text-blue-400' : ''}
                    `}
                    onClick={() => setIsOpen(false)} // close sidebar on mobile link click
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Hamburger button */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default StaffSidebar;
