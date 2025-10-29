import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join, dirname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'
import { autoUpdater } from 'electron-updater'
import { registerDepartmentHandlers } from './handlers/departments.js'
import { registerCourseHandlers } from './handlers/courses.js'
import { registerStudentHandlers } from './handlers/students.js'
import { registerFacultyHandlers } from './handlers/faculties.js'
import { registerSessionHandlers } from './handlers/sessions.js'
import { registerResultsHandlers } from './handlers/results.js'
import { registerCarryoversHandlers } from './handlers/carryovers.js'
registerDepartmentHandlers()
registerCourseHandlers()
registerStudentHandlers()
registerFacultyHandlers()
registerSessionHandlers()
registerResultsHandlers()
registerCarryoversHandlers()

export let db
let loadingWindow
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const preloadPath = join(__dirname, '../preload/index.js')

// const dbPath = path.join(process.cwd(), "db/academic_records.db");

const userDataPath = app.getPath('userData')
const dbFolder = path.join(userDataPath, 'db')
const dbPath = path.join(dbFolder, 'academic_records.db')

// Ensure directory exists
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true })
}

export const excelPath = path.join(process.cwd(), `Result.xlsx`)
export const markSheetpath = (str = '') => {
  let documentsDir

  // Handle different platforms if needed
  if (process.platform === 'win32') {
    documentsDir = path.join(os.homedir(), 'Documents')
  } else if (process.platform === 'darwin') {
    documentsDir = path.join(os.homedir(), 'Documents')
  } else {
    // Linux and other Unix-like systems
    documentsDir = path.join(os.homedir(), 'Documents')
  }

  return str ? path.join(documentsDir, str) : documentsDir
}

function initDatabase() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, '')
    }
    db = new Database(dbPath)
    // --- Migrations ---
    db.exec(`
      CREATE TABLE IF NOT EXISTS faculties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        faculty_id INTEGER NOT NULL,
        FOREIGN KEY(faculty_id) REFERENCES faculties(id)
      );

      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        unit INTEGER NOT NULL,
        department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
        lecturer_id INTEGER,
        description TEXT,
        FOREIGN KEY(department_id) REFERENCES departments(id)
      );

      CREATE TABLE IF NOT EXISTS carryover (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courses TEXT,
        student_id INTEGER NOT NULL,
        FOREIGN KEY(student_id) REFERENCES students(id)
      );

      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matric_no TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        middle_name TEXT,
        gender TEXT,
        department_id INTEGER,
        mode_of_entry TEXT DEFAULT u,
        faculty_id INTEGER NOT NULL,
        is_100_active BOOLEAN DEFAULT 0,
        is_100_complete BOOLEAN DEFAULT 0,
        is_200_active BOOLEAN DEFAULT 0,
        is_200_complete BOOLEAN DEFAULT 0,
        is_300_active BOOLEAN DEFAULT 0,
        is_300_complete BOOLEAN DEFAULT 0,
        is_400_active BOOLEAN DEFAULT 0,
        is_400_complete BOOLEAN DEFAULT 0,
        is_500_active BOOLEAN DEFAULT 0,
        is_500_complete BOOLEAN DEFAULT 0,
        is_600_active BOOLEAN DEFAULT 0,
        is_600_complete BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (faculty_id) REFERENCES faculties(id)
      );
      


      CREATE TABLE IF NOT EXISTS student_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          session_id INTEGER NOT NULL,
          department_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(student_id, session_id),
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (session_id) REFERENCES sessions(id),
          FOREIGN KEY (department_id) REFERENCES departments(id)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL, -- e.g., 2024/2025
        start_year INTEGER NOT NULL,
        end_year INTEGER NOT NULL,
        current INTEGER DEFAULT 0, -- marks the active session
        faculty_id INTEGER REFERENCES faculties(id) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES faculties(id)
      );

      CREATE TABLE IF NOT EXISTS semesters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- 'First' or 'Second'
        UNIQUE(session_id, name),
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS session_courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER REFERENCES semesters(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        lecturer_id INTEGER,
        department_id INTEGER REFERENCES departments(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS session_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          course_id INTEGER NOT NULL,
          session_id INTEGER NOT NULL,
          semester_id INTEGER NOT NULL,
          score REAL CHECK (score >= 0 AND score <= 100),
          status TEXT DEFAULT 'valid',
          grade TEXT,
          grade_point REAL,
          updated_by TEXT,
          ca INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (course_id) REFERENCES courses(id)
          FOREIGN KEY (session_id) REFERENCES sessions(id)
          FOREIGN KEY (semester_id) REFERENCES semesters(id)
      );
    `)
    console.log('✅ Database initialized with departments, courses, and students.')
  } catch (error) {
    console.log(error)
  }
}

function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    show: false
  })

  // loadingWindow.loadFile(path.join(__dirname, '../renderer/loading.html'))
  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show()
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    backgroundColor: '#000000',
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })
  // mainWindow.maximize()
  mainWindow.show()

  mainWindow.on('ready-to-show', () => {
    if (loadingWindow) {
      loadingWindow.close()
      loadingWindow = null
    }
    initDatabase()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createLoadingWindow()
  createWindow()
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
