import { ipcRenderer } from 'electron'

export const departmentAPI = {
  addDepartment: (name, code, facultyId) =>
    ipcRenderer.invoke('add-department', name, code, facultyId),

  getDepartments: () => ipcRenderer.invoke('get-departments'),

  getDepartment: (departmentId) => ipcRenderer.invoke('get-department', departmentId),

  getDepartmentByFaculty: (facultyId) => ipcRenderer.invoke('get-department-by-faculty', facultyId),

  deleteDepartment: (id) => ipcRenderer.invoke('delete-department', id)
}
