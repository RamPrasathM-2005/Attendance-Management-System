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
  deleteCourse
} from "../../controllers/subjectController.js";

const router = express.Router();

/* =========================
   📌 Semester Routes
   ========================= */

// Add a new semester / Get all semesters
router
  .route("/semesters")
  .post(addSemester)
  .get(getAllSemesters);

// Get a specific semester by batch, branch, degree, and semesterNumber (query params)
router.get("/semesters/search", getSemester);

// Get all semesters for a specific batch, branch, and degree (query params)
router.get("/semesters/by-batch-branch", getSemestersByBatchBranch);

// Update or delete a semester by ID
router
  .route("/semesters/:semesterId")
  .put(updateSemester)     // ✅ Update semester
  .delete(deleteSemester); // ✅ Delete semester


/* =========================
   📌 Course Routes
   ========================= */

// Add a new course to a specific semester / Get all courses for a semester
// Course Routes
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

export default router;


