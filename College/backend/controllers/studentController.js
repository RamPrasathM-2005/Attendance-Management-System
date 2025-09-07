import pool from "../db.js";
import catchAsync from "../utils/catchAsync.js";

export const searchStudents = catchAsync(async (req, res) => {
  const { degree, branch, batch } = req.query;

  if (!degree || !branch || !batch) {
    return res.status(400).json({
      status: "failure",
      message: "degree, branch, and batch are required",
    });
  }

  const [rows] = await pool.execute(
    `SELECT s.rollnumber, s.name, s.batchId, s.semesterNumber, s.isActive
     FROM Student s
     JOIN Batch b ON s.batchId = b.batchId
     WHERE b.degree = ? AND b.branch = ? AND b.batch = ? AND s.isActive = 'YES'`,
    [degree, branch, batch]
  );

  res.status(200).json({
    status: "success",
    data: rows,
  });
});

export const getAvailableCourses = catchAsync(async (req, res) => {
  const { semesterNumber } = req.params;

  if (!semesterNumber || isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 8) {
    return res.status(400).json({
      status: "failure",
      message: "Valid semesterNumber (1-8) is required",
    });
  }

  const [rows] = await pool.execute(
    `SELECT c.courseId, c.courseCode, c.courseTitle, c.semesterId, s.sectionId, s.sectionName
     FROM Course c
     JOIN Semester sem ON c.semesterId = sem.semesterId
     JOIN Section s ON c.courseCode = s.courseCode
     WHERE sem.semesterNumber = ? AND c.isActive = 'YES' AND s.isActive = 'YES'`,
    [semesterNumber]
  );

  res.status(200).json({
    status: "success",
    data: rows,
  });
});

export const enrollStudentInCourse = catchAsync(async (req, res) => {
  const { rollnumber, courseCode, sectionName, staffId } = req.body;

  if (!rollnumber || !courseCode || !sectionName) {
    return res.status(400).json({
      status: "failure",
      message: "rollnumber, courseCode, and sectionName are required",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Validate student
    const [studentRows] = await connection.execute(
      `SELECT batchId, semesterNumber FROM Student WHERE rollnumber = ? AND isActive = 'YES'`,
      [rollnumber]
    );
    if (studentRows.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `No active student found with rollnumber ${rollnumber}`,
      });
    }
    const { batchId, semesterNumber } = studentRows[0];

    // Validate course and semester
    const [courseRows] = await connection.execute(
      `SELECT courseId FROM Course c
       JOIN Semester s ON c.semesterId = s.semesterId
       WHERE c.courseCode = ? AND s.batchId = ? AND s.semesterNumber = ? AND c.isActive = 'YES'`,
      [courseCode, batchId, semesterNumber]
    );
    if (courseRows.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `No active course ${courseCode} found for semester ${semesterNumber}`,
      });
    }

    // Get sectionId
    const [sectionRows] = await connection.execute(
      `SELECT sectionId FROM Section WHERE courseCode = ? AND sectionName = ? AND isActive = 'YES'`,
      [courseCode, sectionName]
    );
    if (sectionRows.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `No active section ${sectionName} found for course ${courseCode}`,
      });
    }
    const { sectionId } = sectionRows[0];

    // Check for existing enrollment
    const [existingEnrollment] = await connection.execute(
      `SELECT studentCourseId, sectionId FROM StudentCourse WHERE rollnumber = ? AND courseCode = ?`,
      [rollnumber, courseCode]
    );

    if (existingEnrollment.length > 0) {
      // Edit existing enrollment (update section if different)
      const existingSectionId = existingEnrollment[0].sectionId;
      if (existingSectionId !== sectionId) {
        await connection.execute(
          `UPDATE StudentCourse SET sectionId = ?, updatedBy = ?, updatedDate = CURRENT_TIMESTAMP WHERE studentCourseId = ?`,
          [sectionId, req.user?.email || 'admin', existingEnrollment[0].studentCourseId]
        );
        // Update StaffCourse if staffId is provided
        if (staffId) {
          const [staffCourse] = await connection.execute(
            `SELECT staffCourseId FROM StaffCourse WHERE courseCode = ? AND sectionId = ? AND staffId = ?`,
            [courseCode, sectionId, staffId]
          );
          if (staffCourse.length === 0 && existingSectionId !== sectionId) {
            await connection.execute(
              `INSERT INTO StaffCourse (staffId, courseCode, sectionId, departmentId)
               VALUES (?, ?, ?, (SELECT departmentId FROM Users WHERE staffId = ?))`,
              [staffId, courseCode, sectionId, staffId]
            );
          }
        }
        await connection.commit();
        return res.status(200).json({
          status: "success",
          message: `Student ${rollnumber} section updated to ${sectionName} for course ${courseCode}`,
        });
      }
      return res.status(400).json({
        status: "failure",
        message: `Student ${rollnumber} is already enrolled in course ${courseCode} with section ${sectionName}`,
      });
    }

    // New enrollment
    const [result] = await connection.execute(
      `INSERT INTO StudentCourse (rollnumber, courseCode, sectionId, createdBy, updatedBy)
       VALUES (?, ?, ?, ?, ?)`,
      [rollnumber, courseCode, sectionId, req.user?.email || 'admin', req.user?.email || 'admin']
    );

    // Allocate staff if provided
    if (staffId) {
      const [staffCourse] = await connection.execute(
        `SELECT staffCourseId FROM StaffCourse WHERE courseCode = ? AND sectionId = ? AND staffId = ?`,
        [courseCode, sectionId, staffId]
      );
      if (staffCourse.length === 0) {
        await connection.execute(
          `INSERT INTO StaffCourse (staffId, courseCode, sectionId, departmentId)
           VALUES (?, ?, ?, (SELECT departmentId FROM Users WHERE staffId = ?))`,
          [staffId, courseCode, sectionId, staffId]
        );
      }
    }

    await connection.commit();
    res.status(201).json({
      status: "success",
      message: "Student enrolled in course successfully",
      studentCourseId: result.insertId,
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

export const updateStudentBatch = catchAsync(async (req, res) => {
  const { rollnumber } = req.params;
  const { batchId, semesterNumber } = req.body;

  if (!batchId || !semesterNumber || isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 8) {
    return res.status(400).json({
      status: "failure",
      message: "batchId and valid semesterNumber (1-8) are required",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Validate student
    const [studentRows] = await connection.execute(
      `SELECT rollnumber FROM Student WHERE rollnumber = ? AND isActive = 'YES'`,
      [rollnumber]
    );
    if (studentRows.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `No active student found with rollnumber ${rollnumber}`,
      });
    }

    // Validate batch
    const [batchRows] = await connection.execute(
      `SELECT batchId FROM Batch WHERE batchId = ? AND isActive = 'YES'`,
      [batchId]
    );
    if (batchRows.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `No active batch found with batchId ${batchId}`,
      });
    }

    // Update student batch and semester
    const [result] = await connection.execute(
      `UPDATE Student
       SET batchId = ?, semesterNumber = ?, updatedDate = CURRENT_TIMESTAMP
       WHERE rollnumber = ?`,
      [batchId, semesterNumber, rollnumber]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: "failure",
        message: "No changes made to the student batch",
      });
    }

    await connection.commit();
    res.status(200).json({
      status: "success",
      message: "Student batch updated successfully",
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});