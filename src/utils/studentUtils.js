// src/main/handlers/students/getStudentsFiltered.js
import { db } from '../main/index.js'
export function getStudentsFiltered({ level, status = 'all', order = 'asc' }) {
  if (!level) throw new Error('Level is required')

  let query = `
    SELECT s.*, d.name AS department_name, f.name AS faculty_name
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN faculties f ON s.faculty_id = f.id
    WHERE s.level = ?
  `
  const params = [level]

  // ✅ Handle completion filter
  if (status === 'complete') {
    query += ' AND s.is_level_complete = 1'
  } else if (status === 'incomplete') {
    query += ' AND s.is_level_complete = 0'
  }

  // ✅ Handle alphabetical order
  query +=
    order === 'desc'
      ? ' ORDER BY s.last_name DESC, s.first_name DESC'
      : ' ORDER BY s.last_name ASC, s.first_name ASC'

  return db.prepare(query).all(...params)
}

export const filterStudents = ({ level, department_id, completion = 'all', order = 'asc' }) => {
  if (!level || !department_id) throw new Error('Level and department_id are required')

  // Validate level parameter
  const validLevels = [100, 200, 300, 400, 500, 600]
  if (!validLevels.includes(Number(level))) {
    throw new Error('Level must be one of: 100, 200, 300, 400, 500, 600')
  }

  const levelColumn = `is_${level}_complete`
  const activeColumn = `is_${level}_active`

  // 🔹 Base query
  let query = `
    SELECT 
      s.*,
      s.${activeColumn} AS in_level,
      COALESCE(s.${levelColumn}, 0) AS is_completed
    FROM students s
    WHERE s.department_id = ?
  `
  const params = [department_id]

  // 🔹 Apply completion filter
  if (completion === 'complete') {
    query += ` AND s.${levelColumn} = 1`
  } else if (completion === 'incomplete') {
    query += ` AND (s.${levelColumn} = 0 OR s.${levelColumn} IS NULL)`
  }

  // 🔹 Alphabetical order
  if (order === 'asc') {
    query += ' ORDER BY s.last_name ASC, s.first_name ASC'
  } else if (order === 'desc') {
    query += ' ORDER BY s.last_name DESC, s.first_name DESC'
  }

  const students = db.prepare(query).all(...params)

  // 🔹 Summary counts
  const totalQuery = `
    SELECT COUNT(*) AS total
    FROM students s
    WHERE s.department_id = ?
  `
  const total = db.prepare(totalQuery).get(department_id).total

  const completeQuery = `
    SELECT COUNT(*) AS complete
    FROM students s
    WHERE s.department_id = ? AND s.${levelColumn} = 1
  `
  const completeCount = db.prepare(completeQuery).get(department_id).complete

  const incompleteQuery = `
    SELECT COUNT(*) AS incomplete
    FROM students s
    WHERE s.department_id = ? AND (s.${levelColumn} = 0 OR s.${levelColumn} IS NULL)
  `
  const incompleteCount = db.prepare(incompleteQuery).get(department_id).incomplete

  // 🔹 Return full response
  return {
    students,
    summary: {
      total,
      complete: completeCount,
      incomplete: incompleteCount
    }
  }
}
