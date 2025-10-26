/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'

export default function StudentPage({ facultyId, department, level, onComplete }) {
  const [tab, setTab] = useState('conventional') // "conventional" | "byMatric"
  const [matricNo, setMatricNo] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [mode, setMode] = useState('u')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!department) return toast.error('Select a department first!')
    if (matricNo.length !== 7)
      return toast.error('Mat number must be 7 digits, Faculty name will attach itself')
    await window.api.students.addStudent({
      matric_no: matricNo,
      first_name: firstName,
      last_name: lastName,
      level,
      department_id: department.id,
      faculty_id: facultyId
    })
    setMatricNo('')
    setFirstName('')
    setLastName('')
    onComplete()
    toast.success('Success!')
  }

  const handleSearch = async () => {
    if (!matricNo) return alert('Enter a matric number!')
    setLoading(true)
    const res = await window.api.students.serchByMatric(matricNo)
    setSearchResult(res.success ? res.student : null)
    setLoading(false)
    toast.success('Success!')
  }

  const handleAddExisting = async () => {
    if (!searchResult) return
    const res = await window.api.students.addStudent({
      matric_no: searchResult.matric_no,
      first_name: searchResult.first_name,
      last_name: searchResult.last_name,
      level,
      department_id: searchResult.department_id,
      faculty_id: searchResult.faculty_id
    })
    alert(res.message)
    onComplete()
    handleSearch() // refresh
  }

  const handleDelete = async () => {
    if (!searchResult) return
    if (!confirm('Remove this student from the current level?')) return
    await window.api.students.updateStudent(searchResult.id, {
      [`is_${level}_active`]: 0
    })
    // toast.success('Student removed from level successfully.')
    handleSearch()
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 text-primary">
      <h1 className="text-2xl font-bold">Students</h1>

      {/* Tabs */}
      <div className="w-full grid grid-cols-2 gap-4">
        <Button
          className={`col-span-1 w-full flex items-center cursor-pointer justify-center text-white hover:bg-slate-600 py-1.5 ${tab === 'conventional' ? 'bg-slate-800' : 'text-slate-800 bg-none border-none shadow-lg'}`}
          variant={tab === 'conventional' ? 'default' : 'outline'}
          onClick={() => setTab('conventional')}
        >
          Add New
        </Button>
        <Button
          className={`col-span-1 w-full flex items-center cursor-pointer justify-center text-white hover:bg-slate-600 py-1.5 ${tab === 'byMatric' ? 'bg-slate-800' : 'text-slate-800 bg-none border-none shadow-lg'}`}
          variant={tab === 'byMatric' ? 'default' : 'secondary'}
          onClick={() => setTab('byMatric')}
        >
          Add by Matric No
        </Button>
      </div>

      {/* Conventional Add */}
      {tab === 'conventional' && (
        <div className="grid grid-cols-6 gap-2 items-center min-h-48">
          <label htmlFor="mat" className="col-span-3">
            Mat Number
            <Input
              id="mat"
              placeholder="Matric No"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
            />
          </label>
          <label htmlFor="" className="col-span-3">
            First Name
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
            />
          </label>
          <label htmlFor="" className="col-span-3">
            Last Name
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
            />
          </label>
          <label htmlFor="" className="col-span-3">
            Mode of Entry
            <Input
              placeholder="Mode of Entry"
              value={mode.toUpperCase()}
              onChange={(e) => setMode(e.target.value)}
              className="col-span-3"
            />
          </label>
          <label htmlFor="" className="col-span-6">
            Department
            <Input
              placeholder="Department"
              value={department?.name || ''}
              readOnly
              className="col-span-3"
            />
          </label>
          <div
            className="col-span-6 cursor-pointer rounded-md flex items-center text-white justify-center py-2 bg-blue-400"
            onClick={handleAdd}
          >
            Register
          </div>
        </div>
      )}

      {/* Add by Matric */}
      {tab === 'byMatric' && (
        <div className="space-y-4 min-h-48 flex flex-col items-center justify-center">
          <div className="fle gap-2 w-full">
            <label>
              Mat Number
              <Input
                placeholder="Search Matric No"
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
              />
            </label>
            <div className="py-4">
              <Button className="w-1/2" onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {searchResult && (
            <div className="p-3 border rounded-md w-full space-y-2">
              <div>
                <strong>{searchResult.matric_no}</strong> — {searchResult.first_name}{' '}
                {searchResult.last_name}
              </div>
              <div className="text-sm text-gray-500">
                {searchResult.department_name} | Faculty: {searchResult.faculty_name}
              </div>

              {searchResult[`is_${level}_active`] ? (
                <div className="flex items-center gap-3">
                  <span className="text-green-600 font-semibold">Already in level {level}</span>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    Remove from Level
                  </Button>
                </div>
              ) : (
                <Button className="bg-blue-400" size="sm" onClick={handleAddExisting}>
                  Add to Level {level}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
