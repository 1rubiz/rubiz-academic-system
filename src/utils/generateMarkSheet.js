import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'
import { db, markSheetpath } from '../main/index.js'

export const generateMarksheet = async ({
  course_id,
  session_id,
  department_name,
  faculty_name
}) => {
  // 🔹 Fetch course, session and faculty info
  const course = db
    .prepare(
      `
    SELECT c.id, c.name, c.code, d.name AS department_name
    FROM courses c
    JOIN departments d ON c.department_id = d.id
    WHERE c.id = ?
  `
    )
    .get(course_id)

  const session = db
    .prepare(
      `
    SELECT start_year, end_year FROM sessions WHERE id = ?
  `
    )
    .get(session_id)

  if (!course || !session) throw new Error('Course or session not found')

  // 🔹 Fetch student results
  const results = db
    .prepare(
      `
    SELECT 
      stu.matric_no,
      UPPER(stu.last_name || ' ' || stu.first_name) AS full_name,
      sr.ca,
      sr.score,
      (sr.ca + sr.score) AS total
    FROM session_results sr
    JOIN students stu ON sr.student_id = stu.id
    WHERE sr.course_id = ? AND sr.session_id = ?
    ORDER BY stu.last_name ASC, stu.first_name ASC
  `
    )
    .all(course_id, session_id)

  if (!results.length) throw new Error('No results found for this course/session')

  // 🔹 Create workbook
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Marksheet')

  // 🔹 Header
  sheet.columns = [
    { header: 'S/N', key: 'sn', width: 6 },
    { header: 'Matric Number', key: 'matric_no', width: 18 },
    { header: 'FULL NAME', key: 'full_name', width: 25 },
    { header: 'CA', key: 'ca', width: 8 },
    { header: 'EXAM', key: 'exam', width: 8 },
    { header: 'TOTAL', key: 'total', width: 10 }
  ]

  // 🔹 Insert rows
  results.forEach((row, i) => {
    sheet.addRow({
      sn: i + 1,
      matric_no: `${faculty_name}${row.matric_no}`,
      full_name: row.full_name,
      ca: row.ca || 0,
      exam: row.score || 0,
      total: row.total || 0
    })
  })

  // 🔹 Style header
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true }
    cell.alignment = { horizontal: 'center' }
  })

  // 🔹 Generate file path
  const fileName = `${department_name}_${course.name.replace(/\s+/g, '')}${course.code}_${session.start_year}_${session.end_year}.xlsx`
  const dir = markSheetpath(fileName)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, fileName)

  // 🔹 Write file
  await workbook.xlsx.writeFile(filePath)
  return { filePath, count: results.length }
}
