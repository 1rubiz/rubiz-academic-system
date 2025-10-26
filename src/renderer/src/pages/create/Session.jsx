'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'react-toastify'

export default function SessionManager({ id, setData }) {
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState({ name: '', start: '', end: '' })
  // const [courses, setCourses] = useState([]);
  // const [selectedSemester, setSelectedSemester] = useState(null);
  // const [selectedCourse, setSelectedCourse] = useState("");

  const fetchSessions = async () => {
    const data = await window.api.sessions.getSessions()
    // const data = await window.api.sessions.getSession(id);
    if (data.length > 0) {
      setSessions(data)
    }
    setData(data)
    console.log(data)
  }

  // const fetchCourses = async () => {
  //   // const data = await window.api.courses.getCourses();
  //   // setCourses(data);
  // };

  const handleAddSession = async () => {
    if (!form.name || !form.start || !form.end) return alert('All fields required')
    await window.api.sessions.addSession(form.name, form.start, form.end, id)
    setForm({ name: '', start: '', end: '' })
    toast.success('Success!')
    fetchSessions()
  }

  // const handleAddCourse = async () => {
  //   if (!selectedSemester || !selectedCourse) return alert("Select course and semester");
  //   await window.api.sessions.addCourseToSemester(selectedSemester, selectedCourse);
  //   alert("Course added to semester");
  // };

  useEffect(() => {
    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Add new session */}
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-lg">Add New Session</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Level</Label>
            <Select onValueChange={(val) => setForm({ ...form, name: val })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100 Level">100 Level</SelectItem>
                <SelectItem value="200 Level">200 Level</SelectItem>
                <SelectItem value="300 Level">300 Level</SelectItem>
                <SelectItem value="400 Level">400 Level</SelectItem>
                <SelectItem value="500 Level">500 Level</SelectItem>
                <SelectItem value="600 Level">600 Level</SelectItem>
              </SelectContent>
            </Select>
            {/* <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /> */}
          </div>
          <div>
            <Label>Start Year</Label>
            <Input
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </div>
          <div>
            <Label>End Year</Label>
            <Input value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          </div>
        </div>
        <div
          className="bg-green-600 hover:bg-green-700 w-full rounded-md py-2 flex items-center justify-center text-white"
          onClick={handleAddSession}
        >
          Add Session
        </div>
      </Card>

      {/* List sessions and add courses */}
      {sessions &&
        sessions.length !== 0 &&
        sessions.map((session) => (
          <Card key={session.id} className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{session.name}</h3>
              {/* <Button variant="outline" onClick={() => window.api.sessions.setCurrentSession(session.id)}>
              Set Current
            </Button> */}
            </div>

            {/* <div className="grid grid-cols-2 gap-6">
            {session.length > 0 && session.semesters.map((sem) => (
              <div key={sem.id} onClick={()=> setSelectedSemester(sem.id)}>
                <h4 className="font-medium">{sem.name} Semester</h4>
                <Select onValueChange={(val) => setSelectedCourse(val)}>
                  <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="mt-2"
                  onClick={() => {
                    handleAddCourse();
                  }}
                >
                  Add Course
                </Button>
              </div>
            ))}
          </div> */}
          </Card>
        ))}
    </div>
  )
}
