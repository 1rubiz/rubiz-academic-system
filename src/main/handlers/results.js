import { ipcMain } from 'electron'
import {
  addOrUpdateResult,
  addResults,
  getSessionResult,
  getStudentResult,
  getStudentResults,
  getStudentSessionalResult,
  getTranscript,
  updateResult
} from '../../utils/resultsUtils.js'
import { handleExport } from '../../utils/generateResult.js'
import { generateMarksheet } from '../../utils/generateMarkSheet.js'

export function registerResultsHandlers() {
  ipcMain.handle('addOrUpdateResult', (_, data) => addOrUpdateResult(data))
  ipcMain.handle('getStudentResults', (_, sid, sesid, semid) =>
    getStudentResults(sid, sesid, semid)
  )
  ipcMain.handle('getTranscript', (_, data) => getTranscript(data))
  ipcMain.handle('addResult', (_, data) => addResults(data))
  ipcMain.handle('get-sessional-result', (_, sessionId, departmentId) =>
    getSessionResult(sessionId, departmentId)
  )
  ipcMain.handle('get-student-sessional-result', (matric_no, sess_name) =>
    getStudentSessionalResult(matric_no, sess_name)
  )
  ipcMain.handle('update-student-result', (_, data) => updateResult(data))
  ipcMain.handle('get-student-result', (studentId, sessionId) =>
    getStudentResult(studentId, sessionId)
  )
  ;(ipcMain.handle('export-session-result', (_, sessionId, departmentId, session_name) =>
    handleExport({ sessionId, departmentId, session_name })
  ),
    ipcMain.handle('generateMarksheet', async (_, data) => {
      try {
        const res = await generateMarksheet(data)
        return { success: true, ...res }
      } catch (err) {
        return { success: false, message: err.message }
      }
    }))
}
