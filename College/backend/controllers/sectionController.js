import pool from "../db.js";
import catchAsync from "../utils/catchAsync.js";

export const addSectionsToCourse = catchAsync(async (req, res) => {
  const { courseCode } = req.params;
  const { numberOfSections } = req.body;

  if (!courseCode || !numberOfSections || isNaN(numberOfSections) || numberOfSections < 1) {
    return res.status(400).json({
      status: "failure",
      message: "courseCode and a valid numberOfSections (minimum 1) are required",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Validate course
    const [courseRows] = await connection.execute(
      `SELECT courseId FROM Course WHERE courseCode = ? AND isActive = 'YES'`,
      [courseCode]
    );
    if (courseRows.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `No active course found with courseCode ${courseCode}`,
      });
    }

    // Find the current maximum Batch number, considering all sections to avoid reuse
    const [maxRows] = await connection.execute(
      `SELECT MAX(CAST(SUBSTRING(sectionName, 6) AS UNSIGNED)) as maxNum 
       FROM Section 
       WHERE courseCode = ? AND sectionName LIKE 'Batch%'`,
      [courseCode]
    );
    const currentMax = maxRows[0].maxNum || 0;

    const sectionsToAdd = [];
    let newSectionsAdded = 0;
    for (let i = 1; i <= numberOfSections; i++) {
      const sectionNum = currentMax + i;
      const sectionName = `Batch${sectionNum}`;
      sectionsToAdd.push([courseCode, sectionName, req.user?.email || 'admin', req.user?.email || 'admin']);
      newSectionsAdded++;
    }

    // Insert new sections
    if (sectionsToAdd.length > 0) {
      const placeholders = sectionsToAdd.map(() => "(?, ?, ?, ?)").join(",");
      const query = `
        INSERT INTO Section (courseCode, sectionName, createdBy, updatedBy)
        VALUES ${placeholders}
      `;
      const values = sectionsToAdd.flat();
      await connection.execute(query, values);
    }

    await connection.commit();
    res.status(201).json({
      status: "success",
      message: `${newSectionsAdded} new section(s) added to course ${courseCode} successfully`,
      data: sectionsToAdd.map(([_, sectionName]) => ({ sectionName })),
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

export const getSectionsForCourse = catchAsync(async (req, res) => {
  const { courseCode } = req.params;

  const connection = await pool.getConnection();
  try {
    const [sectionRows] = await connection.execute(
      `SELECT sectionName FROM Section WHERE courseCode = ? AND isActive = 'YES'`,
      [courseCode]
    );
    res.status(200).json({
      status: "success",
      data: sectionRows.map(row => ({ sectionName: row.sectionName })),
    });
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
});

export const updateSectionsForCourse = catchAsync(async (req, res) => {
  const { courseCode } = req.params;
  const { sections } = req.body; // Array of { sectionId, sectionName, isActive }

  if (!courseCode || !sections || !Array.isArray(sections)) {
    return res.status(400).json({
      status: "failure",
      message: "courseCode and an array of sections are required",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Validate course
    const [courseRows] = await connection.execute(
      `SELECT courseId FROM Course WHERE courseCode = ? AND isActive = 'YES'`,
      [courseCode]
    );
    if (courseRows.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `No active course found with courseCode ${courseCode}`,
      });
    }

    for (const section of sections) {
      const { sectionId, sectionName, isActive } = section;
      if (!sectionId || (sectionName && typeof sectionName !== 'string') || (isActive && isActive !== 'YES' && isActive !== 'NO')) {
        return res.status(400).json({
          status: "failure",
          message: "Each section must have a valid sectionId, optional sectionName, and optional isActive (YES/NO)",
        });
      }

      // Validate existing section
      const [sectionRows] = await connection.execute(
        `SELECT sectionId FROM Section WHERE sectionId = ? AND courseCode = ? AND isActive = 'YES'`,
        [sectionId, courseCode]
      );
      if (sectionRows.length === 0) {
        return res.status(404).json({
          status: "failure",
          message: `No active section found with sectionId ${sectionId} for course ${courseCode}`,
        });
      }

      // Update section
      const updateFields = [];
      const values = [];
      if (sectionName) {
        updateFields.push("sectionName = ?");
        values.push(sectionName);
      }
      if (isActive) {
        updateFields.push("isActive = ?");
        values.push(isActive);
      }
      updateFields.push("updatedBy = ?", "updatedDate = CURRENT_TIMESTAMP");
      values.push(req.user?.email || 'admin');

      if (updateFields.length > 0) {
        const query = `
          UPDATE Section
          SET ${updateFields.join(", ")}
          WHERE sectionId = ?
        `;
        values.push(sectionId);
        await connection.execute(query, values);
      }
    }

    await connection.commit();
    res.status(200).json({
      status: "success",
      message: `Sections updated successfully for course ${courseCode}`,
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

export const deleteSection = catchAsync(async (req, res) => {
  const { courseCode, sectionName } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Validate section
    const [sectionRows] = await connection.execute(
      `SELECT sectionId FROM Section WHERE courseCode = ? AND sectionName = ? AND isActive = 'YES'`,
      [courseCode, sectionName]
    );
    if (sectionRows.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `No active section found with sectionName ${sectionName} for course ${courseCode}`,
      });
    }

    // Soft delete by setting isActive to 'NO'
    await connection.execute(
      `UPDATE Section SET isActive = 'NO', updatedBy = ?, updatedDate = CURRENT_TIMESTAMP WHERE courseCode = ? AND sectionName = ?`,
      [req.user?.email || 'admin', courseCode, sectionName]
    );

    await connection.commit();
    res.status(200).json({
      status: "success",
      message: `Section ${sectionName} deleted successfully`,
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});
