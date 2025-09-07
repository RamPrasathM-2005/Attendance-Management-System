import pool from "../db.js";
import catchAsync from "../utils/catchAsync.js";

// Allocate Staff to a Course (Courses page flow)
export const allocateStaffToCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { staffId, sectionName, departmentId } = req.body;

  // Validate required fields
  if (!staffId || !sectionName || !departmentId) {
    return res.status(400).json({
      status: "failure",
      message: "staffId, sectionName, and departmentId are required",
    });
  }

  // Validate courseId and get courseCode
  const [courseRows] = await pool.execute(
    `SELECT courseCode FROM Course WHERE courseId = ? AND isActive = 'YES'`,
    [courseId]
  );
  if (courseRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active course found with courseId ${courseId}`,
    });
  }
  const { courseCode } = courseRows[0];

  // Validate staffId and departmentId
  const [staffRows] = await pool.execute(
    `SELECT userId FROM Users WHERE staffId = ? AND departmentId = ? AND role = 'STAFF' AND isActive = 'YES'`,
    [staffId, departmentId]
  );
  if (staffRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active staff found with staffId ${staffId} in departmentId ${departmentId}`,
    });
  }

  // Validate sectionName and get sectionId
  const [sectionRows] = await pool.execute(
    `SELECT sectionId FROM Section WHERE sectionName = ? AND courseCode = ? AND isActive = 'YES'`,
    [sectionName, courseCode]
  );
  if (sectionRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active section found with sectionName ${sectionName} for courseCode ${courseCode}`,
    });
  }
  const { sectionId } = sectionRows[0];

  // Check for existing allocation
  const [existingAllocation] = await pool.execute(
    `SELECT staffCourseId FROM StaffCourse WHERE staffId = ? AND courseCode = ? AND sectionId = ? AND departmentId = ?`,
    [staffId, courseCode, sectionId, departmentId]
  );
  if (existingAllocation.length > 0) {
    return res.status(400).json({
      status: "failure",
      message: `Staff ${staffId} is already allocated to course ${courseCode} in section ${sectionName}`,
    });
  }

  // Insert allocation
  const [result] = await pool.execute(
    `INSERT INTO StaffCourse (staffId, courseCode, sectionId, departmentId)
     VALUES (?, ?, ?, ?)`,
    [staffId, courseCode, sectionId, departmentId]
  );

  res.status(201).json({
    status: "success",
    message: "Staff allocated to course successfully",
    staffCourseId: result.insertId,
  });
});

// Allocate Course to a Staff (Staff page flow)
export const allocateCourseToStaff = catchAsync(async (req, res) => {
  const { staffId } = req.params;
  const { courseCode, sectionName, departmentId } = req.body;

  // Validate required fields
  if (!courseCode || !sectionName || !departmentId) {
    return res.status(400).json({
      status: "failure",
      message: "courseCode, sectionName, and departmentId are required",
    });
  }

  // Validate staffId and departmentId
  const [staffRows] = await pool.execute(
    `SELECT userId FROM Users WHERE staffId = ? AND departmentId = ? AND role = 'STAFF' AND isActive = 'YES'`,
    [staffId, departmentId]
  );
  if (staffRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active staff found with staffId ${staffId} in departmentId ${departmentId}`,
    });
  }

  // Validate courseCode
  const [courseRows] = await pool.execute(
    `SELECT courseCode FROM Course WHERE courseCode = ? AND isActive = 'YES'`,
    [courseCode]
  );
  if (courseRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active course found with courseCode ${courseCode}`,
    });
  }

  // Validate sectionName and get sectionId
  const [sectionRows] = await pool.execute(
    `SELECT sectionId FROM Section WHERE sectionName = ? AND courseCode = ? AND isActive = 'YES'`,
    [sectionName, courseCode]
  );
  if (sectionRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active section found with sectionName ${sectionName} for courseCode ${courseCode}`,
    });
  }
  const { sectionId } = sectionRows[0];

  // Check for existing allocation
  const [existingAllocation] = await pool.execute(
    `SELECT staffCourseId FROM StaffCourse WHERE staffId = ? AND courseCode = ? AND sectionId = ? AND departmentId = ?`,
    [staffId, courseCode, sectionId, departmentId]
  );
  if (existingAllocation.length > 0) {
    return res.status(400).json({
      status: "failure",
      message: `Staff ${staffId} is already allocated to course ${courseCode} in section ${sectionName}`,
    });
  }

  // Insert allocation
  const [result] = await pool.execute(
    `INSERT INTO StaffCourse (staffId, courseCode, sectionId, departmentId)
     VALUES (?, ?, ?, ?)`,
    [staffId, courseCode, sectionId, departmentId]
  );

  res.status(201).json({
    status: "success",
    message: "Course allocated to staff successfully",
    staffCourseId: result.insertId,
  });
});

// Update Staff-Course Allocation
export const updateStaffAllocation = catchAsync(async (req, res) => {
  const { staffCourseId } = req.params;
  const { staffId, courseCode, sectionName, departmentId } = req.body;

  // Validate required fields
  if (!staffId || !courseCode || !sectionName || !departmentId) {
    return res.status(400).json({
      status: "failure",
      message: "staffId, courseCode, sectionName, and departmentId are required",
    });
  }

  // Validate staffCourseId
  const [allocationRows] = await pool.execute(
    `SELECT staffCourseId FROM StaffCourse WHERE staffCourseId = ?`,
    [staffCourseId]
  );
  if (allocationRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No allocation found with staffCourseId ${staffCourseId}`,
    });
  }

  // Validate staffId and departmentId
  const [staffRows] = await pool.execute(
    `SELECT userId FROM Users WHERE staffId = ? AND departmentId = ? AND role = 'STAFF' AND isActive = 'YES'`,
    [staffId, departmentId]
  );
  if (staffRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active staff found with staffId ${staffId} in departmentId ${departmentId}`,
    });
  }

  // Validate courseCode
  const [courseRows] = await pool.execute(
    `SELECT courseCode FROM Course WHERE courseCode = ? AND isActive = 'YES'`,
    [courseCode]
  );
  if (courseRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active course found with courseCode ${courseCode}`,
    });
  }

  // Validate sectionName and get sectionId
  const [sectionRows] = await pool.execute(
    `SELECT sectionId FROM Section WHERE sectionName = ? AND courseCode = ? AND isActive = 'YES'`,
    [sectionName, courseCode]
  );
  if (sectionRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active section found with sectionName ${sectionName} for courseCode ${courseCode}`,
    });
  }
  const { sectionId } = sectionRows[0];

  // Check for duplicate allocation (excluding current staffCourseId)
  const [existingAllocation] = await pool.execute(
    `SELECT staffCourseId FROM StaffCourse 
     WHERE staffId = ? AND courseCode = ? AND sectionId = ? AND departmentId = ? AND staffCourseId != ?`,
    [staffId, courseCode, sectionId, departmentId, staffCourseId]
  );
  if (existingAllocation.length > 0) {
    return res.status(400).json({
      status: "failure",
      message: `Staff ${staffId} is already allocated to course ${courseCode} in section ${sectionName}`,
    });
  }

  // Update allocation
  const [result] = await pool.execute(
    `UPDATE StaffCourse 
     SET staffId = ?, courseCode = ?, sectionId = ?, departmentId = ?
     WHERE staffCourseId = ?`,
    [staffId, courseCode, sectionId, departmentId, staffCourseId]
  );

  if (result.affectedRows === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No changes made to the allocation",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Staff-course allocation updated successfully",
  });
});

// Get Staff Allocations for a Course
export const getStaffAllocationsByCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  // Validate courseId
  const [courseRows] = await pool.execute(
    `SELECT courseCode FROM Course WHERE courseId = ? AND isActive = 'YES'`,
    [courseId]
  );
  if (courseRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active course found with courseId ${courseId}`,
    });
  }
  const { courseCode } = courseRows[0];

  // Get allocations
  const [rows] = await pool.execute(
    `SELECT sc.staffCourseId, sc.staffId, u.name AS staffName, sc.courseCode, sc.sectionId, s.sectionName, sc.departmentId, d.departmentName
     FROM StaffCourse sc
     JOIN Users u ON sc.staffId = u.staffId AND sc.departmentId = u.departmentId
     JOIN Section s ON sc.sectionId = s.sectionId
     JOIN Department d ON sc.departmentId = d.departmentId
     WHERE sc.courseCode = ? AND u.isActive = 'YES' AND s.isActive = 'YES' AND d.isActive = 'YES'`,
    [courseCode]
  );

  res.status(200).json({
    status: "success",
    data: rows,
  });
});

// Get Course Allocations for a Staff
export const getCourseAllocationsByStaff = catchAsync(async (req, res) => {
  const { staffId } = req.params;

  // Validate staffId
  const [staffRows] = await pool.execute(
    `SELECT userId, departmentId FROM Users WHERE staffId = ? AND role = 'STAFF' AND isActive = 'YES'`,
    [staffId]
  );
  if (staffRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No active staff found with staffId ${staffId}`,
    });
  }
  const { departmentId } = staffRows[0];

  // Get allocations
  const [rows] = await pool.execute(
    `SELECT sc.staffCourseId, sc.staffId, sc.courseCode, c.courseTitle, sc.sectionId, s.sectionName, sc.departmentId, d.departmentName
     FROM StaffCourse sc
     JOIN Course c ON sc.courseCode = c.courseCode
     JOIN Section s ON sc.sectionId = s.sectionId
     JOIN Department d ON sc.departmentId = d.departmentId
     WHERE sc.staffId = ? AND sc.departmentId = ? AND c.isActive = 'YES' AND s.isActive = 'YES' AND d.isActive = 'YES'`,
    [staffId, departmentId]
  );

  res.status(200).json({
    status: "success",
    data: rows,
  });
});

// Delete Staff-Course Allocation
export const deleteStaffAllocation = catchAsync(async (req, res) => {
  const { staffCourseId } = req.params;

  // Validate staffCourseId
  const [allocationRows] = await pool.execute(
    `SELECT staffCourseId FROM StaffCourse WHERE staffCourseId = ?`,
    [staffCourseId]
  );
  if (allocationRows.length === 0) {
    return res.status(404).json({
      status: "failure",
      message: `No allocation found with staffCourseId ${staffCourseId}`,
    });
  }

 

  // Delete allocation
  const [result] = await pool.execute(`DELETE FROM StaffCourse WHERE staffCourseId = ?`, [staffCourseId]);
  if (result.affectedRows === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No changes made to the allocation",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Staff-course allocation deleted successfully",
  });
});