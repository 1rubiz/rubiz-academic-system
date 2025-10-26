import { ipcRenderer } from 'electron'

export const courseAPI = {
  addCourse: (name, code, unit, departmentId, lecturerId, description) =>
    ipcRenderer.invoke('add-course', name, code, unit, departmentId, lecturerId, description),

  getCourses: () => ipcRenderer.invoke('get-courses'),

  updateCourse: (id, updates) => ipcRenderer.invoke('update-course', id, updates),

  deleteCourse: (id) => ipcRenderer.invoke('delete-course', id)
}
