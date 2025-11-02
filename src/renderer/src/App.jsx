import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom'
import Auth from './pages/Auth'
import DashboardLayout from './layouts/dashboard'
import Home from './pages/Home'
import RouteCards from './components/route-cards'
import { utilityRoutes, resultsRoutes } from './utils/routes'
import NotFound from './pages/NotFound'
import MoreRoutes from './components/more-routes'
import Loading from './components/loading'
import CoursePage from './pages/create/Course'
import StudentPage from './pages/students/Page'
// create pages
import Faculty from './pages/create/Faculty'
import Department from './pages/create/Department'
import { ToastContainer } from 'react-toastify'
import UpdateManager from './pages/Updates'
// import Course from './pages/create/Course'
// // student files
// import Records from './pages/students/Records'
// import StudentMarkSheet from './pages/students/MarkSheet'
// import CourseRegistrationSlip from './pages/students/CourseRegistrationSlip'
// import CourseResultSlip from './pages/students/CourseResultSlip'
// // report pages
// import RecordsListing from './pages/reports/RecordsListing'
// import DepartmentalResults from './pages/reports/DepartmentalResults'
// import MarkSheet from './pages/reports/MarkSheet'
// import TranscriptData from './pages/reports/TranscriptData'
// import AcademicRecords from './pages/reports/AcademicRecords'
// // utility
// import MatricEditor from './pages/utility/MatricEditor'
// import TransferResults from './pages/utility/TransferResults'
// import TransferPrevious from './pages/utility/TransferPrevious'
// import TransferGeneral from './pages/utility/TransferGeneral'
// import EmptyDatabase from './pages/utility/EmptyDatabase'
// import CourseAdviser from './pages/utility/CourseAdviser'
// import Registration from './pages/utility/Registration'
// import PasswordManager from './pages/utility/PasswordManager'
// // results
// import StudentResultA from './pages/result/StudentResultA'
// import StudentResultB from './pages/result/StudentResultB'
// import StudentResultC from './pages/result/StudentResultC'
// import LevelGPA from './pages/result/LevelGPA'
// import FinalYearGPA from './pages/result/FinalYearGPA'
// import ListRegCourses from './pages/result/ListRegCourses'
// import SenateGroupHeaderA from './pages/result/SenateGroupHeaderA'
// import SeneteGroupHeaderB from './pages/result/SeneteGroupHeaderB'
// import SenateFormat from './pages/result/SenateFormat'
// import SenateFinalYear from './pages/result/SenateFinalYear'
import SessionManager from './pages/create/Session'
import SessionPage from './pages/create/Sessions'
import ResultEntry from './pages/create/Results'
import AcademicRecordDashboard from './pages/create/Dashboard'
// import { useEffect } from 'react'

export default function App() {
  const isDev = import.meta.env.DEV // Vite env check
  const RouterImpl = isDev ? BrowserRouter : HashRouter
  // useEffect(() => {
  //   console.log(window.api)
  // }, [])
  return (
    <div className="bg-purple-800 w-screen">
      <ToastContainer />
      <Loading />
      <RouterImpl>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Auth />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/dashboard/home" element={<AcademicRecordDashboard />} />
            <Route path="/dashboard/courses" element={<CoursePage />} />
            <Route path="/dashboard/students" element={<StudentPage />} />
            <Route path="/dashboard/departments" element={<Department />} />
            <Route path="/dashboard/faculty" element={<Faculty />} />
            <Route path="/dashboard/session" element={<SessionManager />} />
            <Route path="/dashboard/sessions" element={<SessionPage />} />
            <Route path="/dashboard/result" element={<ResultEntry />} />
            <Route path="/dashboard/updates" element={<UpdateManager />} />

            {/* more routes */}
            <Route path="/dashboard/more" element={<MoreRoutes />} />
            {/* utility */}
            <Route
              path="/dashboard/utility"
              element={
                <RouteCards
                  parentRoute="Utility"
                  routes={utilityRoutes}
                  cardBgColor="bg-white"
                  cardHoverColor="bg-blue-50"
                  textColor="text-gray-800"
                  parentRouteColor="text-blue-600"
                />
              }
            />

            {/* Result processing */}
            <Route
              path="/dashboard/result"
              element={
                <RouteCards
                  parentRoute="Result Processing"
                  routes={resultsRoutes}
                  cardBgColor="bg-white"
                  cardHoverColor="bg-blue-50"
                  textColor="text-gray-800"
                  parentRouteColor="text-blue-600"
                />
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RouterImpl>
    </div>
  )
}
