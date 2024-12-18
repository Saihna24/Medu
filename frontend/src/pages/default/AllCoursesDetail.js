import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentModal from './PaymentModal'; 

const AllCoursesDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coursePrice, setCoursePrice] = useState(0);
  const toastId = useRef(null);

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      try {
        const courseResponse = await axios.get(`/api/courses/${id}`);
        setCourse(courseResponse.data);
        setCoursePrice(courseResponse.data.price);

        const teacherId = courseResponse.data.teacher_id;
        const teacherResponse = await axios.get(`/api/teacherProfile/${teacherId}`);
        setTeacher(teacherResponse.data);

        const teacherCoursesResponse = await axios.get(`/api/teacherAllCourse/${teacherId}`);
        setTeacherCourses(teacherCoursesResponse.data);

        const lessonsResponse = await axios.get(`/api/courses/${id}/lessons`);
        setLessons(lessonsResponse.data);
      } catch (error) {
        console.error('Error fetching course details');
      }
    };

    fetchCourseAndLessons();
  }, [id]);

  if (!course) return <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">Loading...</div>;

  const filteredTeacherCourses = teacherCourses.filter(teacherCourse => teacherCourse.id !== course.id);

  const handlePurchase = () => {
    if (!user) {
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
      toastId.current = toast.info('Та нэвтэрсэн тохиолдолд худалдаж авах боломжтой болно', {
        autoClose: 5000,
        draggable: true,
        closeButton: true,
        position: "top-right",
        onClose: () => toastId.current = null 
      });
      return;
    }
    setIsModalOpen(true);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Н/А';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col space-y-8">
      <ToastContainer 
        draggable 
        closeButton 
        autoClose={5000} 
        position="top-right"
      />
      <PaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        courseId={course.id} 
        userId={user?.id}
        price={coursePrice} 
      />
      <div className="flex flex-col md:flex-row">
        <div className="flex-grow pr-0 md:pr-8 md:w-2/3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{course.name}</h2>
          <p className="text-gray-700 mb-6">{course.description}</p>
          <div className="md:hidden">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Хичээлүүд</h3>
            <div className="h-64 overflow-y-auto">
              <ul>
                {lessons.slice(0, 20).map((lesson) => (
                  <li key={lesson.id} className="bg-white p-3 border border-gray-300 rounded-lg shadow-sm flex items-center mb-2">
                    <div className="flex items-center space-x-4 flex-1">
                      <span className="text-gray-600 font-semibold">{lesson.lesson_number || 'Н/А'}.</span>
                      <span className="text-gray-800 text-sm flex-1 truncate">{lesson.title}</span>
                    </div>
                    <span className="text-gray-600 text-sm ml-auto">{formatDuration(lesson.video_duration)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={handlePurchase}
              className="mt-4 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-bright focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Хичээлүүдийг худалдаж авах
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/3">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 hidden md:block">Хичээлүүд</h3>
          <div className="hidden md:block h-96 overflow-y-auto">
            <ul>
              {lessons.slice(0, 20).map((lesson) => (
                <li key={lesson.id} className="bg-white p-3 border border-gray-300 rounded-lg shadow-sm flex items-center mb-2">
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-gray-600 font-semibold">{lesson.lesson_number || 'Н/А'}.</span>
                    <span className="text-gray-800 text-sm flex-1 truncate">{lesson.title}</span>
                  </div>
                  <span className="text-gray-600 text-sm ml-auto">{formatDuration(lesson.video_duration)}</span>
                </li>
              ))}
            </ul>
          </div>
          <button 
            onClick={handlePurchase}
            className="mt-4 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-bright focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 hidden md:block"
          >
            Хичээлүүдийг худалдаж авах
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0">
          {teacher && (
            <div className="bg-white p-4 md:p-6 border border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4 h-32">
                <img
                  src={`http://localhost:5000/${teacher.image}`}
                  alt="Зураг"
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full"
                />
                <div>
                  <h4 className="text-lg md:text-xl font-semibold text-gray-800">Нэр: {teacher.firstname}</h4>
                  <p className="text-gray-600">Туршлага: {teacher.experience || 'Н/А'}</p>
                  <p className="text-gray-600">Заах төрөл: {teacher.subject || 'Н/А'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3">
          {filteredTeacherCourses.length > 0 && (
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Багшийн бусад хичээлүүд:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeacherCourses.map((course) => (
                  <div key={course.id} className="bg-gray-50 p-4 border border-gray-200 rounded-lg flex items-start space-x-4">
                    <img
                      src={`http://localhost:5000/coursesImg/${course.image}`}
                      alt="Зураг"
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full"
                    />
                    <div className="flex flex-col">
                      <h4 className="text-lg font-semibold text-gray-800">{course.name}</h4>
                      <p className="text-gray-600 text-sm">{course.description}</p>
                      <Link to={`/student/courses/${course.id}`} className="text-blue-500 hover:underline">
                        Зочлох
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCoursesDetail;
