import React, { useState } from 'react';
import { Home, Book, Users, Calendar, X, Menu, LogOut, Settings } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService'; // Import logout function

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Added missing state
  const navigate = useNavigate();

  // Mock user data (replace with actual auth context or state management)
  const currentUser = {
    name: "Admin User",
    role: "Administrator",
    email: "admin@example.com"
  };

  const sidebarItems = [
    { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { to: "/admin/manage-semesters", icon: Calendar, label: "Semesters" },
    { to: "/admin/manage-courses", icon: Book, label: "Courses" },
    { to: "/admin/manage-staff", icon: Users, label: "Staff" },
    { to: "/admin/manage-students", icon: Users, label: "Students" },
    { to: "/admin/timetable", icon: Calendar, label: "Timetable" },
  ];

  const handleLogout = async () => {
    try {
      await logout(); // Call logout from authService
      navigate('/login'); // Redirect to login
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsOpen(false); // Close sidebar on mobile
    setIsProfileOpen(false); // Close profile dropdown
  };

  const handleViewProfile = () => {
    // Implement navigation to profile page or modal
    console.log("View profile clicked");
    setIsProfileOpen(false); // Close dropdown after action
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Profile dropdown overlay for mobile */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-gray-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - scrollable area */}
        <nav className="flex-1 overflow-y-auto py-4">
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
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
            {/* Logout Button */}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left hover:bg-red-600 hover:text-white transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Profile Section - fixed at bottom */}
        <div className="border-t border-gray-700 p-3 flex-shrink-0 relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" /> {/* Using Settings as a placeholder for user icon */}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-gray-400">{currentUser.role}</p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-40">
              <div className="p-3 border-b border-gray-600">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-400">{currentUser.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleViewProfile}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">View Details</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
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

export default AdminSidebar;