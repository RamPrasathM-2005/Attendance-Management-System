import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Users, 
  UserPlus, 
  Calendar,
  BookOpen,
  ChevronRight,
  X,
  Save,
  Eye,
  Settings,
  GraduationCap
} from 'lucide-react';

const ManageCourses = () => {
  // Sample data - replace with actual API calls
  const [courses, setCourses] = useState([
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Programming',
      credits: 4,
      type: 'Theory',
      semester: 'Semester 1',
      batch: 'B.Tech CSE 2024',
      batches: [
        { 
          id: 1, 
          name: 'Batch A', 
          students: 45,
          staff: [
            { id: 1, name: 'Dr. John Smith', role: 'Primary' },
            { id: 2, name: 'Prof. Sarah Wilson', role: 'Lab Assistant' }
          ]
        },
        { 
          id: 2, 
          name: 'Batch B', 
          students: 42,
          staff: [
            { id: 3, name: 'Dr. Mike Johnson', role: 'Primary' }
          ]
        }
      ]
    },
    {
      id: 2,
      code: 'CS201',
      name: 'Data Structures and Algorithms',
      credits: 3,
      type: 'Integrated',
      semester: 'Semester 3',
      batch: 'B.Tech CSE 2023',
      batches: [
        { 
          id: 3, 
          name: 'Batch A', 
          students: 38,
          staff: [
            { id: 4, name: 'Dr. Alice Brown', role: 'Primary' }
          ]
        }
      ]
    },
    {
      id: 3,
      code: 'CS301L',
      name: 'Database Management Lab',
      credits: 2,
      type: 'Lab',
      semester: 'Semester 5',
      batch: 'B.Tech CSE 2022',
      batches: [
        { 
          id: 4, 
          name: 'Batch A', 
          students: 35,
          staff: [
            { id: 5, name: 'Prof. David Lee', role: 'Lab Instructor' }
          ]
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  
  // Form states
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    credits: '',
    type: 'Theory',
    semester: '',
    description: ''
  });

  // Sample data for dropdowns
  const courseTypes = ['Theory', 'Lab', 'Integrated', 'Experiential'];
  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
  const availableStaff = [
    { id: 1, name: 'Dr. John Smith', department: 'CSE' },
    { id: 2, name: 'Prof. Sarah Wilson', department: 'CSE' },
    { id: 3, name: 'Dr. Mike Johnson', department: 'CSE' },
    { id: 4, name: 'Dr. Alice Brown', department: 'CSE' },
    { id: 5, name: 'Prof. David Lee', department: 'CSE' }
  ];

  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.semester.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCourse = () => {
    if (newCourse.code && newCourse.name && newCourse.credits) {
      const course = {
        id: courses.length + 1,
        ...newCourse,
        credits: parseInt(newCourse.credits),
        batches: []
      };
      setCourses([...courses, course]);
      setNewCourse({ code: '', name: '', credits: '', type: 'Theory', semester: '', description: '' });
      setShowCreateModal(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleAction = (action, course = null) => {
    setActiveAction(action);
    if (course) setSelectedCourse(course);
    
    // Route simulation - in real app, use React Router
    switch(action) {
      case 'allocateStaff':
        console.log(`Routing to: /admin/courses/${course?.id}/allocate-staff`);
        break;
      case 'allocateStudents':
        console.log(`Routing to: /admin/courses/${course?.id}/allocate-students`);
        break;
      case 'addBatch':
        console.log(`Routing to: /admin/courses/${course?.id}/add-batch`);
        break;
      case 'viewBatches':
        console.log(`Routing to: /admin/courses/${course?.id}/batches`);
        break;
      case 'editCourse':
        console.log(`Routing to: /admin/courses/${course?.id}/edit`);
        break;
      default:
        break;
    }
  };

  const getCourseTypeColor = (type) => {
    const colors = {
      'Theory': 'bg-blue-100 text-blue-800',
      'Lab': 'bg-green-100 text-green-800',
      'Integrated': 'bg-purple-100 text-purple-800',
      'Experiential': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-600 mt-1">Create and manage academic courses</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <Plus size={20} />
            Create Course
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses by code, name, or semester..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden cursor-pointer"
            onClick={() => handleCourseClick(course)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{course.code}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{course.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCourseTypeColor(course.type)}`}>
                  {course.type}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen size={16} className="mr-2" />
                  <span>Credits: {course.credits}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-2" />
                  <span>{course.semester}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users size={16} className="mr-2" />
                  <span>{course.batches?.length || 0} Batches</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('allocateStaff', course);
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <UserPlus size={16} />
                  Staff
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('allocateStudents', course);
                  }}
                  className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <GraduationCap size={16} />
                  Students
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search terms or create a new course.</p>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quick Create Course</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Code *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., CS101"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Programming"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credits *</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newCourse.type}
                      onChange={(e) => setNewCourse({...newCourse, type: e.target.value})}
                    >
                      {courseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Quick Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.code}</h2>
                  <p className="text-gray-600 mt-1">{selectedCourse.name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCourseTypeColor(selectedCourse.type)}`}>
                      {selectedCourse.type}
                    </span>
                    <span className="text-sm text-gray-500">{selectedCourse.credits} Credits</span>
                    <span className="text-sm text-gray-500">{selectedCourse.semester}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCourseDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <button
                  onClick={() => handleAction('allocateStaff', selectedCourse)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  Allocate Staff
                </button>
                <button
                  onClick={() => handleAction('allocateStudents', selectedCourse)}
                  className="bg-green-50 hover:bg-green-100 text-green-600 px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <GraduationCap size={16} />
                  Allocate Students
                </button>
                <button
                  onClick={() => handleAction('addBatch', selectedCourse)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Batch
                </button>
                <button
                  onClick={() => handleAction('editCourse', selectedCourse)}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Edit3 size={16} />
                  Edit Course
                </button>
              </div>

              {/* Batches Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Batches</h3>
                {selectedCourse.batches && selectedCourse.batches.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCourse.batches.map((batch) => (
                      <div key={batch.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{batch.name}</h4>
                            <p className="text-sm text-gray-500">{batch.students} students enrolled</p>
                          </div>
                          <button
                            onClick={() => handleAction('viewBatches', selectedCourse)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Staff:</h5>
                          <div className="flex flex-wrap gap-2">
                            {batch.staff.map((staff) => (
                              <div key={staff.id} className="bg-white px-3 py-1 rounded-full border border-gray-200">
                                <span className="text-sm text-gray-700">{staff.name}</span>
                                <span className="text-xs text-gray-500 ml-1">({staff.role})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No batches created for this course yet.</p>
                    <button
                      onClick={() => handleAction('addBatch', selectedCourse)}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Create First Batch
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Route Actions */}
      {activeAction && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Action: {activeAction} - Check console for route
        </div>
      )}
    </div>
  );
};

export default ManageCourses;