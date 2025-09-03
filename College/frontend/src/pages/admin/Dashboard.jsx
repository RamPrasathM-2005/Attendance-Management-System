import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Plus,
  Settings,
  BarChart3,
  Clock,
  UserPlus,
  BookPlus,
  CalendarPlus,
  UserCog,
  FileText,
  TrendingUp,
  Eye,
  Edit,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const AdminDashboard = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(true);

  // Mock data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    totalSemesters: 8,
    totalCourses: 45,
    totalStaff: 23,
    totalStudents: 1200,
    recentSemesters: [
      { id: 1, name: "B.Tech CSE Sem 6", batch: "2022-26", students: 120 },
      { id: 2, name: "M.Tech AI Sem 2", batch: "2023-25", students: 45 },
      { id: 3, name: "B.E ECE Sem 4", batch: "2023-27", students: 90 }
    ],
    recentCourses: [
      { id: 1, name: "Data Structures", code: "CS201", staff: "Dr. Smith" },
      { id: 2, name: "Machine Learning", code: "AI301", staff: "Dr. Johnson" },
      { id: 3, name: "Digital Electronics", code: "EC202", staff: "Dr. Brown" }
    ]
  });

  // All action options
  const allActions = [
    { name: "Create Semester", icon: <CalendarPlus className="w-4 h-4" />, action: () => navigateTo("create-semester") },
    { name: "View Semesters", icon: <Eye className="w-4 h-4" />, action: () => navigateTo("semesters") },
    { name: "Edit Semester", icon: <Edit className="w-4 h-4" />, action: () => navigateTo("edit-semester") },
    { name: "Create Course", icon: <BookPlus className="w-4 h-4" />, action: () => navigateTo("create-course") },
    { name: "View Courses", icon: <Eye className="w-4 h-4" />, action: () => navigateTo("courses") },
    { name: "Allocate Course", icon: <Settings className="w-4 h-4" />, action: () => navigateTo("course-allocation") },
    { name: "Add Staff", icon: <UserPlus className="w-4 h-4" />, action: () => navigateTo("add-staff") },
    { name: "View Staff", icon: <Eye className="w-4 h-4" />, action: () => navigateTo("staff") },
    { name: "Allocate Staff", icon: <UserCog className="w-4 h-4" />, action: () => navigateTo("allocate-staff") },
    { name: "Add Student", icon: <UserPlus className="w-4 h-4" />, action: () => navigateTo("add-student") },
    { name: "View Students", icon: <Eye className="w-4 h-4" />, action: () => navigateTo("students") },
    { name: "Allocate Students", icon: <Settings className="w-4 h-4" />, action: () => navigateTo("allocate-students") }
  ];

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (isScrolling) {
        setScrollPosition(prev => {
          const maxScroll = allActions.length * 116; // Each button is ~116px with gap
          if (prev >= maxScroll) {
            return 0; // Reset to start for seamless loop
          }
          return prev + 1;
        });
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isScrolling, allActions.length]);

  // Navigation function
  const navigateTo = (page) => {
    console.log(`Navigating to: ${page}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your institution efficiently</p>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Semesters</p>
              <p className="text-xl font-bold text-gray-800">{dashboardData.totalSemesters}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-400">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-blue-400 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Courses</p>
              <p className="text-xl font-bold text-gray-800">{dashboardData.totalCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-slate-500">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-slate-500 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Staff</p>
              <p className="text-xl font-bold text-gray-800">{dashboardData.totalStaff}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
          <div className="flex items-center">
            <GraduationCap className="w-6 h-6 text-gray-500 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Students</p>
              <p className="text-xl font-bold text-gray-800">{dashboardData.totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Scrolling Management Options */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Management Options</h3>
          <button
            onClick={() => setIsScrolling(!isScrolling)}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
          >
            {isScrolling ? '⏸️ Pause' : '▶️ Play'}
          </button>
        </div>
        <div className="overflow-hidden relative bg-gray-50 rounded-lg p-2" style={{ height: '120px' }}>
          <div 
            className="flex gap-3 absolute top-2 left-2"
            style={{ 
              transform: `translateX(-${scrollPosition}px)`,
              transition: 'transform 0.1s linear'
            }}
          >
            {/* Render items twice for seamless loop */}
            {[...allActions, ...allActions, ...allActions].map((action, index) => (
              <button
                key={`action-${index}`}
                onClick={() => {
                  setIsScrolling(false);
                  action.action();
                }}
                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
                style={{ 
                  minWidth: '100px',
                  maxWidth: '100px',
                  height: '100px',
                  flexShrink: 0
                }}
              >
                <div className="text-blue-600 mb-2">
                  {action.icon}
                </div>
                <span className="text-xs text-center text-gray-700 font-medium leading-tight">
                  {action.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Action Buttons - Center */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigateTo("create-semester")}
              className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CalendarPlus className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">New Semester</span>
            </button>
            <button
              onClick={() => navigateTo("create-course")}
              className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookPlus className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">New Course</span>
            </button>
            <button
              onClick={() => navigateTo("allocate-staff")}
              className="flex items-center justify-center p-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <UserCog className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Staff Allocation</span>
            </button>
            <button
              onClick={() => navigateTo("allocate-students")}
              className="flex items-center justify-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Student Allocation</span>
            </button>
            <button
              onClick={() => navigateTo("timetable")}
              className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Timetable</span>
            </button>
            <button
              onClick={() => navigateTo("reports")}
              className="flex items-center justify-center p-4 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Reports</span>
            </button>
          </div>
        </div>

        {/* Right Column - Recent Data */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-800">Recent Semesters</h4>
              <button
                onClick={() => navigateTo("semesters")}
                className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
              >
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            <div className="space-y-2">
              {dashboardData.recentSemesters.map((semester) => (
                <div key={semester.id} className="p-2 bg-blue-50 rounded border border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 text-xs">{semester.name}</p>
                      <span className="text-xs text-gray-600">{semester.batch}</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {semester.students}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-800">Recent Courses</h4>
              <button
                onClick={() => navigateTo("manage-courses")}
                className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
              >
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            <div className="space-y-2">
              {dashboardData.recentCourses.map((course) => (
                <div key={course.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 text-xs">{course.name}</p>
                      <span className="text-xs text-blue-600">{course.code}</span>
                    </div>
                    <span className="text-xs text-gray-600">{course.staff}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-gray-700">Database Online</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-gray-700">Services Active</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-gray-700">Sync: 98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;