import React, { useState, useEffect } from 'react'
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'react-toastify'

export default function CarryoverModal({ isOpen, onClose, studentId, courses }) {
  //   const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('')
  const [carryovers, setCarryovers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [score, setScore] = useState(0)

  // Fetch all courses
  const getCarryovers = async () => {
    const data = await window.api.carryovers.getCarryovers(studentId)
    console.log(data.courses)
    const parsed = await parseCarryoverString(data.courses)
    console.log(parsed)
    setCarryovers(parsed)
  }
  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      getCarryovers()
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentId])

  const parseCarryoverString = (str) => {
    if (!str) return []
    return str
      .split('-')
      .filter(Boolean)
      .map((item) => {
        const match = item.match(/([A-Z]+\d+)(id)(\d+)(SC)(\d+)/)
        if (!match) return null
        return {
          code: match[1],
          courseId: Number(match[3]),
          score: Number(match[5])
        }
      })
      .filter(Boolean)
  }

  const handleAdd = () => {
    const course = courses.find((c) => c.id == selectedCourse)
    if (!course) return
    console.log(course)
    if (carryovers.some((c) => c.courseId === course.id)) return

    setCarryovers((prev) => [
      ...prev,
      { code: `${course.name}${course.code}`, courseId: course.id, score }
    ])
  }

  const handleRemove = (id) => {
    setCarryovers((prev) => prev.filter((c) => c.courseId !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    if (!carryovers.length) {
      await window.api.carryovers.saveCarryovers({ studentId, formatted: '' })
      setSaving(false)
      toast.success('Saved successfully')
      return
    }

    const formatted = carryovers.map((c) => `${c.code}id${c.courseId}SC${c.score}-`).join('')

    await window.api.carryovers.saveCarryovers({ studentId, formatted })
    alert('Saved successfully')
    setSaving(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-[400px] p-5 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
            Manage Carryovers ({carryovers.length})
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            ✖
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center">Loading courses...</p>
        ) : (
          <>
            <div className="w-full grid grid-cols-2 gap-2 mb-3">
              <Select value={selectedCourse} onValueChange={(val) => setSelectedCourse(val)}>
                <SelectTrigger className="col-span-1 w-full">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent className="h-60 overflow-y-scroll">
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={score} onValueChange={(val) => setScore(Number(val))}>
                <SelectTrigger className="col-span-1 w-full">
                  <SelectValue placeholder="Select Score" />
                </SelectTrigger>
                <SelectContent className="h-60 overflow-y-scroll">
                  {Array.from({ length: 40 }, (_, index) => (
                    <SelectItem value={parseInt(index)} key={index}>
                      {index}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div
                onClick={handleAdd}
                className="bg-blue-600 col-end-2 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto border rounded-lg p-2 mb-3">
              {carryovers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">No carryovers added yet.</p>
              ) : (
                carryovers.map((c) => (
                  <div
                    key={c.courseId}
                    className="flex justify-between items-center py-1 border-b border-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {c.code} (Score: {c.score})
                    </span>
                    <button
                      onClick={() => handleRemove(c.courseId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="border border-gray-400 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`${
                  saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                } text-white px-4 py-2 rounded-lg`}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
