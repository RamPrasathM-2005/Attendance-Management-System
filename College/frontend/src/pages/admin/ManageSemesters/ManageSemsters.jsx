import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import SearchBar from './SearchBar';
import SemesterList from './SemesterList';
import CreateSemesterForm from './CreateSemesterForm';
import SemesterDetails from './SemesterDetails';

const ManageSemesters = () => {
  const [semesters, setSemesters] = useState([
    { id: 1, batch: '2023-2027', department: 'Computer Science Engineering', semester: 3, totalCourses: 6, totalStudents: 45, createdAt: '2024-01-15' },
    { id: 2, batch: '2024-2028', department: 'Information Technology', semester: 1, totalCourses: 5, totalStudents: 52, createdAt: '2024-08-20' },
    { id: 3, batch: '2022-2026', department: 'Electronics & Communication', semester: 5, totalCourses: 7, totalStudents: 38, createdAt: '2023-07-10' },
    { id: 4, batch: '2023-2027', department: 'Mechanical Engineering', semester: 2, totalCourses: 6, totalStudents: 41, createdAt: '2024-01-22' }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [searchQuery, setSearchQuery] = useState({ batch: '', department: '', semester: '' });

  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];

  const handleCreateSemester = (newSemester) => {
    setSemesters([...semesters, { id: semesters.length + 1, ...newSemester }]);
    setShowCreateForm(false);
  };

  const filteredSemesters = semesters.filter(s => {
    const batchMatch = s.batch.toLowerCase().includes(searchQuery.batch.toLowerCase());
    const deptMatch = s.department.toLowerCase().includes(searchQuery.department.toLowerCase());
    const semMatch = searchQuery.semester ? s.semester === parseInt(searchQuery.semester) : true;
    return batchMatch && deptMatch && semMatch;
  });

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
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} departments={departments} />
            <SemesterList semesters={filteredSemesters} onSemesterClick={setSelectedSemester} />
            <CreateSemesterForm
              showCreateForm={showCreateForm}
              setShowCreateForm={setShowCreateForm}
              onCreateSemester={handleCreateSemester}
              departments={departments}
            />
          </>
        ) : (
          <SemesterDetails semester={selectedSemester} onBack={() => setSelectedSemester(null)} />
        )}
      </div>
    </div>
  );
};

export default ManageSemesters;
