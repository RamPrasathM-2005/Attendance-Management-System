import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Users, UserPlus, Calendar, BookOpen, ChevronRight, X, Save, Eye, Settings, GraduationCap, Trash2 } from 'lucide-react';
import CourseForm from './ManageSemesters/CourseForm';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/admin';

const deptNameMap = {
  1: 'Computer Science Engineering',
  2: 'Electronics and Communication Engineering',
  3: 'Mechanical Engineering',
};

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [sections, setSections] = useState({});
  const [fetchingSections, setFetchingSections] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ dept: '', semester: '', name: '', type: '' });
  const [staffSearch, setStaffSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showAllocateStaffModal, setShowAllocateStaffModal] = useState(false);
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [newBatchForm, setNewBatchForm] = useState({ numberOfBatches: 1 });

  const courseTypes = ['THEORY', 'PRACTICAL', 'INTEGRATED', 'PROJECT'];
  const categories = ['BSC', 'ESC', 'PEC', 'OEC', 'EEC', 'HSMC'];

  // Debug state changes
  useEffect(() => {
    console.log('Courses state:', courses);
    console.log('Sections state:', sections);
  }, [courses, sections]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const semRes = await axios.get(`${API_BASE}/semesters`);
      setSemesters(semRes.data.data || []);

      const courseRes = await axios.get(`${API_BASE}/courses`);
      let allCourses = courseRes.data.data || [];

      allCourses = allCourses.map(course => {
        const semester = semRes.data.data.find(s => s.semesterId === course.semesterId);
        return { ...course, semesterDetails: semester };
      });

      allCourses.sort((a, b) => b.courseId - a.courseId);
      setCourses(allCourses);

      const usersRes = await axios.get(`${API_BASE}/users`);
      let staffData = usersRes.data.data.filter(user => user.departmentId);
      staffData = staffData.map(user => ({
        id: user.staffId || user.userId || user.id,
        name: user.name || user.fullName,
        departmentId: user.departmentId,
        departmentName: deptNameMap[user.departmentId] || user.departmentName || 'Unknown',
      }));
      const uniqueStaff = staffData.filter((staff, index, self) =>
        index === self.findIndex(s => s.id === staff.id)
      );
      setStaffList(uniqueStaff);
      toast.success('Fetched all staff successfully');
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
      toast.error('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStaff = () => {
    return staffList.filter(staff =>
      staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      staff.id.toLowerCase().includes(staffSearch.toLowerCase()) ||
      staff.departmentName.toLowerCase().includes(staffSearch.toLowerCase())
    );
  };

  const fetchCourseStaff = async (courseId) => {
    setFetchingSections(true);
    try {
      const course = courses.find(c => c.courseId === courseId);
      if (!course) {
        toast.error('Course not found');
        return;
      }

      const sectionRes = await axios.get(`${API_BASE}/courses/${course.courseCode}/sections`);
      console.log('Fetched sections for course', course.courseCode, sectionRes.data);
      if (sectionRes.data?.status !== 'success' || !Array.isArray(sectionRes.data.data)) {
        toast.error('Failed to fetch sections or invalid response');
        console.error('Invalid section response:', sectionRes.data);
        setSections(prev => ({ ...prev, [courseId]: {} }));
        return;
      }

      const batches = sectionRes.data.data.reduce((acc, section) => {
        if (section.sectionName) {
          acc[section.sectionName] = [];
        }
        return acc;
      }, {});

      const staffRes = await axios.get(`${API_BASE}/courses/${courseId}/staff`);
      console.log('Fetched staff for course', courseId, staffRes.data);
      if (staffRes.data?.status === 'success' && Array.isArray(staffRes.data.data)) {
        staffRes.data.data.forEach(alloc => {
          if (batches[alloc.sectionName]) {
            batches[alloc.sectionName].push({
              staffId: alloc.staffId,
              staffName: alloc.staffName,
              staffCourseId: alloc.staffCourseId,
              sectionId: alloc.sectionId,
              sectionName: alloc.sectionName,
              departmentId: alloc.departmentId,
              departmentName: alloc.departmentName,
            });
          }
        });
      } else {
        toast.error('Failed to fetch staff allocations or invalid response');
        console.error('Invalid staff response:', staffRes.data);
      }

      setSections(prev => ({ ...prev, [courseId]: batches }));
      setSelectedCourse(prev => ({
        ...prev,
        courseId,
        courseCode: course.courseCode,
        allocations: staffRes.data.data || [],
      }));
      toast.success('Fetched course staff successfully');
    } catch (err) {
      console.error('Error fetching course staff or sections:', err.response || err);
      toast.error('Error fetching course staff: ' + (err.response?.data?.message || err.message));
      setSections(prev => ({ ...prev, [courseId]: {} }));
    } finally {
      setFetchingSections(false);
    }
  };

  const handleAllocateStaff = async (staffId) => {
    if (!selectedCourse || !selectedBatch || !staffId) {
      toast.error('Missing course, batch, or staff information');
      console.error('Missing required inputs:', { selectedCourse, selectedBatch, staffId });
      return;
    }

    const staff = staffList.find(s => s.id === staffId);
    if (!staff || !staff.id || !staff.departmentId) {
      toast.error('Staff not found or missing required fields');
      console.error('Staff lookup failed:', { staffId, staffList });
      return;
    }

    const currentSections = sections[selectedCourse.courseId] || {};
    const isStaffAlreadyAllocated = Object.entries(currentSections).some(([sectionName, staffs]) =>
      sectionName !== selectedBatch && staffs.some(s => s.staffId === staffId)
    );
    if (isStaffAlreadyAllocated) {
      toast.error(`Staff ${staff.name} is already allocated to another batch for course ${selectedCourse.courseCode}`);
      return;
    }

    let sectionId = null;
    try {
      const sectionRes = await axios.get(`${API_BASE}/courses/${selectedCourse.courseCode}/sections`);
      console.log('Sections API response:', sectionRes.data);
      if (sectionRes.data?.status !== 'success' || !Array.isArray(sectionRes.data.data)) {
        toast.error('Failed to fetch sections');
        console.error('Section API response:', sectionRes.data);
        return;
      }
      const matchingSection = sectionRes.data.data.find(s => s.sectionName === selectedBatch);
      if (!matchingSection || !matchingSection.sectionId) {
        toast.error(`Section ${selectedBatch} not found for course ${selectedCourse.courseCode}`);
        console.error('Section not found:', { selectedBatch, sections: sectionRes.data.data });
        return;
      }
      sectionId = matchingSection.sectionId;
    } catch (err) {
      console.error('Error fetching sections:', err.response || err);
      toast.error('Error fetching section ID: ' + (err.response?.data?.message || err.message));
      return;
    }

    const payload = {
      staffId: staff.id,
      courseCode: selectedCourse.courseCode,
      sectionId,
      departmentId: staff.departmentId,
    };

    if (!payload.staffId || !payload.courseCode || !payload.sectionId || !payload.departmentId) {
      toast.error('Invalid payload: missing required fields');
      console.error('Invalid payload:', payload);
      return;
    }

    console.log('Allocation payload:', payload);

    try {
      const res = await axios.post(`${API_BASE}/courses/${selectedCourse.courseId}/staff`, payload);
      if (res.status === 201) {
        setShowAllocateStaffModal(false);
        setStaffSearch('');
        await fetchCourseStaff(selectedCourse.courseId);
        setShowCourseDetailsModal(true);
        toast.success('Staff allocated successfully');
      } else {
        toast.error('Failed to allocate staff: ' + (res.data?.message || 'Unknown error'));
        console.error('Allocation failed:', res.data);
      }
    } catch (err) {
      console.error('Error allocating staff:', err.response || err);
      toast.error('Error allocating staff: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBatch = async (courseCode, sectionName) => {
    if (!courseCode || !sectionName) {
      toast.error('Missing course or section info');
      return;
    }
    if (!confirm(`Delete batch ${sectionName}? This action cannot be undone.`)) return;

    try {
      const res = await axios.delete(`${API_BASE}/courses/${courseCode}/sections/${sectionName}`);
      if (res.status === 200) {
        console.log(`Deleted batch ${sectionName} for course ${courseCode}`);
        await fetchCourseStaff(selectedCourse.courseId); // Refresh sections
        setSections(prev => {
          const updatedSections = { ...prev[selectedCourse.courseId] };
          delete updatedSections[sectionName]; // Remove deleted batch
          return { ...prev, [selectedCourse.courseId]: updatedSections };
        });
        setShowCourseDetailsModal(true);
        toast.success('Batch deleted successfully');
      } else {
        toast.error('Failed to delete batch: ' + (res.data?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting batch:', err.response || err);
      toast.error('Error deleting batch: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteStaff = async (staffCourseId) => {
    if (!confirm('Remove this staff from the batch?')) return;

    try {
      const res = await axios.delete(`${API_BASE}/staff-courses/${staffCourseId}`);
      if (res.status === 200) {
        await fetchCourseStaff(selectedCourse.courseId);
        setShowCourseDetailsModal(true);
        toast.success('Staff removed successfully');
      } else {
        toast.error('Failed to remove staff');
      }
    } catch (err) {
      toast.error('Error removing staff: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditStaff = (staffCourseId) => {
    const allocation = selectedCourse.allocations.find(a => a.staffCourseId === staffCourseId);
    if (allocation) {
      setSelectedBatch(allocation.sectionName);
      setStaffSearch(allocation.staffName);
      setShowAllocateStaffModal(true);
      setShowCourseDetailsModal(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setSections(prev => ({
      ...prev,
      [course.courseId]: prev[course.courseId] || {},
    }));
    setShowCourseDetailsModal(true);
    fetchCourseStaff(course.courseId);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Delete this course?')) return;
    try {
      const res = await axios.delete(`${API_BASE}/courses/${courseId}`);
      if (res.status === 200) {
        await fetchData();
        toast.success('Course deleted successfully');
      } else {
        toast.error('Failed to delete course');
      }
    } catch (err) {
      toast.error('Error deleting course: ' + (err.response?.data?.message || err.message));
    }
  };

  const getCourseTypeColor = (type) => {
    const colors = {
      'THEORY': 'bg-blue-100 text-blue-800',
      'PRACTICAL': 'bg-green-100 text-green-800',
      'INTEGRATED': 'bg-purple-100 text-purple-800',
      'PROJECT': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const openCreateModal = () => {
    setSelectedSemesterId('');
    setShowCreateModal(true);
  };

  const handleNextToForm = () => {
    if (!selectedSemesterId) {
      toast.error('Please select a semester');
      return;
    }
    setShowCreateModal(false);
    setShowCourseForm(true);
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !newBatchForm.numberOfBatches) {
      toast.error('Missing course or number of batches');
      return;
    }
    const numberOfBatches = parseInt(newBatchForm.numberOfBatches) || 1;
    console.log('Adding batches:', { courseCode: selectedCourse.courseCode, numberOfBatches });
    
    try {
      const res = await axios.post(`${API_BASE}/courses/${selectedCourse.courseCode}/sections`, {
        numberOfSections: numberOfBatches,
      });
      console.log('Batch addition response:', res.data);
      if (res.status === 201) {
        setShowAddBatchModal(false);
        setNewBatchForm({ numberOfBatches: 1 });
        await fetchCourseStaff(selectedCourse.courseId);
        setShowCourseDetailsModal(true);
        toast.success(`Added ${numberOfBatches} batch${numberOfBatches > 1 ? 'es' : ''} successfully`);
      } else {
        toast.error('Failed to add batches: ' + (res.data?.message || 'Unknown error'));
        console.error('Batch addition failed:', res.data);
      }
    } catch (err) {
      console.error('Error adding batches:', err.response || err);
      toast.error('Error adding batches: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const filteredCourses = courses.filter(course => {
    const { dept, semester, name, type } = filters;
    const semDetails = course.semesterDetails;
    return (
      (!dept || semDetails?.branch === dept) &&
      (!semester || semDetails?.semesterNumber.toString() === semester) &&
      (!name || course.courseTitle.toLowerCase().includes(name.toLowerCase())) &&
      (!type || course.type === type)
    );
  });

  const displayCourses = Object.keys(filters).some(key => filters[key])
    ? filteredCourses
    : courses;

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage academic courses with batches and staff</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg font-semibold"
          >
            <Plus size={20} />
            Add Course
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-wrap gap-4 items-end justify-center">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filters.dept}
                onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {[...new Set(semesters.map(s => s.branch))].map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {[...new Set(semesters.map(s => s.semesterNumber))].sort((a, b) => a - b).map(num => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {courseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button
              onClick={() => setFilters({ dept: '', semester: '', name: '', type: '' })}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
            >
              <Search size={16} />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCourses.map((course) => {
          const sem = course.semesterDetails;
          const numBatches = sections[course.courseId] ? Object.keys(sections[course.courseId]).length : 0;
          return (
            <div
              key={course.courseId}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden cursor-pointer border-2 border-gray-200"
              onClick={() => handleCourseClick(course)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{course.courseCode}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{course.courseTitle}</p>
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
                    <span>Semester: {sem ? ` ${sem.semesterNumber} (${sem.branch})` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users size={16} className="mr-2" />
                    <span>{numBatches} Batches</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Settings size={16} className="mr-2" />
                    <span>Category: {course.category}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.courseId); }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your filters or create a new course.</p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Select Semester for New Course</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester *</label>
                <select
                  value={selectedSemesterId}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesters.map(sem => (
                    <option key={sem.semesterId} value={sem.semesterId}>
                      Semester {sem.semesterNumber} - {sem.branch} {sem.batch || ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNextToForm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  disabled={!selectedSemesterId}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCourseForm && (
        <CourseForm
          isOpen={showCourseForm}
          onClose={() => {
            setShowCourseForm(false);
            setSelectedSemesterId('');
            fetchData();
          }}
          semesterId={selectedSemesterId}
          course={null}
          onRefresh={fetchData}
        />
      )}

      {showEditModal && selectedCourse && (
        <CourseForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            fetchData();
          }}
          semesterId={selectedCourse.semesterId}
          course={selectedCourse}
          onRefresh={fetchData}
        />
      )}

      {showAddBatchModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Batches to {selectedCourse.courseCode}</h2>
                <button onClick={() => setShowAddBatchModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddBatch}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Batches *</label>
                  <input
                    type="number"
                    min="1"
                    value={newBatchForm.numberOfBatches}
                    onChange={(e) => setNewBatchForm({ numberOfBatches: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Batches will be auto-generated as Batch1, Batch2, etc.</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddBatchModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    Add Batches
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCourseDetailsModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.courseCode} - {selectedCourse.courseTitle}</h2>
                <button
                  onClick={() => {
                    setShowCourseDetailsModal(false);
                    setSelectedCourse(null);
                    setSections(prev => ({ ...prev, [selectedCourse.courseId]: {} }));
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => {
                    openEditModal(selectedCourse);
                    setShowCourseDetailsModal(false);
                  }}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Edit3 size={16} />
                  Edit Course
                </button>
                <button
                  onClick={() => {
                    setShowAddBatchModal(true);
                    setShowCourseDetailsModal(false);
                  }}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Batch
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Batches ({sections[selectedCourse.courseId] ? Object.keys(sections[selectedCourse.courseId]).length : 0})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {fetchingSections ? (
                  <p className="text-gray-500 italic">Loading batches...</p>
                ) : !sections[selectedCourse.courseId] || Object.keys(sections[selectedCourse.courseId]).length === 0 ? (
                  <p className="text-gray-500 italic">No batches available. Add batches to get started.</p>
                ) : (
                  Object.entries(sections[selectedCourse.courseId]).map(([sectionName, staffs]) => (
                    <div key={sectionName} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-900">{sectionName}</h4>
                          <span className="text-sm text-gray-500">{staffs ? staffs.length : 0} Staff Assigned</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {staffs && staffs.length > 0 ? (
                            staffs.map(staff => (
                              <span key={staff.staffId} className="text-xs bg-white px-2 py-1 rounded-full border text-gray-700">
                                {staff.staffName || staff.name || 'Unknown'}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No staff assigned</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {staffs && staffs.length > 0 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStaff(staffs[0].staffCourseId);
                              }}
                              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStaff(staffs[0].staffCourseId);
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </>
                        )}
                        {(!staffs || staffs.length === 0) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBatch(sectionName);
                              setShowAllocateStaffModal(true);
                              setShowCourseDetailsModal(false);
                            }}
                            className="bg-green-50 hover:bg-green-100 text-green-600 px-2 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <UserPlus size={14} />
                            Allocate Staff
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBatch(selectedCourse.courseCode, sectionName)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          Delete Batch
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAllocateStaffModal && selectedCourse && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Allocate Staff to {selectedBatch} ({selectedCourse.courseCode})</h2>
                <button
                  onClick={() => {
                    setShowAllocateStaffModal(false);
                    setStaffSearch('');
                    setShowCourseDetailsModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name, ID, or department..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-64 overflow-y-auto mb-4">
                {getFilteredStaff().length > 0 ? (
                  getFilteredStaff().map(staff => (
                    <div
                      key={staff.id}
                      onClick={() => handleAllocateStaff(staff.id)}
                      className="cursor-pointer bg-gray-50 p-2 rounded-lg mb-2 hover:bg-gray-100 flex justify-between items-center"
                    >
                      <span>{staff.name} (ID: {staff.id}, Dept: {staff.departmentName})</span>
                      <UserPlus size={16} className="text-green-600" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No staff found matching the search.</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllocateStaffModal(false);
                    setStaffSearch('');
                    setShowCourseDetailsModal(true);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;