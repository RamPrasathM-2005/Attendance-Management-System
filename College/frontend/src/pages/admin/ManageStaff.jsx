import React, { useState, useEffect } from 'react';
import { Users, Filter, X, BookOpen, UserPlus, Trash2, ChevronDown, ChevronUp, Edit2, Plus, Search } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/admin';

const ManageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ dept: '', semester: '', batch: '' });
  const [nameSearch, setNameSearch] = useState('');
  const [sortBy, setSortBy] = useState('staffId');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showStaffDetailsModal, setShowStaffDetailsModal] = useState(false);
  const [showAllocateCourseModal, setShowAllocateCourseModal] = useState(false);
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedStaffCourse, setSelectedStaffCourse] = useState(null);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseFilters, setCourseFilters] = useState({ dept: '', semester: '', batch: '' });
  const [expandedCourses, setExpandedCourses] = useState([]);
  const [operationFromModal, setOperationFromModal] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState({ numberOfBatches: 1 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch departments
      let deptRes;
      try {
        deptRes = await axios.get(`http://localhost:4000/api/departments`);
        console.log('Departments response:', JSON.stringify(deptRes.data, null, 2));
      } catch (err) {
        console.error('Error fetching departments:', err.response?.data || err.message);
      }
      const departmentsData = Array.isArray(deptRes?.data?.data) ? deptRes.data.data.filter(d => d.isActive === 'YES') : [];
      console.log('Fetched departments:', JSON.stringify(departmentsData, null, 2));
      setDepartments(departmentsData);

      // Fetch semesters
      const semRes = await axios.get(`${API_BASE}/semesters`);
      const semestersData = Array.isArray(semRes.data.data) ? semRes.data.data : [];
      console.log('Fetched semesters:', JSON.stringify(semestersData, null, 2));
      setSemesters(semestersData);

      // Fetch batches
      const batchRes = await axios.get(`${API_BASE}/batches`);
      const batchesData = Array.isArray(batchRes.data.data) ? batchRes.data.data : [];
      console.log('Fetched batches:', JSON.nan, 2);
      setBatches(batchesData);

      // Fetch users (staff)
      const usersRes = await axios.get(`${API_BASE}/users`);
      console.log('Raw users response:', JSON.stringify(usersRes.data, null, 2));
      let staffData = Array.isArray(usersRes.data.data) ? usersRes.data.data.filter(user => {
        console.log(`Filtering user ${user.staffId || 'unknown'}:`, { 
          hasStaffId: !!user.staffId, 
          role: user.role, 
          isActive: user.isActive 
        });
        return user.staffId;
      }) : [];
      console.log('Filtered staffData before mapping:', JSON.stringify(staffData, null, 2));
      staffData = staffData.map(user => {
        const department = departmentsData.find(d => d.departmentId === user.departmentId);
        const allocatedCourses = Array.isArray(user.allocatedCourses) ? user.allocatedCourses.map(course => {
          const semester = semestersData.find(s => s.semesterId === course.semesterId) || {};
          return {
            id: course.staffCourseId || 0,
            courseCode: course.courseCode || 'N/A',
            name: course.courseTitle || 'Unknown',
            sectionId: course.sectionId || '',
            batch: course.sectionName ? course.sectionName.replace(/^BatchBatch/, 'Batch') : 'N/A',
            semester: semester.semesterNumber ? String(semester.semesterNumber) : 'N/A',
            year: semester.batchYears || 'N/A',
          };
        }) : [];
        return {
          id: user.id || 0,
          staffId: user.staffId || 'Unknown',
          name: user.name || 'Unknown',
          email: user.email || '',
          departmentId: user.departmentId || 0,
          departmentName: department ? department.departmentName : user.departmentName || 'Unknown',
          allocatedCourses,
        };
      });
      const uniqueStaff = staffData.filter(
        (staff, index, self) => index === self.findIndex(s => s.staffId === staff.staffId)
      );
      console.log('Mapped staff:', JSON.stringify(uniqueStaff, null, 2));
      setStaffList(uniqueStaff);

      // Fetch courses
      const courseRes = await axios.get(`${API_BASE}/courses`);
      console.log('Raw courses response:', JSON.stringify(courseRes.data, null, 2));
      let allCourses = Array.isArray(courseRes.data.data) ? courseRes.data.data : [];

      const coursesWithDetails = await Promise.all(
        allCourses.map(async course => {
          const semester = semestersData.find(s => s.semesterId === course.semesterId) || {};
          const batch = batchesData.find(b => b.batchId === semester.batchId) || {};
          let sections = [];
          try {
            const sectionRes = await axios.get(`${API_BASE}/courses/${course.courseCode}/sections`);
            if (sectionRes.data?.status === 'success' && Array.isArray(sectionRes.data.data)) {
              sections = sectionRes.data.data.map(section => ({
                sectionId: section.sectionId || 0,
                sectionName: section.sectionName ? (section.sectionName.startsWith('Batch') ? section.sectionName : `Batch${section.sectionName}`) : 'N/A',
              }));
            }
          } catch (err) {
            console.error(`Error fetching sections for course ${course.courseCode}:`, err.message);
          }
          return {
            ...course,
            courseId: course.courseId || 0,
            name: course.courseTitle || '',
            code: course.courseCode || '',
            department: batch.branch || '',
            semester: semester.semesterNumber ? String(semester.semesterNumber) : '',
            batchYears: semester.batchYears || '',
            batch: batch.batch || '',
            sections,
          };
        })
      );
      console.log('Mapped courses:', JSON.stringify(coursesWithDetails, null, 2));
      setCourses(coursesWithDetails);
      console.log('Triggering fetch data success toast');
      toast.success('Data fetched successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "fetch-data-success"
      });
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      console.error('Fetch error:', err.message, err.stack);
      console.log('Triggering fetch data error toast');
      toast.error(`Error fetching data: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "fetch-data-error"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStaff = () => {
    console.log('Applying filters:', { ...filters, nameSearch });
    const filteredStaff = staffList.filter(staff => {
      const { dept, semester, batch } = filters;
      const matchesName = !nameSearch || staff.name.toLowerCase().includes(nameSearch.toLowerCase());
      const hasMatchingCourse = staff.allocatedCourses.some(course => {
        const courseBatchYear = course.year; // Use batchYears from semester
        return (
          (!semester || course.semester === semester) &&
          (!batch || courseBatchYear.toLowerCase() === batch.toLowerCase())
        );
      });
      const matches = (
        (!dept || staff.departmentName.toLowerCase() === dept.toLowerCase()) &&
        (!semester && !batch || hasMatchingCourse) &&
        matchesName
      );
      console.log(`Staff ${staff.staffId} matches:`, matches, {
        deptMatch: !dept || staff.departmentName.toLowerCase() === dept.toLowerCase(),
        courseMatch: !semester && !batch || hasMatchingCourse,
        nameMatch: matchesName,
        appliedFilters: { dept, semester, batch, nameSearch },
        staffName: staff.name,
        staffDepartment: staff.departmentName,
        allocatedCourses: staff.allocatedCourses
      });
      return matches;
    }).sort((a, b) => {
      let aVal = sortBy === 'allocatedCourses' ? a.allocatedCourses.length : a[sortBy];
      let bVal = sortBy === 'allocatedCourses' ? b.allocatedCourses.length : b[sortBy];
      if (sortOrder === 'desc') {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      } else {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
    });
    console.log('Filtered staff:', JSON.stringify(filteredStaff, null, 2));
    return filteredStaff;
  };

  const getFilteredCourses = () => {
    const allocatedCourseDetails = selectedStaff?.allocatedCourses.map(c => ({
      courseCode: c.courseCode,
      sectionId: c.sectionId,
      batch: c.batch
    })) || [];
    const filteredCourses = courses.filter(course => {
      const { dept, semester, batch } = courseFilters;
      return (
        (!dept || course.department.toLowerCase() === dept.toLowerCase()) &&
        (!semester || course.semester === semester) &&
        (!batch || course.batchYears.toLowerCase() === batch.toLowerCase()) &&
        ((course.name || '').toLowerCase().includes(courseSearch.toLowerCase()) ||
         (course.code || '').toLowerCase().includes(courseSearch.toLowerCase()))
      );
    });
    console.log('Filtered courses:', JSON.stringify(filteredCourses, null, 2));
    return filteredCourses.map(course => {
      const allocation = allocatedCourseDetails.find(c => c.courseCode === course.code);
      return {
        ...course,
        isAllocated: !!allocation,
        currentBatch: allocation ? allocation.batch : null
      };
    });
  };

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
    setShowStaffDetailsModal(true);
    setOperationFromModal(false);
  };

  const toggleCourses = (staffId) => {
    setExpandedCourses(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId) 
        : [...prev, staffId]
    );
    console.log('Toggled courses for staffId:', staffId, 'Expanded:', expandedCourses.includes(staffId) ? expandedCourses.filter(id => id !== staffId) : [...expandedCourses, staffId]);
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !newBatchForm.numberOfBatches) {
      console.log('Triggering add batch validation error toast');
      toast.error('Missing course or number of batches', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "add-batch-error"
      });
      return;
    }
    const numberOfBatches = parseInt(newBatchForm.numberOfBatches) || 1;
    console.log('Adding batches:', { courseCode: selectedCourse.code, numberOfBatches });

    try {
      const res = await axios.post(`${API_BASE}/courses/${selectedCourse.code}/sections`, {
        numberOfSections: numberOfBatches,
      });
      console.log('Batch addition response:', JSON.stringify(res.data, null, 2));
      if (res.status === 201) {
        setShowAddBatchModal(false);
        setNewBatchForm({ numberOfBatches: 1 });
        // Refresh courses
        const courseRes = await axios.get(`${API_BASE}/courses`);
        let allCourses = Array.isArray(courseRes.data.data) ? courseRes.data.data : [];
        const coursesWithDetails = await Promise.all(
          allCourses.map(async course => {
            const semester = semesters.find(s => s.semesterId === course.semesterId) || {};
            const batch = batches.find(b => b.batchId === semester.batchId) || {};
            let sections = [];
            try {
              const sectionRes = await axios.get(`${API_BASE}/courses/${course.courseCode}/sections`);
              if (sectionRes.data?.status === 'success' && Array.isArray(sectionRes.data.data)) {
                sections = sectionRes.data.data.map(section => ({
                  sectionId: section.sectionId || 0,
                  sectionName: section.sectionName ? (section.sectionName.startsWith('Batch') ? section.sectionName : `Batch${section.sectionName}`) : 'N/A',
                }));
              }
            } catch (err) {
              console.error(`Error fetching sections for course ${course.courseCode}:`, err.message);
            }
            return {
              ...course,
              courseId: course.courseId || 0,
              name: course.courseTitle || '',
              code: course.courseCode || '',
              department: batch.branch || '',
              semester: semester.semesterNumber ? String(semester.semesterNumber) : '',
              batchYears: semester.batchYears || '',
              batch: batch.batch || '',
              sections,
            };
          })
        );
        setCourses(coursesWithDetails);
        setShowAllocateCourseModal(true);
        toast.success(`Added ${numberOfBatches} batch${numberOfBatches > 1 ? 'es' : ''} successfully`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: "add-batch-success"
        });
      } else {
        console.log('Triggering add batch API error toast');
        toast.error(`Failed to add batches: ${res.data?.message || 'Unknown error'}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: "add-batch-api-error"
        });
      }
    } catch (err) {
      console.error('Error adding batches:', err.response || err);
      console.log('Triggering add batch catch error toast');
      toast.error(`Error adding batches: ${err.response?.data?.message || err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "add-batch-catch-error"
      });
    }
  };

  const handleAllocateCourse = async () => {
    console.log('handleAllocateCourse called', { selectedStaff, selectedCourse, selectedSectionId });
    if (!selectedStaff || !selectedCourse || !selectedSectionId) {
      console.log('Triggering allocate course validation error toast');
      toast.error('Missing staff, course, or section information', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "allocate-course-error"
      });
      return;
    }

    const payload = {
      staffId: selectedStaff.staffId,
      courseCode: selectedCourse.code,
      sectionId: selectedSectionId,
      departmentId: selectedStaff.departmentId,
    };

    try {
      const isUpdate = selectedCourse.isAllocated;
      const endpoint = isUpdate
        ? `${API_BASE}/staff-courses/${selectedStaff.allocatedCourses.find(c => c.courseCode === selectedCourse.code)?.id}`
        : `${API_BASE}/staff/${selectedStaff.staffId}/courses`;
      const method = isUpdate ? axios.patch : axios.post;

      const res = await method(endpoint, payload);
      console.log(`${isUpdate ? 'Update' : 'Allocation'} response:`, JSON.stringify(res.data, null, 2));
      if (res.status === 201 || res.status === 200) {
        setShowAllocateCourseModal(false);
        setSelectedCourse(null);
        setSelectedSectionId('');
        setCourseSearch('');
        setCourseFilters({ dept: '', semester: '', batch: '' });
        await fetchData();
        const updatedStaff = staffList.find(s => s.staffId === selectedStaff.staffId);
        setSelectedStaff(updatedStaff || selectedStaff);
        if (operationFromModal) {
          setShowStaffDetailsModal(true);
        } else {
          setExpandedCourses(prev => [...prev, selectedStaff.staffId]);
        }
        console.log('Triggering allocate course success toast');
        toast.success(`Course ${selectedCourse.code} ${isUpdate ? 'updated' : 'allocated'} successfully`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: "allocate-course-success"
        });
      } else {
        console.log('Triggering allocate course API error toast');
        toast.error(`Failed to ${isUpdate ? 'update' : 'allocate'} course`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: "allocate-course-api-error"
        });
      }
    } catch (err) {
      console.error(`${selectedCourse.isAllocated ? 'Update' : 'Allocation'} error:`, err.response || err);
      console.log('Triggering allocate course catch error toast');
      toast.error(`Error ${selectedCourse.isAllocated ? 'updating' : 'allocating'} course: ${err.response?.data?.message || err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "allocate-course-catch-error"
      });
    }
  };

  const handleRemoveCourse = async (staffCourseId) => {
    console.log('handleRemoveCourse called', { staffCourseId, selectedStaff });
    if (!selectedStaff) {
      console.log('Triggering remove course validation error toast');
      toast.error('No staff selected for course removal', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "remove-course-error"
      });
      return;
    }
    if (!confirm(`Remove this course allocation?`)) return;

    try {
      const course = selectedStaff.allocatedCourses.find(c => c.id === staffCourseId);
      const res = await axios.delete(`${API_BASE}/staff-courses/${staffCourseId}`);
      console.log('Remove course response:', JSON.stringify(res.data, null, 2));
      if (res.status === 200) {
        await fetchData();
        const updatedStaff = staffList.find(s => s.staffId === selectedStaff.staffId) || selectedStaff;
        setSelectedStaff(updatedStaff);
        if (operationFromModal) {
          setShowStaffDetailsModal(true);
        } else {
          setExpandedCourses(prev => [...prev, selectedStaff.staffId]);
        }
        console.log('Triggering remove course success toast');
        toast.success(`Course ${course?.courseCode || 'Unknown'} removed successfully`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: "remove-course-success"
        });
      } else {
        console.log('Triggering remove course API error toast');
        toast.error('Failed to remove course allocation', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: "remove-course-api-error"
        });
      }
    } catch (err) {
      console.error('Remove course error:', err.response || err);
      console.log('Triggering remove course catch error toast');
      toast.error(`Error removing course: ${err.response?.data?.message || err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "remove-course-catch-error"
      });
    }
  };

  const handleEditBatch = async () => {
    console.log('handleEditBatch called', { selectedStaffCourse, selectedSectionId });
    if (!selectedStaffCourse || !selectedSectionId) {
      console.log('Triggering edit batch validation error toast');
      toast.error('Missing course or section information', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "edit-batch-error"
      });
      return;
    }

    const payload = {
      sectionId: selectedSectionId,
    };

    try {
      const res = await axios.patch(`${API_BASE}/staff-courses/${selectedStaffCourse.id}`, payload);
      console.log('Edit batch response:', JSON.stringify(res.data, null, 2));
      if (res.status === 200) {
        setShowEditBatchModal(false);
        setSelectedStaffCourse(null);
        setSelectedSectionId('');
        await fetchData();
        const updatedStaff = staffList.find(s => s.staffId === selectedStaff.staffId) || selectedStaff;
        setSelectedStaff(updatedStaff);
        if (operationFromModal) {
          setShowStaffDetailsModal(true);
        } else {
          setExpandedCourses(prev => [...prev, selectedStaff.staffId]);
        }
        console.log('Triggering edit batch success toast');
        toast.success(`Batch updated successfully for course ${selectedStaffCourse.courseCode}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: "edit-batch-success"
        });
      } else {
        console.log('Triggering edit batch API error toast');
        toast.error(`Failed to update batch: ${res.data?.message || 'Unknown error'}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: "edit-batch-api-error"
        });
      }
    } catch (err) {
      console.error('Edit batch error:', err.response || err);
      console.log('Triggering edit batch catch error toast');
      toast.error(`Error updating batch: ${err.response?.data?.message || err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "edit-batch-catch-error"
      });
    }
  };

  const handleViewStudents = async (courseCode, sectionId) => {
    try {
      console.log('Calling API with:', { courseCode, sectionId });
      const studentRes = await axios.get(`${API_BASE}/students/enrolled-courses`, {
        params: { courseCode, sectionId },
      });
      console.log('Enrolled students response:', JSON.stringify(studentRes.data, null, 2));
      if (studentRes.data?.status === 'success' && Array.isArray(studentRes.data.data)) {
        setSelectedCourseStudents(studentRes.data.data);
        setSelectedCourseCode(courseCode);
        setShowStudentsModal(true);
      } else {
        console.error('Invalid students response:', studentRes.data);
        setSelectedCourseStudents([]);
        setSelectedCourseCode(courseCode);
        setShowStudentsModal(true);
      }
    } catch (err) {
      console.error('View students error:', err.response || err);
      console.log('Triggering view students catch error toast');
      toast.error(`Error fetching students: ${err.response?.data?.message || err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: "view-students-catch-error"
      });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const departmentOptions = departments.length > 0 
    ? [...new Set(departments.map(dept => dept.departmentName))].filter(d => d).sort()
    : [...new Set(staffList.map(staff => staff.departmentName))].filter(d => d).sort();
  const semesterOptions = [...new Set(semesters.map(sem => String(sem.semesterNumber)))].filter(sem => sem).sort((a, b) => a - b);
  const batchOptions = [...new Set(semesters.map(sem => sem.batchYears))].filter(batch => batch).sort();

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 9999 }}
      />
      <div className="w-full max-w-7xl mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Manage Staff</h1>
            <p className="text-gray-600 mt-1">View and manage staff members and their course allocations</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-wrap gap-4 items-end justify-center">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter staff name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filters.dept}
                onChange={(e) => setFilters({ ...filters, dept: e.target.value, batch: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value, batch: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {semesterOptions.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select
                value={filters.batch}
                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Batches</option>
                {batchOptions.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="staffId">Staff ID</option>
                <option value="departmentName">Department</option>
                <option value="allocatedCourses">Course Count</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredStaff().map((staff) => (
          <div
            key={staff.staffId}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden cursor-pointer border-2 border-gray-200 min-h-[200px] h-fit flex-shrink-0"
            onClick={() => handleStaffClick(staff)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{staff.name}</h3>
                  <p className="text-gray-600 text-sm">ID: {staff.staffId}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {staff.allocatedCourses.length} Courses
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Users size={16} className="mr-2" />
                  <span>Department: {staff.departmentName}</span>
                </div>
              </div>

              <div className="mb-4">
                <div
                  className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCourses(staff.staffId);
                  }}
                >
                  <span>Allocated Courses</span>
                  {expandedCourses.includes(staff.staffId) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {expandedCourses.includes(staff.staffId) && (
                  <div className="mt-4 space-y-4 max-h-96 overflow-y-auto transition-all duration-300">
                    {staff.allocatedCourses.length > 0 ? (
                      staff.allocatedCourses.map(course => (
                        <div
                          key={course.id}
                          className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 font-bold text-sm">
                                    {course.courseCode.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                                    {course.courseCode}
                                  </h4>
                                  <p className="text-xs text-gray-600 truncate">
                                    {course.name}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-3">
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="text-center">
                                <div className="text-sm font-bold text-gray-900">
                                  {course.batch}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Section
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-gray-900">
                                  {course.semester}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Semester
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-bold text-gray-900">
                                  {course.year}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Batch
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewStudents(course.courseCode, course.sectionId);
                                }}
                                className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 border border-blue-200"
                              >
                                <Users size={12} />
                                <span className="truncate">Students</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStaff(staff);
                                  setSelectedStaffCourse(course);
                                  setSelectedSectionId(course.sectionId);
                                  setShowEditBatchModal(true);
                                  setOperationFromModal(false);
                                }}
                                className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 border border-amber-200"
                              >
                                <Edit2 size={12} />
                                <span className="truncate">Edit Section</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStaff(staff);
                                  setOperationFromModal(false);
                                  handleRemoveCourse(course.id);
                                }}
                                className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 border border-red-200"
                              >
                                <Trash2 size={12} />
                                <span className="truncate">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl py-8">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen size={20} className="text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No courses allocated</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Assign courses to this staff member
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStaff(staff);
                  setShowAllocateCourseModal(true);
                  setOperationFromModal(false);
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 w-full justify-center"
              >
                <UserPlus size={16} />
                Allocate Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {getFilteredStaff().length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
          <p className="text-gray-500">Try adjusting your filters or check the console for errors.</p>
        </div>
      )}

      {showStaffDetailsModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStaff.name}</h2>
                <button
                  onClick={() => setShowStaffDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Staff ID</p>
                  <p className="text-sm text-gray-600">{selectedStaff.staffId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-600">{selectedStaff.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-sm text-gray-600">{selectedStaff.departmentName}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Allocated Courses ({selectedStaff.allocatedCourses.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedStaff.allocatedCourses.length > 0 ? (
                  selectedStaff.allocatedCourses.map(course => (
                    <div
                      key={course.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {course.courseCode} - {course.name}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              {course.batch}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                              Semester {course.semester}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                              {course.year}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleViewStudents(course.courseCode, course.sectionId)}
                            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 border border-blue-200"
                          >
                            <Users size={12} />
                            View Students
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStaffCourse(course);
                              setSelectedSectionId(course.sectionId);
                              setShowEditBatchModal(true);
                              setOperationFromModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 border border-amber-200"
                          >
                            <Edit2 size={12} />
                            Edit Section
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStaff(staff);
                              setOperationFromModal(true);
                              handleRemoveCourse(course.id);
                            }}
                            className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 border border-red-200"
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg py-8">
                    <div className="text-center">
                      <BookOpen size={32} className="text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No courses allocated</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Assign courses to this staff member
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowStaffDetailsModal(false);
                    setShowAllocateCourseModal(true);
                    setOperationFromModal(true);
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 w-full justify-center"
                >
                  <UserPlus size={16} />
                  Allocate Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAllocateCourseModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Allocate Course to {selectedStaff.name}
                </h2>
                <button
                  onClick={() => {
                    setShowAllocateCourseModal(false);
                    setSelectedCourse(null);
                    setSelectedSectionId('');
                    setCourseSearch('');
                    setCourseFilters({ dept: '', semester: '', batch: '' });
                    if (operationFromModal) {
                      setShowStaffDetailsModal(true);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by course name or code..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={courseFilters.dept}
                    onChange={(e) => setCourseFilters({ ...courseFilters, dept: e.target.value, batch: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {[...new Set(batches.map(batch => batch.branch))].filter(d => d).sort().map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={courseFilters.semester}
                    onChange={(e) => setCourseFilters({ ...courseFilters, semester: e.target.value, batch: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Semesters</option>
                    {semesterOptions.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select
                    value={courseFilters.batch}
                    onChange={(e) => setCourseFilters({ ...courseFilters, batch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Batches</option>
                    {batchOptions.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
              </div>
              {selectedCourse && (
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setShowAllocateCourseModal(false);
                      setShowAddBatchModal(true);
                    }}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 w-full justify-center"
                  >
                    <Plus size={16} />
                    Add New Section
                  </button>
                </div>
              )}
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {getFilteredCourses().length > 0 ? (
                  getFilteredCourses().map(course => (
                    <div
                      key={course.courseId}
                      onClick={() => {
                        setSelectedCourse(course);
                        setSelectedSectionId(course.isAllocated ? selectedStaff.allocatedCourses.find(c => c.courseCode === course.code)?.sectionId || '' : '');
                      }}
                      className={`cursor-pointer bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors ${
                        selectedCourse?.courseId === course.courseId ? 'border-2 border-blue-500' : 'border border-gray-200'
                      }`}
                    >
                      <p className="font-medium text-gray-900">
                        {course.code || 'N/A'} {course.isAllocated && <BookOpen size={16} className="inline text-green-600" />}
                      </p>
                      <p className="text-sm text-gray-600">{course.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        Semester {course.semester || 'N/A'} • Batch {course.batchYears || 'N/A'} • {course.department || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Available Sections: {course.sections.length > 0 ? course.sections.map(s => s.sectionName).join(', ') : 'None'}
                      </p>
                      {course.isAllocated && (
                        <p className="text-sm text-blue-600">
                          Current Section: {course.currentBatch || 'N/A'}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No courses available for allocation.</p>
                )}
              </div>
              {selectedCourse && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select Section for {selectedCourse.code || 'N/A'} {selectedCourse.isAllocated && '(Already Allocated)'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.sections.length > 0 ? (
                      selectedCourse.sections.map(section => (
                        <button
                          key={section.sectionId}
                          onClick={() => setSelectedSectionId(section.sectionId)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedSectionId === section.sectionId
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {section.sectionName}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No sections available for this course.</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAllocateCourseModal(false);
                    setSelectedCourse(null);
                    setSelectedSectionId('');
                    setCourseSearch('');
                    setCourseFilters({ dept: '', semester: '', batch: '' });
                    if (operationFromModal) {
                      setShowStaffDetailsModal(true);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAllocateCourse}
                  disabled={!selectedCourse || !selectedSectionId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  {selectedCourse?.isAllocated ? 'Update Section' : 'Allocate Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddBatchModal && selectedStaff && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Sections to {selectedCourse.code}</h2>
                <button
                  onClick={() => {
                    setShowAddBatchModal(false);
                    setNewBatchForm({ numberOfBatches: 1 });
                    setShowAllocateCourseModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddBatch}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Sections *</label>
                  <input
                    type="number"
                    min="1"
                    value={newBatchForm.numberOfBatches}
                    onChange={(e) => setNewBatchForm({ numberOfBatches: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Sections will be auto-generated as Batch1, Batch2, etc.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBatchModal(false);
                      setNewBatchForm({ numberOfBatches: 1 });
                      setShowAllocateCourseModal(true);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add Sections
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditBatchModal && selectedStaffCourse && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Section for {selectedStaffCourse.courseCode} ({selectedStaff.name})
                </h2>
                <button
                  onClick={() => {
                    setShowEditBatchModal(false);
                    setSelectedStaffCourse(null);
                    setSelectedSectionId('');
                    if (operationFromModal) {
                      setShowStaffDetailsModal(true);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select New Section for {selectedStaffCourse.courseCode}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {courses.find(c => c.code === selectedStaffCourse.courseCode)?.sections.length > 0 ? (
                    courses.find(c => c.code === selectedStaffCourse.courseCode).sections.map(section => (
                      <button
                        key={section.sectionId}
                        onClick={() => setSelectedSectionId(section.sectionId)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedSectionId === section.sectionId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {section.sectionName}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No sections available for this course.</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditBatchModal(false);
                    setSelectedStaffCourse(null);
                    setSelectedSectionId('');
                    if (operationFromModal) {
                      setShowStaffDetailsModal(true);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditBatch}
                  disabled={!selectedSectionId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  Update Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStudentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Students Enrolled in {selectedCourseCode}
              </h2>
              <button
                onClick={() => setShowStudentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              {selectedCourseStudents.length > 0 ? (
                selectedCourseStudents.map(student => (
                  <div key={student.rollnumber} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">{student.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Roll Number: {student.rollnumber || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Batch: {student.batch || 'N/A'}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No students enrolled in this course section.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;