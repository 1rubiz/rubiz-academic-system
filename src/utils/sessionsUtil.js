// import { db } from "../dbInit.js";
import { db } from '../main/index.js'

export const createSession = (name) => {
  const stmt = db.prepare('INSERT INTO sessions (name) VALUES (?)')
  const result = stmt.run(name)
  const sessionId = result.lastInsertRowid
  // create two default semesters
  const semesterStmt = db.prepare('INSERT INTO semesters (session_id, name) VALUES (?, ?)')
  semesterStmt.run(sessionId, 'First Semester')
  semesterStmt.run(sessionId, 'Second Semester')
  return sessionId
}

export const getSessions = () => db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all()

export const addSessionResult = (data) => {
  const { student_id, course_id, session_id, semester_id, score, created_by } = data
  const { grade, grade_point } = getGrade(score)

  const stmt = db.prepare(`
    INSERT INTO session_results 
    (student_id, course_id, session_id, semester_id, score, grade, grade_point, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    student_id,
    course_id,
    session_id,
    semester_id,
    score,
    grade,
    grade_point,
    created_by
  )
}

export const computeGPA = (student_id, session_id, semester_id) => {
  const rows = db
    .prepare(
      'SELECT grade_point FROM session_results WHERE student_id = ? AND session_id = ? AND semester_id = ?'
    )
    .all(student_id, session_id, semester_id)

  if (!rows.length) return null
  const gpa = rows.reduce((a, b) => a + b.grade_point, 0) / rows.length
  const senate_rating = getSenateRating(gpa)
  db.prepare(
    'UPDATE session_results SET gpa = ?, senate_rating = ? WHERE student_id = ? AND session_id = ? AND semester_id = ?'
  ).run(gpa, senate_rating, student_id, session_id, semester_id)
  return { gpa, senate_rating }
}

// Grading utils
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
