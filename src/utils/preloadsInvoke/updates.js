import { ipcRenderer } from 'electron'

export const updatesAPI = {
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
}
