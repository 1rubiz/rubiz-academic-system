import { useEffect, useState } from 'react'
import {
  Plus,
  ChevronRight,
  Users,
  Calendar,
  // BookOpen,
  // Search,
  Edit,
  Trash2,
  GraduationCap,
  Download,
  FileUp,
  PlusCircle,
  TicketCheckIcon,
  TicketXIcon,
  BookTypeIcon,
  UsersIcon
  // ReceiptTextIcon
} from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import FacultyManager from './Faculty'
import SessionManager from './Session'
import CoursePage from './Course'
import DepartmentPage from './Department'
import StudentPage from '../students/Page'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import ResultUpdateComponent from './Result'
import ExcelUploader from '../students/Upload'
// import { Switch } from '@/components/ui/switch'
import MarksheetModal from '../students/Marksheetmodal'
import StudentSearch from '../students/_components/search'
import { toast } from 'react-toastify'
// import { generateResultExcel } from '@/utils/generateResultSheet';

export default function AcademicRecordDashboard() {
  const [currentStep, setCurrentStep] = useState('main')
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [departments, setDepartments] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [showFacultyModal, setShowFacultyModal] = useState(false)
  const [showYearModal, setShowYearModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showDepartmentModal, setShowdDepartmentModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courses, setCourses] = useState([])
  const [firstSmesterCourses, setFirstSemesterCourses] = useState([])
  const [secondSmesterCourses, setSecondSemesterCourses] = useState([])
  const [sessions, setSessions] = useState([])
  const [level, setLevel] = useState(100)
  const [showMarksheet, setShowMarksheet] = useState(false)

  const [faculties, setFaculties] = useState([])
  const [academicYears, setAcademicYears] = useState()
  const [students, setStudents] = useState([])
  const [studentSummary, setStudentSummary] = useState({ total: 0, complete: 0, incomplete: 0 })
  const [studentFilter, setStudetFilter] = useState('all')

  //   const [newFaculty, setNewFaculty] = useState({ name: '', departments: '', students: '' });
  //   const [newYear, setNewYear] = useState({ year: '', status: 'Active' });
  const fetchCourses = async () => {
    const data = await window.api.courses.getCourses()
    setCourses(data)
    toast.success('Courses are set!')
    // console.log(await window.api.sessions.getAllSemesterSessions())
  }
  const fetchFaculties = async () => {
    const data = await window.api.faculties.getFaculties()
    setFaculties(data)
    // console.log(data)
  }

  const changeStatus = async (id, status) => {
    await window.api.students.updateStudentStatus({
      studentId: id,
      status: status
    })
    fetchStudents()
  }

  const fetchStudents = async () => {
    filterStudents()
    // fetchStudentsByDepartmentAndLevel(selectedDepartment && selectedDepartment.id, level)
    // console.log(await window.api.students.getStudents())
  }

  const sessionalResult = async (sessionId, departmentId) => {
    await window.api.result.handleExport(
      sessionId,
      departmentId,
      `${selectedYear.start_year}/${selectedYear.end_year}`
    )
    toast.success('Sessional result downloaded successfully!')
    // generateResultExcel(results, "2024_2025_Session")
    // console.log(results)
  }

  const handleAddCourse = async (sem) => {
    // console.log(selectedSemester, selectedCourse)
    if (!sem || !selectedCourse) return alert('Select course and semester')
    try {
      await window.api.sessions.addCourseToSemester(sem, selectedCourse)
      // alert("Course added to semester");
      fetchSemesterCourses()
      toast.success('New Course Added')
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      toast.error('Failed to add course')
    }
  }

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty)
    // setCurrentStep('year');
    // console.log(faculty)
  }

  const removeCourseFromSemester = async (semesterId, courseId) => {
    try {
      await window.api.sessions.removeCourseFromSemester(semesterId, courseId)
      fetchSemesterCourses()
      toast.success('Course removed successfully')
    } catch (error) {
      toast.error('Failed to remove course')
    }
  }

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department)
    setCurrentStep('year')
  }

  const handleYearSelect = async (year) => {
    await window.api.sessions.setCurrentSession(year.id)
    setSelectedYear(year)
    setLevel(parseInt(year.name.split(' ')[0]))
    // console.log(year)
  }

  const filterStudents = async (completion = studentFilter, order = 'desc') => {
    console.log(completion)
    const { students, summary } = await window.api.students.filterStudents({
      level,
      department_id: selectedDepartment.id,
      completion,
      order
    })
    setStudents(students)
    console.log(students)
    setStudentSummary(summary)
  }

  useEffect(() => {
    if (selectedDepartment) {
      filterStudents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentFilter])

  const fetchDepartmentsByFaculty = async () => {
    console.log(selectedFaculty.id)
    const data = await window.api.departments.getDepartmentByFaculty(selectedFaculty.id)
    // console.log(data)
    setDepartments(data)
  }
  // const fetchStudentsByDepartmentAndLevel = async(dept)=>{
  //     const data = await window.api.students.getStudentByLevelAndDept(dept, level)
  //     // console.log(data)
  //     setStudents(data)
  // }
  const fetchSessions = async () => {
    const data = await window.api.sessions.getSession(selectedFaculty.id)
    // const data = await window.api.sessions.getSessions();
    setAcademicYears(data)
    console.log('years', data)
    // console.log(data)
  }

  const fetchAllSessions = async () => {
    const data = await window.api.sessions.getSessions()
    // const data = await window.api.sessions.getSessions();
    setSessions(data)
    console.log('years', data)
  }

  const fetchSemesterCourses = async () => {
    const firstData = await window.api.sessions.getSemesterCourses(selectedYear?.semesters[0].id)
    const secondData = await window.api.sessions.getSemesterCourses(selectedYear?.semesters[1].id)

    setFirstSemesterCourses(firstData)
    setSecondSemesterCourses(secondData)
    // const data = await window.api.sessions.getSessions();
    // setAcademicYears(data)
    // console.log({ firstData, secondData })
  }

  // useEffect(()=>{
  //     if(level !== 0){
  //         fetchStudentsByDepartmentAndLevel(selectedDepartment && selectedDepartment.id, level)
  //     }else{
  //         fetchStudents()
  //     }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [level])

  useEffect(() => {
    fetchFaculties()
    fetchCourses()
    fetchAllSessions()
  }, [])

  const toggleLevelComplete = async (id, value) => {
    console.log('clicked', value)
    await window.api.students.setStudentLevelActive(id, level)
    filterStudents()
    toast.success('Hurrayy, another student result completed!')
  }

  useEffect(() => {
    if (currentStep === 'year') {
      fetchSessions()
    }
    if (currentStep === 'students') {
      // fetchStudentsByDepartmentAndLevel(selectedDepartment && selectedDepartment.id, level)
      filterStudents()
    }
    if (currentStep === 'main' && selectedFaculty) {
      fetchDepartmentsByFaculty()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, selectedFaculty])

  useEffect(() => {
    if (selectedYear) {
      fetchSemesterCourses()
      // console.log({selectedYear: selectedYear.id, dep: selectedDepartment.id})
      // sessionalResult(selectedYear.id, selectedDepartment.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear])

  const renderBreadcrumb = () => (
    <div className="w-full flex items-center justify-between pb-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button onClick={() => setCurrentStep('main')} className="hover:text-blue-600">
          Dashboard
        </button>
        {selectedFaculty && (
          <>
            <ChevronRight size={16} />
            <button onClick={() => setCurrentStep('year')} className="hover:text-blue-600">
              {selectedFaculty.name}
            </button>
          </>
        )}
        {selectedDepartment && (
          <>
            <ChevronRight size={16} />
            <button
              onClick={() => setCurrentStep('main')}
              className="hover:text-blue-600 w-32 overflow-clip text-nowrap"
            >
              {selectedDepartment.name}
            </button>
          </>
        )}
        {selectedYear && (
          <>
            <ChevronRight size={16} />
            <span
              onClick={() => setCurrentStep('year')}
              className="text-gray-900 hover:underline cursor-pointer"
            >
              {selectedYear.start_year} / {selectedYear.end_year}
            </span>
            <ChevronRight size={16} />
            <span className="font-bold">{level} Level</span>
          </>
        )}
      </div>
      <div className="h-full flex items-center justify-center">
        <Button className="flex items-center gap-2" onClick={() => setShowCourseModal(true)}>
          {' '}
          <BookTypeIcon /> Create Course
        </Button>
      </div>
    </div>
  )

  const renderMainDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Academic Records Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg py-4 px-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Faculties</p>
              <h3 className="text-3xl font-bold mt-1">{faculties.length}</h3>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg py-4 px-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Academic Years</p>
              <h3 className="text-3xl font-bold mt-1">{sessions?.length}</h3>
            </div>
            <Calendar size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-lg py-4 px-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Students</p>
              <h3 className="text-3xl font-bold mt-1">1,350</h3>
            </div>
            <GraduationCap size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Select or Create Faculty</h2>
          <button
            onClick={() => setShowFacultyModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Create Faculty
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculties.map((faculty) => (
            <div
              key={faculty.id}
              onClick={() => handleFacultySelect(faculty)}
              className={`${selectedFaculty && selectedFaculty.id === faculty.id ? 'border-blue-500 border-2' : 'border-gray-200  border'} rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{faculty.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{faculty.departments} Departments</p>
                    <p>{faculty.students} Students</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400 mt-1" size={20} />
              </div>
            </div>
          ))}
        </div>
        {selectedFaculty && (
          <div className="w-full shadow my-4 p-4">
            <div className="w-full flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Select or Create Department</h2>
              <Button className="bg-black" onClick={() => setShowdDepartmentModal(true)}>
                Create Department
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {departments &&
                departments.map((department) => (
                  <div
                    key={department.id}
                    onClick={() => handleDepartmentSelect(department)}
                    className={`${selectedDepartment && selectedDepartment.id === department.id ? 'border-blue-500 border-2' : 'border-gray-200  border'} rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{department.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>CODE - {department.code}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400 mt-1" size={20} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderYearSelection = () => (
    <div className="space-y-6">
      {renderBreadcrumb()}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Select or Create Academic Year</h2>
          <button
            onClick={() => setShowYearModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={18} />
            Create Academic Year
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {academicYears?.length > 0 &&
            academicYears?.map((year) => (
              <div
                key={year.id}
                onClick={() => handleYearSelect(year)}
                className={`border border-gray-200 rounded-lg ${selectedYear?.id === year.id && 'border-green-700 border-2'} p-4 hover:border-green-500 hover:shadow-lg transition cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {year.start_year} / {year.end_year}
                    </h3>
                    <div className="space-y-1 text-sm">
                      {/* <span className={`inline-block px-2 py-1 rounded text-xs ${
                      year.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {year.status}
                    </span> */}
                      <p className="text-gray-600 mt-2">{year.name}</p>
                      {/* <p className="text-gray-600 mt-2">{year.students} Students</p> */}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 mt-1" size={20} />
                </div>
              </div>
            ))}
        </div>
      </div>
      {selectedYear && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* {(sessions && sessions.length !== 0) && sessions.map((session) => (
                    <Card key={session.id} className="p-4 space-y-3"> */}
          <div className="flex justify-end w-full">
            {/* <h3 className="font-semibold"></h3> */}
            <Button
              className="bg-blue-400 flex items-center gap-2"
              onClick={() => setCurrentStep('students')}
            >
              <UsersIcon /> Manage Students
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {selectedYear?.semesters.map((sem, key) => (
              <div key={sem.id}>
                <h4 className="font-medium">{sem.name} Semester</h4>
                <Select onValueChange={(val) => setSelectedCourse(val)}>
                  <SelectTrigger className="text-primary">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => {
                      // if (c.code[1] === (key + 1).toString()) {
                      return (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name} - {c.code}
                        </SelectItem>
                      )
                      // }
                    })}
                  </SelectContent>
                </Select>
                <Button
                  className="bg-green-600 mt-2 rounded-md border shadow-md my-2 w-fit flex items-center gap-2 text-white py-1 px-4 cursor-pointer hover:bg-green-700"
                  onClick={async () => {
                    handleAddCourse(sem.id)
                  }}
                >
                  <PlusCircle size={10} />
                  Add Course
                </Button>
                <div className="space-y-2 py-2">
                  {key === 0
                    ? firstSmesterCourses &&
                      firstSmesterCourses.map((item) => {
                        return (
                          <div
                            key={item.id}
                            className="space-y-2 flex items-center justify-between border shadow-md py-2 px-6 rounded-md text-primary"
                          >
                            <div className="font-semibold flex flex-col gap-2 h-full items-start justify-center">
                              <div className="h-full">
                                {item.name} {item.code}{' '}
                                <span className="font-normal">(unit - {item.unit})</span>
                              </div>
                              {/* <div> unit - {item.unit} </div> */}
                            </div>
                            <div>
                              <Trash2
                                className="text-red-400 cursor-pointer"
                                onClick={() =>
                                  removeCourseFromSemester(item.semester_id, item.course_id)
                                }
                              />
                            </div>
                          </div>
                        )
                      })
                    : secondSmesterCourses &&
                      secondSmesterCourses.map((item) => {
                        return (
                          <div
                            key={item.id}
                            className="space-y-2 flex items-center text-primary justify-between border shadow-md py-2 px-6 rounded-md"
                          >
                            <div className="font-semibold flex flex-col gap-2 h-full items-start justify-center">
                              <div className="h-full">
                                {item.name} {item.code}{' '}
                                <span className="font-normal">(unit - {item.unit})</span>
                              </div>
                              {/* <div> unit - {item.unit} </div> */}
                            </div>
                            <div>
                              <Trash2
                                className="text-red-400 cursor-pointer"
                                onClick={() =>
                                  removeCourseFromSemester(item.semester_id, item.course_id)
                                }
                              />
                            </div>
                          </div>
                        )
                      })}
                </div>
              </div>
            ))}
          </div>
          {/* </Card>
                ))} */}
        </div>
      )}
    </div>
  )

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {renderBreadcrumb()}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg px-4 py-2 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Students</p>
                <h3 className="text-3xl font-bold mt-1">{studentSummary.total}</h3>
              </div>
              <Users size={20} className="opacity-80" />
            </div>
          </div>
          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg px-4 py-2 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <h3 className="text-3xl font-bold mt-1">{studentSummary.complete}</h3>
              </div>
              <TicketCheckIcon size={20} className="opacity-80" />
            </div>
          </div>
          <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-lg px-4 py-2 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">InComplete</p>
                <h3 className="text-3xl font-bold mt-1">{studentSummary.incomplete}</h3>
              </div>
              <TicketXIcon size={20} className="opacity-80" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 mb-6 flex-wrap py-4">
          <div className="col-span-2 flex-nowrap flex gap-2 items-center">
            <h2 className="text-2xl font-bold text-gray-900">{selectedFaculty?.name}</h2>
            {/* <p className="text-gray-600">{selectedYear?.start_year} / {selectedYear.end_year}</p> */}
          </div>
          <div className="col-span-10 flex items-center flex-wrap gap-4">
            <div className="w-44">
              <Select value={studentFilter} onValueChange={(val) => setStudetFilter(val)}>
                <SelectTrigger className="text-primary">
                  <SelectValue className="w-32" placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="complete">Completed</SelectItem>
                  <SelectItem value="incomplete">In Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              onClick={() => sessionalResult(selectedYear.id, selectedDepartment.id)}
              className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={18} />
              Download Result
            </div>
            <div
              onClick={() => setShowMarksheet(true)}
              className="flex cursor-pointer items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <Download size={18} />
              Download Mark Sheet
            </div>
            <div
              onClick={() => setShowUploadModal(true)}
              className="flex cursor-pointer items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <FileUp size={18} />
              Upload students
            </div>
            <div
              onClick={() => setShowStudentModal(true)}
              className="flex cursor-pointer items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              <Plus size={18} />
              Add Student
            </div>
          </div>
        </div>
        {/* search */}
        <StudentSearch
          departmentId={selectedDepartment.id}
          onResults={setStudents}
          fetchAll={fetchStudents}
        />

        <div className="overflow-x-auto text-primary">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Matric No.
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                {/* <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">CGPA</th> */}
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {selectedFaculty?.code}
                    {student.matric_no}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{level}</td>
                  {/* <td className="px-4 py-3 text-sm text-gray-900">{student.cgpa}</td> */}
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2 items-center">
                      <Sheet>
                        <SheetTrigger>
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition">
                            <Edit size={16} />
                          </button>
                        </SheetTrigger>
                        <SheetContent>
                          <ResultUpdateComponent
                            student={{
                              id: student.id,
                              matric_no: `${selectedFaculty?.code}${student.matric_no}`,
                              first_name: student.first_name,
                              last_name: student.last_name,
                              level: student.level,
                              department_name: selectedDepartment.name
                            }}
                            session={{
                              id: 1,
                              name: `${selectedYear.start_year} / ${selectedYear.end_year}`
                            }}
                            onResultsUpdate={() => console.log('Results updated')}
                            firstSemesterCourses={firstSmesterCourses}
                            secondSmesterCourses={secondSmesterCourses}
                            courses={courses}
                          />
                        </SheetContent>
                      </Sheet>
                      {/* const allowed = ["active", "suspend", "d", "e", "f", "g", "h", "i"]; */}
                      <div className="w-32">
                        <Select
                          value={student.status}
                          onValueChange={(val) => changeStatus(student.id, val)}
                        >
                          <SelectTrigger>
                            <SelectValue className="w-32" placeholder="Select Course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspend">Suspend</SelectItem>
                            <SelectItem value="d">Withdrawal</SelectItem>
                            <SelectItem value="e">Previously on probation</SelectItem>
                            <SelectItem value="f">Medical case</SelectItem>
                            <SelectItem value="g">Absent</SelectItem>
                            <SelectItem value="h">Withheld Result</SelectItem>
                            <SelectItem value="i">Expelled</SelectItem>
                            <SelectItem value="j">Temporary Withdrawal</SelectItem>
                            <SelectItem value="k">Unregistered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* <button className="p-1 text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 size={16} />
                      </button> */}
                      <div
                        onClick={() => toggleLevelComplete(student.id, level)}
                        className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 ${
                          student[`is_${level}_complete`] ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        aria-label={`Toggle ${level} complete`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                            student[`is_${level}_complete`] ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </div>

                      {/* <Switch checked={student[`is_${level}_complete`] === true} onClick={()=>toggleLevelComplete(student.id, !student[`is_${level}_complete`])}/> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto lg:max-w-full">
        {currentStep === 'main' && renderMainDashboard()}
        {currentStep === 'year' && renderYearSelection()}
        {currentStep === 'students' && renderStudentDashboard()}
      </div>

      {showFacultyModal && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
          <div className="min-w-md max-w-md">
            <FacultyManager />
            <Button
              onClick={async () => {
                await fetchFaculties()
                setShowFacultyModal(false)
              }}
              className="w-md text-center cursor-pointer flex-1 px-4 py-5 border-2 border-gray-300 rounded-lg hover:bg-slate-700 transition"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showYearModal && (
        <div className="absolute inset-0 bg-white overflow-y-scroll bg-opacity-50 flex items-center justify-center z-50">
          <div className="min-w-md max-w-md">
            <SessionManager id={selectedFaculty.id} setData={setAcademicYears} />
            <Button
              onClick={async () => {
                await fetchSessions()
                setShowYearModal(false)
              }}
              className="w-md text-center cursor-pointer flex-1 px-4 py-5 border-2 border-gray-300 rounded-lg hover:bg-slate-700 transition"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="absolute inset-0 bg-white overflow-y-scroll bg-opacity-50 flex items-center justify-center z-50">
          <div className="min-w-md max-w-md">
            <CoursePage />
            <Button
              onClick={async () => {
                await fetchCourses()
                setShowCourseModal(false)
              }}
              className="w-md text-center cursor-pointer flex-1 px-4 py-5 border-2 border-gray-300 rounded-lg hover:bg-slate-700 transition"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showDepartmentModal && (
        <div className="absolute inset-0 bg-white overflow-y-scroll bg-opacity-50 flex items-center justify-center z-50">
          <div className="min-w-md max-w-md">
            <DepartmentPage id={selectedFaculty && selectedFaculty.id} />
            <Button
              onClick={async () => {
                await fetchDepartmentsByFaculty()
                setShowdDepartmentModal(false)
              }}
              className="w-md text-center cursor-pointer flex-1 px-4 py-5 border-2 border-gray-300 rounded-lg hover:bg-slate-700 transition"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showStudentModal && (
        <div className="absolute inset-0 bg-white overflow-y-scroll bg-opacity-50 flex items-center justify-center z-50">
          <div className="min-w-md max-w-md">
            <StudentPage
              facultyId={selectedFaculty && selectedFaculty.id}
              department={selectedDepartment}
              level={level}
              onComplete={fetchStudents}
            />
            <Button
              onClick={() => setShowStudentModal(false)}
              className="w-md text-center cursor-pointer flex-1 px-4 py-5 border-2 border-gray-300 rounded-lg hover:bg-slate-700 transition"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="absolute inset-0 bg-white overflow-y-scroll bg-opacity-50 flex items-center justify-center z-50">
          <div className="min-w-md max-w-md">
            <ExcelUploader
              departmentId={selectedDepartment && selectedDepartment.id}
              facultyId={selectedFaculty && selectedFaculty.id}
              onClose={filterStudents}
            />
            <Button
              onClick={() => setShowUploadModal(false)}
              className="w-md text-center cursor-pointer flex-1 px-4 py-5 border-2 border-gray-300 rounded-lg hover:bg-slate-700 transition"
            >
              Close
            </Button>
          </div>
        </div>
      )}
      <MarksheetModal
        open={showMarksheet}
        onClose={() => setShowMarksheet(false)}
        courses={courses}
        session={selectedYear}
        department={selectedDepartment}
        facultyName={selectedFaculty?.code}
      />
    </div>
  )
}
