// src/components/ManageStaff.js
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import Filters from './Filters';
import StaffCard from './StaffCard';
import StaffDetailsModal from './StaffDetailsModal';
import AllocateCourseModal from './AllocateCourseModal';
import AddBatchModal from './AddBatchModal';
import EditBatchModal from './EditBatchModal';
import StudentsModal from './StudentsModal';
import useManageStaffData from './hooks/useManageStaffData';
import useManageStaffHandlers from './hooks/useManageStaffHandlers';
import useManageStaffFilters from './hooks/useManageStaffFilters';

const ManageStaff = () => {
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
  const [operationLoading, setOperationLoading] = useState(false);

  const { staffList, setStaffList, courses, semesters, batches, departments, loading, error } = useManageStaffData(
    selectedStaff,
    setSelectedStaff
  );

  const {
    filters,
    setFilters,
    nameSearch,
    setNameSearch,
    sortBy,
    handleSort,
    getFilteredStaff,
    getFilteredCourses,
  } = useManageStaffFilters(staffList, courses, selectedStaff, courseSearch, courseFilters);

  const {
    handleStaffClick,
    handleAddBatch,
    handleAllocateCourse,
    handleRemoveCourse,
    handleEditBatch,
    handleViewStudents,
  } = useManageStaffHandlers({
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
    setStaffList, // Pass setStaffList
  });

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
            key={`${staff.staffId}-${staff.allocatedCourses.map(c => `${c.courseCode}-${c.sectionId}`).join('-')}`} // Unique key
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