import React, { useState, useEffect } from 'react';
import { Users, Plus, BookOpen, UserPlus, Search, Filter, X, Check, ArrowUpDown, Edit3, Trash2 } from 'lucide-react';

const ManageStaff = () => {
  const [staffList, setStaffList] = useState([
    {
      id: 1,
      staffId: "STAFF001",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      phone: "+91 9876543210",
      department: "Computer Science",
      designation: "Professor",
      experience: "8 years",
      allocatedCourses: [
        { id: 1, code: "CS101", name: "Data Structures", batch: "Batch A", semester: "1", year: "2023" },
        { id: 2, code: "CS201", name: "Algorithms", batch: "Batch B", semester: "2", year: "2023" }
      ]
    },
    {
      id: 2,
      staffId: "STAFF002",
      name: "Prof. Michael Chen",
      email: "michael.chen@university.edu",
      phone: "+91 9876543211",
      department: "Information Technology",
      designation: "Associate Professor",
      experience: "6 years",
      allocatedCourses: [
        { id: 3, code: "IT301", name: "Database Systems", batch: "Batch A", semester: "3", year: "2023" }
      ]
    },
    {
      id: 3,
      staffId: "STAFF003",
      name: "Dr. Priya Sharma",
      email: "priya.sharma@university.edu",
      phone: "+91 9876543212",
      department: "Electronics",
      designation: "Assistant Professor",
      experience: "4 years",
      allocatedCourses: []
    },
    {
      id: 4,
      staffId: "STAFF004",
      name: "Prof. James Wilson",
      email: "james.wilson@university.edu",
      phone: "+91 9876543213",
      department: "Mechanical",
      designation: "Professor",
      experience: "10 years",
      allocatedCourses: [
        { id: 4, code: "ME401", name: "Thermodynamics", batch: "Batch C", semester: "4", year: "2022" }
      ]
    }
  ]);

  const [availableCourses] = useState([
    { id: 5, code: "CS301", name: "Operating Systems", department: "Computer Science", semester: "3", year: "2023", batches: ["Batch A", "Batch B", "Batch C"] },
    { id: 6, code: "IT201", name: "Web Technologies", department: "Information Technology", semester: "2", year: "2023", batches: ["Batch A", "Batch B", "Batch C"] },
    { id: 7, code: "EC101", name: "Digital Electronics", department: "Electronics", semester: "1", year: "2023", batches: ["Batch A", "Batch B", "Batch C"] },
    { id: 8, code: "ME201", name: "Fluid Mechanics", department: "Mechanical", semester: "2", year: "2023", batches: ["Batch A", "Batch B", "Batch C"] },
    { id: 9, code: "CS401", name: "Machine Learning", department: "Computer Science", semester: "4", year: "2022", batches: ["Batch A", "Batch B", "Batch C"] },
    { id: 10, code: "IT301", name: "Network Security", department: "Information Technology", semester: "3", year: "2022", batches: ["Batch A", "Batch B", "Batch C"] }
  ]);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCourseAllocation, setShowCourseAllocation] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Course allocation filters
  const [courseSearch, setCourseSearch] = useState('');
  const [courseDeptFilter, setCourseDeptFilter] = useState('');
  const [courseSemesterFilter, setCourseSemesterFilter] = useState('');
  const [courseYearFilter, setCourseYearFilter] = useState('');

  // Add new staff form
  const [newStaff, setNewStaff] = useState({
    staffId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    experience: ''
  });
  
  const departments = [...new Set(staffList.map(staff => staff.department))];
  const semesters = [...new Set(availableCourses.map(course => course.semester))].sort();
  const years = [...new Set(availableCourses.map(course => course.year))].sort().reverse();

  const filteredStaff = staffList
    .filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.staffId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === '' || staff.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'allocatedCourses') {
        aVal = a.allocatedCourses.length;
        bVal = b.allocatedCourses.length;
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                         course.code.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesDept = courseDeptFilter === '' || course.department === courseDeptFilter;
    const matchesSemester = courseSemesterFilter === '' || course.semester === courseSemesterFilter;
    const matchesYear = courseYearFilter === '' || course.year === courseYearFilter;
    
    return matchesSearch && matchesDept && matchesSemester && matchesYear;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
  };

  const handleAllocateCourse = (staff) => {
    setSelectedStaff(staff);
    setShowCourseAllocation(true);
    // Reset course allocation filters
    setCourseSearch('');
    setCourseDeptFilter('');
    setCourseSemesterFilter('');
    setCourseYearFilter('');
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedBatch(''); // Reset batch selection
  };

  const handleBatchAllocation = () => {
    if (selectedCourse && selectedBatch && selectedStaff) {
      const newAllocation = {
        id: selectedCourse.id,
        code: selectedCourse.code,
        name: selectedCourse.name,
        batch: selectedBatch,
        semester: selectedCourse.semester,
        year: selectedCourse.year
      };

      setStaffList(prev => prev.map(staff => 
        staff.id === selectedStaff.id 
          ? { ...staff, allocatedCourses: [...staff.allocatedCourses, newAllocation] }
          : staff
      ));

      // Reset selections
      setSelectedCourse(null);
      setSelectedBatch('');
      setShowCourseAllocation(false);
      setSelectedStaff(null);
      
      alert(`Course ${selectedCourse.code} allocated to ${selectedStaff.name} for ${selectedBatch}`);
    }
  };

  const handleRemoveCourse = (staffId, courseId) => {
    setStaffList(prev => prev.map(staff => 
      staff.id === staffId 
        ? { ...staff, allocatedCourses: staff.allocatedCourses.filter(course => course.id !== courseId) }
        : staff
    ));
  };

  const handleAddNewCourse = () => {
    alert("Redirecting to Manage Course page...");
    console.log("Navigate to /admin/manage-courses");
  };

  const handleAddStaff = () => {
    if (newStaff.staffId && newStaff.name && newStaff.department) {
      const staffToAdd = {
        id: staffList.length + 1,
        ...newStaff,
        allocatedCourses: []
      };
      
      setStaffList(prev => [...prev, staffToAdd]);
      setNewStaff({
        staffId: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        experience: ''
      });
      setShowAddStaff(false);
      alert(`Staff ${newStaff.name} added successfully!`);
    } else {
      alert('Please fill in required fields: Staff ID, Name, and Department');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Manage Staff</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddStaff(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add New Staff</span>
            </button>
            <button
              onClick={handleAddNewCourse}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Course</span>
            </button>
          </div>
        </div>

        {/* Search, Filter and Sort */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or staff ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="pl-10 pr-8 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="department">Sort by Department</option>
              <option value="designation">Sort by Designation</option>
              <option value="allocatedCourses">Sort by Course Count</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredStaff.length} of {staffList.length} staff members
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 flex flex-col h-[450px]"
            onClick={() => handleStaffClick(staff)}
          >
            {/* Header Section */}
            <div className="p-6 border-b border-gray-50 flex-shrink-0">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate">{staff.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{staff.designation}</p>
                  <p className="text-sm text-blue-600 font-medium">ID: {staff.staffId}</p>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-6 flex-1 overflow-hidden">
              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-gray-700 w-20 flex-shrink-0">Email:</span>
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-gray-700 w-20 flex-shrink-0">Dept:</span>
                  <span>{staff.department}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-gray-700 w-20 flex-shrink-0">Exp:</span>
                  <span className="text-blue-600 font-medium">{staff.experience}</span>
                </div>
              </div>

              {/* Allocated Courses Section */}
              <div className="border-t border-gray-50 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Allocated Courses</span>
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                    {staff.allocatedCourses.length}
                  </span>
                </div>
                
                <div className="min-h-[100px] max-h-[120px] overflow-y-auto">
                  {staff.allocatedCourses.length > 0 ? (
                    <div className="space-y-2">
                      {staff.allocatedCourses.slice(0, 3).map((course) => (
                        <div key={course.id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
                          <div className="font-semibold text-sm text-gray-900">{course.code}</div>
                          <div className="text-xs text-blue-600 font-medium">{course.batch} • Semester {course.semester}</div>
                        </div>
                      ))}
                      {staff.allocatedCourses.length > 3 && (
                        <div className="text-sm text-blue-600 font-medium pl-2">
                          +{staff.allocatedCourses.length - 3} more courses
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="text-sm text-gray-500 italic">No courses allocated yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Button - FIXED AT BOTTOM */}
            <div className="p-6 pt-4 border-t border-gray-50 bg-gray-50/50 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAllocateCourse(staff);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <UserPlus className="h-4 w-4" />
                <span>Allocate Course</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Staff</h2>
              <button
                onClick={() => setShowAddStaff(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID *</label>
                <input
                  type="text"
                  value={newStaff.staffId}
                  onChange={(e) => setNewStaff({...newStaff, staffId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., STAFF005"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@university.edu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  <option value="Civil">Civil</option>
                  <option value="Chemical">Chemical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <select
                  value={newStaff.designation}
                  onChange={(e) => setNewStaff({...newStaff, designation: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Designation</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  value={newStaff.experience}
                  onChange={(e) => setNewStaff({...newStaff, experience: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5 years"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddStaff(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Details Modal */}
      {selectedStaff && !showCourseAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h2>
              <button
                onClick={() => setSelectedStaff(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Staff ID</p>
                <p className="text-sm text-gray-600">{selectedStaff.staffId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-600">{selectedStaff.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-sm text-gray-600">{selectedStaff.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Department</p>
                <p className="text-sm text-gray-600">{selectedStaff.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Designation</p>
                <p className="text-sm text-gray-600">{selectedStaff.designation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Experience</p>
                <p className="text-sm text-gray-600">{selectedStaff.experience}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Allocated Courses</h3>
              {selectedStaff.allocatedCourses.length > 0 ? (
                <div className="space-y-3">
                  {selectedStaff.allocatedCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{course.code}</p>
                        <p className="text-sm text-gray-600">{course.name}</p>
                        <p className="text-sm text-blue-600">{course.batch} • Semester {course.semester} • Year {course.year}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveCourse(selectedStaff.id, course.id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 text-sm bg-red-50 hover:bg-red-100 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No courses allocated yet</p>
              )}
            </div>

            <button
              onClick={() => handleAllocateCourse(selectedStaff)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Allocate New Course</span>
            </button>
          </div>
        </div>
      )}

      {/* Course Allocation Modal */}
      {showCourseAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Allocate Course to {selectedStaff?.name}
              </h2>
              <button
                onClick={() => {
                  setShowCourseAllocation(false);
                  setSelectedCourse(null);
                  setSelectedBatch('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Course Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={courseDeptFilter}
                  onChange={(e) => setCourseDeptFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {[...new Set(availableCourses.map(course => course.department))].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                
                <select
                  value={courseSemesterFilter}
                  onChange={(e) => setCourseSemesterFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Semesters</option>
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                
                <select
                  value={courseYearFilter}
                  onChange={(e) => setCourseYearFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredCourses.length} of {availableCourses.length} available courses
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Courses</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{course.code}</p>
                          <p className="text-sm text-gray-600">{course.name}</p>
                          <div className="flex space-x-4 mt-1">
                            <p className="text-sm text-gray-500">{course.department}</p>
                            <p className="text-sm text-gray-500">Semester {course.semester}</p>
                            <p className="text-sm text-gray-500">Year {course.year}</p>
                          </div>
                        </div>
                        {selectedCourse?.id === course.id && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No courses found matching your filters</p>
                  </div>
                )}
              </div>
            </div>

            {selectedCourse && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Select Batch for {selectedCourse.code}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedCourse.batches.map(batch => (
                    <button
                      key={batch}
                      onClick={() => setSelectedBatch(batch)}
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        selectedBatch === batch
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {batch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleBatchAllocation}
              disabled={!selectedCourse || !selectedBatch}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Allocate Course</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;