import { ipcRenderer } from 'electron'

export const carryoverAPI = {
  getAllCourses: () => ipcRenderer.invoke('get-all-courses'),

  getCarryovers: (student_id) => ipcRenderer.invoke('get-carryovers', student_id),

  saveCarryovers: (result) => ipcRenderer.invoke('save-carryovers', result)
}
