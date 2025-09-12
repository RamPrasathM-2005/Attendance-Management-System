// ManageStudents.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, Users, BookOpen, UserPlus, Eye, ChevronRight, X, Edit3, Save } from "lucide-react";

const API_BASE = "http://localhost:4000/api/admin";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    course: "",
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [editBatchId, setEditBatchId] = useState("");
  const [editSemester, setEditSemester] = useState("");
  const [showEditBatch, setShowEditBatch] = useState(false);
  const [error, setError] = useState(null); // New state for error handling

  // Filter options
  const departments = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Information Technology",
    "Electrical and Electronics Engineering",
    "Artificial Intelligence and Data Science",
  ];
  const semesters = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

  // Fetch all batches on load
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`${API_BASE}/batches`);
        if (!res.ok) throw new Error("Failed to fetch batches");
        const { data } = await res.json();
        setBatches(data);
      } catch (err) {
        console.error("Failed to fetch batches:", err);
        setError("Unable to load batches. Please try again.");
      }
    };
    fetchBatches();
  }, []);

  // Fetch students and enrolled courses
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null); // Reset error
      try {
        const res = await fetch(`${API_BASE}/students`);
        if (!res.ok) throw new Error("Failed to fetch students");
        const { data: rawData } = await res.json();
        const mapped = rawData.map((s) => ({
          id: s.rollnumber,
          rollNo: s.rollnumber,
          rollnumber: s.rollnumber,
          name: s.name,
          batchId: s.batchId,
          department: s.branch,
          semester: `S${s.semesterNumber}`,
          semesterNumber: s.semesterNumber,
          batch: s.batch,
          enrolledCourses: [],
        }));

        // Load enrolled courses for each student
        const updated = await Promise.all(
          mapped.map(async (student) => {
            try {
              const erRes = await fetch(`${API_BASE}/students/${student.rollnumber}/enrolled-courses`);
              if (erRes.ok) {
                const erData = await erRes.json();
                return { ...student, enrolledCourses: erData.data || [] };
              } else {
                console.warn(`No enrolled courses found for ${student.rollnumber}`);
                return { ...student, enrolledCourses: [] }; // Return empty array for 404
              }
            } catch (err) {
              console.error(`Failed to fetch enrolled courses for ${student.rollnumber}:`, err);
              return { ...student, enrolledCourses: [] }; // Fallback to empty array
            }
          })
        );
        setStudents(updated);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Unable to load students. Please check the server and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = !filters.department || student.department === filters.department;
      const matchesSem = !filters.semester || student.semester === filters.semester;

      const matchesCourse =
        !filters.course ||
        student.enrolledCourses.some((course) =>
          course.courseName.toLowerCase().includes(filters.course.toLowerCase())
        );

      return matchesSearch && matchesDept && matchesSem && matchesCourse;
    });

    setFilteredStudents(filtered);
  }, [searchTerm, filters, students]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setEditBatchId(student.batchId);
    setEditSemester(student.semesterNumber);
    setShowEditBatch(false);
    setError(null); // Reset error when selecting a new student
  };

  const handleEnrollToCourse = async () => {
    if (!selectedStudent) return;
    setError(null); // Reset error
    try {
      const res = await fetch(`${API_BASE}/courses/available/${selectedStudent.batchId}/${selectedStudent.semesterNumber}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("No available courses found for this batch and semester");
        }
        throw new Error("Failed to fetch available courses");
      }
      const { data } = await res.json();
      setAvailableCourses(data);
      setShowEnrollModal(true);
    } catch (err) {
      console.error("Failed to fetch available courses:", err);
      setError(err.message || "Unable to load available courses. Please try again.");
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleBatchEnroll = async (courseId, batchId, staffId) => {
    if (!selectedStudent) return;
    setError(null); // Reset error
    try {
      const res = await fetch(`${API_BASE}/students/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollnumber: selectedStudent.rollnumber,
          courseCode: courseId,
          sectionName: batchId,
          staffId: staffId || null,
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        const newCourse = {
          courseId,
          courseName: selectedCourse.courseName,
          batch: batchId,
          staff: selectedCourse.batches.find((b) => b.batchId === batchId)?.staff || "Not Assigned",
        };
        const updatedEnrolled = [...selectedStudent.enrolledCourses, newCourse];
        const updatedStudent = { ...selectedStudent, enrolledCourses: updatedEnrolled };
        setSelectedStudent(updatedStudent);
        setStudents(students.map((s) => (s.rollnumber === selectedStudent.rollnumber ? updatedStudent : s)));
        alert(result.message || "Student enrolled successfully!");
        setShowEnrollModal(false);
        setSelectedCourse(null);
      } else {
        alert(result.message || "Enrollment failed");
      }
    } catch (err) {
      alert("Error enrolling student");
      console.error(err);
      setError("Failed to enroll student. Please try again.");
    }
  };

  const getAvailableCoursesForStudent = () => {
    if (!selectedStudent) return [];
    return availableCourses.filter((course) => {
      const isAlreadyEnrolled = selectedStudent.enrolledCourses.some(
        (enrolled) => enrolled.courseId === course.courseId
      );
      return !isAlreadyEnrolled;
    });
  };

  const handleUpdateBatch = async () => {
    if (!selectedStudent || !editBatchId || !editSemester) return;
    setError(null); // Reset error
    try {
      const res = await fetch(`${API_BASE}/students/${selectedStudent.rollnumber}/batch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: parseInt(editBatchId),
          semesterNumber: parseInt(editSemester),
        }),
      });
      if (res.ok) {
        const result = await res.json();
        alert(result.message || "Batch updated successfully!");
        const updatedStudent = {
          ...selectedStudent,
          batchId: parseInt(editBatchId),
          semesterNumber: parseInt(editSemester),
          semester: `S${editSemester}`,
        };
        setSelectedStudent(updatedStudent);
        setStudents(students.map((s) => (s.rollnumber === selectedStudent.rollnumber ? updatedStudent : s)));
        setShowEditBatch(false);
      } else {
        const result = await res.json();
        alert(result.message || "Update failed");
        setError(result.message || "Failed to update batch. Please try again.");
      }
    } catch (err) {
      alert("Error updating batch");
      console.error(err);
      setError("Failed to update batch. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading students...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Students</h1>
        <p className="text-gray-600">Search, filter, and manage student enrollments</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by enrolled course..."
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Students ({filteredStudents.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedStudent?.id === student.id ? "bg-blue-50 border-r-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.rollNo}</p>
                      <p className="text-sm text-gray-500">
                        {student.department} • {student.semester} • Batch {student.batch}
                      </p>
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
                  <p className="text-sm text-gray-600 mb-1">Department: {selectedStudent.department}</p>
                  <p className="text-sm text-gray-600 mb-1">Program Batch: {selectedStudent.batch}</p>
                  <p className="text-sm text-gray-600">Semester: {selectedStudent.semester}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Edit Batch & Semester</h4>
                    <button
                      onClick={() => setShowEditBatch(!showEditBatch)}
                      className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      {showEditBatch ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  {showEditBatch && (
                    <div className="space-y-2">
                      <select
                        value={editBatchId}
                        onChange={(e) => setEditBatchId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Batch</option>
                        {batches.map((b) => (
                          <option key={b.batchId} value={b.batchId}>
                            {b.degree} {b.branch} {b.batch}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={editSemester}
                        onChange={(e) => setEditSemester(e.target.value)}
                        placeholder="Semester (1-8)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={handleUpdateBatch}
                        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Update
                      </button>
                    </div>
                  )}
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
                          <p className="text-xs text-gray-600">
                            Section {course.batch} • {course.staff}
                          </p>
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
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              {!selectedCourse ? (
                <div>
                  <h3 className="font-medium text-blue-900 mb-4">Available Courses</h3>
                  <div className="space-y-3">
                    {getAvailableCoursesForStudent().map((course) => (
                      <div
                        key={course.courseId}
                        onClick={() => handleCourseSelect(course)}
                        className="p-4 border border-blue-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-blue-900">{course.courseName}</h4>
                            <p className="text-sm text-blue-600">
                              {course.courseCode} • {course.semester}
                            </p>
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
                    Select Section for {selectedCourse.courseName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCourse.batches.map((batch) => (
                      <div
                        key={batch.batchId}
                        className="p-4 border border-blue-200 rounded-lg hover:border-blue-400 transition-colors bg-blue-50"
                      >
                        <div className="text-center mb-3">
                          <h4 className="font-medium text-blue-900">Section {batch.batchId}</h4>
                          <p className="text-sm text-blue-600">{batch.staff}</p>
                          <p className="text-xs text-blue-500 mt-1">
                            {batch.enrolled}/{batch.capacity} students
                          </p>
                        </div>
                        <button
                          onClick={() => handleBatchEnroll(selectedCourse.courseCode, batch.batchId, batch.staffId)}
                          disabled={batch.enrolled >= batch.capacity}
                          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            batch.enrolled >= batch.capacity
                              ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          }`}
                        >
                          {batch.enrolled >= batch.capacity ? "Full" : "Enroll"}
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