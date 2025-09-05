import express from 'express';
import { addSemester, deleteSemester, getAllSemesters, getSemester, updateSemester, getSemestersByBatchBranch } from '../../controllers/semesterController.js';
import { addCourse, getAllCourse, getCourseBySemester } from '../../controllers/subjectController.js';

const router = express.Router();


// Semester Routes

// For adding a new semester and getting all semesters
router.route('/semesters')
  .post(addSemester)
  .get(getAllSemesters);

// For getting a specific semester by a combination of batch, branch, and semester number (using query parameters)
router.get('/semesters/search', getSemester);

// For getting all semesters for a specific batch and branch
router.get('/semesters/by-batch-branch', getSemestersByBatchBranch);

// For updating or deleting a semester by its ID
router.route('/semesters/:semesterId')
  .put(updateSemester)
  .delete(deleteSemester);




  
// Course Routes

// For adding a new course to a specific semester or getting all courses for a semester
router.route('/semesters/:semesterId/courses')
  .post(addCourse)
  .get(getCourseBySemester);

// For getting all courses
router.get('/courses', getAllCourse);

export default router;
