// app/results/add-result.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateGrade } from "@/utils/grading";

export default function AddResultForm() {
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [score, setScore] = useState("");
  const [grade, setGrade] = useState("");

  const handleScoreChange = (value) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setScore(num);
      setGrade(calculateGrade(num));
    }
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId, score, grade }),
    });
    if (res.ok) {
      alert("Result added successfully!");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-4 border rounded-lg shadow">
      <Input
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <Input
        placeholder="Course ID"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
      />
      <Input
        placeholder="Score"
        value={score}
        onChange={(e) => handleScoreChange(e.target.value)}
      />
      <Input placeholder="Grade" value={grade} disabled />
      <Button className="w-full" onClick={handleSubmit}>
        Save Result
      </Button>
    </div>
  );
}
