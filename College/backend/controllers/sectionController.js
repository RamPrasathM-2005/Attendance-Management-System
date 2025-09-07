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

    // Check existing sections
    const [existingSections] = await connection.execute(
      `SELECT sectionName FROM Section WHERE courseCode = ? AND isActive = 'YES'`,
      [courseCode]
    );
    const usedSections = existingSections.map(row => row.sectionName);

    const sectionsToAdd = [];
    let newSectionsAdded = 0;
    for (let i = 1; i <= numberOfSections; i++) {
      const sectionName = `Batch${i}`;
      if (usedSections.includes(sectionName)) {
        return res.status(400).json({
          status: "failure",
          message: `Section ${sectionName} already exists for course ${courseCode}`,
        });
      }
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
    } else if (newSectionsAdded === 0) {
      return res.status(400).json({
        status: "failure",
        message: `No new sections added; all requested sections already exist for course ${courseCode}`,
      });
    }

    await connection.commit();
    res.status(201).json({
      status: "success",
      message: `${newSectionsAdded} new section(s) added to course ${courseCode} successfully`,
    });
  } catch (err) {
    await connection.rollback();
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
      message: "Sections updated successfully for course ${courseCode}",
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});