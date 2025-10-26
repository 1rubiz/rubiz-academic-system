// src/preload/index.js
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { departmentAPI } from '../utils/preloadsInvoke/departments.js'
import { courseAPI } from '../utils/preloadsInvoke/courses.js'
import { studentAPI } from '../utils/preloadsInvoke/student.js'
import { facultyAPI } from '../utils/preloadsInvoke/faculties.js'
import { sessionAPI } from '../utils/preloadsInvoke/sessions.js'
import { resultAPI } from '../utils/preloadsInvoke/result.js'
import { carryoverAPI } from '../utils/preloadsInvoke/carryovers.js'

console.log('🧠 Preload script running...')

contextBridge.exposeInMainWorld('electron', electronAPI)
contextBridge.exposeInMainWorld('api', {
  departments: departmentAPI,
  courses: courseAPI,
  students: studentAPI,
  faculties: facultyAPI,
  sessions: sessionAPI,
  result: resultAPI,
  carryovers: carryoverAPI
})
