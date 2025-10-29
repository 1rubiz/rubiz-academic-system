import { db } from '../index.js'
import { ipcMain } from 'electron'

export function registerCourseHandlers() {
  ipcMain.handle(
    'add-course',
    async (_, name, code, unit, departmentId, lecturerId, description) => {
      const stmt = db.prepare(
        'INSERT INTO courses (name, code, unit, department_id, lecturer_id, description) VALUES (?, ?, ?, ?, ?, ?)'
      )
      stmt.run(name, code, unit, departmentId, lecturerId || null, description || '')
      return { success: true }
    }
  )

  ipcMain.handle('get-courses', async () => {
    const stmt = db.prepare(`
      SELECT c.*, d.name AS department_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
    `)
    return stmt.all()
  })

  ipcMain.handle('get-courses-by-department', async (_, departmentId) => {
    const stmt = db.prepare(`
      SELECT c.*, d.name AS department_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.department_id = ?
    `)
    return stmt.all(departmentId)
  })


  ipcMain.handle('update-course', async (_, id, updates) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ')
    const values = Object.values(updates)
    const stmt = db.prepare(`UPDATE courses SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    return { success: true }
  })

  ipcMain.handle('delete-course', async (_, id) => {
    const stmt = db.prepare('DELETE FROM courses WHERE id = ?')
    stmt.run(id)
    return { success: true }
  })
}
