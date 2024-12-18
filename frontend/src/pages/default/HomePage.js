import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [comments, setComments] = useState([]);
  const [courses, setCourses] = useState({});
  const [topCourses, setTopCourses] = useState([]);
  const [coursePurchaseCounts, setCoursePurchaseCounts] = useState({});
  const [error, setError] = useState('');

  const navigate = useNavigate(); // useNavigate hook ашиглана

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/comments/allComments');
        const commentsData = response.data;

        const courseIds = [...new Set(commentsData.map(comment => comment.course_id))];
        const courseRequests = courseIds.map(id => axios.get(`http://localhost:5000/api/courses/${id}`));
        const courseResponses = await Promise.all(courseRequests);
        const coursesData = courseResponses.reduce((acc, course) => {
          acc[course.data.id] = course.data.name;
          return acc;
        }, {});

        setCourses(coursesData);
        setComments(commentsData);

        fetchTopCourses();
      } catch (error) {
        console.error('Сэтгэгдлийг авахад алдаа гарлаа', error);
        setError('Сэтгэгдлийг авахад алдаа гарлаа');
      }
    };

    const fetchTopCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/top-courses');
        const topCoursesData = response.data;

        setTopCourses(topCoursesData);

        const courseIds = topCoursesData.map(course => course.id);
        fetchPurchaseCounts(courseIds);
      } catch (error) {
        console.error('Хамгийн их лайктай сургалтуудыг авахад алдаа гарлаа', error);
        setError('Хамгийн их лайктай сургалтуудыг авахад алдаа гарлаа');
      }
    };

    const fetchPurchaseCounts = async (courseIds) => {
      try {
        const purchaseCountRequests = courseIds.map(id => axios.get(`http://localhost:5000/api/course/${id}/purchase-count`));
        const purchaseCountResponses = await Promise.all(purchaseCountRequests);
        const purchaseCountsData = purchaseCountResponses.reduce((acc, response, index) => {
          if (response.data && typeof response.data.studentCount !== 'undefined') {
            acc[courseIds[index]] = response.data.studentCount;
          } else {
            console.warn(`Course ID: ${courseIds[index]}-ийн хувьд худалдан авалтын тоо олдсонгүй.`);
            acc[courseIds[index]] = 0;
          }
          return acc;
        }, {});
        setCoursePurchaseCounts(purchaseCountsData);
      } catch (error) {
        console.error('Курсийн тоо хэмжээг авахад алдаа гарлаа', error);
        setError('Курсийн тоо хэмжээг авахад алдаа гарлаа');
      }
    };

    fetchComments();
  }, []);

  const handleCourseClick = (id) => {
    navigate(`/student/courses/${id}`); // Шилжих үүрэг гүйцэтгэнэ
  };

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">Манай сургалтын платформд тавтай морил!</h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8">Манайх бичлэг хичээл болон дасгал ажлуудаар таны ур чадварыг дээшлүүлнэ.</p>
        <Link
          to="/courses"
          className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 text-base sm:text-lg"
        >
          Сургалтуудыг үзэх
        </Link>
      </section>

      {/* Features Section */}
      <section className="container mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Яагаад биднийг сонгох вэ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Богино хугацааны сургалт</h3>
            <p className="text-gray-600">Ердөө тавхан минутад өөрийн сонирхож буй зүйлээ суралцаарай.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Мэргэжлийн Багш нар</h3>
            <p className="text-gray-600">Салбартаа туршлагатай мэргэжилтнүүдээс суралцаж мэдлэг, чадвараа өсгөөрэй.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Уян хатан нөхцөл</h3>
            <p className="text-gray-600">Манай платформд хэзээ ч, хаанаас ч хичээлээ үзэж суралцах боломжтой.</p>
          </div>
        </div>
      </section>

      {/* Top Courses Section */}
      <section className="container mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Хамгийн их таалагдсан сургалтууд</h2>
        <div className="relative overflow-hidden w-full">
          <div className="flex animate-marquee hover:animate-marquee-pause space-x-4 px-4 sm:px-0">
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              topCourses.length > 0 ? (
                <>
                  {topCourses.concat(topCourses).map((course) => (
                    <div
                      key={course.id}
                      className="flex-none w-[250px] sm:w-[300px] bg-white p-4 rounded-lg shadow-lg cursor-pointer"
                      onClick={() => handleCourseClick(course.id)} // Дарахад шилжих
                    >
                      {course.image && (
                        <div className="relative w-full h-40 overflow-hidden rounded-lg mb-4">
                          <img
                            src={`http://localhost:5000/coursesImg/${course.image}`}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <h3 className="text-base sm:text-lg font-semibold mb-2">{course.name}</h3>
                      <p className="text-gray-700 mb-2">Таалагдсан: {course.likes} (сурагчид: {coursePurchaseCounts[course.id] || '0'})</p>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-gray-600">Сургалтууд олдсонгүй.</p>
              )
            )}
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="container mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Сэтгэгдлүүд</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg max-h-[600px] overflow-y-auto">
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <ul>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <li key={comment.id} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-md">
                    <p className="text-gray-800 font-semibold mb-2">Курсын нэр: <span className="font-normal">{courses[comment.course_id] || 'Курсийн нэр олдсонгүй'}</span></p>
                    <p className="text-gray-700 mb-2">Сэтгэгдэл: {comment.content}</p>
                    <p className="text-gray-500 text-sm">{new Date(comment.created_at).toLocaleDateString()}</p>
                  </li>
                ))
              ) : (
                <p className="text-gray-600">Сэтгэгдлүүд байхгүй.</p>
              )}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
