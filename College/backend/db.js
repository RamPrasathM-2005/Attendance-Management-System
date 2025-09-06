import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

const initDatabase = async () => {
    let connection;
    try {
        // 0) Ensure DB exists
        const admin = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        await admin.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        await admin.end();

        // Get a connection from the pool and start a transaction for atomic table creation.
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Reordered table creation to resolve foreign key dependencies
        // 1) Department (must be created before Users)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Department (
                departmentId INT PRIMARY KEY AUTO_INCREMENT,
                departmentName VARCHAR(100) NOT NULL UNIQUE,
                isActive ENUM('YES','NO') DEFAULT 'YES',
                createdBy VARCHAR(150),
                updatedBy VARCHAR(150),
                createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 2) Users (Admin / Staff)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                userId INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                passwordHash VARCHAR(255) NOT NULL,
                role ENUM('ADMIN','STAFF') NOT NULL,
                departmentId INT,
                isActive ENUM('YES','NO') DEFAULT 'YES',
                createdBy VARCHAR(150),
                updatedBy VARCHAR(150),
                createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_user_dept FOREIGN KEY (departmentId) REFERENCES Department(departmentId)
                ON UPDATE CASCADE ON DELETE SET NULL
            )
        `);

        // 3) Batch
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Batch (
                batchId INT PRIMARY KEY AUTO_INCREMENT,
                degree VARCHAR(50) NOT NULL,
                branch VARCHAR(100) NOT NULL,
                batch VARCHAR(4) NOT NULL,
                batchYears VARCHAR(20) NOT NULL,
                isActive ENUM('YES','NO') DEFAULT 'YES',
                createdBy VARCHAR(150),
                updatedBy VARCHAR(150),
                createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uq_batch (degree, branch, batch)
            )
        `);

        // 4) Section
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Section (
                sectionId INT PRIMARY KEY AUTO_INCREMENT,
                batchId INT NOT NULL,
                sectionName VARCHAR(10) NOT NULL,
                isActive ENUM('YES','NO') DEFAULT 'YES',
                createdBy VARCHAR(150),
                updatedBy VARCHAR(150),
                createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_section_batch FOREIGN KEY (batchId) REFERENCES Batch(batchId)
                ON UPDATE CASCADE ON DELETE RESTRICT,
                UNIQUE (batchId, sectionName)
            )
        `);

        // 5) Semester
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Semester (
                semesterId INT PRIMARY KEY AUTO_INCREMENT,
                batchId INT NOT NULL,
                semesterNumber INT NOT NULL CHECK (semesterNumber BETWEEN 1 AND 8),
                startDate DATE NOT NULL,
                endDate DATE NOT NULL,
                isActive ENUM('YES','NO') DEFAULT 'YES',
                createdBy VARCHAR(150),
                updatedBy VARCHAR(150),
                createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_sem_batch FOREIGN KEY (batchId) REFERENCES Batch(batchId)
                ON UPDATE CASCADE ON DELETE RESTRICT,
                UNIQUE (batchId, semesterNumber)
            )
        `);

        // 6) Course
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Course (
                courseId INT PRIMARY KEY AUTO_INCREMENT,
                courseCode VARCHAR(20) NOT NULL UNIQUE,
                semesterId INT NOT NULL,
                courseTitle VARCHAR(255) NOT NULL,
                category ENUM('HSMC','BSC','ESC','PEC','OEC','EEC') NOT NULL,
                type ENUM('THEORY','INTEGRATED','PRACTICAL') NOT NULL,
                lectureHours INT DEFAULT 0,
                tutorialHours INT DEFAULT 0,
                practicalHours INT DEFAULT 0,
                experientialHours INT DEFAULT 0,
                totalContactPeriods INT NOT NULL,
                credits INT NOT NULL,
                minMark INT NOT NULL,
                maxMark INT NOT NULL,
                isActive ENUM('YES','NO') DEFAULT 'YES',
                createdBy VARCHAR(100),
                updatedBy VARCHAR(100),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_course_sem FOREIGN KEY (semesterId) REFERENCES Semester(semesterId)
                ON UPDATE CASCADE ON DELETE RESTRICT
            )
        `);

        // 7) Student
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Student (
                rollnumber VARCHAR(20) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                batchId INT NOT NULL,
                sectionId INT NOT NULL,
                semesterNumber INT NOT NULL CHECK (semesterNumber BETWEEN 1 AND 8),
                isActive ENUM('YES','NO') DEFAULT 'YES',
                createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_student_batch FOREIGN KEY (batchId) REFERENCES Batch(batchId),
                CONSTRAINT fk_student_section FOREIGN KEY (sectionId) REFERENCES Section(sectionId)
            )
        `);

        // 8) Enrollments
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS StudentCourse (
                studentCourseId INT PRIMARY KEY AUTO_INCREMENT,
                rollnumber VARCHAR(20) NOT NULL,
                courseCode VARCHAR(20) NOT NULL,
                UNIQUE (rollnumber, courseCode),
                CONSTRAINT fk_sc_student FOREIGN KEY (rollnumber) REFERENCES Student(rollnumber),
                CONSTRAINT fk_sc_course FOREIGN KEY (courseCode) REFERENCES Course(courseCode)
            )
        `);

        // 9) Staff-Course (Updated with sectionId for per-section allocation)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS StaffCourse (
                staffCourseId INT PRIMARY KEY AUTO_INCREMENT,
                staffId INT NOT NULL,
                courseCode VARCHAR(20) NOT NULL,
                sectionId INT,
                UNIQUE (staffId, courseCode, sectionId),
                CONSTRAINT fk_stc_staff FOREIGN KEY (staffId) REFERENCES Users(userId),
                CONSTRAINT fk_stc_course FOREIGN KEY (courseCode) REFERENCES Course(courseCode),
                CONSTRAINT fk_stc_section FOREIGN KEY (sectionId) REFERENCES Section(sectionId)
                ON UPDATE CASCADE ON DELETE SET NULL
            )
        `);

        // 10) Course Outcomes
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS CourseOutcome (
                coId INT PRIMARY KEY AUTO_INCREMENT,
                courseCode VARCHAR(20) NOT NULL,
                coNumber VARCHAR(10) NOT NULL,
                weightage INT NOT NULL,
                UNIQUE (courseCode, coNumber),
                CONSTRAINT fk_co_course FOREIGN KEY (courseCode) REFERENCES Course(courseCode)
            )
        `);

        // 11) CO Tools
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS COTool (
                toolId INT PRIMARY KEY AUTO_INCREMENT,
                coId INT NOT NULL,
                toolName VARCHAR(100) NOT NULL,
                weightage INT NOT NULL,
                CONSTRAINT fk_tool_co FOREIGN KEY (coId) REFERENCES CourseOutcome(coId)
            )
        `);

        // 12) Student marks per tool
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS StudentCOTool (
                studentToolId INT PRIMARY KEY AUTO_INCREMENT,
                rollnumber VARCHAR(20) NOT NULL,
                toolId INT NOT NULL,
                marksObtained INT NOT NULL,
                UNIQUE (rollnumber, toolId),
                CONSTRAINT fk_sct_student FOREIGN KEY (rollnumber) REFERENCES Student(rollnumber),
                CONSTRAINT fk_sct_tool FOREIGN KEY (toolId) REFERENCES COTool(toolId)
            )
        `);

        // 13) Timetable
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Timetable (
                timetableId INT PRIMARY KEY AUTO_INCREMENT,
                staffId INT NOT NULL,
                courseCode VARCHAR(20) NOT NULL,
                dayOfWeek ENUM('MON','TUE','WED','THU','FRI','SAT') NOT NULL,
                periodNumber INT NOT NULL CHECK (periodNumber BETWEEN 1 AND 8),
                UNIQUE (staffId, courseCode, dayOfWeek, periodNumber),
                CONSTRAINT fk_tt_staff FOREIGN KEY (staffId) REFERENCES Users(userId),
                CONSTRAINT fk_tt_course FOREIGN KEY (courseCode) REFERENCES Course(courseCode)
            )
        `);

        // 14) Attendance - Day
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS DayAttendance (
                dayAttendanceId INT PRIMARY KEY AUTO_INCREMENT,
                rollnumber VARCHAR(20) NOT NULL,
                semesterNumber INT NOT NULL,
                attendanceDate DATE NOT NULL,
                status ENUM('P','A') NOT NULL,
                UNIQUE (rollnumber, attendanceDate),
                CONSTRAINT fk_da_student FOREIGN KEY (rollnumber) REFERENCES Student(rollnumber)
            )
        `);

        // 15) Attendance - Period
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS PeriodAttendance (
                periodAttendanceId INT PRIMARY KEY AUTO_INCREMENT,
                rollnumber VARCHAR(20) NOT NULL,
                staffId INT NOT NULL,
                courseCode VARCHAR(20) NOT NULL,
                semesterNumber INT NOT NULL,
                dayOfWeek ENUM('MON','TUE','WED','THU','FRI','SAT') NOT NULL,
                periodNumber INT NOT NULL,
                attendanceDate DATE NOT NULL,
                status ENUM('P','A') NOT NULL,
                UNIQUE (rollnumber, courseCode, attendanceDate, periodNumber),
                CONSTRAINT fk_pa_student FOREIGN KEY (rollnumber) REFERENCES Student(rollnumber),
                CONSTRAINT fk_pa_staff FOREIGN KEY (staffId) REFERENCES Users(userId),
                CONSTRAINT fk_pa_course FOREIGN KEY (courseCode) REFERENCES Course(courseCode)
            )
        `);

        // Initial data for Department
        await connection.execute(`
            INSERT IGNORE INTO Department (departmentName, createdBy, updatedBy)
            VALUES
            ('Computer Science Engineering', 'admin', 'admin'),
            ('Electronics and Communication Engineering', 'admin', 'admin'),
            ('Mechanical Engineering', 'admin', 'admin'),
            ('Information Technology', 'admin', 'admin'),
            ('Electrical and Electronics Engineering', 'admin', 'admin'),
            ('Artificial Intelligence and Data Science', 'admin', 'admin')
        `);

        // Commit the transaction to save all changes
        await connection.commit();
        console.log("✅ Database initialized with full academic schema");

    } catch (err) {
        // Rollback the transaction on error
        if (connection) {
            await connection.rollback();
            console.error("❌ DB Initialization Error - Transaction rolled back:", err);
        } else {
            console.error("❌ DB Initialization Error:", err);
        }
    } finally {
        // Release the connection back to the pool
        if (connection) {
            connection.release();
        }
    }
};

initDatabase();
export default pool;