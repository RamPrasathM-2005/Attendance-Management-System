import React, { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('In progress');
  const [sortBy, setSortBy] = useState('Sort by last accessed');
  const [viewMode, setViewMode] = useState('Summary');

  const courses = [
    { id: '23CS11E', title: 'Web Framework using Python - DVK Batch - O25-26', semester: '2025 - 2026 ODD SEMESTER', progress: 50, lastAccessed: '2025-08-20', bgColor: 'bg-purple-500' },
    { id: '23CS55C', title: 'Artificial Intelligence (DRYG Batch)', semester: '2025 - 2026 ODD SEMESTER', progress: 56, lastAccessed: '2025-08-15', bgColor: 'bg-gray-400' },
    { id: '25-26-ODD', title: 'OBJECT ORIENTED ANALYSIS AND DESIGN', semester: '2025 - 2026 ODD SEMESTER', progress: 33, lastAccessed: '2025-08-18', bgColor: 'bg-yellow-500' },
    { id: '23CS42', title: 'Software Engineering Principles', semester: '2025 - 2026 ODD SEMESTER', progress: 75, lastAccessed: '2025-08-10', bgColor: 'bg-blue-500' },
    { id: '23CS61', title: 'Computer Graphics and Visualization', semester: '2025 - 2026 ODD SEMESTER', progress: 85, lastAccessed: '2025-08-22', bgColor: 'bg-green-500' },
    { id: '23CS34', title: 'Database Management Systems', semester: '2025 - 2026 ODD SEMESTER', progress: 40, lastAccessed: '2025-08-12', bgColor: 'bg-red-500' }
  ];

  let filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filteredCourses.sort((a, b) => {
    if (sortBy === 'Sort by last accessed') return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    if (sortBy === 'Sort by name') return a.title.localeCompare(b.title);
    if (sortBy === 'Sort by progress') return b.progress - a.progress;
    return 0;
  });

  const handleCourseClick = (course) => {
    navigate(`/staff/options/${course.id}`, { state: { course } });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">Hi, RAM PRASATH M! 👋</h1>
      </header>

      {/* Course Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-700">Course Overview</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status Filter */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="In progress">In progress</option>
          <option value="All">All courses</option>
          <option value="Completed">Completed</option>
          <option value="Not started">Not started</option>
        </select>

        {/* Search */}
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sort By */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Sort by last accessed">Sort by last accessed</option>
          <option value="Sort by name">Sort by name</option>
          <option value="Sort by progress">Sort by progress</option>
        </select>

        {/* View Mode */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
        >
          <option value="Summary">Summary</option>
          <option value="Card">Card</option>
          <option value="List">List</option>
        </select>
      </div>

      {/* Courses */}
      <div className={viewMode === 'Card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => handleCourseClick(course)}
            className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer ${
              viewMode === 'Card' ? 'flex flex-col items-start' : ''
            }`}
          >
            <div className={`w-16 h-16 ${course.bgColor} rounded-lg flex-shrink-0 mb-4`}></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-blue-600 hover:text-blue-700 mb-1">
                    {course.id} - {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{course.semester}</p>
                  <span className="text-sm text-gray-600 font-medium">{course.progress}% complete</span>
                </div>
                <div className="pointer-events-none">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
