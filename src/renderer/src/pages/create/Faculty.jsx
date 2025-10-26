import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'react-toastify'

export default function FacultyManager() {
  const [faculties, setFaculties] = useState([])
  const [form, setForm] = useState({ name: '', code: '' })
  const [isEditing, setIsEditing] = useState(null)

  const fetchFaculties = async () => {
    const data = await window.api.faculties.getFaculties()
    setFaculties(data)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.code) return alert('All fields are required')
    if (isEditing) {
      await window.api.faculties.updateFaculty(isEditing, form)
      setIsEditing(null)
    } else {
      await window.api.faculties.addFaculty(form.name, form.code)
    }
    toast.success('Success!')
    setForm({ name: '', code: '' })
    fetchFaculties()
  }

  // const handleEdit = (faculty) => {
  //   setForm({ name: faculty.name, code: faculty.code });
  //   setIsEditing(faculty.id);
  // };

  // const handleDelete = async (id) => {
  //   if (confirm("Delete this faculty?")) {
  //     await window.api.faculties.deleteFaculty(id);
  //     fetchFaculties();
  //   }
  // };

  useEffect(() => {
    console.log(window.api)
    fetchFaculties()
  }, [])

  return (
    <div className="p-6 space-y-6 w-full">
      <Card className="p-4 space-y-3 w-full">
        <h2 className="text-lg font-semibold">{isEditing ? 'Edit Faculty' : 'Add Faculty'}</h2>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Code</Label>
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <Button onClick={handleSubmit}>{isEditing ? 'Update Faculty' : 'Add Faculty'}</Button>
      </Card>

      <Card className="p-4 flex flex-col items-center justify-center">
        <h3 className="text-md font-semibold mb-3">Number of Faculties</h3>
        <ul className="space-y-2 h-14 w-14 text-xl animate-pulse bg-green-700 rounded-full flex items-center justify-center text-white">
          {faculties.length}
          {/* {faculties.map((faculty) => (
            <li
              key={faculty.id}
              className="flex justify-between items-center border p-2 rounded-md"
            >
              <div>
                <p className="font-medium">{faculty.name}</p>
                <p className="text-sm text-gray-500">{faculty.code}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(faculty)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(faculty.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))} */}
        </ul>
      </Card>
    </div>
  )
}
