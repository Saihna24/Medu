import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HeartIcon from './HeartIcon';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentModal from './PaymentModal';

const AllCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories] = useState([
    'Бизнес', 
    'Маркетинг', 
    'Санхүү хөрөнгө оруулалт', 
    'Дизайн', 
    'Мэдээлэл технологи', 
    'Хувь хүний хөгжил', 
    'Гадаад хэл', 
    'Гэр бүлийн харилцаа'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses${selectedCategory ? `/category/${selectedCategory}` : ''}`);
        
        if (response.data.message) {
          toast.info(response.data.message);
        } else {
          if (response.data.length === 0) {
            setCourses([]);
            toast.info('Энэ төрлийн сургалт хараахан үүсгэгдээгүй байна');
          } else {
            setCourses(response.data);
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setCourses([]);
          toast.info('Энэ төрлийн сургалт хараахан үүсгэгдээгүй байна');
        } else {
          toast.error('Сургалтуудыг авахад алдаа гарлаа');
        }
        console.error('Error fetching courses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory]);

  const handlePurchase = (courseId, price) => {
    if (!user) {
      toast.info('Та нэвтэрсэн тохиолдолд худалдаж авах боломжтой болно');
      return;
    }
    setSelectedCourse({ id: courseId, price });
    setIsModalOpen(true);
  };

  const handleLike = async (courseId) => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      toast.info('Таалагдсан тэмдэглэгээ үлдээхийн тулд, Эхлээд нэвтрэх шаардлагатай');
      return;
    }
  
    try {
      const response = await axios.post('/api/courses/like', 
        { userId: user.id, courseId }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
  
      const updatedLikes = response.data.likes;
  
      setCourses(courses.map(course =>
        course.id === courseId ? { ...course, likes: updatedLikes, likedByUser: true } : course
      ));
      toast.success('Курс таалагдлаа');
    } catch (error) {
      toast.error('Курсийг таалагдсан гэж тэмдэглэхэд алдаа гарлаа');
      console.error('Error liking course:', error.response ? error.response.data : error.message);
    }
  };
  
  const handleUnlike = async (courseId) => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      toast.info('Таалагдсан тэмдэглэгээ үлдээхийн тулд, Эхлээд нэвтрэх шаардлагатай');
      return;
    }
  
    try {
      const response = await axios.post('/api/courses/unlike', 
        { userId: user.id, courseId }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
  
      const updatedLikes = response.data.likes;
  
      setCourses(courses.map(course =>
        course.id === courseId ? { ...course, likes: updatedLikes, likedByUser: false } : course
      ));
      toast.success('Курс таалагдаагүй');
    } catch (error) {
      toast.error('Курс таалагдаагүй гэж тэмдэглэхэд алдаа гарлаа');
      console.error('Error unliking course:', error.response ? error.response.data : error.message);
    }
  };

  if (loading) return <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ToastContainer 
        draggable 
        draggablePercent={60}
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick 
        pauseOnHover 
        draggableDirection="x"
      />
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Бүх сургалтууд</h2>
      <div className="mb-8">
        <label htmlFor="category" className="block text-lg font-medium text-gray-700 mb-2">Төрөл сонгох</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full sm:w-72 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Бүгд</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.length === 0 ? (
          <li className="col-span-full text-center text-gray-700">Энэ төрлийн сургалт хараахан үүсгэгдээгүй байна</li>
        ) : (
          courses.map((course) => (
            <li key={course.id} className="bg-white p-6 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col">
                {course.image && (
                  <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                    <img
                      src={`http://localhost:5000/coursesImg/${course.image}`}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                  <p className="text-gray-700 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <HeartIcon
                        filled={course.likedByUser}
                        onClick={() => {
                          course.likedByUser ? handleUnlike(course.id) : handleLike(course.id);
                        }}
                      />
                      <span>{course.likes || 0}</span>
                    </div>
                    <Link
                      to={`/student/courses/${course.id}`}
                      className="text-blue-600 rounded-lg hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Дэлгэрэнгүй
                    </Link>
                  </div>
                  <button
                    onClick={() => handlePurchase(course.id, course.price)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-bright focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    худалдаж авах
                  </button>
                  <span className="text-xl font-bold text-gray-900">{course.price ? `${course.price}₮` : 'Үнэгүй'}</span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseId={selectedCourse ? selectedCourse.id : ''}
        userId={user ? user.id : ''}
        price={selectedCourse ? selectedCourse.price : ''}
      />
    </div>
  );
};

export default AllCoursesPage;
