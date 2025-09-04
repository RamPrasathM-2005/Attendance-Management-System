import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, BookOpen, UserPlus, Eye, ChevronRight, X } from 'lucide-react';

const ManageStudents = () => {
  // Sample data - replace with actual API calls
  const [students, setStudents] = useState([
    {
      id: 1,
      rollNo: 'CS21001',
      name: 'John Doe',
      email: 'john.doe@college.edu',
      phone: '+91 9876543210',
      department: 'Computer Science',
      semester: 'S5',
      batch: 'A',
      enrolledCourses: [
        { courseId: 'CS501', courseName: 'Data Structures', batch: 'A', staff: 'Dr. Smith' },
        { courseId: 'CS502', courseName: 'Database Systems', batch: 'B', staff: 'Prof. Johnson' }
      ]
    },
    {
      id: 2,
      rollNo: 'CS21002',
      name: 'Jane Smith',
      email: 'jane.smith@college.edu',
      phone: '+91 9876543211',
      department: 'Computer Science',
      semester: 'S5',
      batch: 'B',
      enrolledCourses: [
        { courseId: 'CS501', courseName: 'Data Structures', batch: 'B', staff: 'Dr. Wilson' }
      ]
    },
    {
      id: 3,
      rollNo: 'EC21001',
      name: 'Mike Johnson',
      email: 'mike.johnson@college.edu',
      phone: '+91 9876543212',
      department: 'Electronics',
      semester: 'S3',
      batch: 'A',
      enrolledCourses: []
    }
  ]);

  const [availableCourses, setAvailableCourses] = useState([
    {
      courseId: 'CS501',
      courseName: 'Data Structures',
      semester: 'S5',
      department: 'Computer Science',
      batches: [
        { batchId: 'A', staff: 'Dr. Smith', enrolled: 35, capacity: 40 },
        { batchId: 'B', staff: 'Dr. Wilson', enrolled: 32, capacity: 40 },
        { batchId: 'C', staff: 'Prof. Davis', enrolled: 28, capacity: 40 }
      ]
    },
    {
      courseId: 'CS502',
      courseName: 'Database Systems',
      semester: 'S5',
      department: 'Computer Science',
      batches: [
        { batchId: 'A', staff: 'Prof. Johnson', enrolled: 38, capacity: 40 },
        { batchId: 'B', staff: 'Dr. Brown', enrolled: 30, capacity: 40 },
        { batchId: 'C', staff: 'Prof. Miller', enrolled: 25, capacity: 40 }
      ]
    },
    {
      courseId: 'CS503',
      courseName: 'Operating Systems',
      semester: 'S5',
      department: 'Computer Science',
      batches: [
        { batchId: 'A', staff: 'Dr. Taylor', enrolled: 33, capacity: 40 },
        { batchId: 'B', staff: 'Prof. Anderson', enrolled: 29, capacity: 40 },
        { batchId: 'C', staff: 'Dr. White', enrolled: 31, capacity: 40 }
      ]
    }
  ]);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    course: ''
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState(students);

  // Filter options
  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil'];
  const semesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = !filters.department || student.department === filters.department;
      const matchesSem = !filters.semester || student.semester === filters.semester;
      
      const matchesCourse = !filters.course || student.enrolledCourses.some(course => 
        course.courseName.toLowerCase().includes(filters.course.toLowerCase())
      );

      return matchesSearch && matchesDept && matchesSem && matchesCourse;
    });

    setFilteredStudents(filtered);
  }, [searchTerm, filters, students]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleEnrollToCourse = () => {
    setShowEnrollModal(true);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleBatchEnroll = (courseId, batchId, staff) => {
    // Update student's enrolled courses
    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        const isAlreadyEnrolled = student.enrolledCourses.some(course => course.courseId === courseId);
        if (!isAlreadyEnrolled) {
          return {
            ...student,
            enrolledCourses: [...student.enrolledCourses, {
              courseId,
              courseName: selectedCourse.courseName,
              batch: batchId,
              staff
            }]
          };
        }
      }
      return student;
    });

    setStudents(updatedStudents);
    
    // Update selected student
    const updatedSelectedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
    setSelectedStudent(updatedSelectedStudent);
    
    // Reset modal states
    setSelectedCourse(null);
    setShowEnrollModal(false);
    
    alert(`Student enrolled in ${selectedCourse.courseName} - Batch ${batchId} successfully!`);
  };

  const getAvailableCoursesForStudent = () => {
    if (!selectedStudent) return [];
    
    return availableCourses.filter(course => {
      const isAlreadyEnrolled = selectedStudent.enrolledCourses.some(
        enrolled => enrolled.courseId === course.courseId
      );
      const matchesDeptSem = course.department === selectedStudent.department && 
                           course.semester === selectedStudent.semester;
      
      return !isAlreadyEnrolled && matchesDeptSem;
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Students</h1>
        <p className="text-gray-600">Search, filter, and manage student enrollments</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={filters.semester}
            onChange={(e) => setFilters({...filters, semester: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>

          {/* Course Filter */}
          <input
            type="text"
            placeholder="Filter by course..."
            value={filters.course}
            onChange={(e) => setFilters({...filters, course: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Students ({filteredStudents.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedStudent?.id === student.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.rollNo}</p>
                      <p className="text-sm text-gray-500">{student.department} • {student.semester}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {student.enrolledCourses.length} Courses
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No students found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Details Panel */}
        <div className="lg:col-span-1">
          {selectedStudent ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Student Details</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">Roll No: {selectedStudent.rollNo}</p>
                  <p className="text-sm text-gray-600 mb-1">Email: {selectedStudent.email}</p>
                  <p className="text-sm text-gray-600 mb-1">Phone: {selectedStudent.phone}</p>
                  <p className="text-sm text-gray-600 mb-1">Department: {selectedStudent.department}</p>
                  <p className="text-sm text-gray-600">Semester: {selectedStudent.semester}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Enrolled Courses</h4>
                    <button
                      onClick={handleEnrollToCourse}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Enroll
                    </button>
                  </div>
                  {selectedStudent.enrolledCourses.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStudent.enrolledCourses.map((course, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm text-gray-900">{course.courseName}</p>
                          <p className="text-xs text-gray-600">Batch {course.batch} • {course.staff}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No courses enrolled</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Select a student to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Enroll {selectedStudent?.name} to Course
              </h2>
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!selectedCourse ? (
                <div>
                  <h3 className="font-medium text-blue-900 mb-4">Available Courses</h3>
                  <div className="space-y-3">
                    {getAvailableCoursesForStudent().map(course => (
                      <div
                        key={course.courseId}
                        onClick={() => handleCourseSelect(course)}
                        className="p-4 border border-blue-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-blue-900">{course.courseName}</h4>
                            <p className="text-sm text-blue-600">{course.courseId} • {course.semester}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>
                    ))}
                    {getAvailableCoursesForStudent().length === 0 && (
                      <p className="text-center text-blue-500 py-8">No available courses to enroll</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="mb-4 text-blue-600 hover:text-blue-700 text-sm flex items-center transition-colors"
                  >
                    ← Back to courses
                  </button>
                  <h3 className="font-medium text-blue-900 mb-4">
                    Select Batch for {selectedCourse.courseName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCourse.batches.map(batch => (
                      <div
                        key={batch.batchId}
                        className="p-4 border border-blue-200 rounded-lg hover:border-blue-400 transition-colors bg-blue-50"
                      >
                        <div className="text-center mb-3">
                          <h4 className="font-medium text-blue-900">Batch {batch.batchId}</h4>
                          <p className="text-sm text-blue-600">{batch.staff}</p>
                          <p className="text-xs text-blue-500 mt-1">
                            {batch.enrolled}/{batch.capacity} students
                          </p>
                        </div>
                        <button
                          onClick={() => handleBatchEnroll(selectedCourse.courseId, batch.batchId, batch.staff)}
                          disabled={batch.enrolled >= batch.capacity}
                          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            batch.enrolled >= batch.capacity
                              ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                          }`}
                        >
                          {batch.enrolled >= batch.capacity ? 'Full' : 'Enroll'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;