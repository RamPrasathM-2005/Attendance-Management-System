import React, { useState, useEffect } from "react";
import { Search, Users, UserPlus, Eye, ChevronRight, X, Edit2 } from "lucide-react";
import { branchMap } from "../admin/ManageSemesters/branchMap.js";

const API_BASE = "http://localhost:4000/api/admin"; // Adjust to match backend port

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [branches, setBranches] = useState(Object.keys(branchMap));
  const [semesters, setSemesters] = useState(["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]);
  const [batches, setBatches] = useState([{ batch: "2023", batchYears: "2023-2027", branch: "CSE", batchId: 1 }]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    branch: "",
    semester: "",
    batch: "",
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [editingCourseSection, setEditingCourseSection] = useState(null);
  const [error, setError] = useState(null);

  // Fetch dynamic filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setError(null);
      let errorMessages = [];

      try {
        // Fetch branches
        const branchesRes = await fetch(`${API_BASE}/students/branches`);
        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData.data || Object.keys(branchMap));
        } else {
          const errorText = await branchesRes.text();
          console.warn(`Branches fetch failed: ${branchesRes.status} ${errorText}`);
          errorMessages.push(`Failed to load branches: ${errorText}. Using default values.`);
          setBranches(Object.keys(branchMap));
        }

        // Fetch semesters
        const semestersRes = await fetch(`${API_BASE}/students/semesters`);
        if (semestersRes.ok) {
          const semestersData = await semestersRes.json();
          setSemesters(semestersData.data || ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]);
        } else {
          const errorText = await semestersRes.text();
          console.warn(`Semesters fetch failed: ${semestersRes.status} ${errorText}`);
          errorMessages.push(`Failed to load semesters: ${errorText}. Using default values.`);
          setSemesters(["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]);
        }

        // Fetch batches
        const batchesRes = await fetch(
          `${API_BASE}/students/batches${filters.branch ? `?branch=${encodeURIComponent(filters.branch)}` : ""}`
        );
        if (batchesRes.ok) {
          const batchesData = await batchesRes.json();
          setBatches(batchesData.data || [{ batch: "2023", batchYears: "2023-2027", branch: "CSE", batchId: 1 }]);
        } else {
          const errorText = await batchesRes.text();
          console.warn(`Batches fetch failed: ${batchesRes.status} ${errorText}`);
          errorMessages.push(`Failed to load batches: ${errorText}. Using default values.`);
          setBatches([{ batch: "2023", batchYears: "2023-2027", branch: "CSE", batchId: 1 }]);
        }

        if (errorMessages.length > 0) {
          setError(errorMessages.join(" "));
        }
      } catch (err) {
        console.error("Network or unexpected error in fetchFilterOptions:", err);
        setError(`Network error: ${err.message}. Please check the server connection and try again.`);
      }
    };
    fetchFilterOptions();
  }, [filters.branch]);

  // Fetch students and enrolled courses
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/students`);
        if (!res.ok) throw new Error(`Failed to fetch students: ${res.status}`);
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

        const updated = await Promise.all(
          mapped.map(async (student) => {
            try {
              const erRes = await fetch(`${API_BASE}/students/${student.rollnumber}/enrolled-courses`);
              if (erRes.ok) {
                const erData = await erRes.json();
                console.log(`Enrolled courses for ${student.rollnumber}:`, JSON.stringify(erData.data, null, 2));
                return { ...student, enrolledCourses: erData.data || [] };
              } else if (erRes.status === 404) {
                console.warn(`Student ${student.rollnumber} not found or no enrolled courses`);
                return { ...student, enrolledCourses: [] };
              } else {
                throw new Error(`Failed to fetch enrolled courses for ${student.rollnumber}: ${erRes.status}`);
              }
            } catch (err) {
              console.error(`Error fetching enrolled courses for ${student.rollnumber}:`, err);
              return { ...student, enrolledCourses: [] };
            }
          })
        );
        setStudents(updated.filter((student) => student));
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Unable to load students. Please try again or check the server.");
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

      const matchesBranch = !filters.branch || student.department === filters.branch;
      const matchesSemester = !filters.semester || student.semester === filters.semester;
      const matchesBatch = !filters.batch || student.batchId === parseInt(filters.batch);

      return matchesSearch && matchesBranch && matchesSemester && matchesBatch;
    });

    setFilteredStudents(filtered);
  }, [searchTerm, filters, students]);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setEditingCourseSection(null);
    setError(null);
  };

  const handleEnrollToCourse = async () => {
    if (!selectedStudent) return;
    setError(null);
    setEditingCourseSection(null);
    try {
      const res = await fetch(`${API_BASE}/courses/available/${selectedStudent.batchId}/${selectedStudent.semesterNumber}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("No available courses found for this batch and semester");
        }
        throw new Error(`Failed to fetch available courses: ${res.status}`);
      }
      const { data } = await res.json();
      console.log("Available courses:", JSON.stringify(data, null, 2));
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

  const handleBatchEnroll = async (courseId, courseCode, sectionName, staffId) => {
    if (!selectedStudent) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/students/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollnumber: selectedStudent.rollnumber,
          courseCode,
          sectionName,
          staffId: staffId || null,
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        const newCourse = {
          courseId,
          courseCode,
          courseName: selectedCourse.courseName,
          batch: sectionName,
          staff: selectedCourse.batches.find((b) => b.batchId === sectionName)?.staff || "Not Assigned",
        };
        let updatedEnrolled;
        if (editingCourseSection) {
          updatedEnrolled = selectedStudent.enrolledCourses.map((course) =>
            course.courseId === courseId ? newCourse : course
          );
        } else {
          updatedEnrolled = [...selectedStudent.enrolledCourses, newCourse];
        }
        const updatedStudent = { ...selectedStudent, enrolledCourses: updatedEnrolled };
        setSelectedStudent(updatedStudent);
        setStudents(students.map((s) => (s.rollnumber === selectedStudent.rollnumber ? updatedStudent : s)));
        alert(result.message || (editingCourseSection ? "Section updated successfully!" : "Student enrolled successfully!"));
        setShowEnrollModal(false);
        setSelectedCourse(null);
        setEditingCourseSection(null);
      } else {
        alert(result.message || (editingCourseSection ? "Section update failed" : "Enrollment failed"));
        setError(result.message || "Failed to process request. Please try again.");
      }
    } catch (err) {
      alert(editingCourseSection ? "Error updating section" : "Error enrolling student");
      console.error(err);
      setError(editingCourseSection ? "Failed to update section. Please try again." : "Failed to enroll student. Please try again.");
    }
  };

  const handleEditCourseSection = async (course) => {
    setEditingCourseSection(course);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/courses/available/${selectedStudent.batchId}/${selectedStudent.semesterNumber}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("No available sections found for this batch and semester");
        }
        throw new Error(`Failed to fetch available courses: ${res.status}`);
      }
      const { data } = await res.json();
      console.log("Available courses for section edit:", JSON.stringify(data, null, 2));
      const courseDetails = data.find((c) => c.courseId === course.courseId);
      if (!courseDetails) {
        console.warn(`Course not found for courseId: ${course.courseId}, courseCode: ${course.courseCode}`);
        setError(`Course ${course.courseName} is no longer available for this batch and semester. Please select another course.`);
        setShowEnrollModal(false);
        return;
      }
      setSelectedCourse(courseDetails);
      setAvailableCourses(data);
      setShowEnrollModal(true);
    } catch (err) {
      console.error("Failed to fetch available courses for section edit:", err);
      setError(err.message || "Unable to load available sections. Please try again.");
      setShowEnrollModal(false);
    }
  };

  const getAvailableCoursesForStudent = () => {
    if (!selectedStudent) return [];
    if (editingCourseSection) {
      return availableCourses.filter((course) => course.courseId === editingCourseSection.courseId);
    }
    return availableCourses.filter((course) => {
      const isAlreadyEnrolled = selectedStudent.enrolledCourses.some(
        (enrolled) => enrolled.courseId === course.courseId
      );
      return !isAlreadyEnrolled;
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading students...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Students</h1>
        <p className="text-gray-600">Search, filter, and manage student enrollments</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
          {error}
          <button
            onClick={() => {
              setError(null);
              fetchFilterOptions();
            }}
            className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value, batch: "" })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branchMap[branch] || branch}
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
          <select
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Batches</option>
            {batches
              .filter((batch) => !filters.branch || batch.branch === filters.branch)
              .map((batch) => (
                <option key={batch.batchId} value={batch.batchId}>
                  {`${batch.batch} (${batch.batchYears})`}
                </option>
              ))}
          </select>
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
                        <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{course.courseName}</p>
                            <p className="text-xs text-gray-600">
                              Section {course.batch} • {course.staff}
                            </p>
                          </div>
                          <button
                            onClick={() => handleEditCourseSection(course)}
                            className="px-2 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit Section
                          </button>
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
                {editingCourseSection
                  ? `Edit Section for ${editingCourseSection.courseName}`
                  : `Enroll ${selectedStudent?.name} to Course`}
              </h2>
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedCourse(null);
                  setEditingCourseSection(null);
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
                  <button
                    onClick={() => {
                      setError(null);
                      handleEnrollToCourse();
                    }}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              )}
              {!selectedCourse ? (
                <div>
                  <h3 className="font-medium text-blue-900 mb-4">
                    {editingCourseSection ? "Available Sections" : "Available Courses"}
                  </h3>
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
                      <p className="text-center text-blue-500 py-8">
                        {editingCourseSection ? "No other sections available for this course" : "No available courses to enroll"}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => {
                      setSelectedCourse(null);
                      if (editingCourseSection) {
                        setShowEnrollModal(false);
                        setEditingCourseSection(null);
                      }
                    }}
                    className="mb-4 text-blue-600 hover:text-blue-700 text-sm flex items-center transition-colors"
                  >
                    ← {editingCourseSection ? "Cancel" : "Back to courses"}
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
                          <p className="text-sm text-blue-600">{batch.staff || "Not Assigned"}</p>
                          <p className="text-xs text-blue-500 mt-1">
                            {batch.enrolled}/{batch.capacity} students
                          </p>
                        </div>
                        <button
                          onClick={() => handleBatchEnroll(selectedCourse.courseId, selectedCourse.courseCode, batch.batchId, batch.staffId)}
                          disabled={batch.enrolled >= batch.capacity || (editingCourseSection && batch.batchId === editingCourseSection.batch)}
                          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            batch.enrolled >= batch.capacity || (editingCourseSection && batch.batchId === editingCourseSection.batch)
                              ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          }`}
                        >
                          {batch.enrolled >= batch.capacity
                            ? "Full"
                            : editingCourseSection && batch.batchId === editingCourseSection.batch
                            ? "Current"
                            : editingCourseSection
                            ? "Change Section"
                            : "Enroll"}
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