// preload/results.js
import { ipcRenderer } from 'electron'

export const resultAPI = {
  addOrUpdateResult: (data) => ipcRenderer.invoke('addOrUpdateResult', data),
  getStudentResults: (sid, sesid, semid) =>
    ipcRenderer.invoke('getStudentResults', sid, sesid, semid),
  getTranscript: (data) => ipcRenderer.invoke('getTranscript', data),
  addResult: (data) => ipcRenderer.invoke('addResult', data),
  getSessionalResult: (sessionId, departmentId) =>
    ipcRenderer.invoke('get-sessional-result', sessionId, departmentId),
  getStudentSessionalResult: (matric_no, sess_name) =>
    ipcRenderer.invoke('get-student-sessional-result', matric_no, sess_name),
  updateResult: (data) => ipcRenderer.invoke('update-student-result', data),
  getStudentResult: (studentId, sessionId) =>
    ipcRenderer.invoke('get-student-result', studentId, sessionId),
  handleExport: (sessionId, departmentId, session_name) =>
    ipcRenderer.invoke('export-session-result', sessionId, departmentId, session_name),
  generateMarksheet: (data) => ipcRenderer.invoke('generateMarksheet', data)
}
