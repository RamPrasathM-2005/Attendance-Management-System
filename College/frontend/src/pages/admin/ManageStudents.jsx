import React, { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import Swal from "sweetalert2";
import { branchMap } from "../admin/ManageSemesters/branchMap.js";

const API_BASE = "http://localhost:4000/api/admin";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [degrees] = useState(["BE", "BTech", "ME", "MTech"]);
  const [branches, setBranches] = useState(Object.keys(branchMap));
  const [semesters, setSemesters] = useState(["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    degree: "BE", // Default degree
    branch: "",
    semester: "",
    batch: "",
  });
  const [error, setError] = useState(null);
  const [pendingAssignments, setPendingAssignments] = useState({});

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setError(null);
      try {
        const branchesRes = await fetch(`${API_BASE}/students/branches`);
        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData.data || Object.keys(branchMap));
        } else {
          setError("Failed to load branches.");
        }

        const semestersRes = await fetch(`${API_BASE}/students/semesters`);
        if (semestersRes.ok) {
          const semestersData = await semestersRes.json();
          setSemesters(semestersData.data || ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]);
        } else {
          setError("Failed to load semesters.");
        }

        const batchesRes = await fetch(
          `${API_BASE}/students/batches${filters.branch ? `?branch=${encodeURIComponent(filters.branch)}` : ""}`
        );
        if (batchesRes.ok) {
          const batchesData = await batchesRes.json();
          setBatches(batchesData.data || []);
        } else {
          setError("Failed to load batches.");
        }
      } catch (err) {
        setError("Network error: Unable to fetch filter options.");
      }
    };
    fetchFilterOptions();
  }, [filters.branch]);

  // Fetch students and courses
  useEffect(() => {
    const fetchData = async () => {
      if (!filters.branch || !filters.semester || !filters.batch) {
        setStudents([]);
        setAvailableCourses([]);
        setPendingAssignments({});
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const studentsRes = await fetch(
          `${API_BASE}/students/search?degree=${filters.degree}&branch=${filters.branch}&batch=${filters.batch}&semesterNumber=${filters.semester.slice(1)}`
        );
        if (!studentsRes.ok) {
          const errorData = await studentsRes.json();
          throw new Error(errorData.message || "Failed to fetch students");
        }
        const studentsData = await studentsRes.json();
        // Clean up enrolledCourses data by removing quotes
        const cleanedStudents = studentsData.data.map(student => ({
          ...student,
          enrolledCourses: student.enrolledCourses.map(course => ({
            ...course,
            staffId: course.staffId.replace(/"/g, ''),
            staffName: course.staffName.replace(/"/g, ''),
            courseCode: course.courseCode.replace(/"/g, ''),
            sectionName: course.sectionName.replace(/"/g, ''),
          })),
        }));
        console.log("Students data:", JSON.stringify(cleanedStudents, null, 2)); // Debug log
        setStudents(cleanedStudents || []);

        const batchId = batches.find((b) => b.batch === filters.batch)?.batchId;
        if (batchId) {
          const coursesRes = await fetch(
            `${API_BASE}/courses/available/${batchId}/${filters.semester.slice(1)}`
          );
          if (!coursesRes.ok) {
            const errorData = await coursesRes.json();
            throw new Error(errorData.message || "Failed to fetch courses");
          }
          const coursesData = await coursesRes.json();
          console.log("Courses data:", JSON.stringify(coursesData.data, null, 2)); // Debug log
          const mappedCourses = coursesData.data.map((course) => ({
            ...course,
            courseTitle: course.courseName,
            batches: course.batches.map((batch) => ({
              ...batch,
              sectionId: batch.batchId,
              sectionName: batch.batchId,
              staffName: batch.staff,
            })),
          }));
          setAvailableCourses(mappedCourses || []);
        }
      } catch (err) {
        setError(err.message || "Unable to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filters.degree, filters.branch, filters.semester, filters.batch]);

  // Handle staff assignment
  const assignStaff = (student, courseCode, sectionId, staffId) => {
    try {
      const course = availableCourses.find((c) => c.courseCode === courseCode);
      const section = course?.batches.find((b) => b.sectionId === sectionId);
      if (!section) {
        setError(`No section found for course ${courseCode}`);
        return false;
      }

      // Store pending assignment
      setPendingAssignments((prev) => ({
        ...prev,
        [`${student.rollnumber}-${courseCode}`]: {
          sectionId,
          sectionName: section.sectionName,
          staffId,
          staffName: section.staffName,
        },
      }));

      // Update local state
      setStudents((prev) =>
        prev.map((s) =>
          s.rollnumber === student.rollnumber
            ? {
                ...s,
                enrolledCourses: s.enrolledCourses.some((c) => c.courseCode === courseCode)
                  ? s.enrolledCourses.map((c) =>
                      c.courseCode === courseCode
                        ? { ...c, sectionId, sectionName: section.sectionName, staffId, staffName: section.staffName }
                        : c
                    )
                  : [
                      ...s.enrolledCourses,
                      {
                        courseId: course.courseId,
                        courseCode,
                        courseTitle: course.courseTitle,
                        sectionId,
                        sectionName: section.sectionName,
                        staffId,
                        staffName: section.staffName,
                      },
                    ],
              }
            : s
        )
      );
      return true;
    } catch (err) {
      setError("Failed to assign staff.");
      return false;
    }
  };

  // Handle unenrollment
  const unenroll = async (student, courseCode) => {
    try {
      // Store pending unenrollment
      setPendingAssignments((prev) => {
        const newAssignments = { ...prev };
        delete newAssignments[`${student.rollnumber}-${courseCode}`];
        return newAssignments;
      });

      // Update local state
      setStudents((prev) =>
        prev.map((s) =>
          s.rollnumber === student.rollnumber
            ? { ...s, enrolledCourses: s.enrolledCourses.filter((c) => c.courseCode !== courseCode) }
            : s
        )
      );

      // Send unenrollment request
      const res = await fetch(`${API_BASE}/students/unenroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollnumber: student.rollnumber, courseCode }),
      });
      const result = await res.json();
      if (result.status !== "success") {
        setError(result.message || "Failed to unenroll.");
        return false;
      }
      return true;
    } catch (err) {
      setError("Failed to unenroll: " + err.message);
      return false;
    }
  };

  // Apply staff to all students for a course
  const applyToAll = async (course) => {
    const batch1 = course.batches.find((b) => b.sectionName === "Batch 1") || course.batches[0];
    if (!batch1) {
      setError("No default section found for this course.");
      return;
    }
    students.forEach((student) => {
      assignStaff(student, course.courseCode, batch1.sectionId, batch1.staffId);
    });
  };

  // Save all pending assignments
  const saveAllAssignments = async () => {
    try {
      const assignments = Object.entries(pendingAssignments).map(([key, assignment]) => ({
        rollnumber: key.split("-")[0],
        courseCode: key.split("-")[1],
        sectionName: assignment.sectionName,
        staffId: assignment.staffId,
      }));

      if (assignments.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Changes",
          text: "No assignments to save.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const responses = await Promise.all(
        assignments.map((assignment) =>
          fetch(`${API_BASE}/students/enroll`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assignment),
          }).then((res) =>
            res.json().then((data) => ({
              status: res.status,
              data,
              assignment,
            }))
          )
        )
      );

      const failed = responses.filter((res) => res.data.status !== "success");
      if (failed.length > 0) {
        const errorMessages = failed
          .map((res) => `${res.data.message || "Unknown error"} (Student: ${res.assignment.rollnumber}, Course: ${res.assignment.courseCode})`)
          .join("; ");
        Swal.fire({
          icon: "error",
          title: "Failed to Save",
          text: `Failed to save ${failed.length} assignment(s): ${errorMessages}`,
          confirmButtonColor: "#d33",
        });
        setError(`Failed to save ${failed.length} assignment(s): ${errorMessages}`);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Assignments Saved",
        text: "All student assignments have been saved successfully!",
        confirmButtonColor: "#3085d6",
      });
      setPendingAssignments({});
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to save assignments: ${err.message}`,
        confirmButtonColor: "#d33",
      });
      setError("Failed to save assignments: " + err.message);
    }
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
            onClick={() => setError(null)}
            className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Dismiss
          </button>
        </div>
      )}

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
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batch}>
                {`${batch.batch} (${batch.batchYears})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Students (
            {students.filter((s) =>
              searchTerm
                ? s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.rollnumber.toLowerCase().includes(searchTerm.toLowerCase())
                : true
            ).length}
            )
          </h2>
          {(!filters.branch || !filters.semester || !filters.batch) && (
            <p className="text-sm text-gray-500 mt-1">Select a branch, semester, and batch to view the course assignment table.</p>
          )}
        </div>
        {filters.branch && filters.semester && filters.batch ? (
          students.length === 0 && availableCourses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No students or courses found for the selected criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: '140px', minWidth: '140px', position: 'sticky', left: 0, zIndex: 30, background: '#f9fafb' }}
                      >
                        Reg. No
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: '260px', minWidth: '260px', position: 'sticky', left: '140px', zIndex: 30, background: '#f9fafb' }}
                      >
                        Name of the Student
                      </th>
                      {availableCourses.map((course) => (
                        <th
                          key={course.courseCode}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          style={{ width: '300px', minWidth: '300px' }}
                        >
                          <div className="space-y-2">
                            <div className="truncate" title={course.courseTitle}>
                              <span className="block font-bold text-gray-900">{course.courseCode}</span>
                              <span className="block text-gray-400 text-xs">{course.courseTitle}</span>
                            </div>
                            <button
                              onClick={() => applyToAll(course)}
                              className="w-full py-1.5 px-3 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                              title="Apply Batch 1 to All"
                            >
                              Apply to All
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                    {students.length > 0 ? (
                      students
                        .filter((student) =>
                          searchTerm
                            ? student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              student.rollnumber.toLowerCase().includes(searchTerm.toLowerCase())
                            : true
                        )
                        .map((student, index) => (
                          <tr key={student.rollnumber} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} style={{ height: '70px' }}>
                            <td
                              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                              style={{ width: '140px', minWidth: '140px', position: 'sticky', left: 0, zIndex: 20, background: index % 2 === 0 ? '#fff' : '#f9fafb' }}
                            >
                              {student.rollnumber}
                            </td>
                            <td
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                              style={{ width: '260px', minWidth: '260px', position: 'sticky', left: '140px', zIndex: 20, background: index % 2 === 0 ? '#fff' : '#f9fafb' }}
                            >
                              <div className="truncate" title={student.name}>
                                {student.name}
                              </div>
                            </td>
                            {availableCourses.map((course) => {
                              const enrolled = student.enrolledCourses.find((c) => c.courseCode === course.courseCode);
                              const selectedStaffId = enrolled
                                ? course.batches.find((b) => b.staffId === enrolled.staffId && b.sectionName === enrolled.sectionName)?.staffId || ""
                                : "";
                              return (
                                <td
                                  key={course.courseCode}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  style={{ width: '300px', minWidth: '300px' }}
                                >
                                  <select
                                    value={selectedStaffId}
                                    onChange={(e) => {
                                      const staffId = e.target.value;
                                      if (!staffId) {
                                        unenroll(student, course.courseCode);
                                      } else {
                                        const section = course.batches.find((b) => b.staffId === staffId);
                                        if (section) {
                                          assignStaff(student, course.courseCode, section.sectionId, section.staffId);
                                        }
                                      }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white hover:bg-gray-100"
                                  >
                                    <option value="">Not Assigned</option>
                                    {course.batches.map((batch) => (
                                      <option key={batch.sectionId} value={batch.staffId}>
                                        {`${batch.staffName} (${batch.sectionName})`}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              );
                            })}
                          </tr>
                        ))
                    ) : availableCourses.length > 0 ? (
                      <tr style={{ height: '70px' }}>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          style={{ width: '140px', minWidth: '140px', position: 'sticky', left: 0, zIndex: 20, background: '#fff' }}
                        ></td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          style={{ width: '260px', minWidth: '260px', position: 'sticky', left: '140px', zIndex: 20, background: '#fff' }}
                        ></td>
                        {availableCourses.map((course) => (
                          <td
                            key={course.courseCode}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            style={{ width: '300px', minWidth: '300px' }}
                          >
                            <select
                              value=""
                              onChange={(e) => {
                                const staffId = e.target.value;
                                if (staffId) {
                                  const section = course.batches.find((b) => b.staffId === staffId);
                                  if (section) {
                                    // No student to assign to, so this is a no-op
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white hover:bg-gray-100"
                            >
                              <option value="">Not Assigned</option>
                              {course.batches.map((batch) => (
                                <option key={batch.sectionId} value={batch.staffId}>
                                  {`${batch.staffName} (${batch.sectionName})`}
                                </option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              {students.length === 0 && availableCourses.length > 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No students found for the selected criteria.</p>
                </div>
              )}
              {Object.keys(pendingAssignments).length > 0 && (
                <div className="p-6 text-center border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={saveAllAssignments}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save All Assignments ({Object.keys(pendingAssignments).length})
                  </button>
                </div>
              )}
            </>
          )
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Please select a branch, semester, and batch to display the assignment table.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;