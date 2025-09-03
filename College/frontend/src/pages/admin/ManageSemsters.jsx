import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Users, Calendar, ChevronRight, GraduationCap } from 'lucide-react';

const ManageSemesters = () => {
  const [semesters, setSemesters] = useState([
    {
      id: 1,
      batch: '2023-2027',
      department: 'Computer Science Engineering',
      semester: 3,
      totalCourses: 6,
      totalStudents: 45,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      batch: '2024-2028',
      department: 'Information Technology',
      semester: 1,
      totalCourses: 5,
      totalStudents: 52,
      createdAt: '2024-08-20'
    },
    {
      id: 3,
      batch: '2022-2026',
      department: 'Electronics & Communication',
      semester: 5,
      totalCourses: 7,
      totalStudents: 38,
      createdAt: '2023-07-10'
    },
    {
      id: 4,
      batch: '2023-2027',
      department: 'Mechanical Engineering',
      semester: 2,
      totalCourses: 6,
      totalStudents: 41,
      createdAt: '2024-01-22'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [formData, setFormData] = useState({
    batch: '',
    department: '',
    semester: ''
  });

  // Sample courses for selected semester
  const [semesterCourses] = useState({
    1: [
      { id: 1, code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, type: 'Core' },
      { id: 2, code: 'CS302', name: 'Database Management Systems', credits: 3, type: 'Core' },
      { id: 3, code: 'CS303', name: 'Computer Networks', credits: 3, type: 'Core' },
      { id: 4, code: 'CS304', name: 'Software Engineering', credits: 3, type: 'Core' },
      { id: 5, code: 'HS301', name: 'Technical Communication', credits: 2, type: 'Humanities' },
      { id: 6, code: 'CS305', name: 'Web Technologies Lab', credits: 2, type: 'Lab' }
    ]
  });

  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];

  const handleCreateSemester = () => {
    if (!formData.batch || !formData.department || !formData.semester) {
      alert('Please fill all fields');
      return;
    }
    
    const newSemester = {
      id: semesters.length + 1,
      ...formData,
      totalCourses: 0,
      totalStudents: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSemesters([...semesters, newSemester]);
    setFormData({ batch: '', department: '', semester: '' });
    setShowCreateForm(false);
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
  };

  const handleCourseClick = (course) => {
    // Navigate to course details or manage courses page
    console.log('Navigate to course:', course);
  };

  const handleAddCourses = () => {
    // Navigate to manage courses page
    console.log('Navigate to manage courses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Manage Semesters</h1>
          </div>
          <p className="text-gray-600">Create and manage semesters for different batches and departments</p>
        </div>

        {!selectedSemester ? (
          <>
            {/* Existing Semesters Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Existing Semesters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {semesters.map((semester, index) => (
                  <div
                    key={semester.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                    style={{
                      animation: `slideIn 0.6s ease-out ${index * 0.1}s both`
                    }}
                    onClick={() => handleSemesterClick(semester)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">Sem {semester.semester}</div>
                          <div className="text-sm text-blue-600 font-medium">{semester.batch}</div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{semester.department}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Courses</span>
                          <span className="font-medium text-gray-800">{semester.totalCourses}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Students</span>
                          <span className="font-medium text-gray-800">{semester.totalStudents}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Created {semester.createdAt}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create New Semester Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Semester
                </h2>
                <button
                  onClick={handleAddCourses}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Manage Courses
                </button>
              </div>

              {!showCreateForm ? (
                <div className="text-center py-8">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Add New Semester</h3>
                  <p className="text-gray-600 mb-6">Create a new semester for a specific batch and department</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create Semester
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                      <input
                        type="text"
                        placeholder="e.g., 2025-2029"
                        value={formData.batch}
                        onChange={(e) => setFormData({...formData, batch: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select Semester</option>
                        {[1,2,3,4,5,6,7,8].map((sem) => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleCreateSemester}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Create Semester
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Selected Semester View */
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedSemester(null)}
                className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 transform rotate-180" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedSemester.department} - Semester {selectedSemester.semester}
                </h2>
                <p className="text-gray-600">Batch: {selectedSemester.batch}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Courses</h3>
                <button
                  onClick={handleAddCourses}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Courses
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(semesterCourses[selectedSemester.id] || []).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseClick(course)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-blue-600">{course.code}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{course.type}</span>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-2">{course.name}</h4>
                    <div className="text-sm text-gray-600">
                      Credits: {course.credits}
                    </div>
                  </div>
                ))}
              </div>

              {(!semesterCourses[selectedSemester.id] || semesterCourses[selectedSemester.id].length === 0) && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses added yet</p>
                  <button
                    onClick={handleAddCourses}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Course
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ManageSemesters;