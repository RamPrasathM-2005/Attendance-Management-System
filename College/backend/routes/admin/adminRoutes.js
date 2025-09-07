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
} from "../../controllers/staffCourseController.js";

import {
  searchStudents,
  getAvailableCourses,
  enrollStudentInCourse,
  updateStudentBatch,
} from "../../controllers/studentAllocationController.js";

import {
  addSectionsToCourse,
  updateSectionsForCourse,
} from "../../controllers/sectionController.js";

import {
  addStudent,
  getAllStudents,
  getStudentByRollNumber,
  updateStudent,
  deleteStudent,
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
router.post("/courses/:courseId/staff", allocateStaffToCourse); // Allocate staff to a course (Courses page)
router.post("/staff/:staffId/courses", allocateCourseToStaff); // Allocate course to a staff (Staff page)
router.put("/staff-courses/:staffCourseId", updateStaffAllocation); // Update a staff-course allocation
router.get("/courses/:courseId/staff", getStaffAllocationsByCourse); // Get staff allocations for a course
router.get("/staff/:staffId/courses", getCourseAllocationsByStaff); // Get course allocations for a staff
router.delete("/staff-courses/:staffCourseId", deleteStaffAllocation); // Delete a staff-course allocation




router.get("/students/search", searchStudents);
router.get("/courses/available/:semesterNumber", getAvailableCourses);
router.post("/students/enroll", enrollStudentInCourse);
router.put("/students/:rollnumber/batch", updateStudentBatch);


// Add sections to a course
router.post("/courses/:courseCode/sections", addSectionsToCourse);

// Update sections for a course
router.put("/courses/:courseCode/sections", updateSectionsForCourse);


/* =========================
   📌 Student Routes
   ========================= */
router
  .route("/students")
  .post(addStudent)
  .get(getAllStudents);

// CRUD operations on a single student by rollnumber
router
  .route("/students/:rollnumber")
  .get(getStudentByRollNumber) // Get a single student by rollnumber
  .put(updateStudent)       // Update a student by rollnumber
  .delete(deleteStudent);     // Delete a student by rollnumber



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