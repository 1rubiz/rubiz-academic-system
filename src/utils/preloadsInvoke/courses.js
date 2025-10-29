import { ipcRenderer } from 'electron'

export const courseAPI = {
  addCourse: (name, code, unit, departmentId, lecturerId, description) =>
    ipcRenderer.invoke('add-course', name, code, unit, departmentId, lecturerId, description),

  getCourses: () => ipcRenderer.invoke('get-courses'),

  getCoursesByDept: (departmentId) => ipcRenderer.invoke('get-courses-by-department', departmentId),

  updateCourse: (id, updates) => ipcRenderer.invoke('update-course', id, updates),

  deleteCourse: (id) => ipcRenderer.invoke('delete-course', id)
}
