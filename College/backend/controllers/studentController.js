import pool from "../db.js";
import catchAsync from "../utils/catchAsync.js";

// ✅ Add new Student
export const addStudent = catchAsync(async (req, res) => {
  const {
    rollnumber,
    name,
    degree,
    branch,
    batch,
    semesterNumber,
    createdBy,
  } = req.body;

  // 1. Validate required fields
  if (!rollnumber || !name || !degree || !branch || !batch || !semesterNumber || !createdBy) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 2. Check for existing student
  const [existingStudent] = await pool.execute(
    `SELECT rollnumber FROM Student WHERE rollnumber = ?`,
    [rollnumber]
  );
  if (existingStudent.length > 0) {
    return res.status(400).json({ message: "Student with this roll number already exists" });
  }

  // 3. Find the batchId based on degree, branch, and batch
  const [batchRows] = await pool.execute(
    `SELECT batchId FROM Batch WHERE degree = ? AND branch = ? AND batch = ?`,
    [degree, branch, batch]
  );
  if (batchRows.length === 0) {
    return res.status(404).json({ message: `Batch ${batch} - ${branch} not found` });
  }
  const batchId = batchRows[0].batchId;

  // 4. Insert the new student into the database
  const [result] = await pool.execute(
    `INSERT INTO Student (rollnumber, name, batchId, semesterNumber, createdBy, updatedBy)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [rollnumber, name, batchId, semesterNumber, createdBy, createdBy]
  );

  res.status(201).json({
    status: "success",
    message: "Student added successfully",
    rollnumber: rollnumber,
  });
});

// ✅ Get all Students
export const getAllStudents = catchAsync(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT
       s.*,
       b.degree,
       b.branch,
       b.batch,
       b.batchYears
     FROM Student s
     INNER JOIN Batch b ON s.batchId = b.batchId
     ORDER BY s.rollnumber ASC`
  );

  res.status(200).json({ status: "success", data: rows });
});

// ✅ Get a single Student by Roll Number
export const getStudentByRollNumber = catchAsync(async (req, res) => {
  const { rollnumber } = req.params;

  const [rows] = await pool.execute(
    `SELECT
       s.*,
       b.degree,
       b.branch,
       b.batch,
       b.batchYears
     FROM Student s
     INNER JOIN Batch b ON s.batchId = b.batchId
     WHERE s.rollnumber = ?`,
    [rollnumber]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.status(200).json({ status: "success", data: rows[0] });
});

// ✅ Update a Student
export const updateStudent = catchAsync(async (req, res) => {
  const { rollnumber } = req.params;
  const {
    name,
    degree,
    branch,
    batch,
    semesterNumber,
    updatedBy,
  } = req.body;

  // 1. Get the current student record to check if it exists
  const [existingStudent] = await pool.execute(
    `SELECT batchId FROM Student WHERE rollnumber = ?`,
    [rollnumber]
  );

  if (existingStudent.length === 0) {
    return res.status(404).json({ message: "Student not found" });
  }

  let batchId = existingStudent[0].batchId;
  
  // 2. If batch, branch, or degree are provided, resolve the new batchId
  if (batch || branch || degree) {
    const [batchRows] = await pool.execute(
      `SELECT batchId FROM Batch WHERE degree = ? AND branch = ? AND batch = ?`,
      [degree, branch, batch]
    );

    if (batchRows.length === 0) {
      return res.status(404).json({ message: `Batch ${batch} - ${branch} not found` });
    }
    batchId = batchRows[0].batchId;
  }

  // 3. Construct the update query dynamically
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (semesterNumber !== undefined) updateFields.semesterNumber = semesterNumber;
  if (batchId !== undefined) updateFields.batchId = batchId;
  if (updatedBy !== undefined) updateFields.updatedBy = updatedBy;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const keys = Object.keys(updateFields).map(key => `${key} = ?`).join(", ");
  const values = Object.values(updateFields);

  const [result] = await pool.execute(
    `UPDATE Student SET ${keys}, updatedDate = NOW() WHERE rollnumber = ?`,
    [...values, rollnumber]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Student not found or no changes made" });
  }

  res.status(200).json({
    status: "success",
    message: "Student updated successfully",
    rollnumber: rollnumber
  });
});

// ✅ Delete a Student
export const deleteStudent = catchAsync(async (req, res) => {
  const { rollnumber } = req.params;

  const [result] = await pool.execute(
    `DELETE FROM Student WHERE rollnumber = ?`,
    [rollnumber]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.status(200).json({
    status: "success",
    message: `Student with roll number ${rollnumber} deleted successfully`,
  });
});
