import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { toast } from 'react-toastify'
// type Department = {
//   id: number;
//   name: string;
// };

// type Course = {
//   id: number;
//   name: string;
//   code: string;
//   unit: number;
//   department_id: number;
//   department_name: string;
// };

export default function CoursePage() {
  const [courses, setCourses] = useState([])
  const [departments, setDepartments] = useState([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [unit, setUnit] = useState(3)
  const [departmentId, setDepartmentId] = useState(null)
  const [description, setDescription] = useState('')

  const fetchData = async () => {
    const [depts, crs] = await Promise.all([
      window.api.departments.getDepartments(),
      window.api.courses.getCourses()
    ])
    console.log(depts)
    setDepartments(depts)
    setCourses(crs)
  }

  const handleAdd = async () => {
    if (!departmentId) return alert('Select a department first!')
    console.log(departmentId)
    await window.api.courses.addCourse(name, code, unit, departmentId, description)
    setName('')
    setCode('')
    setUnit(3)
    fetchData()
    toast.success('Success!')
  }

  // const handleDelete = async (id) => {
  //   await window.api.courses.deleteCourse(id);
  //   fetchData();
  // };

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Courses</h1>

      {/* Add form */}
      <div className="grid grid-cols-6 gap-2 items-center">
        <input
          placeholder="Course Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-slate-900 col-span-3 px-4 border rounded-md h-10"
        />
        <Input
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="text-slate-900 col-span-3 px-4 border rounded-md h-10"
        />
        <Input
          type="number"
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(parseInt(e.target.value))}
          className="text-slate-900 col-span-3 px-4 border rounded-md h-10"
        />
        <Select onValueChange={(val) => setDepartmentId(Number(val))}>
          <SelectTrigger className="text-slate-900 col-span-3">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-slate-900 col-span-6 px-4 border rounded-md h-10"
        />
        <div
          className="bg-green-600 col-span-6 hover:bg-green-700 w-full rounded-md py-2 flex items-center justify-center text-white"
          onClick={handleAdd}
        >
          Add Course
        </div>
      </div>

      {/* List */}
      <Card className="p-4 flex flex-col items-center justify-center">
        <ul className="space-y-2 h-14 w-14 text-xl animate-pulse bg-green-700 rounded-full flex items-center justify-center text-white">
          {courses.length}
        </ul>
      </Card>
      {/* <ul className="space-y-2">
        {courses.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center p-2 border rounded"
          >
            <span>
              {c.code} – {c.name} ({c.unit} units) [{c.department_name}]
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(c.id)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul> */}
    </div>
  )
}
