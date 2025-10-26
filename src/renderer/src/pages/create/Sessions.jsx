// pages/create/Session.jsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SessionPage() {
  const [sessions, setSessions] = useState([]);
  const [sessionName, setSessionName] = useState("");

  useEffect(() => {
    window.api.sessions.getSessions().then(setSessions);
  }, []);

  const handleAddSession = async () => {
    await window.api.sessions.createSession(sessionName);
    setSessionName("");
    const updated = await window.sessionAPI.getSessions();
    setSessions(updated);
  };

  return (
    <div className="p-4">
      <Card className="p-4 space-y-3">
        <h2 className="text-xl font-semibold">Academic Sessions</h2>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. 2024/2025"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
          <Button onClick={handleAddSession}>Add Session</Button>
        </div>
        <ul className="mt-4 space-y-1">
          {sessions.map((s) => (
            <li key={s.id} className="border p-2 rounded">
              {s.name}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
