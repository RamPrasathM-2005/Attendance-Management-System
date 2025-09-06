import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

(async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // USERS
    await connection.execute(`
      INSERT IGNORE INTO Users (name, email, passwordHash, role, departmentId, isActive, createdBy, updatedBy)
      VALUES
        -- Admin
        ('Admin User', 'admin_user@nec.edu.in', 'hashed_password', 'ADMIN', NULL, 'YES', 'admin', 'admin'),
        -- CSE Staff
        ('Kalaiselvi', 'kalaiselvi@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('VijayKumar', 'vijaykumar@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('Mohideen Pitchai', 'mohideen_pitchai@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('ThamaraiSelvi', 'thamaraiselvi@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('Rajkumar', 'rajkumar@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('M.Kanthimathi', 'm_kanthimathi@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('Abisha', 'abisha@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('Vazhan Arul Santhiya', 'vazhan_arul_santhiya@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('Vignesh', 'vignesh@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        ('Lincy', 'lincy@nec.edu.in', 'hashed_password', 'STAFF', 1, 'YES', 'admin', 'admin'),
        -- MECH Staff
        ('Iyahraja', 'iyahraja@nec.edu.in', 'hashed_password', 'STAFF', 3, 'YES', 'admin', 'admin'),
        ('Manisekar', 'manisekar@nec.edu.in', 'hashed_password', 'STAFF', 3, 'YES', 'admin', 'admin'),
        ('Venkatkumar', 'venkatkumar@nec.edu.in', 'hashed_password', 'STAFF', 3, 'YES', 'admin', 'admin'),
        ('Harichandran', 'harichandran@nec.edu.in', 'hashed_password', 'STAFF', 3, 'YES', 'admin', 'admin'),
        ('Kathiresan', 'kathiresan@nec.edu.in', 'hashed_password', 'STAFF', 3, 'YES', 'admin', 'admin'),
        ('Ramanan', 'ramanan@nec.edu.in', 'hashed_password', 'STAFF', 3, 'YES', 'admin', 'admin'),
        ('Sankar', 'sankar@nec.edu.in', 'hashed_password', 'STAFF', 3, 'YES', 'admin', 'admin'),
        ('Vignesh kumar', 'vignesh_kumar@nec.edu.in', 'hashed_password', 'STAFF', 3, 'YES', 'admin', 'admin'),
        -- IT Staff
        ('Paramasivan', 'paramasivan@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        ('Muthukkumar', 'muthukkumar@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        ('Chidambaram', 'chidambaram@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        ('Manimaran', 'manimaran@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        ('Rajagopal', 'rajagopal@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        ('Anitha', 'anitha@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        ('Gowthami', 'gowthami@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        ('Manimegalai', 'manimegalai@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        ('Santhi', 'santhi@nec.edu.in', 'hashed_password', 'STAFF', 4, 'YES', 'admin', 'admin'),
        -- EEE Staff
        ('Maheswari', 'maheswari@nec.edu.in', 'hashed_password', 'STAFF', 5, 'YES', 'admin', 'admin'),
        ('Vigneshwaran', 'vigneshwaran@nec.edu.in', 'hashed_password', 'STAFF', 5, 'YES', 'admin', 'admin'),
        ('Sankarakumar', 'sankarakumar@nec.edu.in', 'hashed_password', 'STAFF', 5, 'YES', 'admin', 'admin'),
        ('Venkatasamy', 'venkatasamy@nec.edu.in', 'hashed_password', 'STAFF', 5, 'YES', 'admin', 'admin'),
        ('F X Edwin Deepak', 'f_x_edwin_deepak@nec.edu.in', 'hashed_password', 'STAFF', 5, 'YES', 'admin', 'admin'),
        ('Antony Jeffry Vaz', 'antony_jeffry_vaz@nec.edu.in', 'hashed_password', 'STAFF', 5, 'YES', 'admin', 'admin'),
        ('Dhanalakshmi', 'dhanalakshmi@nec.edu.in', 'hashed_password', 'STAFF', 5, 'YES', 'admin', 'admin'),
        -- ECE Staff
        ('Shenbagavalli', 'shenbagavalli@nec.edu.in', 'hashed_password', 'STAFF', 2, 'YES', 'admin', 'admin'),
        ('Arun', 'arun@nec.edu.in', 'hashed_password', 'STAFF', 2, 'YES', 'admin', 'admin'),
        ('Suresh', 'suresh@nec.edu.in', 'hashed_password', 'STAFF', 2, 'YES', 'admin', 'admin'),
        ('Arishenbagam', 'arishenbagam@nec.edu.in', 'hashed_password', 'STAFF', 2, 'YES', 'admin', 'admin'),
        ('Tamilselvi', 'tamilselvi@nec.edu.in', 'hashed_password', 'STAFF', 2, 'YES', 'admin', 'admin'),
        ('Balamurugan', 'balamurugan@nec.edu.in', 'hashed_password', 'STAFF', 2, 'YES', 'admin', 'admin'),
        ('Prasanna Venkatesan', 'prasanna_venkatesan@nec.edu.in', 'hashed_password', 'STAFF', 2, 'YES', 'admin', 'admin'),
        -- AIDS Staff
        ('Naskath', 'naskath@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Shenbagaraman', 'shenbagaraman@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Veera Anusuya', 'veera_anusuya@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Ram Priya', 'ram_priya@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Dhivya', 'dhivya@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Swarna Gowsaly', 'swarna_gowsaly@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Saranya', 'saranya@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Indira', 'indira@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Subhashini', 'subhashini@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Jeyaseelan', 'jeyaseelan@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Kalaivani', 'kalaivani@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin'),
        ('Poorani', 'poorani@nec.edu.in', 'hashed_password', 'STAFF', 6, 'YES', 'admin', 'admin');
    `);

    // BATCH
    await connection.execute(`
      INSERT INTO Batch (degree, branch, batch, batchYears, createdBy, updatedBy)
      VALUES
      ('B.E', 'Computer Science Engineering', '2023', '2023-2027', 'admin', 'admin'),
      ('B.E', 'Electronics and Communication Engineering', '2023', '2023-2027', 'admin', 'admin'),
      ('B.E', 'Mechanical Engineering', '2023', '2023-2027', 'admin', 'admin'),
      ('B.Tech', 'Information Technology', '2024', '2024-2028', 'admin', 'admin'),
      ('B.E', 'Electrical and Electronics Engineering', '2024', '2024-2028', 'admin', 'admin'),
      ('B.Tech', 'Artificial Intelligence and Data Science', '2025', '2025-2029', 'admin', 'admin');
    `);

    // SEMESTER
    await connection.execute(`
      -- B.E - Computer Science Engineering (BatchId = 1)
      INSERT INTO Semester (batchId, semesterNumber, startDate, endDate, createdBy, updatedBy)
      VALUES
      (1, 1, '2023-07-01', '2023-12-15', 'admin', 'admin'),
      (1, 2, '2024-01-10', '2024-05-30', 'admin', 'admin'),
      (1, 3, '2024-07-01', '2024-12-15', 'admin', 'admin'),
      (1, 4, '2025-01-10', '2025-05-30', 'admin', 'admin'),
      -- B.E - Electronics and Communication Engineering (BatchId = 2)
      (2, 1, '2023-07-01', '2023-12-15', 'admin', 'admin'),
      (2, 2, '2024-01-10', '2024-05-30', 'admin', 'admin'),
      -- B.E - Mechanical Engineering (BatchId = 3)
      (3, 1, '2023-07-01', '2023-12-15', 'admin', 'admin'),
      (3, 2, '2024-01-10', '2024-05-30', 'admin', 'admin'),
      (3, 3, '2024-07-01', '2024-12-15', 'admin', 'admin'),
      -- B.Tech - Information Technology (BatchId = 4)
      (4, 1, '2024-07-01', '2024-12-15', 'admin', 'admin'),
      -- B.E - Electrical and Electronics Engineering (BatchId = 5)
      (5, 1, '2024-07-01', '2024-12-15', 'admin', 'admin'),
      -- B.Tech - Artificial Intelligence and Data Science (BatchId = 6)
      (6, 1, '2025-07-01', '2025-12-15', 'admin', 'admin'),
      (6, 2, '2026-01-10', '2026-05-30', 'admin', 'admin'),
      (6, 3, '2026-07-01', '2026-12-15', 'admin', 'admin'),
      (6, 4, '2027-01-10', '2027-05-30', 'admin', 'admin'),
      (6, 5, '2027-07-01', '2027-12-15', 'admin', 'admin'),
      (6, 6, '2028-01-10', '2028-05-30', 'admin', 'admin'),
      (6, 7, '2028-07-01', '2028-12-15', 'admin', 'admin');
    `);

    // COURSE
    await connection.execute(`
      INSERT INTO Course (
        courseCode, semesterId, courseTitle, category, type, 
        lectureHours, tutorialHours, practicalHours, experientialHours, 
        totalContactPeriods, credits, minMark, maxMark, isActive, 
        createdBy, updatedBy, createdAt, updatedAt
      )
      VALUES
      -- Semester 1: Computer Science Engineering, Batch 2023
      ('CS101', 1, 'Programming for Problem Solving', 'ESC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('MA101', 1, 'Engineering Mathematics I', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('PH101', 1, 'Engineering Physics', 'BSC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('HS101', 1, 'Technical English', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('CS102', 1, 'Computer Programming Lab', 'ESC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      -- Semester 2: Computer Science Engineering, Batch 2023
      ('CS201', 2, 'Data Structures', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('MA201', 2, 'Engineering Mathematics II', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('CS202', 2, 'Object-Oriented Programming', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('HS201', 2, 'Professional Communication', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('CS203', 2, 'Data Structures Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      -- Semester 3: Computer Science Engineering, Batch 2023
      ('CS301', 3, 'Database Management Systems', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('CS302', 3, 'Computer Organization', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('MA301', 3, 'Discrete Mathematics', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('CS303', 3, 'Database Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('OE301', 3, 'Environmental Science', 'OEC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      -- Semester 4: Computer Science Engineering, Batch 2023
      ('CS401', 4, 'Operating Systems', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('CS402', 4, 'Design and Analysis of Algorithms', 'PEC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('CS403', 4, 'Operating Systems Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('HS401', 4, 'Constitution of India', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      ('CS404', 4, 'Software Engineering', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:28', '2025-09-06 10:49:28'),
      -- Semester 5: Electronics and Communication Eng, Batch 2023
      ('EC501', 5, 'Electronic Devices', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      ('EC502', 5, 'Circuit Theory', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      ('MA501', 5, 'Engineering Mathematics I', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      ('HS501', 5, 'Technical English', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      ('EC503', 5, 'Electronics Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      -- Semester 6: Electronics and Communication Eng, Batch 2023
      ('EC601', 6, 'Digital Electronics', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      ('EC602', 6, 'Signals and Systems', 'PEC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      ('MA601', 6, 'Engineering Mathematics II', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      ('EC603', 6, 'Digital Electronics Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      ('OE601', 6, 'Environmental Science', 'OEC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:34', '2025-09-06 10:49:34'),
      -- Semester 7: Mechanical Engineering, Batch 2023
      ('ME701', 7, 'Engineering Mechanics', 'ESC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('ME702', 7, 'Thermodynamics', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('MA701', 7, 'Engineering Mathematics I', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('HS701', 7, 'Technical English', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('ME703', 7, 'Workshop Practice', 'ESC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      -- Semester 8: Mechanical Engineering, Batch 2023
      ('ME801', 8, 'Fluid Mechanics', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('ME802', 8, 'Manufacturing Technology', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('MA801', 8, 'Engineering Mathematics II', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('ME803', 8, 'Manufacturing Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('HS801', 8, 'Professional Ethics', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      -- Semester 9: Mechanical Engineering, Batch 2023
      ('ME901', 9, 'Heat and Mass Transfer', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('ME902', 9, 'Machine Design', 'PEC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('ME903', 9, 'Thermal Engineering Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('OE901', 9, 'Renewable Energy', 'OEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      ('ME904', 9, 'CAD/CAM', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:37', '2025-09-06 10:49:37'),
      -- Semester 10: Information Technology, Batch 2024
      ('IT1001', 10, 'Programming in C', 'ESC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:40', '2025-09-06 10:49:40'),
      ('MA1001', 10, 'Engineering Mathematics I', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:40', '2025-09-06 10:49:40'),
      ('PH1001', 10, 'Engineering Physics', 'BSC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:40', '2025-09-06 10:49:40'),
      ('HS1001', 10, 'Technical English', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:40', '2025-09-06 10:49:40'),
      ('IT1002', 10, 'Programming Lab', 'ESC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:40', '2025-09-06 10:49:40'),
      -- Semester 11: Electrical and Electronics Eng, Batch 2024
      ('EE1101', 11, 'Basic Electrical Engineering', 'ESC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:45', '2025-09-06 10:49:45'),
      ('MA1101', 11, 'Engineering Mathematics I', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:45', '2025-09-06 10:49:45'),
      ('PH1101', 11, 'Engineering Physics', 'BSC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:45', '2025-09-06 10:49:45'),
      ('HS1101', 11, 'Technical English', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:45', '2025-09-06 10:49:45'),
      ('EE1102', 11, 'Electrical Circuits Lab', 'ESC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:45', '2025-09-06 10:49:45'),
      -- Semester 12: AI and Data Science, Batch 2025
      ('AI1201', 12, 'Introduction to AI', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('MA1201', 12, 'Engineering Mathematics I', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('PH1201', 12, 'Engineering Physics', 'BSC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('HS1201', 12, 'Technical English', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1202', 12, 'Python Programming Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      -- Semester 13: AI and Data Science, Batch 2025
      ('AI1301', 13, 'Data Structures for AI', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('MA1301', 13, 'Engineering Mathematics II', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1302', 13, 'Machine Learning Basics', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('HS1301', 13, 'Professional Communication', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1303', 13, 'Machine Learning Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      -- Semester 14: AI and Data Science, Batch 2025
      ('AI1401', 14, 'Deep Learning', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1402', 14, 'Big Data Analytics', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('MA1401', 14, 'Probability and Statistics', 'BSC', 'THEORY', 3, 1, 0, 0, 4, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1403', 14, 'Deep Learning Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('OE1401', 14, 'Ethics in AI', 'OEC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      -- Semester 15: AI and Data Science, Batch 2025
      ('AI1501', 15, 'Natural Language Processing', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1502', 15, 'Computer Vision', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1503', 15, 'NLP Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('HS1501', 15, 'Constitution of India', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1504', 15, 'Data Science Project', 'EEC', 'PRACTICAL', 0, 0, 4, 2, 6, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      -- Semester 16: AI and Data Science, Batch 2025
      ('AI1601', 16, 'Reinforcement Learning', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1602', 16, 'Cloud Computing for AI', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1603', 16, 'AI Project I', 'EEC', 'PRACTICAL', 0, 0, 4, 2, 6, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('OE1601', 16, 'Cybersecurity Basics', 'OEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1604', 16, 'Reinforcement Learning Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      -- Semester 17: AI and Data Science, Batch 2025
      ('AI1701', 17, 'AI for IoT', 'PEC', 'INTEGRATED', 3, 0, 2, 0, 5, 4, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1702', 17, 'Advanced Machine Learning', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1703', 17, 'AI Project II', 'EEC', 'PRACTICAL', 0, 0, 4, 2, 6, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('OE1701', 17, 'Blockchain Technology', 'OEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1704', 17, 'IoT Lab', 'PEC', 'PRACTICAL', 0, 0, 4, 0, 4, 2, 0, 50, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      -- Semester 18: AI and Data Science, Batch 2025
      ('AI1801', 18, 'Capstone Project', 'EEC', 'PRACTICAL', 0, 0, 8, 4, 12, 6, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1802', 18, 'Ethics and Professional Practice', 'HSMC', 'THEORY', 2, 0, 0, 0, 2, 2, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('OE1801', 18, 'Entrepreneurship Development', 'OEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50'),
      ('AI1803', 18, 'Advanced AI Applications', 'PEC', 'THEORY', 3, 0, 0, 0, 3, 3, 0, 100, 'YES', 'admin', 'admin', '2025-09-06 10:49:50', '2025-09-06 10:49:50');
    `);

    console.log('✅ Seed data inserted successfully');
    await connection.end();
  } catch (err) {
    console.error('❌ Error inserting seed data:', err);
  }
})();