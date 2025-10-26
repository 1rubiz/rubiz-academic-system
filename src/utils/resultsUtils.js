import { db } from '../main/index.js'

export const addOrUpdateResult = (data) => {
  const {
    student_id,
    course_id,
    session_id,
    semester_id,
    score,
    status = 'NORMAL',
    created_by
  } = data

  // Handle statuses first
  let grade = 'NA'
  let grade_point = 0

  if (status === 'AB' || status === 'NR' || status === 'NA') {
    grade = status
  } else {
    const { grade: g, grade_point: gp } = getGrade(score)
    grade = g
    grade_point = gp
  }

  const existing = db
    .prepare(
      `SELECT id FROM session_results 
       WHERE student_id=? AND course_id=? AND session_id=? AND semester_id=?`
    )
    .get(student_id, course_id, session_id, semester_id)

  if (existing) {
    db.prepare(
      `UPDATE session_results SET score=?, status=?, grade=?, grade_point=?, updated_by=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=?`
    ).run(score, status, grade, grade_point, created_by, existing.id)
  } else {
    db.prepare(
      `INSERT INTO session_results 
      (student_id, course_id, session_id, semester_id, score, status, grade, grade_point, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      student_id,
      course_id,
      session_id,
      semester_id,
      score,
      status,
      grade,
      grade_point,
      created_by
    )
  }

  computeGPA(student_id, session_id, semester_id)
}

export const getTranscript = (matNo) => {
  db.prepare(
    `
    SELECT 
        sess.name as session,
        sem.name as semester,
        c.code as course_code,
        c.name as course_name,
        c.unit as credits,
        sr.score,
        sr.grade,
        sr.grade_point
    FROM session_results sr
    JOIN student_sessions ss ON sr.student_session_id = ss.id
    JOIN students stu ON ss.student_id = stu.id
    JOIN session_courses sc ON sr.session_course_id = sc.id
    JOIN courses c ON sc.course_id = c.id
    JOIN semesters sem ON sc.semester_id = sem.id
    JOIN sessions sess ON ss.session_id = sess.id
    WHERE stu.matric_no = ?
    ORDER BY sess.start_year, sem.name, c.code;  
  `
  ).run(matNo)
}

export const computeGPA = (student_id, session_id, semester_id) => {
  const rows = db
    .prepare(
      `SELECT grade_point FROM session_results
       WHERE student_id=? AND session_id=? AND semester_id=? AND status='NORMAL'`
    )
    .all(student_id, session_id, semester_id)

  if (!rows.length) return { gpa: 'NA', senate_rating: 'NA' }

  const gpa = rows.reduce((a, b) => a + b.grade_point, 0) / rows.length
  const senate_rating = getSenateRating(gpa)

  db.prepare(
    `UPDATE session_results 
     SET gpa=?, senate_rating=? 
     WHERE student_id=? AND session_id=? AND semester_id=?`
  ).run(gpa, senate_rating, student_id, session_id, semester_id)

  return { gpa, senate_rating }
}

export const getStudentResults = (student_id, session_id, semester_id) => {
  return db
    .prepare(
      `SELECT r.*, c.name as course_name, c.code as course_code
       FROM session_results r
       JOIN courses c ON c.id = r.course_id
       WHERE student_id=? AND session_id=? AND semester_id=?`
    )
    .all(student_id, session_id, semester_id)
}

export const addResults = (resultData) => {
  const { matric_no, session_id, semester_id, course_id, score, created_by } = resultData

  // 1. Get or create student_session record
  const student = db
    .prepare('SELECT id, department_id FROM students WHERE matric_no = ?')
    .get(matric_no)
  if (!student) throw new Error('Student not found')

  const studentSessionStmt = db.prepare(`
    INSERT OR IGNORE INTO student_sessions (student_id, session_id, department_id, level)
    VALUES (?, ?, ?, (SELECT level FROM students WHERE id = ?))
  `)
  studentSessionStmt.run(student.id, session_id, student.department_id, student.id)

  const studentSession = db
    .prepare(
      `
    SELECT id FROM student_sessions WHERE student_id = ? AND session_id = ?
  `
    )
    .get(student.id, session_id)

  // 2. Get session_course record
  const sessionCourse = db
    .prepare(
      `
    SELECT id FROM session_courses 
    WHERE semester_id = ? AND course_id = ?
  `
    )
    .get(semester_id, course_id)

  if (!sessionCourse) throw new Error('Course not offered in this semester')

  // 3. Calculate grade and grade points
  const gradeData = calculateGrade(score) // Your grading system function

  // 4. Insert or update result
  const resultStmt = db.prepare(`
    INSERT OR REPLACE INTO session_results 
    (student_session_id, session_course_id, score, grade, grade_point, remarks, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  return resultStmt.run(
    studentSession.id,
    sessionCourse.id,
    score,
    gradeData.grade,
    gradeData.points,
    gradeData.remarks,
    created_by
  )
}

export const getStudentSessionalResult = (matric_no, sess_name) => {
  const stmt = db.prepare(`
    SELECT 
        stu.matric_no,
        stu.first_name,
        stu.last_name,
        c.code as course_code,
        c.name as course_name,
        c.unit as credits,
        sr.score,
        sr.grade,
        sr.grade_point,
        (c.unit * sr.grade_point) as quality_points,
        sem.name as semester,
        sess.name as session
    FROM session_results sr
    JOIN student_sessions ss ON sr.student_session_id = ss.id
    JOIN students stu ON ss.student_id = stu.id
    JOIN session_courses sc ON sr.session_course_id = sc.id
    JOIN courses c ON sc.course_id = c.id
    JOIN semesters sem ON sc.semester_id = sem.id
    JOIN sessions sess ON ss.session_id = sess.id
    WHERE stu.matric_no = ? AND sess.name = ?
    ORDER BY sem.name, c.code;  
  `)
  return stmt.run(matric_no, sess_name)
}

export const getSessionResult = (sessionId, departmentId) => {
  const stmt = db.prepare(`
     SELECT 
        stu.matric_no,
        stu.first_name,
        stu.last_name,
        c.code as course_code,
        c.name as course_name,
        c.unit as credits,
        sr.score,
        sr.grade,
        sr.grade_point,
        sr.status,
        sem.name as semester,
        sess.name as session_name
    FROM session_results sr
    JOIN students stu ON sr.student_id = stu.id
    JOIN courses c ON sr.course_id = c.id
    JOIN semesters sem ON sr.semester_id = sem.id
    JOIN sessions sess ON sr.session_id = sess.id
    WHERE sr.session_id = ? AND stu.department_id = ?
    ORDER BY stu.matric_no, sem.name, c.code;  
  `)
  return stmt.all(sessionId, departmentId)
}

// Update the backend handler to support status and carryover
export const updateResult = async ({
  studentId,
  sessionId,
  semester,
  courseId,
  score,
  status = 'valid',
  updatedBy,
  ca
}) => {
  // Get semester ID
  const semesterRecord = db
    .prepare(
      `
      SELECT id FROM semesters 
      WHERE session_id = ? AND name = ?
    `
    )
    .get(sessionId, semester.charAt(0).toUpperCase() + semester.slice(1))

  if (!semesterRecord) {
    throw new Error(`Semester not found for session ${sessionId}`)
  }

  // Calculate grade only for valid status with score
  let gradeData = { grade: 'NA', points: 0 }
  if (status === 'valid' && score !== null && score !== undefined) {
    gradeData = calculateGrade(score)
  }

  // Check if result already exists
  const existing = db
    .prepare(
      `
      SELECT id FROM session_results 
      WHERE student_id = ? AND course_id = ?
    `
    )
    .get(studentId, courseId)

  if (existing) {
    // Update existing record
    const updateStmt = db.prepare(`
      UPDATE session_results
      SET 
        score = ?, 
        grade = ?, 
        grade_point = ?, 
        status = ?, 
        updated_by = ?, 
        ca = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE student_id = ? AND course_id = ?
    `)

    return updateStmt.run(
      status === 'valid' ? score : null,
      gradeData.grade,
      gradeData.points,
      status,
      updatedBy,
      ca,
      studentId,
      courseId
    )
  } else {
    // Insert new record
    const insertStmt = db.prepare(`
      INSERT INTO session_results 
      (student_id, course_id, session_id, semester_id, score, grade, grade_point, status, updated_by, ca)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    return insertStmt.run(
      studentId,
      courseId,
      sessionId,
      semesterRecord.id,
      status === 'valid' ? score : null,
      gradeData.grade,
      gradeData.points,
      status,
      updatedBy,
      ca
    )
  }
}

// Add these handlers to your backend
export const getStudentResult = async ({ studentId, sessionId }) => {
  const firstSemester = db
    .prepare(
      `
    SELECT 
      c.id, c.code, c.name, c.unit, 
      d.name as department_name,
      sc.id as session_course_id
    FROM session_courses sc
    JOIN courses c ON sc.course_id = c.id
    JOIN departments d ON c.department_id = d.id
    JOIN semesters sem ON sc.semester_id = sem.id
    WHERE sem.session_id = ? AND sem.name = 'First'
  `
    )
    .all(sessionId)

  const secondSemester = db
    .prepare(
      `
    SELECT 
      c.id, c.code, c.name, c.unit, 
      d.name as department_name,
      sc.id as session_course_id
    FROM session_courses sc
    JOIN courses c ON sc.course_id = c.id
    JOIN departments d ON c.department_id = d.id
    JOIN semesters sem ON sc.semester_id = sem.id
    WHERE sem.session_id = ? AND sem.name = 'Second'
  `
    )
    .all(sessionId)

  // Get existing results
  const existingResults = db
    .prepare(
      `
    SELECT 
      sr.course_id,
      sem.name as semester,
      sr.score,
      sr.grade,
      sr.grade_point
    FROM session_results sr
    JOIN semesters sem ON sr.semester_id = sem.id
    WHERE sr.student_id = ? AND sr.session_id = ?
  `
    )
    .all(studentId, sessionId)

  const results = {}
  existingResults.forEach((result) => {
    const key = `${result.course_id}-${result.semester.toLowerCase()}`
    results[key] = result
  })

  return {
    firstSemester,
    secondSemester,
    results
  }
}

// Update your session_results table to include new columns:
// ALTER TABLE session_results ADD COLUMN status TEXT DEFAULT 'valid';
// ALTER TABLE session_results ADD COLUMN is_carryover INTEGER DEFAULT 0;

// Grading system helper function
function calculateGrade(score) {
  if (score >= 70) return { grade: 'A', points: 5.0, remarks: 'Excellent' }
  if (score >= 60) return { grade: 'B', points: 4.0, remarks: 'Very Good' }
  if (score >= 50) return { grade: 'C', points: 3.0, remarks: 'Good' }
  if (score >= 45) return { grade: 'D', points: 2.0, remarks: 'Pass' }
  if (score >= 40) return { grade: 'E', points: 1.0, remarks: 'Poor' }
  return { grade: 'F', points: 0.0, remarks: 'Fail' }
}

// Helpers
function getGrade(score) {
  if (score >= 70) return { grade: 'A', grade_point: 5 }
  if (score >= 60) return { grade: 'B', grade_point: 4 }
  if (score >= 50) return { grade: 'C', grade_point: 3 }
  if (score >= 45) return { grade: 'D', grade_point: 2 }
  if (score >= 40) return { grade: 'E', grade_point: 1 }
  return { grade: 'F', grade_point: 0 }
}

function getSenateRating(gpa) {
  if (gpa >= 4.5) return 'First Class'
  if (gpa >= 3.5) return 'Second Class Upper'
  if (gpa >= 2.5) return 'Second Class Lower'
  if (gpa >= 1.5) return 'Third Class'
  if (gpa >= 1.0) return 'Pass'
  return 'Fail'
}
