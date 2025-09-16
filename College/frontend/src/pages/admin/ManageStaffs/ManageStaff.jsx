import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Filters from './Filters';
import StaffCard from './StaffCard';
import StaffDetailsModal from './StaffDetailsModal';
import AllocateCourseModal from './AllocateCourseModal';
import AddBatchModal from './AddBatchModal';
import EditBatchModal from './EditBatchModal';
import StudentsModal from './StudentsModal';
import { Users } from 'lucide-react';

const MySwal = withReactContent(Swal);
const API_BASE = 'http://localhost:4000/api/admin';

const ManageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const deptRes = await axios.get('http://localhost:4000/api/departments').catch(err => {
        console.error('Error fetching departments:', err.response?.data || err.message);
        return { data: { data: [] } };
      });
      const departmentsData = Array.isArray(deptRes.data.data) ? deptRes.data.data.filter(d => d.isActive === 'YES') : [];
      setDepartments(departmentsData);

      const [semRes, batchRes, usersRes, courseRes] = await Promise.all([
        axios.get(`${API_BASE}/semesters`),
        axios.get(`${API_BASE}/batches`),
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/courses`),
      ]);

      const semestersData = Array.isArray(semRes.data.data) ? semRes.data.data : [];
      setSemesters(semestersData);

      const batchesData = Array.isArray(batchRes.data.data) ? batchRes.data.data : [];
      setBatches(batchesData);

      const staffData = Array.isArray(usersRes.data.data)
        ? usersRes.data.data.filter(user => user.staffId).map(user => {
            const department = departmentsData.find(d => d.departmentId === user.departmentId);
            const allocatedCourses = Array.isArray(user.allocatedCourses)
              ? user.allocatedCourses.map(course => ({
                  id: course.staffCourseId || 0,
                  courseCode: course.courseCode || 'N/A',
                  name: course.courseTitle || 'Unknown',
                  sectionId: course.sectionId || '',
                  batch: course.sectionName ? course.sectionName.replace(/^BatchBatch/, 'Batch') : 'N/A',
                  semester: semestersData.find(s => s.semesterId === course.semesterId)?.semesterNumber
                    ? String(semestersData.find(s => s.semesterId === course.semesterId).semesterNumber)
                    : 'N/A',
                  year: semestersData.find(s => s.semesterId === course.semesterId)?.batchYears || 'N/A',
                }))
              : [];
            return {
              id: user.id || 0,
              staffId: user.staffId || 'Unknown',
              name: user.name || 'Unknown',
              email: user.email || '',
              departmentId: user.departmentId || 0,
              departmentName: department ? department.departmentName : user.departmentName || 'Unknown',
              allocatedCourses,
            };
          })
        : [];
      setStaffList(staffData.filter((staff, index, self) => index === self.findIndex(s => s.staffId === staff.staffId)));

      const coursesWithDetails = await Promise.all(
        Array.isArray(courseRes.data.data) ? courseRes.data.data.map(async course => {
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
        }) : []
      );
      setCourses(coursesWithDetails);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync selectedStaff with updated staffList after operations
  useEffect(() => {
    if (selectedStaff && staffList.length > 0) {
      const updatedStaff = staffList.find(s => s.staffId === selectedStaff.staffId);
      if (updatedStaff) {
        const oldCoursesMap = new Map(selectedStaff.allocatedCourses.map(c => [c.id, c]));
        const newCoursesMap = new Map(updatedStaff.allocatedCourses.map(c => [c.id, c]));
        let hasDifference = oldCoursesMap.size !== newCoursesMap.size;
        if (!hasDifference) {
          hasDifference = Array.from(newCoursesMap.values()).some(newC => {
            const oldC = oldCoursesMap.get(newC.id);
            return !oldC || oldC.sectionId !== newC.sectionId;
          });
        }
        if (hasDifference) {
          setSelectedStaff({ ...updatedStaff });
        }
      }
    }
  }, [staffList, selectedStaff]);

  const getFilteredStaff = () => {
    return staffList
      .filter(staff => {
        const { dept, semester, batch } = filters;
        const matchesName = !nameSearch || staff.name.toLowerCase().includes(nameSearch.toLowerCase());
        const hasMatchingCourse = staff.allocatedCourses.some(course =>
          (!semester || course.semester === semester) &&
          (!batch || course.year.toLowerCase() === batch.toLowerCase())
        );
        return (
          (!dept || staff.departmentName.toLowerCase() === dept.toLowerCase()) &&
          (!semester && !batch || hasMatchingCourse) &&
          matchesName
        );
      })
      .sort((a, b) => {
        const aVal = sortBy === 'allocatedCourses' ? a.allocatedCourses.length : a[sortBy];
        const bVal = sortBy === 'allocatedCourses' ? b.allocatedCourses.length : b[sortBy];
        return sortOrder === 'desc' ? (aVal < bVal ? 1 : -1) : (aVal < bVal ? -1 : 1);
      });
  };

  const getFilteredCourses = useMemo(() => {
    const allocatedCourseDetails = selectedStaff?.allocatedCourses.map(c => ({
      courseCode: c.courseCode,
      sectionId: c.sectionId,
      batch: c.batch,
    })) || [];
    return courses
      .filter(course => {
        const { dept, semester, batch } = courseFilters;
        return (
          (!dept || course.department.toLowerCase() === dept.toLowerCase()) &&
          (!semester || course.semester === semester) &&
          (!batch || course.batchYears.toLowerCase() === batch.toLowerCase()) &&
          (course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
           course.code.toLowerCase().includes(courseSearch.toLowerCase()))
        );
      })
      .map(course => ({
        ...course,
        isAllocated: !!allocatedCourseDetails.find(c => c.courseCode === course.code),
        currentBatch: allocatedCourseDetails.find(c => c.courseCode === course.code)?.batch || null,
      }));
  }, [courses, selectedStaff, courseSearch, courseFilters]);

  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder(sortBy === field ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
  };

  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
    setShowStaffDetailsModal(true);
    setOperationFromModal(false);
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !newBatchForm.numberOfBatches) {
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Missing course or number of batches',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
      return;
    }
    setOperationLoading(true);
    try {
      const numberOfBatches = parseInt(newBatchForm.numberOfBatches) || 1;
      const res = await axios.post(`${API_BASE}/courses/${selectedCourse.code}/sections`, { numberOfSections: numberOfBatches });
      if (res.status === 201) {
        setShowAddBatchModal(false);
        setNewBatchForm({ numberOfBatches: 1 });
        await fetchData();
        setShowAllocateCourseModal(true);
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: `Added ${numberOfBatches} batch${numberOfBatches > 1 ? 'es' : ''} successfully`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to add batches: ${res.data?.message || 'Unknown error'}`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
      }
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error adding batches: ${err.response?.data?.message || err.message}`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAllocateCourse = async () => {
    if (!selectedStaff || !selectedCourse || !selectedSectionId) {
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Missing staff, course, or section information',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
      return;
    }
    setOperationLoading(true);
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
      const optimisticCourse = {
        id: isUpdate ? selectedStaff.allocatedCourses.find(c => c.courseCode === selectedCourse.code).id : Date.now(),
        courseCode: selectedCourse.code,
        name: selectedCourse.name,
        sectionId: selectedSectionId,
        batch: selectedCourse.sections.find(s => s.sectionId === selectedSectionId)?.sectionName || 'N/A',
        semester: selectedCourse.semester || 'N/A',
        year: selectedCourse.batchYears || 'N/A',
      };
      setSelectedStaff(prev => ({
        ...prev,
        allocatedCourses: isUpdate
          ? prev.allocatedCourses.map(c => c.courseCode === selectedCourse.code ? optimisticCourse : c)
          : [...prev.allocatedCourses, optimisticCourse],
      }));
      const res = await method(endpoint, payload);
      if (res.status === 201 || res.status === 200) {
        await fetchData();
        setSelectedCourse(null);
        setSelectedSectionId('');
        setCourseSearch('');
        setCourseFilters({ dept: '', semester: '', batch: '' });
        setExpandedCourses(prev => prev.includes(selectedStaff.staffId) ? prev : [...prev, selectedStaff.staffId]);
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: `Course ${selectedCourse.code} ${isUpdate ? 'updated' : 'allocated'} successfully`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
      } else {
        setSelectedStaff(prev => ({
          ...prev,
          allocatedCourses: isUpdate
            ? prev.allocatedCourses.map(c => c.courseCode === selectedCourse.code ? selectedStaff.allocatedCourses.find(sc => sc.courseCode === selectedCourse.code) : c)
            : prev.allocatedCourses.filter(c => c.courseCode !== selectedCourse.code),
        }));
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to ${isUpdate ? 'update' : 'allocate'} course`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
      }
    } catch (err) {
      setSelectedStaff(prev => ({
        ...prev,
        allocatedCourses: isUpdate
          ? prev.allocatedCourses.map(c => c.courseCode === selectedCourse.code ? selectedStaff.allocatedCourses.find(sc => sc.courseCode === selectedCourse.code) : c)
          : prev.allocatedCourses.filter(c => c.courseCode !== selectedCourse.code),
      }));
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error ${selectedCourse.isAllocated ? 'updating' : 'allocating'} course: ${err.response?.data?.message || err.message}`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRemoveCourse = async (staff, staffCourseId) => {
    const courseToRemove = staff.allocatedCourses.find(c => c.id === staffCourseId);
    if (!staff || !staffCourseId || !courseToRemove) {
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Missing staff or course information',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
      return;
    }

    // Show a non-blocking toast for confirmation
    MySwal.fire({
      title: 'Confirm Removal',
      text: `Are you sure you want to remove the course ${courseToRemove.courseCode}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      toast: true,
      position: 'top-end',
      customClass: { popup: 'swal-toast' },
      timer: 5000,
      timerProgressBar: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      setOperationLoading(true);
      // Optimistic update
      setSelectedStaff(prev => ({
        ...prev,
        allocatedCourses: prev.allocatedCourses.filter(c => c.id !== staffCourseId),
      }));

      try {
        const res = await axios.delete(`${API_BASE}/staff-courses/${staffCourseId}`);
        if (res.status === 200) {
          await fetchData();
          setSelectedCourse(null);
          setSelectedSectionId('');
          setExpandedCourses(prev => prev.includes(staff.staffId) ? prev : [...prev, staff.staffId]);
          MySwal.fire({
            icon: 'success',
            title: 'Success',
            text: `Course ${courseToRemove.courseCode} removed successfully`,
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            customClass: { popup: 'swal-toast' },
          });
        } else {
          setSelectedStaff(prev => ({
            ...prev,
            allocatedCourses: [...prev.allocatedCourses, courseToRemove],
          }));
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to remove course allocation',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            customClass: { popup: 'swal-toast' },
          });
        }
      } catch (err) {
        setSelectedStaff(prev => ({
          ...prev,
          allocatedCourses: [...prev.allocatedCourses, courseToRemove],
        }));
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error removing course: ${err.response?.data?.message || err.message}`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
      } finally {
        setOperationLoading(false);
      }
    });
  };

  const handleEditBatch = async () => {
    if (!selectedStaff || !selectedStaffCourse || !selectedSectionId) {
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Missing staff, course, or section information',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
      return;
    }

    const course = courses.find(c => c.code === selectedStaffCourse.courseCode);
    if (!course) {
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: `Course ${selectedStaffCourse.courseCode} not found`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
      return;
    }
    const section = course.sections.find(s => s.sectionId === selectedSectionId);
    if (!section) {
      MySwal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: `Section ID ${selectedSectionId} not found for course ${selectedStaffCourse.courseCode}`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
      return;
    }

    setOperationLoading(true);
    const payload = {
      staffId: selectedStaff.staffId,
      courseCode: selectedStaffCourse.courseCode,
      sectionId: selectedSectionId,
      departmentId: selectedStaff.departmentId,
    };

    try {
      const optimisticCourse = {
        ...selectedStaffCourse,
        sectionId: selectedSectionId,
        batch: section.sectionName || 'N/A',
      };
      setSelectedStaff(prev => ({
        ...prev,
        allocatedCourses: prev.allocatedCourses.map(c => c.id === selectedStaffCourse.id ? optimisticCourse : c),
      }));
      const res = await axios.patch(`${API_BASE}/staff-courses/${selectedStaffCourse.id}`, payload);
      if (res.status === 200) {
        setShowEditBatchModal(false);
        setSelectedStaffCourse(null);
        setSelectedSectionId('');
        await fetchData();
        setSelectedCourse(null);
        if (!operationFromModal) {
          setExpandedCourses(prev => prev.includes(selectedStaff.staffId) ? prev : [...prev, selectedStaff.staffId]);
        }
        MySwal.fire({
          icon: 'success',
          title: 'Success',
          text: `Section updated for course ${selectedStaffCourse.courseCode}`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
      } else {
        setSelectedStaff(prev => ({
          ...prev,
          allocatedCourses: prev.allocatedCourses.map(c => c.id === selectedStaffCourse.id ? selectedStaffCourse : c),
        }));
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to update section: ${res.data?.message || 'Unknown error'}`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
      }
    } catch (err) {
      console.error('Error updating section:', err.response || err.message);
      setSelectedStaff(prev => ({
        ...prev,
        allocatedCourses: prev.allocatedCourses.map(c => c.id === selectedStaffCourse.id ? selectedStaffCourse : c),
      }));
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage.includes('not found')) {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: `Section update failed: Staff course ID ${selectedStaffCourse.id} not found or invalid data`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
        await fetchData();
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error updating section: ${errorMessage}`,
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: { popup: 'swal-toast' },
        });
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewStudents = async (courseCode, sectionId) => {
    setOperationLoading(true);
    try {
      const studentRes = await axios.get(`${API_BASE}/students/enrolled-courses`, { params: { courseCode, sectionId } });
      setSelectedCourseStudents(studentRes.data?.status === 'success' && Array.isArray(studentRes.data.data) ? studentRes.data.data : []);
      setSelectedCourseCode(courseCode);
      setShowStudentsModal(true);
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error fetching students: ${err.response?.data?.message || err.message}`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast' },
      });
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight text-center sm:text-left">Manage Staff</h1>
        <p className="text-gray-500 mt-2 text-lg text-center sm:text-left">Efficiently manage staff members and their course allocations</p>
        <Filters
          filters={filters}
          setFilters={setFilters}
          nameSearch={nameSearch}
          setNameSearch={setNameSearch}
          sortBy={sortBy}
          handleSort={handleSort}
          departments={departments}
          semesters={semesters}
          staffList={staffList}
        />
      </div>
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredStaff().map(staff => (
          <StaffCard
            key={staff.staffId}
            staff={staff}
            handleStaffClick={handleStaffClick}
            toggleCourses={() => setExpandedCourses(prev =>
              prev.includes(staff.staffId) ? prev.filter(id => id !== staff.staffId) : [...prev, staff.staffId]
            )}
            expandedCourses={expandedCourses}
            handleViewStudents={handleViewStudents}
            setSelectedStaff={setSelectedStaff}
            setSelectedStaffCourse={setSelectedStaffCourse}
            setSelectedSectionId={setSelectedSectionId}
            setShowEditBatchModal={setShowEditBatchModal}
            setOperationFromModal={setOperationFromModal}
            handleRemoveCourse={handleRemoveCourse}
            setShowAllocateCourseModal={setShowAllocateCourseModal}
          />
        ))}
      </div>
      {getFilteredStaff().length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff found</h3>
          <p className="text-gray-500">Try adjusting your filters or check the console for errors.</p>
        </div>
      )}
      {showStaffDetailsModal && selectedStaff && (
        <StaffDetailsModal
          selectedStaff={selectedStaff}
          setShowStaffDetailsModal={setShowStaffDetailsModal}
          handleViewStudents={handleViewStudents}
          setSelectedStaffCourse={setSelectedStaffCourse}
          setSelectedSectionId={setSelectedSectionId}
          setShowEditBatchModal={setShowEditBatchModal}
          setOperationFromModal={setOperationFromModal}
          handleRemoveCourse={handleRemoveCourse}
          setShowAllocateCourseModal={setShowAllocateCourseModal}
        />
      )}
      {showAllocateCourseModal && selectedStaff && (
        <AllocateCourseModal
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          setShowAllocateCourseModal={setShowAllocateCourseModal}
          setSelectedCourse={setSelectedCourse}
          setSelectedSectionId={setSelectedSectionId}
          courseSearch={courseSearch}
          setCourseSearch={setCourseSearch}
          courseFilters={courseFilters}
          setCourseFilters={setCourseFilters}
          selectedCourse={selectedCourse}
          selectedSectionId={selectedSectionId}
          handleAllocateCourse={handleAllocateCourse}
          setShowAddBatchModal={setShowAddBatchModal}
          setShowStaffDetailsModal={setShowStaffDetailsModal}
          operationFromModal={operationFromModal}
          getFilteredCourses={getFilteredCourses}
          semesters={semesters}
          batches={batches}
          operationLoading={operationLoading}
          handleRemoveCourse={handleRemoveCourse}
        />
      )}
      {showAddBatchModal && selectedStaff && selectedCourse && (
        <AddBatchModal
          selectedCourse={selectedCourse}
          setShowAddBatchModal={setShowAddBatchModal}
          newBatchForm={newBatchForm}
          setNewBatchForm={setNewBatchForm}
          handleAddBatch={handleAddBatch}
          setShowAllocateCourseModal={setShowAllocateCourseModal}
          operationLoading={operationLoading}
        />
      )}
      {showEditBatchModal && selectedStaffCourse && selectedStaff && (
        <EditBatchModal
          selectedStaffCourse={selectedStaffCourse}
          selectedStaff={selectedStaff}
          setShowEditBatchModal={setShowEditBatchModal}
          setSelectedStaffCourse={setSelectedStaffCourse}
          setSelectedSectionId={setSelectedSectionId}
          selectedSectionId={selectedSectionId}
          handleEditBatch={handleEditBatch}
          setShowStaffDetailsModal={setShowStaffDetailsModal}
          operationFromModal={operationFromModal}
          courses={courses}
          operationLoading={operationLoading}
        />
      )}
      {showStudentsModal && (
        <StudentsModal
          selectedCourseCode={selectedCourseCode}
          selectedCourseStudents={selectedCourseStudents}
          setShowStudentsModal={setShowStudentsModal}
        />
      )}
    </div>
  );
};

export default ManageStaff;