import express from "express";
import {
  addSemester,
  deleteSemester,
  getAllSemesters,
  getSemester,
  updateSemester,
  getSemestersByBatchBranch,
} from "../../controllers/semesterController.js";
import {
  addCourse,
  getAllCourse,
  getCourseBySemester,
  updateCourse,
  deleteCourse,
} from "../../controllers/subjectController.js";
import {
  allocateStaffToCourse,
  allocateCourseToStaff,
  updateStaffAllocation,
  getStaffAllocationsByCourse,
  getCourseAllocationsByStaff,
  deleteStaffAllocation,
  getUsers,
  getCourseAllocationsByStaffEnhanced,
} from "../../controllers/staffCourseController.js";
import {
  searchStudents,
  getAvailableCourses,
  enrollStudentInCourse,
  updateStudentBatch,
  getAvailableCoursesForBatch,
} from "../../controllers/studentAllocationController.js";
import {
  getSectionsForCourse,
  addSectionsToCourse,
  updateSectionsForCourse,
  deleteSection,
} from "../../controllers/sectionController.js";
import {
  addStudent,
  getAllStudents,
  getStudentByRollNumber,
  updateStudent,
  deleteStudent,
  getStudentEnrolledCourses,
  getBranches,
  getSemesters,
  getBatches,
} from "../../controllers/studentController.js";
import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchByDetails,
} from "../../controllers/batchController.js";

const router = express.Router();

// Base API: http://localhost:4000/api/admin

/* =========================
   📌 Semester Routes
   ========================= */
router.route("/semesters").post(addSemester).get(getAllSemesters);
router.get("/semesters/search", getSemester);
router.get("/semesters/by-batch-branch", getSemestersByBatchBranch);
router.route("/semesters/:semesterId").put(updateSemester).delete(deleteSemester);

/* =========================
   📌 Course Routes
   ========================= */
router.route("/semesters/:semesterId/courses").post(addCourse).get(getCourseBySemester);
router.route("/courses").get(getAllCourse);
router.route("/courses/:courseId").put(updateCourse).delete(deleteCourse);

/* =========================
   📌 Staff-Course Allocation Routes
   ========================= */
router.get("/users", getUsers);
router.post("/courses/:courseId/staff", allocateStaffToCourse);
router.post("/staff/:staffId/courses", allocateCourseToStaff);
router.put("/staff-courses/:staffCourseId", updateStaffAllocation);
router.get("/courses/:courseId/staff", getStaffAllocationsByCourse);
router.get("/staff/:staffId/courses", getCourseAllocationsByStaff);
router.delete("/staff-courses/:staffCourseId", deleteStaffAllocation);
router.get("/staff/:staffId/courses-enhanced", getCourseAllocationsByStaffEnhanced);

/* =========================
   📌 Student Allocation Routes
   ========================= */
router.get("/students/search", searchStudents);
router.get("/courses/available/:semesterNumber", getAvailableCourses);
router.post("/students/enroll", enrollStudentInCourse);
router.put("/students/:rollnumber/batch", updateStudentBatch);
router.get("/courses/available/:batchId/:semesterNumber", getAvailableCoursesForBatch);

/* =========================
   📌 Section Routes
   ========================= */
router.get("/courses/:courseCode/sections", getSectionsForCourse);
router.post("/courses/:courseCode/sections", addSectionsToCourse);
router.put("/courses/:courseCode/sections", updateSectionsForCourse);
router.delete("/courses/:courseCode/sections/:sectionName", deleteSection);

/* =========================
   📌 Student Routes
   ========================= */
router.route("/students").post(addStudent).get(getAllStudents);
router.get("/students/branches", getBranches);
router.get("/students/semesters", getSemesters);
router.get("/students/batches", getBatches);
router.route("/students/:rollnumber").get(getStudentByRollNumber).put(updateStudent).delete(deleteStudent);
router.get("/students/:rollnumber/enrolled-courses", getStudentEnrolledCourses);
/* =========================
   📌 Batch Routes
   ========================= */
router.get("/batches/find", getBatchByDetails);
router.route("/batches").get(getAllBatches).post(createBatch);
router.route("/batches/:batchId").get(getBatchById).put(updateBatch).delete(deleteBatch);

export default router;