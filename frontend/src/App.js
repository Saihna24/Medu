import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/default/HomePage';
import CoursePage from './pages/default/AllCoursesPage';
import MainLayout from './components/MainLayout';
import AboutPage from './pages/default/AboutPage';
import AuthPage from './pages/default/AuthPage';
import ProfilePage from './pages/default/ProfilePage';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import PasswordReset from './pages/default/PasswordResetPage';
import RegisterTeacherPage from './pages/teacher/RegisterTeacherPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminTeachers } from './pages/admin/AdminTeachers';
import { AdminStudents } from './pages/admin/AdminStudents';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminRequestsSection from './pages/admin/AdminRequestsSection';
import CourseDetail from './pages/teacher/CourseDetail';
import CreateLesson from './pages/teacher/CreateLesson';
import LessonDetail from './pages/teacher/LessonDetail';
import AllCoursesPage from './pages/default/AllCoursesPage';
import AllCoursesDetail from './pages/default/AllCoursesDetail';
import MyCourses from './pages/default/myCourses';
function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<AllCoursesPage />} />
            <Route path="/student/courses/:id" element={<AllCoursesDetail />} />
            <Route path="/profile" element={<ProfilePage />}/>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/resetPass" element={<PasswordReset/>} />
            <Route path='/register-teacher' element={<RegisterTeacherPage/>} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path='/admin/teachers' element={<AdminTeachers />}/>
            <Route path='/admin/students' element={<AdminStudents />}/>
            <Route path='/teacher-dashboard' element={<TeacherDashboard/>}/>
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/lessons/:id" element={<LessonDetail />} />
            <Route path="/courses/:id/create-lesson" element={<CreateLesson />} />
            <Route path='/admin-requests' element={<AdminRequestsSection/>}/>
            <Route path='/my-courses' element={<MyCourses/>}/>
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
