import React, { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';

const CourseDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('In progress');
  const [sortBy, setSortBy] = useState('Sort by last accessed');

  const courses = [
    {
      id: '23CS11E',
      title: 'Web Framework using Python - DVK Batch - O25-26',
      semester: '2025 - 2026 ODD SEMESTER',
      bgColor: 'bg-purple-500'
    },
    {
      id: '23CS55C',
      title: 'Artificial Intelligence (DRYG Batch) 2025-2026 Odd Sem',
      semester: '2025 - 2026 ODD SEMESTER',
      bgColor: 'bg-gray-400'
    },
    {
      id: '25-26-ODD',
      title: 'OBJECT ORIENTED ANALYSIS AND DESIGN',
      semester: '2025 - 2026 ODD SEMESTER',
      bgColor: 'bg-yellow-500'
    },
    {
      id: '23CS42',
      title: 'Software Engineering Principles',
      semester: '2025 - 2026 ODD SEMESTER',
      bgColor: 'bg-blue-500'
    },
    {
      id: '23CS61',
      title: 'Computer Graphics and Visualization',
      semester: '2025 - 2026 ODD SEMESTER',
      bgColor: 'bg-green-500'
    },
    {
      id: '23CS34',
      title: 'Database Management Systems',
      semester: '2025 - 2026 ODD SEMESTER',
      bgColor: 'bg-red-500'
    }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Hi, KALAI M! 👋</h1>

        </div>
      </header>

      {/* Course Overview Title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-700">Course Overview</h2>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="In progress">In progress</option>
          <option value="All">All courses</option>
          <option value="Completed">Completed</option>
          <option value="Not started">Not started</option>
        </select>

        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Sort by last accessed">Sort by last accessed</option>
          <option value="Sort by name">Sort by name</option>
          <option value="Sort by progress">Sort by progress</option>
        </select>

        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="Summary">Summary</option>
          <option value="Card">Card</option>
          <option value="List">List</option>
        </select>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 flex items-start gap-4">
              <div className={`w-16 h-16 ${course.bgColor} rounded-lg flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-blue-600 hover:text-blue-700 mb-1 cursor-pointer">
                      {course.id} - {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{course.semester}</p>
                    {course.description && (
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">{course.description}</p>
                    )}
                    <span className="text-sm text-gray-600 font-medium">{course.progress}% complete</span>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

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
    </div>
  );
};

export default CourseDashboard;
