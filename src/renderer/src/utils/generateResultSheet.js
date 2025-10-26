import * as XLSX from "xlsx"

export function generateResultExcel(data, sessionName = "Session") {
  if (!Array.isArray(data) || !data.length) {
    alert("No data available to export")
    return
  }

  // 1️⃣ Extract unique course codes (sorted)
  const courseCodes = Array.from(
    new Set(data.map((item) => item.course_code))
  ).sort()

  // 2️⃣ Group by student (matric_no)
  const students = {}
  data.forEach((item) => {
    if (!students[item.matric_no]) {
      students[item.matric_no] = {
        matric_no: item.matric_no,
        name: `${item.last_name} ${item.first_name}`,
        results: {},
        credit_earned: 0,
        credit_failed: 0,
        total_points: 0,
        total_units: 0,
      }
    }

    const st = students[item.matric_no]
    st.results[item.course_code] = item.grade

    const gp = item.grade_point || 0
    const cu = item.unit || 0
    st.total_points += gp * cu
    st.total_units += cu

    if (item.status === "PASSED") st.credit_earned += cu
    else st.credit_failed += cu
  })

  // 3️⃣ Convert to tabular structure
  const rows = []
  Object.values(students).forEach((s, index) => {
    const gpa = s.total_units ? (s.total_points / s.total_units).toFixed(2) : 0

    const row = {
      SN: index + 1,
      "Matric No": s.matric_no,
      Name: s.name,
    }

    courseCodes.forEach((code) => {
      row[code] = s.results[code] || "-"
    })

    row["Credit Earned"] = s.credit_earned
    row["Credit Failed"] = s.credit_failed
    row["GPA"] = gpa

    rows.push(row)
  })

  // 4️⃣ Create worksheet
  const ws = XLSX.utils.json_to_sheet(rows)

  // 5️⃣ Rotate course headers (vertical text)
  const courseHeaderCount = courseCodes.length
//   const range = XLSX.utils.decode_range(ws["!ref"])
  for (let c = 3; c < 3 + courseHeaderCount; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c })
    if (ws[cellRef]) ws[cellRef].s = { alignment: { textRotation: 90 } }
  }

  // 6️⃣ Create workbook and export
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sessionName)
  XLSX.writeFile(wb, `${sessionName}_Senate_Result.xlsx`)
}

export const parseCarryoverString = (str) => {
    if (!str) return [];
    return str
      .split("-")
      .filter(Boolean)
      .map((item) => {
        const match = item.match(/([A-Z]+\d+)(id)(\d+)(SC)(\d+)/);
        if (!match) return null;
        return {
          code: match[1],
          courseId: Number(match[3]),
          score: Number(match[5]),
        };
      })
      .filter(Boolean);
  };
