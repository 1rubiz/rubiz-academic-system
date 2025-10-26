import { ipcMain } from 'electron'
import { db } from '../index.js'
import {
  createSession,
  // getSessions,
  computeGPA,
  addSessionResult
} from '../../utils/sessionsUtil.js'

export function registerSessionHandlers() {
  ipcMain.handle('create-session', (_, name) => createSession(name))
  // ipcMain.handle("get-sessions", () => getSessions());
  ipcMain.handle('add-session-result', (_, data) => addSessionResult(data))
  ipcMain.handle('compute-gpa', (_, studentId, sessionId, semesterId) =>
    computeGPA(studentId, sessionId, semesterId)
  )
  // Create session with default semesters
  ipcMain.handle('add-session', async (_, name, startYear, endYear, facultyId) => {
    const insertSession = db.prepare(
      'INSERT INTO sessions (name, start_year, end_year, faculty_id) VALUES (?, ?, ?, ?)'
    )
    const result = insertSession.run(name, startYear, endYear, facultyId)

    const sessionId = result.lastInsertRowid

    const insertSemester = db.prepare('INSERT INTO semesters (session_id, name) VALUES (?, ?)')
    insertSemester.run(sessionId, 'First')
    insertSemester.run(sessionId, 'Second')

    return { success: true, sessionId }
  })

  // Get all sessions with semesters
  ipcMain.handle('get-all-semester-courses', async () => {
    const sessions = db.prepare('SELECT * FROM session_courses').all()
    return sessions
  })

  // Get all sessions with semesters
  ipcMain.handle('get-sessions', async () => {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY start_year DESC').all()
    const semesters = db.prepare('SELECT * FROM semesters').all()

    return sessions.map((s) => ({
      ...s,
      semesters: semesters.filter((sem) => sem.session_id === s.id)
    }))
  })

  // Add course to semester
  ipcMain.handle(
    'add-course-to-semester',
    async (_, semesterId, courseId, lecturerId, departmentId) => {
      try {
        const checkStmt = db.prepare(`
          SELECT * FROM session_courses 
          WHERE semester_id = ? AND course_id = ?
        `)

        const existing = checkStmt.all(semesterId, courseId)

        // ✅ Only block insertion if we actually found a record
        if (existing.length > 0) {
          // console.log("Course already added to semester:", existing);
          return { success: false, data: existing }
        }

        const insertStmt = db.prepare(`
          INSERT INTO session_courses (semester_id, course_id, lecturer_id, department_id)
          VALUES (?, ?, ?, ?)
        `)
        insertStmt.run(semesterId, courseId, lecturerId, departmentId)

        return { success: true }
      } catch (error) {
        console.error('Error adding course to semester:', error)
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle('remove-course-from-semester', async (_, semesterId, courseId) => {
    try {
      const checkStmt = db.prepare(`
          SELECT * FROM session_courses
          WHERE semester_id = ? AND course_id = ?
        `)
      const existing = checkStmt.all(semesterId, courseId)
      console.log(existing)

      // 🧩 Nothing to remove?
      if (existing.length === 0) {
        console.log('No matching course found for removal.')
        return { success: false, message: 'Course not found in this semester.' }
      }

      const deleteStmt = db.prepare(`
          DELETE FROM session_courses
          WHERE semester_id = ? AND course_id = ?
        `)
      deleteStmt.run(semesterId, courseId)

      console.log('Course removed from semester:', { semesterId, courseId })
      return { success: true }
    } catch (error) {
      console.error('Error removing course from semester:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('get-semester-courses', async (_, semesterId) => {
    const stmt = db.prepare(`
      SELECT *
      FROM session_courses sc
      JOIN courses c ON sc.course_id = c.id
      WHERE sc.semester_id = ?
    `)
    return stmt.all(semesterId)
  })

  ipcMain.handle('delete-session', async (_, id) => {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
    return { success: true }
  })

  ipcMain.handle('set-current-session', async (_, id) => {
    db.prepare('UPDATE sessions SET current = 0').run()
    db.prepare('UPDATE sessions SET current = 1 WHERE id = ?').run(id)
    return { success: true }
  })

  ipcMain.handle('get-session', async (_, id) => {
    const stmt = db.prepare('SELECT * FROM sessions WHERE faculty_id = ?')
    const semesters = db.prepare('SELECT * FROM semesters').all()
    const checkStmt = db.prepare('SELECT * FROM session_courses').all()
    return stmt.all(id).map((s) => ({
      ...s,
      semesters: semesters.filter((sem) => sem.session_id === s.id),
      semester_courses: checkStmt.filter(
        (cos) =>
          cos.id === semesters.filter((sem) => sem.session_id === s.id)[0].id ||
          cos.id === semesters.filter((sem) => sem.session_id === s.id)[1].id
      )
    }))
    // const data =  stmt.all(id);
    // return data;
  })
}
