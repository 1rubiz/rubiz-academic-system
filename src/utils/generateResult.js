import ExcelJS from 'exceljs'
import { dialog } from 'electron'
import { db, markSheetpath } from '../main/index.js'

const parseCarryoverString = (str) => {
  if (!str) return []
  return str
    .split('-')
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/([A-Z]+\d+)(?:id\d+SC\d+)/)
      return match ? match[1] : null
    })
    .filter(Boolean)
}

const getSenateCategory = (gpa, carryovers, failed_str, senate_status) => {
  const hasCarry = carryovers.length > 0
  const hasFailed = failed_str === '-' ? false : true

  // If not active or suspended, return the raw senate status in uppercase
  if (senate_status !== 'active' && senate_status !== 'suspend') {
    return senate_status.toUpperCase()
  }

  // If active and no carryover or failed course
  if (senate_status === 'active' && !hasCarry && !hasFailed) {
    return 'A' // Successful
  }

  // If active but has carryovers or failed courses
  if (senate_status === 'active' && (hasCarry || hasFailed)) {
    return 'B' // With Carry-Over
  }

  // GPA-based classifications
  if (gpa < 1.0) return 'D' // Withdraw
  if (gpa < 1.5) return 'C' // Probation

  return 'H' // Default / Withheld
}

export const handleExport = async ({ sessionId, departmentId, session_name }) => {
  try {
    const results = db
      .prepare(
        `
        SELECT 
          stu.id AS student_id,
          stu.matric_no,
          stu.first_name,
          stu.last_name,
          stu.mode_of_entry,
          stu.status as senate_status,
          c.name AS course_name,
          c.name || '' || c.code AS course_code,
          c.unit AS credits,
          sr.ca,
          sr.score,
          sr.grade,
          sr.grade_point,
          sr.status,
          sem.name AS semester,
          sem.name AS semester_order,
          sess.name AS session_name
        FROM session_results sr
        JOIN students stu ON sr.student_id = stu.id
        JOIN courses c ON sr.course_id = c.id
        JOIN semesters sem ON sr.semester_id = sem.id
        JOIN sessions sess ON sr.session_id = sess.id
        WHERE sr.session_id = ? AND stu.department_id = ?
        ORDER BY stu.first_name COLLATE NOCASE, stu.matric_no, sem.name, c.code;
      `
      )
      .all(sessionId, departmentId)

    if (!results.length) throw new Error('No results found for this session.')

    const firstSemesterCourses = Array.from(
      new Set(results.filter((r) => r.semester_order === 'First').map((r) => r.course_code))
    ).sort()

    const secondSemesterCourses = Array.from(
      new Set(results.filter((r) => r.semester_order === 'Second').map((r) => r.course_code))
    ).sort()

    const students = {}

    for (const r of results) {
      const total = (r.score || 0) + (r.ca || 0) // total = exam + CA
      const gp = r.grade_point || 0
      const cu = r.credits || 0

      if (!students[r.matric_no]) {
        const carry = db
          .prepare(`SELECT courses FROM carryover WHERE student_id = ?`)
          .get(r.student_id)
        const parsedCarry = parseCarryoverString(carry?.courses)
        const carryList = parsedCarry.join(', ')

        students[r.matric_no] = {
          matric_no: r.matric_no,
          name: `${r.last_name} ${r.first_name.toUpperCase()}`,
          mode_of_entry: r.mode_of_entry.toUpperCase() || 'U',
          carryover_courses: carryList,
          results: {},
          total_points: 0,
          total_units: 0,
          credit_earned: 0,
          credit_failed: 0,
          carryovers: parsedCarry,
          senate_status: r.senate_status
        }
      }

      const s = students[r.matric_no]
      s.results[r.course_code] = {
        grade: r.grade,
        total,
        credit: r.credits,
        semester: r.semester_order
      }

      s.total_points += gp * cu
      s.total_units += cu

      if (r.status !== 'NA') {
        if (r.score > 39) {
          s.credit_earned += cu
        } else {
          s.credit_failed += cu
          if (!s.failed_courses) s.failed_courses = []
          s.failed_courses.push(r.course_code)
        }
      }
    }
    Object.values(students).forEach((s) => {
      s.failed_courses_str = s.failed_courses?.join(', ') || '-'
    })

    // --- Excel Setup ---
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Senate Result')

    const university = 'FEDERAL UNIVERSITY OF EXCELLENCE'
    const department = 'Department of History'
    const title = `Senate Approved Results for ${session_name}`

    const baseHeaders = ['S/N', 'Matric No', 'Name', 'Mode of Entry', 'Carryover Courses']

    const totalBaseColumns = baseHeaders.length
    const totalFirstSemColumns = firstSemesterCourses.length
    const totalSecondSemColumns = secondSemesterCourses.length
    const totalSummaryColumns = 5 // Credit Earned, Credit Failed, GPA, Senate Category

    const totalColumns =
      totalBaseColumns + totalFirstSemColumns + totalSecondSemColumns + totalSummaryColumns
    const firstSemStart = totalBaseColumns + 1
    const firstSemEnd = firstSemStart + totalFirstSemColumns - 1
    const secondSemStart = firstSemEnd + 1
    const secondSemEnd = secondSemStart + totalSecondSemColumns - 1
    const summaryStart = secondSemEnd + 1
    const summaryEnd = summaryStart + totalSummaryColumns - 1
    const thickBorderCol = secondSemStart

    // Headers
    sheet.mergeCells(1, 1, 1, totalColumns)
    // sheet.mergeCells(2, 1, 2, totalColumns);
    sheet.mergeCells(3, 1, 3, totalColumns)
    sheet.getCell('A1').value = university
    sheet.getCell('A2').value = department
    sheet.getCell('A3').value = title
    ;[1, 2, 3].forEach((n) => {
      const row = sheet.getRow(n)
      row.alignment = { horizontal: 'center', vertical: 'middle' }
      row.font = { bold: true, size: 14 }
    })

    // Header Rows
    const headerRow1 = sheet.addRow([
      ...Array(5).fill(''),
      ...Array(totalFirstSemColumns).fill('First Semester'),
      ...Array(totalSecondSemColumns).fill('Second Semester'),
      ...Array(5).fill('')
    ])
    sheet.mergeCells(5, firstSemStart, 5, firstSemEnd)
    sheet.mergeCells(5, secondSemStart, 5, secondSemEnd)
    sheet.mergeCells(5, summaryStart, 5, summaryEnd)

    const headerRow2 = sheet.addRow([
      ...Array(totalBaseColumns).fill(''),
      ...firstSemesterCourses,
      ...secondSemesterCourses,
      'Failed Courses',
      'Credit Earned',
      'Credit Failed',
      'GPA',
      'Category'
    ])

    const headerRow3 = sheet.addRow([
      ...baseHeaders,
      ...firstSemesterCourses.map((c) => results.find((r) => r.course_code === c)?.credits || '-'),
      ...secondSemesterCourses.map((c) => results.find((r) => r.course_code === c)?.credits || '-'),
      '',
      '',
      '',
      ''
    ])

    ;[headerRow1, headerRow2, headerRow3].forEach((row) => {
      row.eachCell((cell, col) => {
        cell.border = {
          left: { style: col === thickBorderCol ? 'thick' : 'thin' },
          right: { style: 'thin' },
          top: { style: 'thin' },
          bottom: { style: 'thin' }
        }
        cell.font = { bold: true }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })
    })

    // --- Data Rows ---
    Object.values(students).forEach((student, index) => {
      const gpa = student.total_units
        ? (student.total_points / student.total_units).toFixed(2)
        : '0.00'
      const category = getSenateCategory(
        parseFloat(gpa),
        student.carryovers,
        student.failed_courses_str,
        student.senate_status
      )

      const row = sheet.addRow([
        index + 1,
        student.matric_no,
        student.name,
        student.mode_of_entry,
        student.carryover_courses,
        ...firstSemesterCourses.map((c) => student.results[c]?.grade || '-'),
        ...secondSemesterCourses.map((c) => student.results[c]?.grade || '-'),
        student.failed_courses_str,
        String(student.credit_earned).padStart(2, '0'),
        String(student.credit_failed).padStart(2, '0'),
        student.failed_courses_str === '-' ? gpa : '',
        category
      ])

      row.eachCell((cell, col) => {
        cell.border = {
          left: { style: col === thickBorderCol ? 'thick' : 'thin' },
          right: { style: 'thin' },
          top: { style: 'thin' },
          bottom: { style: 'thin' }
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })
    })

    // Column widths
    sheet.columns = [
      { width: 6 },
      { width: 14 },
      { width: 25 },
      { width: 6 },
      { width: 25 },
      ...firstSemesterCourses.map(() => ({ width: 8 })),
      ...secondSemesterCourses.map(() => ({ width: 8 })),
      { width: 12 },
      { width: 12 },
      { width: 10 },
      { width: 10 }
    ]

    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Marksheet',
      defaultPath: markSheetpath(`${session_name}_Senate_Result.xlsx`),
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    })

    if (!filePath) return { message: 'Export canceled.' }
    await workbook.xlsx.writeFile(filePath)
    return { message: `Exported successfully to ${filePath}` }
  } catch (err) {
    console.error(err)
    return { message: `Export failed: ${err.message}` }
  }
}

5

// import ExcelJS from "exceljs";
// import { dialog } from "electron";
// import { db, excelPath } from "../main.js";

// const parseCarryoverString = (str) => {
//   if (!str) return [];
//   return str
//     .split("-")
//     .filter(Boolean)
//     .map((item) => {
//       const match = item.match(/([A-Z]+\d+)(?:id\d+SC\d+)/);
//       return match ? match[1] : null;
//     })
//     .filter(Boolean);
// };

// export const handleExport = async ({ sessionId, departmentId, sessionName }) => {
//   try {
//     const results = db
//       .prepare(`
//         SELECT
//           stu.id as student_id,
//           stu.matric_no,
//           stu.first_name,
//           stu.last_name,
//           stu.mode_of_entry,
//           c.code as course_code,
//           c.name as course_name,
//           c.unit as credits,
//           sr.score,
//           sr.grade,
//           sr.grade_point,
//           sr.status,
//           sem.name as semester,
//           sem.name as semester_order,
//           sess.name as session_name
//         FROM session_results sr
//         JOIN students stu ON sr.student_id = stu.id
//         JOIN courses c ON sr.course_id = c.id
//         JOIN semesters sem ON sr.semester_id = sem.id
//         JOIN sessions sess ON sr.session_id = sess.id
//         WHERE sr.session_id = ? AND stu.department_id = ?
//         ORDER BY stu.matric_no, sem.name, c.code;
//       `)
//       .all(sessionId, departmentId);

//     if (!results.length) throw new Error("No results found for this session.");

//     const firstSemesterCourses = Array.from(
//       new Set(results.filter(r => r.semester_order === "First").map(r => r.course_code))
//     ).sort();

//     const secondSemesterCourses = Array.from(
//       new Set(results.filter(r => r.semester_order === "Second").map(r => r.course_code))
//     ).sort();

//     const students = {};

//     for (const r of results) {
//       if (!students[r.matric_no]) {
//         // Fetch carryover
//         const carry = db
//           .prepare(`SELECT courses FROM carryover WHERE student_id = ?`)
//           .get(r.student_id);
//         const parsedCarry = parseCarryoverString(carry?.courses);
//         const carryList = parsedCarry.join(", ");

//         students[r.matric_no] = {
//           matric_no: r.matric_no,
//           name: `${r.last_name.toUpperCase()} ${r.first_name}`,
//           mode_of_entry: r.mode_of_entry || "Regular",
//           carryover_courses: carryList,
//           results: {},
//           credit_earned: 0,
//           credit_failed: 0,
//           total_points: 0,
//           total_units: 0,
//         };
//       }

//       const s = students[r.matric_no];
//       s.results[r.course_code] = {
//         grade: r.grade,
//         credit: r.credits,
//         semester: r.semester_order,
//       };

//       const gp = r.grade_point || 0;
//       const cu = r.credits || 0;
//       s.total_points += gp * cu;
//       s.total_units += cu;

//       if (r.status === "PASSED") {
//         s.credit_earned += cu;
//       } else {
//         s.credit_failed += cu;
//       }
//     }

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Senate Result");

//     const university = "FEDERAL UNIVERSITY OF EXCELLENCE";
//     const department = "Department of History";
//     const title = `Senate Approved Results for ${sessionName}`;

//     const baseHeaders = [
//       "S/N",
//       "Matric No",
//       "Name",
//       "Mode of Entry",
//       "Carryover Courses",
//     ];

//     // Calculate column positions
//     const totalBaseColumns = baseHeaders.length;
//     const totalFirstSemColumns = firstSemesterCourses.length;
//     const totalSecondSemColumns = secondSemesterCourses.length;
//     const totalSummaryColumns = 3; // Credit Earned, Credit Failed, GPA

//     const totalColumns = totalBaseColumns + totalFirstSemColumns + totalSecondSemColumns + totalSummaryColumns;

//     // Define semester column ranges
//     const firstSemStart = totalBaseColumns + 1;
//     const firstSemEnd = firstSemStart + totalFirstSemColumns - 1;
//     const secondSemStart = firstSemEnd + 1;
//     const secondSemEnd = secondSemStart + totalSecondSemColumns - 1;
//     const summaryStart = secondSemEnd + 1;
//     const summaryEnd = summaryStart + totalSummaryColumns - 1;

//     // Thick border position (between semesters)
//     const thickBorderCol = secondSemStart;

//     // Titles and headers
//     sheet.mergeCells(1, 1, 1, totalColumns);
//     sheet.mergeCells(2, 1, 2, totalColumns);
//     sheet.mergeCells(3, 1, 3, totalColumns);

//     sheet.getCell("A1").value = university;
//     sheet.getCell("A2").value = department;
//     sheet.getCell("A3").value = title;

//     // Style title rows
//     [1, 2, 3].forEach((rowNum) => {
//       const row = sheet.getRow(rowNum);
//       row.alignment = { horizontal: "center", vertical: "middle" };
//       row.font = { bold: true, size: 14 };
//       row.height = 25;
//     });

//     // First header row (main headers)
//     const headerRow1 = sheet.addRow([
//       ...baseHeaders,
//       ...Array(totalFirstSemColumns).fill("First Semester"),
//       ...Array(totalSecondSemColumns).fill("Second Semester"),
//       ...["", "", ""] // Placeholders for summary columns
//     ]);

//     // Merge semester headers
//     sheet.mergeCells(5, firstSemStart, 5, firstSemEnd);
//     sheet.mergeCells(5, secondSemStart, 5, secondSemEnd);
//     sheet.mergeCells(5, summaryStart, 5, summaryEnd);

//     // Set values for merged summary header
//     sheet.getCell(5, summaryStart).value = "Summary";

//     // Second header row (course codes)
//     const headerRow2 = sheet.addRow([
//       ...Array(totalBaseColumns).fill(""),
//       ...firstSemesterCourses,
//       ...secondSemesterCourses,
//       "Credit Earned",
//       "Credit Failed",
//       "GPA"
//     ]);

//     // Style course code headers with vertical rotation
//     headerRow2.eachCell((cell, colNumber) => {
//       if (colNumber > totalBaseColumns && colNumber <= secondSemEnd) {
//         cell.alignment = { textRotation: 90, horizontal: "center", vertical: "middle" };
//         cell.font = { bold: true, size: 10 };
//       } else if (colNumber >= summaryStart) {
//         cell.font = { bold: true };
//         cell.alignment = { horizontal: "center", vertical: "middle" };
//       }
//     });

//     // Third header row (course credits)
//     const headerRow3 = sheet.addRow([
//       ...baseHeaders,
//       ...firstSemesterCourses.map(
//         (course) => results.find((r) => r.course_code === course)?.credits || "-"
//       ),
//       ...secondSemesterCourses.map(
//         (course) => results.find((r) => r.course_code === course)?.credits || "-"
//       ),
//       "", "", "" // Summary columns don't need credits
//     ]);

//     // Apply borders and styling to all header rows
//     [headerRow1, headerRow2, headerRow3].forEach((row, rowIndex) => {
//       row.eachCell((cell, colNumber) => {
//         cell.border = {
//           top: { style: "thin" },
//           bottom: { style: rowIndex === 2 ? "thin" : "none" }, // Only bottom border on last header row
//           left: { style: colNumber === thickBorderCol ? "thick" : "thin" },
//           right: { style: "thin" },
//         };
//         cell.font = { bold: true };
//         cell.alignment = { horizontal: "center", vertical: "middle" };
//       });
//       row.height = 25;
//     });

//     // Student data rows
//     Object.values(students).forEach((student, index) => {
//       const gpa = student.total_units ? (student.total_points / student.total_units).toFixed(2) : "0.00";

//       const row = sheet.addRow([
//         index + 1,
//         student.matric_no,
//         student.name,
//         student.mode_of_entry,
//         student.carryover_courses,
//         ...firstSemesterCourses.map((course) => student.results[course]?.grade || "-"),
//         ...secondSemesterCourses.map((course) => student.results[course]?.grade || "-"),
//         student.credit_earned,
//         student.credit_failed,
//         gpa,
//       ]);

//       // Apply borders to data rows
//       row.eachCell((cell, colNumber) => {
//         cell.border = {
//           left: { style: colNumber === thickBorderCol ? "thick" : "thin" },
//           right: { style: "thin" },
//           top: { style: "thin" },
//           bottom: { style: "thin" },
//         };
//         cell.alignment = { horizontal: "center", vertical: "middle" };
//       });
//       row.height = 20;
//     });

//     // Set column widths
//     const columnWidths = [
//       { width: 6 },    // S/N
//       { width: 14 },   // Matric No
//       { width: 25 },   // Name
//       { width: 15 },   // Mode of Entry
//       { width: 25 },   // Carryover Courses
//       ...firstSemesterCourses.map(() => ({ width: 8 })),  // First sem courses
//       ...secondSemesterCourses.map(() => ({ width: 8 })), // Second sem courses
//       { width: 12 },   // Credit Earned
//       { width: 12 },   // Credit Failed
//       { width: 10 },   // GPA
//     ];

//     sheet.columns = columnWidths;

//     // Auto-filter for the data range
//     sheet.autoFilter = {
//       from: { row: 5, column: 1 },
//       to: { row: 5 + Object.keys(students).length, column: totalColumns },
//     };

//     const { filePath } = await dialog.showSaveDialog({
//       title: "Save Marksheet",
//       defaultPath: excelPath,
//       filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
//     });

//     if (!filePath) return { message: "Export canceled." };

//     await workbook.xlsx.writeFile(filePath);
//     return { message: `Exported successfully to ${filePath}` };
//   } catch (err) {
//     console.error(err);
//     return { message: `Export failed: ${err.message}` };
//   }
// };

// import ExcelJS from "exceljs";
// import { dialog } from "electron";
// import { db, excelPath } from "../main.js";

// const parseCarryoverString = (str) => {
//   if (!str) return [];
//   return str
//     .split("-")
//     .filter(Boolean)
//     .map((item) => {
//       const match = item.match(/([A-Z]+\d+)(id)(\d+)(SC)(\d+)/);
//       if (!match) return null;
//       return {
//         code: match[1],
//         courseId: Number(match[3]),
//         score: Number(match[5]),
//       };
//     })
//     .filter(Boolean);
// };

// export const handleExport = async ({ sessionId, departmentId, sessionName }) => {
//   try {
//     const results = db
//       .prepare(`
//         SELECT
//           stu.id as student_id,
//           stu.matric_no,
//           stu.first_name,
//           stu.last_name,
//           stu.mode_of_entry,
//           c.code as course_code,
//           c.name as course_name,
//           c.unit as credits,
//           sr.score,
//           sr.grade,
//           sr.grade_point,
//           sr.status,
//           sem.name as semester,
//           sem.name as semester_order,
//           sess.name as session_name
//         FROM session_results sr
//         JOIN students stu ON sr.student_id = stu.id
//         JOIN courses c ON sr.course_id = c.id
//         JOIN semesters sem ON sr.semester_id = sem.id
//         JOIN sessions sess ON sr.session_id = sess.id
//         WHERE sr.session_id = ? AND stu.department_id = ?
//         ORDER BY stu.matric_no, sem.name, c.code;
//       `)
//       .all(sessionId, departmentId);

//     if (!results.length) throw new Error("No results found for this session.");

//     const firstSemesterCourses = Array.from(
//       new Set(results.filter(r => r.semester_order === "First").map(r => r.course_code))
//     ).sort();

//     const secondSemesterCourses = Array.from(
//       new Set(results.filter(r => r.semester_order === "Second").map(r => r.course_code))
//     ).sort();

//     const students = {};

//     for (const r of results) {
//       if (!students[r.matric_no]) {
//         // Fetch carryover
//         const carry = db
//           .prepare(`SELECT courses FROM carryover WHERE student_id = ?`)
//           .get(r.student_id);
//         const parsedCarry = parseCarryoverString(carry?.courses);
//         const carryList = parsedCarry.length
//           ? parsedCarry.reduce((acc, cur) => {
//               const existing = acc.find((a) => a.startsWith(cur.code.slice(0, 3)));
//               if (existing) {
//                 const base = existing.match(/[A-Z]+/)[0];
//                 const nums = existing.match(/\d+/g).join(",");
//                 return acc.map((a) =>
//                   a === existing ? `${base}${nums},${cur.code.replace(base, "")}` : a
//                 );
//               } else {
//                 acc.push(cur.code);
//               }
//               return acc;
//             }, [])
//           : [];

//         students[r.matric_no] = {
//           matric_no: r.matric_no,
//           name: `${r.last_name.toUpperCase()} ${r.first_name}`,
//           mode_of_entry: r.mode_of_entry || "Regular",
//           carryover_courses: carryList.join(", "),
//           results: {},
//           credit_earned: 0,
//           credit_failed: 0,
//           total_points: 0,
//           total_units: 0,
//         };
//       }

//       const s = students[r.matric_no];
//       s.results[r.course_code] = {
//         grade: r.grade,
//         credit: r.credits,
//         semester: r.semester_order,
//       };

//       const gp = r.grade_point || 0;
//       const cu = r.credits || 0;
//       s.total_points += gp * cu;
//       s.total_units += cu;

//       if (r.status === "PASSED") {
//         s.credit_earned += cu;
//       } else {
//         s.credit_failed += cu;
//       }
//     }

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Senate Result");

//     const university = "FEDERAL UNIVERSITY OF EXCELLENCE";
//     const department = "Department of History";
//     const title = `Senate Approved Results for ${sessionName}`;

//     const baseHeaders = [
//       "S/N",
//       "Matric No",
//       "Name",
//       "Mode of Entry",
//       "Carryover Courses",
//     ];

//     // Generate header row indexes
//     let colIndex = baseHeaders.length;
//     const firstSemStart = colIndex + 1;
//     const firstSemEnd = colIndex + firstSemesterCourses.length;
//     const secondSemStart = firstSemEnd + 1;
//     const secondSemEnd = secondSemStart + secondSemesterCourses.length - 1;

//     // Titles
//     sheet.mergeCells(1, 1, 1, secondSemEnd + 5);
//     sheet.mergeCells(2, 1, 2, secondSemEnd + 5);
//     sheet.mergeCells(3, 1, 3, secondSemEnd + 5);
//     sheet.getCell("A1").value = university;
//     sheet.getCell("A2").value = department;
//     sheet.getCell("A3").value = title;

//     [1, 2, 3].forEach((r) => {
//       const row = sheet.getRow(r);
//       row.alignment = { horizontal: "center", vertical: "middle" };
//       row.font = { bold: true, size: 14 };
//     });

//     // Semester headers
//     const headerRow1 = sheet.addRow([
//       ...baseHeaders,
//       ...firstSemesterCourses.map(() => "First Semester"),
//       ...secondSemesterCourses.map(() => "Second Semester"),
//       "Credit Earned",
//       "Credit Failed",
//       "GPA",
//     ]);

//     sheet.mergeCells(5, firstSemStart, 5, firstSemEnd);
//     sheet.mergeCells(5, secondSemStart, 5, secondSemEnd);

//     // Sub headers (Course codes)
//     const headerRow2 = sheet.addRow([
//       ...Array(baseHeaders.length).fill(""),
//       ...firstSemesterCourses,
//       ...secondSemesterCourses,
//       "",
//       "",
//       "",
//     ]);

//     // Vertical rotate for course codes
//     headerRow2.eachCell((cell, colNumber) => {
//       if (colNumber > baseHeaders.length && colNumber <= secondSemEnd) {
//         cell.alignment = { textRotation: 90, horizontal: "center", vertical: "middle" };
//         cell.font = { bold: true, size: 10 };
//       }
//     });

//     // Third header row (Course credits)
//     const headerRow3 = sheet.addRow([
//       ...baseHeaders,
//       ...firstSemesterCourses.map(
//         (course) =>
//           results.find((r) => r.course_code === course)?.credits || "-"
//       ),
//       ...secondSemesterCourses.map(
//         (course) =>
//           results.find((r) => r.course_code === course)?.credits || "-"
//       ),
//       "Credit Earned",
//       "Credit Failed",
//       "GPA",
//     ]);

//     // Borders and thick line
//     const thickBorderIndex = firstSemEnd + 1;
//     headerRow3.eachCell((cell, colNumber) => {
//       cell.border = {
//         top: { style: "thin" },
//         bottom: { style: "thin" },
//         left: { style: colNumber === thickBorderIndex ? "thick" : "thin" },
//         right: { style: "thin" },
//       };
//       cell.font = { bold: true };
//       cell.alignment = { horizontal: "center", vertical: "middle" };
//     });

//     // Rows
//     Object.values(students).forEach((s, i) => {
//       const gpa = s.total_units ? (s.total_points / s.total_units).toFixed(2) : "0.00";

//       const row = sheet.addRow([
//         i + 1,
//         s.matric_no,
//         s.name,
//         s.mode_of_entry,
//         s.carryover_courses,
//         ...firstSemesterCourses.map((c) => s.results[c]?.grade || "-"),
//         ...secondSemesterCourses.map((c) => s.results[c]?.grade || "-"),
//         s.credit_earned,
//         s.credit_failed,
//         gpa,
//       ]);

//       row.eachCell((cell, colNumber) => {
//         cell.border = {
//           left: { style: colNumber === thickBorderIndex ? "thick" : "thin" },
//           right: { style: "thin" },
//           top: { style: "thin" },
//           bottom: { style: "thin" },
//         };
//         cell.alignment = { horizontal: "center", vertical: "middle" };
//       });
//     });

//     // Adjust column widths
//     sheet.columns = [
//       { width: 6 },
//       { width: 14 },
//       { width: 25 },
//       { width: 15 },
//       { width: 25 },
//       ...firstSemesterCourses.map(() => ({ width: 6 })),
//       ...secondSemesterCourses.map(() => ({ width: 6 })),
//       { width: 12 },
//       { width: 12 },
//       { width: 10 },
//     ];

//     const { filePath } = await dialog.showSaveDialog({
//       title: "Save Marksheet",
//       defaultPath: excelPath,
//       filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
//     });

//     if (!filePath) return { message: "Export canceled." };

//     await workbook.xlsx.writeFile(filePath);
//     return { message: `Exported successfully to ${filePath}` };
//   } catch (err) {
//     console.error(err);
//     return { message: `Export failed: ${err.message}` };
//   }
// };
