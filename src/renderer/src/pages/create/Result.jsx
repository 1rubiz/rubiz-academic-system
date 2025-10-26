import React, { useState, useEffect, useCallback } from 'react'
import {
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  BookOpen,
  User,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Clock,
  Ban,
  FileX,
  FileCheck
} from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectSeparator,
  SelectItem,
  SelectValue,
  SelectContent
} from '@/components/ui/select'
import CarryoverModal from '../students/CarryOvers'
import { parseCarryoverString } from '@/utils/generateResultSheet'
import { toast } from 'react-toastify'

const ResultUpdateComponent = ({
  student,
  session,
  onResultsUpdate,
  firstSemesterCourses,
  secondSmesterCourses,
  courses
}) => {
  const [semesters] = useState({
    first: firstSemesterCourses || [],
    second: secondSmesterCourses || []
  })
  const [results, setResults] = useState({})
  const [resultValue, setResultValue] = useState([])
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState({})
  const [activeSemester, setActiveSemester] = useState('first')
  const [showCarryovers, setShowCarryovers] = useState(false)
  const [carryovers, setCarryovers] = useState([])

  // Debounced save function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (courseId, data, semester) => {
      await saveResult(courseId, data, semester)
    }, 1000),
    []
  )

  // Fetch courses and existing results
  const getCarryovers = async () => {
    const data = await window.api.carryovers.getCarryovers(student.id)
    const parsed = await parseCarryoverString(data.courses)
    setCarryovers(parsed)
  }
  useEffect(() => {
    fetchStudentResults()
    getCarryovers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSemester])

  const fetchStudentResults = async () => {
    if (!student?.id || !session?.id) return

    setLoading(true)
    try {
      const data = await window.api.result.getStudentResults(
        student.id,
        session.id,
        activeSemester === 'first' ? 1 : 2
      )
      setResultValue(data || [])
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveResult = async (courseId, data, semester) => {
    if (!student?.id || !session?.id) return

    const key = `${courseId}-${semester}`
    setSaveStatus((prev) => ({ ...prev, [key]: 'saving' }))

    try {
      console.log('semster id', semester)
      await window.api.result.updateResult({
        studentId: student.id,
        sessionId: session.id,
        semester: semester,
        courseId: courseId,
        score: data.score,
        status: data.status,
        isCarryover: data.isCarryover,
        ca: data.ca,
        updatedBy: 'course_adviser'
      })

      setSaveStatus((prev) => ({ ...prev, [key]: 'saved' }))

      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [key]: 'idle' }))
      }, 2000)
      toast('Saved!')

      onResultsUpdate?.()
    } catch (error) {
      toast.error('Saving faild! Press ctrl + R to refresh or contact the dev team')
      // console.error('Error saving result:', error);
      setSaveStatus((prev) => ({ ...prev, [key]: 'error' }))
    }
  }

  const handleScoreChange = (courseId, score, semester, currentData = {}) => {
    const key = `${courseId}-${semester}`
    const newData = {
      ...currentData,
      score: parseFloat(score) || 0,
      ca: currentData.ca || 0,
      status: parseFloat(score) >= 0 ? 'valid' : currentData.status
    }

    setResults((prev) => ({
      ...prev,
      [key]: newData
    }))

    debouncedSave(courseId, newData, semester)
  }

  const handleCAChange = (courseId, ca, semester, currentData = {}) => {
    const key = `${courseId}-${semester}`
    const newData = {
      ...currentData,
      score: currentData.score || 0,
      ca: parseFloat(ca) || 0,
      status: currentData.status
    }

    setResults((prev) => ({
      ...prev,
      [key]: newData
    }))

    debouncedSave(courseId, newData, semester)
  }

  const handleStatusToggle = (courseId, newStatus, semester, currentData = {}) => {
    const key = `${courseId}-${semester}`
    const newData = {
      ...currentData,
      status: newStatus,
      ca: newStatus === 'valid' ? currentData.ca || 0 : null,
      score: newStatus === 'valid' ? currentData.score || 0 : null
    }

    setResults((prev) => ({
      ...prev,
      [key]: newData
    }))
    toast('Course status updated')

    debouncedSave(courseId, newData, semester)
  }

  //   const toggleCarryover = (courseId, semester, currentData = {}) => {
  //     const key = `${courseId}-${semester}`;
  //     const newData = {
  //       ...currentData,
  //       isCarryover: !currentData.isCarryover
  //     };

  //     setResults(prev => ({
  //       ...prev,
  //       [key]: newData
  //     }));

  //     debouncedSave(courseId, newData, semester);
  //   };

  const calculateGrade = (score) => {
    if (score >= 70)
      return { grade: 'A', points: 5.0, color: 'text-green-600', bgColor: 'bg-green-50' }
    if (score >= 60)
      return { grade: 'B', points: 4.0, color: 'text-blue-600', bgColor: 'bg-blue-50' }
    if (score >= 50)
      return { grade: 'C', points: 3.0, color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    if (score >= 45)
      return { grade: 'D', points: 2.0, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    if (score >= 40) return { grade: 'E', points: 1.0, color: 'text-red-600', bgColor: 'bg-red-50' }
    return { grade: 'F', points: 0.0, color: 'text-red-700', bgColor: 'bg-red-50' }
  }

  const getStatusConfig = (status) => {
    const configs = {
      valid: { label: 'Valid', color: 'text-green-700', bgColor: 'bg-green-100', icon: FileCheck },
      AB: { label: 'Absent', color: 'text-red-700', bgColor: 'bg-red-100', icon: Ban },
      NA: { label: 'Not Applicable', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: FileX },
      NR: {
        label: 'Not Registered',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        icon: ToggleLeft
      }
    }
    return configs[status] || configs.valid
  }

  const getSaveStatusIcon = (status) => {
    switch (status) {
      case 'saving':
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const StatusToggle = ({ courseId, semester, currentStatus, currentData }) => {
    const resultVal = resultValue.find((c) => c.course_id === courseId)
    const [showDropdown, setShowDropdown] = useState(false)
    const currentConfig = getStatusConfig(resultVal?.status || currentStatus)

    const statusOptions = [
      { value: 'valid', label: 'Valid', icon: FileCheck },
      { value: 'AB', label: 'Absent', icon: Ban },
      { value: 'NA', label: 'Not Applicable', icon: FileX },
      { value: 'NR', label: 'Not Registered', icon: ToggleLeft }
    ]

    return (
      <div className="relative">
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentConfig.bgColor} ${currentConfig.color} hover:opacity-80`}
        >
          <currentConfig.icon className="w-4 h-4" />
          <span>{currentConfig.label}</span>
        </div>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            {statusOptions.map((option) => {
              const config = getStatusConfig(option.value)
              return (
                <button
                  key={resultVal?.status || option.value}
                  onClick={() => {
                    handleStatusToggle(courseId, option.value, semester, currentData)
                    setShowDropdown(false)
                  }}
                  className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-left transition-colors ${
                    currentStatus === option.value ? config.bgColor : 'hover:bg-gray-50'
                  } ${config.color}`}
                >
                  <option.icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const CourseCard = ({ course, semester }) => {
    const resultKey = `${course.id}-${semester}`
    const resultVal = resultValue.find((c) => c.course_id === course.id)
    const result = results[resultKey] || {}
    const score = result.score || ''
    const status = resultVal?.status || result.status || 'valid'
    const isCarryover = result.isCarryover || false
    const gradeInfo = resultVal?.score
      ? calculateGrade(resultVal?.score)
      : score && status === 'valid'
        ? calculateGrade(score)
        : null
    const saveStatusVal = saveStatus[resultKey] || 'idle'

    return (
      <div
        className={`bg-white col-span-1 rounded-lg border p-4 transition-all ${
          isCarryover ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:shadow-md'
        }`}
      >
        {/* Course Header */}
        <div className="flex items-center justify-end w-full">
          <div className="flex items-center space-x-2 ml-4">{getSaveStatusIcon(saveStatusVal)}</div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-gray-900">
                {course.code} - {course.name}
              </h3>
              {isCarryover && (
                <span className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Carryover</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">Units: {course.unit}</p>
          </div>
          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <StatusToggle
              courseId={course.id}
              semester={semester}
              currentStatus={status}
              currentData={result}
            />
          </div>

          {/* <div className='grid grid-rows-2'> */}
          {/* Score Input - Only show for valid status */}
          {status === 'valid' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <Select
                value={resultVal?.score || result.score}
                onValueChange={(val) =>
                  handleScoreChange(course.id, Number(val), semester, resultVal || result || {})
                }
              >
                <SelectTrigger className="col-span-3 w-32">
                  <SelectValue placeholder={resultVal?.score || 'Select Score'} />
                </SelectTrigger>
                <SelectContent className="h-60 overflow-y-scroll">
                  {Array.from({ length: 101 }, (_, index) => (
                    <SelectItem value={parseInt(index)} key={index}>
                      {index}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {status === 'valid' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select CA Score
              </label>
              <Select
                value={resultVal?.ca || result.ca}
                onValueChange={(val) =>
                  handleCAChange(course.id, Number(val), semester, resultVal || result || {})
                }
              >
                <SelectTrigger className="col-span-3 w-32">
                  <SelectValue placeholder={resultVal?.ca || 0} />
                </SelectTrigger>
                <SelectContent className="h-60 overflow-y-scroll">
                  {Array.from({ length: 31 }, (_, index) => (
                    <SelectItem value={parseInt(index)} key={index}>
                      {index}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* </div> */}
        {/*  */}
        <div className="grid grid-cols-3 mt-4">
          {/* Grade Display - Only show for valid status with score */}
          {status === 'valid' && gradeInfo && (
            <>
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <div
                  className={`px-3 py-2 font-bold rounded-md ${gradeInfo.color} ${gradeInfo.bgColor}`}
                >
                  {gradeInfo.grade}
                </div>
              </div>

              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <div className="px-3 py-2 font-semibold text-gray-700 bg-gray-50 rounded-md">
                  {gradeInfo.points}
                </div>
              </div>

              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                <div className="px-3 py-2 font-semibold text-gray-700 bg-gray-50 rounded-md">
                  {(course.unit * gradeInfo.points).toFixed(1)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Message */}
        {status !== 'valid' && (
          <div className="mt-3 p-2 rounded-md bg-gray-100 text-gray-700 text-sm">
            {status === 'AB' && 'Student was absent for this course'}
            {status === 'NA' && 'This course is not applicable for this student'}
            {status === 'NR' && 'Student is not registered for this course'}
          </div>
        )}
      </div>
    )
  }

  const SemesterTab = ({ semester, courses }) => (
    <div className="space-y-4">
      {courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No courses found for {semester} semester</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} semester={semester} />
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500 mr-2" />
        <span className="text-gray-600">Loading student results...</span>
      </div>
    )
  }

  return (
    <div className="px-6 pt-12 relative">
      {/* Student Info Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {student?.first_name} {student?.last_name}
              </h1>
              <p className="text-gray-600">
                {student?.matric_no} • Level {student?.level} • {student?.department_name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-semibold">{session?.name}</span>
            </div>
            <p className="text-sm text-gray-500">Session Results</p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCarryovers(!showCarryovers)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                showCarryovers
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{showCarryovers ? 'Hide' : 'Show'} Carryovers</span>
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Auto-save enabled</span> • Changes save automatically
          </div>
        </div>
      </div>

      {/* Semester Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['first', 'second'].map((semester) => (
              <div
                key={semester}
                onClick={() => setActiveSemester(semester)}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeSemester === semester
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {semester.charAt(0).toUpperCase() + semester.slice(1)} Semester
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {semesters[semester]?.length || 0}
                </span>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <SemesterTab semester={activeSemester} courses={semesters[activeSemester]} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(results).filter((key) => key.endsWith(activeSemester)).length}
          </div>
          <div className="text-sm text-gray-600">Courses Updated</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(saveStatus).filter((s) => s === 'saved').length}
          </div>
          <div className="text-sm text-gray-600">Successfully Saved</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{carryovers.length}</div>
          <div className="text-sm text-gray-600">Carryover Courses</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {semesters[activeSemester]?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Total Courses</div>
        </div>
      </div>
      <CarryoverModal
        studentId={student.id}
        onClose={() => {
          setShowCarryovers(false)
          getCarryovers()
        }}
        isOpen={showCarryovers}
        courses={courses}
        carryovers={carryovers}
      />
    </div>
  )
}

// Debounce utility function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default ResultUpdateComponent
