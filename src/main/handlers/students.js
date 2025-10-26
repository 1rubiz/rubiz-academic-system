import { db } from '../index.js'
import { ipcMain } from 'electron'
import { getStudentsFiltered, filterStudents } from '../../utils/studentUtils.js'

export function registerStudentHandlers() {
  ipcMain.handle('students', (_, args) => getStudentsFiltered(args))
  ipcMain.handle('filter-students', (_, args) => filterStudents(args))
  ipcMain.handle('add-student', async (_, student) => {
    try {
      const {
        matric_no,
        first_name,
        last_name,
        department_id,
        faculty_id,
        level = 100,
        status = 'active'
      } = student

      // Check if student exists
      const existingStmt = db.prepare('SELECT * FROM students WHERE matric_no = ?')
      const existing = existingStmt.get(matric_no)

      const levelColumn = `is_${level}_active`

      if (existing) {
        // Check if column exists and is already active
        if (existing[levelColumn]) {
          return {
            success: false,
            message: `Student already exists and level ${level} is already active.`
          }
        }

        // Toggle level on
        const toggleStmt = db.prepare(`UPDATE students SET ${levelColumn} = 1 WHERE matric_no = ?`)
        toggleStmt.run(matric_no)

        return {
          success: true,
          message: `Student found. Level ${level} activated successfully.`
        }
      }

      // Prepare all level flags
      const levelFlags = [100, 200, 300, 400, 500, 600].map((lvl) => (lvl === level ? 1 : 0))

      // Insert new student
      const insertStmt = db.prepare(`
        INSERT INTO students (
          matric_no,
          first_name,
          last_name,
          department_id,
          faculty_id,
          status,
          is_100_active,
          is_200_active,
          is_300_active,
          is_400_active,
          is_500_active,
          is_600_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      insertStmt.run(
        matric_no,
        first_name,
        last_name,
        department_id,
        faculty_id,
        status,
        ...levelFlags
      )

      return {
        success: true,
        message: `Student added successfully with level ${level} active.`
      }
    } catch (error) {
      console.error('Error adding student:', error)
      return { success: false, message: 'Error adding student: ' + error.message }
    }
  })

  ipcMain.handle('add-student-session', async (_, student) => {
    const stmt = db.prepare(`
      INSERT INTO students (student_id, session_id, department_id)
      VALUES (?, ?, ?,)
    `)
    stmt.run(student.student_id, student.session_id, student.department_id)
    return { success: true }
  })

  ipcMain.handle('get-students', async () => {
    const stmt = db.prepare(`
      SELECT s.*, d.name AS department_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
    `)
    return stmt.all()
  })

  ipcMain.handle('get-students-by-department-and-level', async (_, departmentId, level) => {
    try {
      const activeCol = `is_${level}_active`
      const stmt = db.prepare(`
        SELECT 
          s.*, 
          d.name AS department_name
        FROM 
          students s
        LEFT JOIN 
          departments d 
        ON 
          s.department_id = d.id
        WHERE 
          s.department_id = ? 
        AND 
          ${activeCol} = 1
      `)

      return stmt.all(departmentId)
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  })

  ipcMain.handle('update-student', async (_, id, updates) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ')
    const values = Object.values(updates)
    const stmt = db.prepare(`UPDATE students SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    return { success: true }
  })

  ipcMain.handle('delete-student', async (_, id) => {
    const stmt = db.prepare('DELETE FROM students WHERE id = ?')
    stmt.run(id)
    return { success: true }
  })

  ipcMain.handle('suspend-student', async (_, id) => {
    const stmt = db.prepare("UPDATE students SET status = 'suspended' WHERE id = ?")
    stmt.run(id)
    return { success: true }
  })
  ipcMain.handle(
    'bulk-upload-students',
    (_, students, faculty_id, department_id, activeLevel = 100) => {
      try {
        const insertStmt = db.prepare(`
          INSERT INTO students 
          (
            matric_no,
            first_name,
            last_name,
            middle_name,
            gender,
            department_id,
            faculty_id,
            is_100_active,
            is_200_active,
            is_300_active,
            is_400_active,
            is_500_active,
            is_600_active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)

        const selectStmt = db.prepare('SELECT * FROM students WHERE matric_no = ?')
        const updateStmt = db.prepare(`
          UPDATE students 
          SET first_name = ?, last_name = ?, middle_name = ?, gender = ?
          WHERE matric_no = ?
        `)

        let added = 0
        let skipped = 0
        let updated = 0

        db.transaction(() => {
          students.forEach((s) => {
            const existing = selectStmt.get(s.matNo)
            const { firstName, middleName, lastName, gender } = parseName(s.name)

            // activeLevel logic
            const activeFlags = [100, 200, 300, 400, 500, 600].map((lvl) =>
              lvl === activeLevel ? 1 : 0
            )

            if (existing) {
              const sameName =
                existing.first_name.toLowerCase() === firstName.toLowerCase() &&
                existing.last_name.toLowerCase() === lastName.toLowerCase() &&
                (existing.middle_name || '').toLowerCase() === (middleName || '').toLowerCase()

              if (!sameName) {
                updateStmt.run(firstName, lastName, middleName, gender, s.matNo)
                updated++
              } else {
                skipped++
              }
            } else {
              insertStmt.run(
                s.matNo,
                firstName,
                lastName,
                middleName,
                gender,
                department_id,
                faculty_id,
                ...activeFlags
              )
              added++
            }
          })
        })()

        return (
          'bulk-upload-result',
          {
            success: true,
            message: `Upload completed: ${added} added, ${updated} updated, ${skipped} unchanged.`
          }
        )
      } catch (err) {
        console.error(err)
        return (
          'bulk-upload-result',
          {
            success: false,
            message: 'Error during bulk upload: ' + err.message
          }
        )
      }
    }
  )

  ipcMain.handle('set-student-level-active', async (_, id, level) => {
    // The column name to toggle dynamically
    const field = `is_${level}_complete`

    // Step 1: Get the current value for that field
    const current = db.prepare(`SELECT ${field} FROM students WHERE id = ?`).get(id)

    // Step 2: Compute the toggled value (1 -> 0, 0 -> 1)
    const newValue = current[field] ? 0 : 1

    // Step 3: Update only that field
    const stmt = db.prepare(`UPDATE students SET ${field} = ? WHERE id = ?`)
    stmt.run(newValue, id)

    return { success: true, field, newValue }
  })

  ipcMain.handle('mark-level-complete', async (_, id, level, value = true) => {
    const stmt = db.prepare(`UPDATE students SET is_${level}_complete = ? WHERE id = ?`)
    stmt.run(value ? 1 : 0, id)
    return { success: true }
  })

  ipcMain.handle('search-student-by-matric', async (_, matricNo) => {
    try {
      const stmt = db.prepare(`
        SELECT 
          s.*, 
          d.name AS department_name,
          f.name AS faculty_name
        FROM 
          students s
        LEFT JOIN 
          departments d ON s.department_id = d.id
        LEFT JOIN 
          faculties f ON s.faculty_id = f.id
        WHERE 
          s.matric_no = ?
        LIMIT 1
      `)

      const student = stmt.get(matricNo)

      if (!student) {
        return { success: false, message: 'Student not found' }
      }

      return { success: true, student }
    } catch (error) {
      console.error('Error searching student:', error)
      return { success: false, message: error.message }
    }
  })

  ipcMain.handle('update-student-status', async (_, { studentId, status }) => {
    const allowed = ['active', 'suspend', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
    if (!allowed.includes(status)) {
      throw new Error('Invalid status code')
    }

    const stmt = db.prepare(`
      UPDATE students 
      SET status = ? 
      WHERE id = ?
    `)

    return stmt.run(status, studentId)
  })

  ipcMain.handle('search-students', async (_, { departmentId, query }) => {
    const searchTerm = `%${query.trim()}%`

    const stmt = db.prepare(`
      SELECT id, matric_no, first_name, last_name, middle_name, status
      FROM students
      WHERE department_id = ?
        AND (
          matric_no LIKE ?
          OR first_name LIKE ?
          OR last_name LIKE ?
          OR middle_name LIKE ?
        )
      ORDER BY last_name ASC
    `)

    return stmt.all(departmentId, searchTerm, searchTerm, searchTerm, searchTerm)
  })
}

function parseName(fullName) {
  if (!fullName) return {}

  // Normalize
  let gender = null
  let cleanName = fullName.trim()

  // Detect gender hints
  const lower = cleanName.toLowerCase()
  if (lower.includes('(miss)') || lower.includes('(mrs)')) gender = 'female'
  else if (lower.includes('(mr)')) gender = 'male'

  // Remove parentheses part
  cleanName = cleanName.replace(/\(.*?\)/g, '').trim()

  // Split into words
  const parts = cleanName.split(/\s+/)
  const firstName = parts[0] || ''
  const lastName = parts.length > 1 ? parts[parts.length - 1] : ''
  const middleName = parts.length > 2 ? parts.slice(1, parts.length - 1).join(' ') : ''

  return { firstName, middleName, lastName, gender }
}
