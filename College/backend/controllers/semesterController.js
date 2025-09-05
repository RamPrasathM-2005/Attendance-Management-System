import pool from "../db.js";
import catchAsync from "../utils/catchAsync.js";

// ✅ Add Semester
export const addSemester = async (req, res) => {
  try {
    const { batch, branch, semesterNumber, startDate, endDate, createdBy } = req.body;

    if (!batch || !branch || !semesterNumber || !startDate || !endDate || !createdBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔍 Get batchId from batch + branch
    const [batchRows] = await pool.execute(
      `SELECT batchId FROM Batch WHERE batch = ? AND branch = ?`,
      [batch, branch]
    );

    if (batchRows.length === 0) {
      return res.status(404).json({ message: `Batch ${batch} - ${branch} not found` });
    }

    const batchId = batchRows[0].batchId;

    // Prevent duplicate semester
    const [existing] = await pool.execute(
      `SELECT semesterId FROM Semester WHERE batchId = ? AND semesterNumber = ?`,
      [batchId, semesterNumber]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Semester already exists for this batch" });
    }

    // Ensure sequential semester creation
    if (semesterNumber > 1) {
      const [previous] = await pool.execute(
        `SELECT semesterNumber FROM Semester WHERE batchId = ? ORDER BY semesterNumber`,
        [batchId]
      );

      if (previous.length !== semesterNumber - 1) {
        return res.status(400).json({
          message: `You must first create semesters 1 to ${semesterNumber - 1} for this batch`,
        });
      }
    }

    // Format dates
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0];

    const [rows] = await pool.execute(
      `INSERT INTO Semester (batchId, semesterNumber, startDate, endDate, createdBy, updatedBy)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [batchId, semesterNumber, formattedStartDate, formattedEndDate, createdBy, createdBy]
    );

    return res.status(201).json({
      status: "success",
      message: "Semester added successfully",
      semesterId: rows.insertId,
    });
  } catch (error) {
    console.error("Error adding semester:", error);
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

// ✅ Get Semester (by batch + branch + semesterNumber)
export const getSemester = async (req, res) => {
  try {
    const { batch, branch, semesterNumber } = req.query;

    if (!batch || !branch || !semesterNumber) {
      return res.status(400).json({
        message: "batch, branch, and semesterNumber are required",
      });
    }

    const [rows] = await pool.execute(
      `SELECT s.*, b.degree, b.branch, b.batch, b.batchYears
       FROM Semester s
       INNER JOIN Batch b ON s.batchId = b.batchId
       WHERE b.batch = ? AND b.branch = ? AND s.semesterNumber = ?`,
      [batch, branch, semesterNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: `Semester ${semesterNumber} not found for batch ${batch} - ${branch}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching semester:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// ✅ Get All Semesters
export const getAllSemesters = catchAsync(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT s.*, b.degree, b.branch, b.batch, b.batchYears
     FROM Semester s
     INNER JOIN Batch b ON s.batchId = b.batchId`
  );
  return res.status(200).json({ message: "success", data: rows });
});

// ✅ Get Semesters by batch + branch
export const getSemestersByBatchBranch = async (req, res) => {
  try {
    const { batch, branch } = req.query;

    if (!batch || !branch) {
      return res.status(400).json({ message: "batch and branch are required" });
    }

    const [rows] = await pool.execute(
      `SELECT s.*, b.degree, b.branch, b.batch, b.batchYears
       FROM Semester s
       INNER JOIN Batch b ON s.batchId = b.batchId
       WHERE b.batch = ? AND b.branch = ?
       ORDER BY s.semesterNumber ASC`,
      [batch, branch]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: `No semesters found for batch ${batch} - ${branch}` });
    }

    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Error fetching semesters by batch+branch:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// ✅ Update Semester
export const updateSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;
  const { batch, branch, semesterNumber, startDate, endDate, isActive, updatedBy } = req.body;

  if (!semesterId) {
    return res.status(400).json({ status: "failure", message: "semesterId is required" });
  }

  const id = parseInt(semesterId, 10);
  if (isNaN(id)) {
    return res.status(400).json({ status: "failure", message: "Invalid semesterId provided." });
  }

  // Resolve batchId
  const [batchRows] = await pool.execute(
    `SELECT batchId FROM Batch WHERE batch = ? AND branch = ?`,
    [batch, branch]
  );

  if (batchRows.length === 0) {
    return res.status(404).json({ message: `Batch ${batch} - ${branch} not found` });
  }

  const batchId = batchRows[0].batchId;

  const [result] = await pool.query(
    `UPDATE Semester
     SET batchId = ?, semesterNumber = ?, startDate = ?, endDate = ?, isActive = ?, updatedBy = ?, updatedDate = NOW()
     WHERE semesterId = ?`,
    [batchId, semesterNumber, startDate, endDate, isActive, updatedBy, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ status: "failure", message: "Semester not found" });
  }

  res.status(200).json({ status: "success", data: result, message: "Semester updated successfully" });
});

// ✅ Delete Semester
export const deleteSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;

  if (!semesterId) {
    return res.status(400).json({ status: "failure", message: "semesterId is required" });
  }

  const id = parseInt(semesterId, 10);
  if (isNaN(id)) {
    return res.status(400).json({ status: "failure", message: "Invalid semesterId provided." });
  }

  const [result] = await pool.query(`DELETE FROM Semester WHERE semesterId = ?`, [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ status: "failure", message: "Semester not found" });
  }

  res.status(200).json({ status: "success", message: `Semester with id ${id} deleted successfully` });
});
