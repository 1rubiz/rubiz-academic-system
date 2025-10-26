// utils/excel.ts
import * as XLSX from "xlsx";

export function exportResultsToExcel(results: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(results);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
