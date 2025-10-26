// pages/result/ResultEntry.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ResultEntry({ studentId=1, sessionId=1, semesterId=1 }) {
  const [results, setResults] = useState([]);
  const [gpa, setGpa] = useState("NA");
  const [rating, setRating] = useState("NA");

  useEffect(() => {
    loadResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadResults = async () => {
    const data = await window.api.result.getStudentResults(
      studentId,
      sessionId,
      semesterId
    );
    setResults(data);
    computeOverall(data);
  };

  const handleScoreChange = async (courseId, value) => {
    const score = value === "" ? null : parseFloat(value);
    const status = value === "AB" || value === "NR" ? value : "NORMAL";

    await window.api.result.addOrUpdateResult({
      student_id: studentId,
      course_id: courseId,
      session_id: sessionId,
      semester_id: semesterId,
      score: isNaN(score) ? 0 : score,
      status,
      created_by: "lecturer",
    });

    const updated = await window.resultAPI.getStudentResults(
      studentId,
      sessionId,
      semesterId
    );
    setResults(updated);
    computeOverall(updated);
  };

  const computeOverall = (data) => {
    const valid = data.filter((r) => r.status === "NORMAL");
    if (!valid.length) {
      setGpa("NA");
      setRating("NA");
      return;
    }
    const total = valid.reduce((a, b) => a + (b.grade_point || 0), 0);
    const avg = total / valid.length;
    setGpa(avg.toFixed(2));
    setRating(getSenateRating(avg));
  };

  return (
    <div className="p-6 space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Result Entry</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Course</th>
              <th className="p-2">Score</th>
              <th className="p-2">Grade</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.course_code} - {r.course_name}</td>
                <td className="p-2">
                  <Input
                    type="text"
                    className="w-20 text-center"
                    defaultValue={r.score || ""}
                    placeholder="NA/AB/NR"
                    onBlur={(e) =>
                      handleScoreChange(r.course_id, e.target.value.trim())
                    }
                  />
                </td>
                <td className="text-center p-2">{r.grade || "NA"}</td>
                <td className="text-center p-2">{r.status || "NA"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-between">
          <div>
            <p className="font-medium">
              GPA: <span className="text-blue-600">{gpa}</span>
            </p>
            <p className="font-medium">
              Senate Rating:{" "}
              <span className="text-green-600">{rating}</span>
            </p>
          </div>
          <Button onClick={loadResults}>Refresh</Button>
        </div>
      </Card>
    </div>
  );
}

function getSenateRating(gpa) {
  gpa = parseFloat(gpa);
  if (isNaN(gpa)) return "NA";
  if (gpa >= 4.5) return "First Class";
  if (gpa >= 3.5) return "Second Class Upper";
  if (gpa >= 2.5) return "Second Class Lower";
  if (gpa >= 1.5) return "Third Class";
  if (gpa >= 1.0) return "Pass";
  return "Fail";
}
