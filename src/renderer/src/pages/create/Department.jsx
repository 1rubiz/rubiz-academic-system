import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { toast } from 'react-toastify'
// import { DepartmentRepo } from "@/lib/db";

// type Department = {
//   id: number;
//   name: string;
//   code: string;
// };

// eslint-disable-next-line react/prop-types
export default function DepartmentPage({ id }) {
  const [departments, setDepartments] = useState([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  // Mock local DB fetch (replace with IPC in Electron)
  const fetchDepartments = async () => {
    const res = await window.api.departments.getDepartments()
    console.log(res)
    setDepartments(res)
  }

  const handleAdd = async () => {
    console.log(id)
    if (!id) {
      alert('Select a faculty')
    }
    await window.api.departments.addDepartment(name, code, id)
    setName('')
    setCode('')
    toast.success('Success!')
    fetchDepartments()
  }

  // const handleDelete = async (id) => {
  //   await window.api.departments.deleteDepartment(id);
  //   fetchDepartments();
  // };

  useEffect(() => {
    fetchDepartments()
  }, [])

  return (
    <div className="w-full bg-white p-4 space-y-6 scrollbar h-full">
      <h1 className="text-2xl font-bold">Departments</h1>

      {/* Add form */}
      <div className="grid grid-cols-5 gap-2">
        <input
          className="text-slate-900 col-span-3 px-4 border rounded-md h-10"
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="text-slate-900 col-span-2 px-4 border rounded-md"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="w-full flex items-center justify-center py-4">
        <button
          onClick={handleAdd}
          className="w-sm text-center cursor-pointer bg-green-600 flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-green-700 transition"
        >
          Add
        </button>
      </div>

      {/* List */}
      <Card className="p-4 flex flex-col items-center justify-center">
        <ul className="space-y-2 h-14 w-14 text-xl animate-pulse bg-green-700 rounded-full flex items-center justify-center text-white">
          {departments.length}
          {/* {departments.map((dept) => (
            <li
              key={dept.id}
              className="flex justify-between items-center p-2 border rounded"
            >
              <span>
                {dept.name} ({dept.code})
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(dept.id)}
              >
                Delete
              </Button>
            </li>
          ))} */}
        </ul>
      </Card>
    </div>
  )
}
