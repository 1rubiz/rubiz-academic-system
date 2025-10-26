import { ipcRenderer } from 'electron'

export const facultyAPI = {
  addFaculty: (name, code) => ipcRenderer.invoke('add-faculty', name, code),

  getFaculties: () => ipcRenderer.invoke('get-faculties'),

  updateFaculty: (id, updates) => ipcRenderer.invoke('update-faculty', id, updates),

  deleteFaculty: (id) => ipcRenderer.invoke('delete-faculty', id)
}
