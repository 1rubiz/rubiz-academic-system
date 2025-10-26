import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'react-toastify'

export default function MarksheetModal({
  open,
  onClose,
  courses,
  session,
  department,
  facultyName
}) {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerate = async () => {
    if (!selectedCourse) return alert('Select a course first!')
    setLoading(true)
    console.log(selectedCourse.id, session.id, department.name)
    const res = await window.api.result.generateMarksheet({
      course_id: selectedCourse.id,
      session_id: session.id,
      department_name: department.code,
      faculty_name: facultyName
    })
    setLoading(false)
    setResult(res)
    toast.success('Marksheet downloaded')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 space-y-4 text-primary">
        <DialogHeader className="">Generate Marksheet</DialogHeader>

        <Select onValueChange={(val) => setSelectedCourse(JSON.parse(val))}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={JSON.stringify(course)}>
                {course.name} ({course.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {result && (
          <div className="text-sm text-green-300">
            ✅ Marksheet generated for {result.count} students.
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-blue-500" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
