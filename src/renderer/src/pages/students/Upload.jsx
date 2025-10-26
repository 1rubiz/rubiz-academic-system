import React, { useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export default function ExcelUploader({departmentId, facultyId, onClose}) {
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({ total: 0, matNos: 0 });
  const [error, setError] = useState("");

  const processFile = async (file) => {
    toast('File received!')
    try {
      setLoading(true);
      setError("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Find header row
      const headerIndex = rows.findIndex((r) =>
        r.some(
          (cell) =>
            typeof cell === "string" && cell.trim().toLowerCase() === "sn"
        )
      );

      if (headerIndex === -1) {
        setError("Header row with 'S/N' not found.");
        setLoading(false);
        return;
      }

      // Slice and parse
      const dataRows = rows.slice(headerIndex + 1);
      const extracted = dataRows
        .filter((r) => r[0] && r[1] && r[2])
        .map((r) => ({
          sn: String(r[0] || "").trim(),
          matNo: String(r[1] || "").trim(),
          name: String(r[2] || "").trim(),
          modeOfEntry: String(r[3] || "").trim(),
        }));

      const matNosFound = extracted.filter((r) => r.matNo).length;
      setStudents(extracted);
      setSummary({ total: extracted.length, matNos: matNosFound });
    } catch (err) {
      console.error(err);
      setError("Error reading file: " + err.message);
    } finally {
      setLoading(false);
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleUpload = async() => {
    if (!students.length) {
      setError("No data to upload.");
      return;
    }
    const data = await window.api.students.bulkUpload(students, facultyId, departmentId)
    // console.log(data)
    toast.success('Upload successfull')
    onClose()
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div
        className={`w-96 h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <p className="text-gray-700">
          {dragOver ? "Drop the file here 📦" : "Drag & drop Excel file here"}
        </p>
        <p className="text-sm text-gray-500">or click below</p>
        <input
          type="file"
          accept=".xlsx, .xls"
          className="mt-2"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) processFile(file);
          }}
        />
      </div>

      {loading && (
        <div className="mt-6 w-80 bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-3 bg-blue-500 animate-pulse w-full"></div>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-green-700">
            ✅ {summary.total} students found
          </p>
          <p className="text-gray-600">
            Matric Numbers Found: {summary.matNos}
          </p>
          <button
            onClick={handleUpload}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Save / Upload
          </button>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
