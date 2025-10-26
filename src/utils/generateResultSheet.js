// main/generateResultSheet.js
import * as XLSX from 'xlsx'
// import fs from "fs"
// import path from "path"

export function generateResultSheet(inputPath, outputPath) {
  const workbook = XLSX.readFile(inputPath)
  const sheetName = workbook.SheetNames[0]
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

  const grouped = {}
  const courseCodes = new Set()

  // --- Group rows by student ---
  data.forEach((row) => {
    const matric = row.matric_no
    if (!grouped[matric]) {
      grouped[matric] = {
        matric_no: row.matric_no,
        name: row.name,
        results: {},
        totalCredits: 0,
        totalGradePoints: 0,
        creditEarned: 0,
        creditFailed: 0
      }
    }

    grouped[matric].results[row.course_code] = row.grade
    courseCodes.add(row.course_code)

    grouped[matric].totalCredits += row.credits
    grouped[matric].totalGradePoints += row.grade_point * row.credits

    if (row.grade_point > 0) grouped[matric].creditEarned += row.credits
    else grouped[matric].creditFailed += row.credits
  })

  const courses = Array.from(courseCodes).sort()

  const rows = Object.values(grouped).map((stu, idx) => {
    const gpa = (stu.totalGradePoints / stu.totalCredits).toFixed(2)
    const courseGrades = courses.reduce(
      (acc, c) => ({
        ...acc,
        [c]: stu.results[c] || '-'
      }),
      {}
    )
    return {
      SN: idx + 1,
      MatricNo: stu.matric_no,
      Name: stu.name,
      ...courseGrades,
      CreditEarned: stu.creditEarned,
      CreditFailed: stu.creditFailed,
      GPA: gpa
    }
  })

  // --- Convert to worksheet ---
  const ws = XLSX.utils.json_to_sheet(rows)

  // --- Add title rows ---
  XLSX.utils.sheet_add_aoa(
    ws,
    [
      ['UNIVERSITY OF BENIN, BENIN CITY'],
      ['DEPARTMENT OF HISTORY AND INTERNATIONAL STUDIES'],
      ['100 LEVEL B.A. International Studies and Diplomacy, 2022/2023 Session Results'],
      []
    ],
    { origin: 'A1' }
  )

  // --- Reposition table after titles ---
  const tableStartRow = 5
  XLSX.utils.sheet_add_json(ws, rows, { origin: `A${tableStartRow}` })

  // --- Style and header rotation (works in Excel, not in all viewers) ---
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let C = 0; C <= range.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ c: C, r: tableStartRow - 1 })
    if (ws[cellRef]) {
      const val = ws[cellRef].v
      if (courses.includes(val)) {
        ws[cellRef].s = {
          alignment: { textRotation: 90, horizontal: 'center', vertical: 'center' },
          font: { bold: true },
          fill: { fgColor: { rgb: 'E0E0E0' } },
          border: makeBorder()
        }
      } else {
        ws[cellRef].s = {
          alignment: { horizontal: 'center', vertical: 'center' },
          font: { bold: true },
          fill: { fgColor: { rgb: 'E0E0E0' } },
          border: makeBorder()
        }
      }
    }
  }

  // --- Style body cells ---
  for (let R = tableStartRow; R <= range.e.r; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C })
      if (ws[ref])
        ws[ref].s = {
          alignment: { horizontal: 'center', vertical: 'center' },
          border: makeBorder()
        }
    }
  }

  // --- Merge title cells ---
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: range.e.c } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: range.e.c } }
  ]

  // --- Column widths ---
  ws['!cols'] = [
    { wch: 5 }, // SN
    { wch: 15 }, // MatricNo
    { wch: 25 }, // Name
    ...courses.map(() => ({ wch: 6 })),
    { wch: 12 }, // Credit Earned
    { wch: 12 }, // Credit Failed
    { wch: 8 } // GPA
  ]

  // --- Save file ---
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Senate Result Sheet')
  XLSX.writeFile(wb, outputPath)
  console.log(`✅ Exported to: ${outputPath}`)
}

// helper to apply thin borders
function makeBorder() {
  const style = { style: 'thin', color: { rgb: '000000' } }
  return { top: style, bottom: style, left: style, right: style }
}
