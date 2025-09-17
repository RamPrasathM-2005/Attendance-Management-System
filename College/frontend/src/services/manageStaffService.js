// src/services/manageStaffService.js
import axios from 'axios';
import { showConfirmToast } from '../utils/swalConfig';

const API_BASE = 'http://localhost:4000/api/admin';

const manageStaffService = {
  fetchInitialData: async () => {
    try {
      const deptRes = await axios.get('http://localhost:4000/api/departments').catch(err => {
        console.error('Error fetching departments:', err.response?.data || err.message);
        return { data: { data: [] } };
      });
      const departmentsData = Array.isArray(deptRes.data.data) ? deptRes.data.data.filter(d => d.isActive === 'YES') : [];

      const [semRes, batchRes, usersRes, courseRes] = await Promise.all([
        axios.get(`${API_BASE}/semesters`),
        axios.get(`${API_BASE}/batches`),
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/courses`),
      ]);

      const semestersData = Array.isArray(semRes.data.data) ? semRes.data.data : [];
      const batchesData = Array.isArray(batchRes.data.data) ? batchRes.data.data : [];

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

      return {
        departments: departmentsData,
        semesters: semestersData,
        batches: batchesData,
        staff: staffData.filter((staff, index, self) => index === self.findIndex(s => s.staffId === staff.staffId)),
        courses: coursesWithDetails,
      };
    } catch (err) {
      throw new Error(`Failed to fetch data: ${err.message}`);
    }
  },

  addBatch: async (courseCode, numberOfBatches) => {
    const res = await axios.post(`${API_BASE}/courses/${courseCode}/sections`, { numberOfSections: numberOfBatches });
    if (res.status !== 201) {
      throw new Error(res.data?.message || 'Failed to add batches');
    }
  },

  allocateCourse: async (selectedStaff, selectedCourse, selectedSectionId) => {
    const isUpdate = selectedCourse.isAllocated;
    const endpoint = isUpdate
      ? `${API_BASE}/staff-courses/${selectedStaff.allocatedCourses.find(c => c.courseCode === selectedCourse.code)?.id}`
      : `${API_BASE}/staff/${selectedStaff.staffId}/courses`;
    const method = isUpdate ? axios.patch : axios.post;
    const payload = {
      staffId: selectedStaff.staffId,
      courseCode: selectedCourse.code,
      sectionId: selectedSectionId,
      departmentId: selectedStaff.departmentId,
    };
    const res = await method(endpoint, payload);
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Failed to ${isUpdate ? 'update' : 'allocate'} course`);
    }
  },

  confirmRemoveCourse: async (courseCode) => {
    const result = await showConfirmToast(
      'Confirm Removal',
      `Are you sure you want to remove the course ${courseCode}?`,
      'warning',
      'Yes, remove it!',
      'No, cancel'
    );
    return result.isConfirmed;
  },

  removeCourse: async (staffCourseId) => {
    const res = await axios.delete(`${API_BASE}/staff-courses/${staffCourseId}`);
    if (res.status !== 200) {
      throw new Error('Failed to remove course allocation');
    }
  },

  editBatch: async (staffCourseId, payload) => {
    const res = await axios.patch(`${API_BASE}/staff-courses/${staffCourseId}`, payload);
    if (res.status !== 200) {
      throw new Error(res.data?.message || 'Failed to update section');
    }
  },

  viewStudents: async (courseCode, sectionId) => {
    const res = await axios.get(`${API_BASE}/students/enrolled-courses`, { params: { courseCode, sectionId } });
    if (res.data?.status !== 'success' || !Array.isArray(res.data.data)) {
      throw new Error('Failed to fetch students');
    }
    return res.data.data;
  },
};

export default manageStaffService;