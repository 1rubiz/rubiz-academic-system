import { ipcRenderer } from 'electron'

export const studentAPI = {
  addStudent: (student) => ipcRenderer.invoke('add-student', student),

  getFilteredStudents: (filter) => ipcRenderer.invoke('students', filter),

  filterStudents: (filter) => ipcRenderer.invoke('filter-students', filter),

  addStudentSession: (student) => ipcRenderer.invoke('add-student-session', student),

  getStudents: () => ipcRenderer.invoke('get-students'),

  updateStudent: (id, updates) => ipcRenderer.invoke('update-student', id, updates),

  deleteStudent: (id) => ipcRenderer.invoke('delete-student', id),

  suspendStudent: (id) => ipcRenderer.invoke('suspend-student', id),

  getStudentByLevelAndDept: (departmentId, level) =>
    ipcRenderer.invoke('get-students-by-department-and-level', departmentId, level),

  bulkUpload: (students, faculty_id, departmentId) =>
    ipcRenderer.invoke('bulk-upload-students', students, faculty_id, departmentId),

  setStudentLevelActive: (id, level) => ipcRenderer.invoke('set-student-level-active', id, level),

  markLevelComplete: (id, level, value) =>
    ipcRenderer.invoke('mark-level-complete', id, level, value),

  serchByMatric: (matricNo) => ipcRenderer.invoke('search-student-by-matric', matricNo),

  updateStudentStatus: (data) => ipcRenderer.invoke('update-student-status', data),

  searchStudents: (data) => ipcRenderer.invoke('search-students', data)
}
