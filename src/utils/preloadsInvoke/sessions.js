import { ipcRenderer } from 'electron'

export const sessionAPI = {
  createSession: (name) => ipcRenderer.invoke('create-session', name),
  addSessionResult: (data) => ipcRenderer.invoke('add-session-result', data),
  computeGPA: (studentId, sessionId, semesterId) =>
    ipcRenderer.invoke('compute-gpa', studentId, sessionId, semesterId),
  addSession: (name, startYear, endYear, facultyId) =>
    ipcRenderer.invoke('add-session', name, startYear, endYear, facultyId),

  getSessions: () => ipcRenderer.invoke('get-sessions'),

  getSession: (id) => ipcRenderer.invoke('get-session', id),

  addCourseToSemester: (semesterId, courseId, lecturerId, departmentId) =>
    ipcRenderer.invoke('add-course-to-semester', semesterId, courseId, lecturerId, departmentId),
  removeCourseFromSemester: (semesterId, courseId) =>
    ipcRenderer.invoke('remove-course-from-semester', semesterId, courseId),

  getSemesterCourses: (semesterId) => ipcRenderer.invoke('get-semester-courses', semesterId),

  deleteSession: (id) => ipcRenderer.invoke('delete-session', id),

  setCurrentSession: (id) => ipcRenderer.invoke('set-current-session', id),

  getAllSemesterSessions: () => ipcRenderer.invoke('get-all-semester-courses')
}
