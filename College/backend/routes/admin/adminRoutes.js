// Updated routes file (adminRoutes.js or similar)
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
  getCourseAllocationsByStaffEnhanced
} from "../../controllers/staffCourseController.js";
import {
  searchStudents,
  getAvailableCourses,
  enrollStudentInCourse,
  updateStudentBatch,
  getAvailableCoursesForBatch  // New import
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
  getStudentEnrolledCourses  // New import
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

/* =========================
   📌 Semester Routes
   ========================= */
router
  .route("/semesters")
  .post(addSemester)
  .get(getAllSemesters);

router.get("/semesters/search", getSemester);
router.get("/semesters/by-batch-branch", getSemestersByBatchBranch);

router
  .route("/semesters/:semesterId")
  .put(updateSemester)
  .delete(deleteSemester);

/* =========================
   📌 Course Routes
   ========================= */
router
  .route("/semesters/:semesterId/courses")
  .post(addCourse)
  .get(getCourseBySemester);

router
  .route("/courses")
  .get(getAllCourse);

router
  .route("/courses/:courseId")
  .put(updateCourse)
  .delete(deleteCourse);

/* =========================
   📌 Staff-Course Allocation Routes
   ========================= */
router.get("/users", getUsers);
router.post("/courses/:courseId/staff", allocateStaffToCourse); // Allocate staff to a course
router.post("/staff/:staffId/courses", allocateCourseToStaff); // Allocate course to a staff
router.put("/staff-courses/:staffCourseId", updateStaffAllocation); // Update a staff-course allocation
router.get("/courses/:courseId/staff", getStaffAllocationsByCourse); // Get staff allocations for a course
router.get("/staff/:staffId/courses", getCourseAllocationsByStaff); // Get course allocations for a staff
router.delete("/staff-courses/:staffCourseId", deleteStaffAllocation); // Delete a staff-course allocation
router.get("/staff/:staffId/courses-enhanced", getCourseAllocationsByStaffEnhanced);

/* =========================
   📌 Student Allocation Routes
   ========================= */
router.get("/students/search", searchStudents);
router.get("/courses/available/:semesterNumber", getAvailableCourses);
router.post("/students/enroll", enrollStudentInCourse);
router.put("/students/:rollnumber/batch", updateStudentBatch);

// New route for enriched available courses
router.get("/courses/available/:batchId/:semesterNumber", getAvailableCoursesForBatch);

/* =========================
   📌 Section (Batch) Routes
   ========================= */
router.get("/courses/:courseCode/sections", getSectionsForCourse); // Fetch all sections (batches) for a course
router.post("/courses/:courseCode/sections", addSectionsToCourse); // Add new sections (batches) to a course
router.put("/courses/:courseCode/sections", updateSectionsForCourse); // Update sections for a course
router.delete("/courses/:courseCode/sections/:sectionName", deleteSection);

/* =========================
   📌 Student Routes
   ========================= */
router
  .route("/students")
  .post(addStudent)
  .get(getAllStudents);

router
  .route("/students/:rollnumber")
  .get(getStudentByRollNumber) // Get a single student by rollnumber
  .put(updateStudent)       // Update a student by rollnumber
  .delete(deleteStudent);     // Delete a student by rollnumber

// New route for enrolled courses
router.get("/students/:rollnumber/enrolled-courses", getStudentEnrolledCourses);

/* =========================
   📌 Batch Routes
   ========================= */
router.get("/batches/find", getBatchByDetails);
router
  .route("/batches")
  .get(getAllBatches)
  .post(createBatch);

router
  .route("/batches/:batchId")
  .get(getBatchById)
  .put(updateBatch)
  .delete(deleteBatch);

export default router;