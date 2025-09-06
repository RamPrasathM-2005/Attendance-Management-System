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
router
  .route("/semesters/:semesterId/courses")
  .post(addCourse)
  .get(getCourseBySemester);

// Get all courses
router.get("/courses", getAllCourse);

export default router;
