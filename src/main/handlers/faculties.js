import { ipcMain } from 'electron'
import { db } from '../index.js'

export function registerFacultyHandlers() {
  ipcMain.handle('add-faculty', async (_, name, code) => {
    const stmt = db.prepare('INSERT INTO faculties (name, code) VALUES (?, ?)')
    stmt.run(name, code)
    return { success: true }
  })

  ipcMain.handle('get-faculties', async () => {
    const stmt = db.prepare('SELECT * FROM faculties ORDER BY name ASC')
    return stmt.all()
  })

  ipcMain.handle('update-faculty', async (_, id, updates) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ')
    const values = Object.values(updates)
    const stmt = db.prepare(`UPDATE faculties SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    return { success: true }
  })

  ipcMain.handle('delete-faculty', async (_, id) => {
    const stmt = db.prepare('DELETE FROM faculties WHERE id = ?')
    stmt.run(id)
    return { success: true }
  })
}
