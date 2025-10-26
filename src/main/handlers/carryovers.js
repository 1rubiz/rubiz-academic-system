import { ipcMain } from 'electron'
import { db } from '../index.js'

export function registerCarryoversHandlers() {
  ipcMain.handle('get-all-courses', () => {
    try {
      const rows = db.prepare('SELECT id, name, code FROM courses').all()
      return ('all-courses', rows)
    } catch (err) {
      console.error(err)
      return err
    }
  })

  ipcMain.handle('get-carryovers', (event, studentId) => {
    try {
      const row = db.prepare('SELECT courses FROM carryover WHERE student_id = ?').get(studentId)
      return ('carryovers', row || {})
    } catch (err) {
      console.error(err)
      return err
    }
  })

  ipcMain.handle('save-carryovers', (event, { studentId, formatted }) => {
    try {
      const existing = db.prepare('SELECT id FROM carryover WHERE student_id = ?').get(studentId)

      if (existing) {
        db.prepare('UPDATE carryover SET courses = ? WHERE student_id = ?').run(
          formatted,
          studentId
        )
      } else {
        db.prepare('INSERT INTO carryover (courses, student_id) VALUES (?, ?)').run(
          formatted,
          studentId
        )
      }

      return (
        'save-carryovers-result',
        {
          success: true,
          message: '✅ Carryovers saved successfully!'
        }
      )
    } catch (err) {
      console.error(err)
      return (
        'save-carryovers-result',
        {
          success: false,
          message: '❌ Error saving carryovers: ' + err.message
        }
      )
    }
  })
}
