import { db } from '../index.js'
import { ipcMain } from 'electron'

export function registerDepartmentHandlers() {
  ipcMain.handle('add-department', async (_, name, code, facultyID) => {
    const stmt = db.prepare('INSERT INTO departments (name, code, faculty_id) VALUES (?, ?, ?)')
    stmt.run(name, code, facultyID)
    return { success: true }
  })

  ipcMain.handle('get-departments', async () => {
    const stmt = db.prepare('SELECT * FROM departments')
    return stmt.all()
  })

  ipcMain.handle('get-department', async (_, departmentId) => {
    const stmt = db.prepare('SELECT * FROM departments WHERE id = ?')
    return stmt.all(departmentId)
  })

  ipcMain.handle('get-department-by-faculty', async (_, facultyId) => {
    if (!facultyId || facultyId === undefined) {
      return { success: false }
    }
    const stmt = db.prepare('SELECT * FROM departments WHERE faculty_id = ?')
    return stmt.all(facultyId)
  })

  ipcMain.handle('delete-department', async (_, id) => {
    const stmt = db.prepare('DELETE FROM departments WHERE id = ?')
    stmt.run(id)
    return { success: true }
  })
}
