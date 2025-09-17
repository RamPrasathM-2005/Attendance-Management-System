// src/hooks/useManageStaffHandlers.js
import { showErrorToast, showSuccessToast } from '../../../../utils/swalConfig';
import manageStaffService from '../../../../services/manageStaffService';

const useManageStaffHandlers = ({
  selectedCourse,
  newBatchForm,
  selectedStaff,
  selectedSectionId,
  selectedStaffCourse,
  courses,
  operationFromModal,
  setOperationLoading,
  setShowAddBatchModal,
  setNewBatchForm,
  setShowAllocateCourseModal,
  setSelectedCourse,
  setSelectedSectionId,
  setCourseSearch,
  setCourseFilters,
  setExpandedCourses,
  setSelectedStaff,
  setShowEditBatchModal,
  setSelectedStaffCourse,
  setSelectedCourseStudents,
  setSelectedCourseCode,
  setShowStudentsModal,
  setShowStaffDetailsModal,
  setOperationFromModal,
  setStaffList, // New parameter
}) => {
  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
    setShowStaffDetailsModal(true);
    setOperationFromModal(false);
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !newBatchForm.numberOfBatches) {
      showErrorToast('Validation Error', 'Missing course or number of batches');
      return;
    }
    setOperationLoading(true);
    try {
      const numberOfBatches = parseInt(newBatchForm.numberOfBatches) || 1;
      await manageStaffService.addBatch(selectedCourse.code, numberOfBatches);
      setShowAddBatchModal(false);
      setNewBatchForm({ numberOfBatches: 1 });
      await manageStaffService.fetchInitialData(); // Refresh data
      setShowAllocateCourseModal(true);
      showSuccessToast(`Added ${numberOfBatches} batch${numberOfBatches > 1 ? 'es' : ''} successfully`);
    } catch (err) {
      showErrorToast('Error', `Error adding batches: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAllocateCourse = async () => {
    if (!selectedStaff || !selectedCourse || !selectedSectionId) {
      showErrorToast('Validation Error', 'Missing staff, course, or section information');
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
      setStaffList(prev =>
        prev.map(s =>
          s.staffId === selectedStaff.staffId
            ? {
                ...s,
                allocatedCourses: isUpdate
                  ? s.allocatedCourses.map(c => c.courseCode === selectedCourse.code ? optimisticCourse : c)
                  : [...s.allocatedCourses, optimisticCourse],
              }
            : s
        )
      );
      await manageStaffService.allocateCourse(selectedStaff, selectedCourse, selectedSectionId);
      const data = await manageStaffService.fetchInitialData(); // Refresh data
      setStaffList(data.staff); // Sync staffList with backend
      setSelectedCourse(null);
      setSelectedSectionId('');
      setCourseSearch('');
      setCourseFilters({ dept: '', semester: '', batch: '' });
      setExpandedCourses(prev => prev.includes(selectedStaff.staffId) ? prev : [...prev, selectedStaff.staffId]);
      showSuccessToast(`Course ${selectedCourse.code} ${isUpdate ? 'updated' : 'allocated'} successfully`);
    } catch (err) {
      setSelectedStaff(prev => ({
        ...prev,
        allocatedCourses: isUpdate
          ? prev.allocatedCourses.map(c => c.courseCode === selectedCourse.code ? selectedStaff.allocatedCourses.find(sc => sc.courseCode === selectedCourse.code) : c)
          : prev.allocatedCourses.filter(c => c.courseCode !== selectedCourse.code),
      }));
      setStaffList(prev =>
        prev.map(s => (s.staffId === selectedStaff.staffId ? { ...s, allocatedCourses: selectedStaff.allocatedCourses } : s))
      );
      showErrorToast('Error', `Error ${selectedCourse.isAllocated ? 'updating' : 'allocating'} course: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRemoveCourse = async (staff, staffCourseId) => {
    const courseToRemove = staff.allocatedCourses.find(c => c.id === staffCourseId);
    if (!staff || !staffCourseId || !courseToRemove) {
      showErrorToast('Validation Error', 'Missing staff or course information');
      return;
    }

    const result = await manageStaffService.confirmRemoveCourse(courseToRemove.courseCode);
    if (!result) return;

    setOperationLoading(true);
    setSelectedStaff(prev => ({
      ...prev,
      allocatedCourses: prev.allocatedCourses.filter(c => c.id !== staffCourseId),
    }));
    setStaffList(prev =>
      prev.map(s =>
        s.staffId === staff.staffId
          ? { ...s, allocatedCourses: s.allocatedCourses.filter(c => c.id !== staffCourseId) }
          : s
      )
    );

    try {
      await manageStaffService.removeCourse(staffCourseId);
      const data = await manageStaffService.fetchInitialData(); // Refresh data
      setStaffList(data.staff); // Sync staffList with backend
      setSelectedCourse(null);
      setSelectedSectionId('');
      setExpandedCourses(prev => prev.includes(staff.staffId) ? prev : [...prev, staff.staffId]);
      showSuccessToast(`Course ${courseToRemove.courseCode} removed successfully`);
    } catch (err) {
      setSelectedStaff(prev => ({
        ...prev,
        allocatedCourses: [...prev.allocatedCourses, courseToRemove],
      }));
      setStaffList(prev =>
        prev.map(s => (s.staffId === staff.staffId ? { ...s, allocatedCourses: [...s.allocatedCourses, courseToRemove] } : s))
      );
      showErrorToast('Error', `Error removing course: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditBatch = async () => {
    if (!selectedStaff || !selectedStaffCourse || !selectedSectionId) {
      showErrorToast('Validation Error', 'Missing staff, course, or section information');
      return;
    }

    const course = courses.find(c => c.code === selectedStaffCourse.courseCode);
    if (!course) {
      showErrorToast('Validation Error', `Course ${selectedStaffCourse.courseCode} not found`);
      return;
    }
    const section = course.sections.find(s => s.sectionId === selectedSectionId);
    if (!section) {
      showErrorToast('Validation Error', `Section ID ${selectedSectionId} not found for course ${selectedStaffCourse.courseCode}`);
      return;
    }

    setOperationLoading(true);
    const payload = {
      staffId: selectedStaff.staffId,
      courseCode: selectedStaffCourse.courseCode,
      sectionId: selectedSectionId,
      departmentId: selectedStaff.departmentId,
    };
    const optimisticCourse = {
      ...selectedStaffCourse,
      sectionId: selectedSectionId,
      batch: section.sectionName || 'N/A',
    };
    setSelectedStaff(prev => ({
      ...prev,
      allocatedCourses: prev.allocatedCourses.map(c => c.id === selectedStaffCourse.id ? optimisticCourse : c),
    }));
    setStaffList(prev =>
      prev.map(s =>
        s.staffId === selectedStaff.staffId
          ? {
              ...s,
              allocatedCourses: s.allocatedCourses.map(c => c.id === selectedStaffCourse.id ? optimisticCourse : c),
            }
          : s
      )
    );

    try {
      await manageStaffService.editBatch(selectedStaffCourse.id, payload);
      const data = await manageStaffService.fetchInitialData(); // Refresh data
      setStaffList(data.staff); // Sync staffList with backend
      setShowEditBatchModal(false);
      setSelectedStaffCourse(null);
      setSelectedSectionId('');
      setSelectedCourse(null);
      if (!operationFromModal) {
        setExpandedCourses(prev => prev.includes(selectedStaff.staffId) ? prev : [...prev, selectedStaff.staffId]);
      }
      showSuccessToast(`Section updated for course ${selectedStaffCourse.courseCode}`);
    } catch (err) {
      setSelectedStaff(prev => ({
        ...prev,
        allocatedCourses: prev.allocatedCourses.map(c => c.id === selectedStaffCourse.id ? selectedStaffCourse : c),
      }));
      setStaffList(prev =>
        prev.map(s =>
          s.staffId === selectedStaff.staffId
            ? {
                ...s,
                allocatedCourses: s.allocatedCourses.map(c => c.id === selectedStaffCourse.id ? selectedStaffCourse : c),
              }
            : s
        )
      );
      const errorMessage = err.message;
      if (errorMessage.includes('not found')) {
        showErrorToast('Error', `Section update failed: Staff course ID ${selectedStaffCourse.id} not found or invalid data`);
        await manageStaffService.fetchInitialData(); // Refresh data
      } else {
        showErrorToast('Error', `Error updating section: ${errorMessage}`);
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewStudents = async (courseCode, sectionId) => {
    setOperationLoading(true);
    try {
      const students = await manageStaffService.viewStudents(courseCode, sectionId);
      setSelectedCourseStudents(students);
      setSelectedCourseCode(courseCode);
      setShowStudentsModal(true);
    } catch (err) {
      showErrorToast('Error', `Error fetching students: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  return {
    handleStaffClick,
    handleAddBatch,
    handleAllocateCourse,
    handleRemoveCourse,
    handleEditBatch,
    handleViewStudents,
  };
};

export default useManageStaffHandlers;