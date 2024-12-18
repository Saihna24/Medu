import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Импортлох

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [comments, setComments] = useState([]); // Сэтгэгдлийн state
  const [newComment, setNewComment] = useState(""); // Шинэ сэтгэгдлийн state
  const [duration, setDuration] = useState({});
  const videoRefs = useRef({});
  const navigate = useNavigate();
  const { user } = useAuth(); // Хэрэглэгчийн мэдээллийг авах

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await axios.get(`/api/courses/${id}`);
        setCourse(courseResponse.data);

        const lessonsResponse = await axios.get(`/api/courses/${id}/lessons`);
        setLessons(lessonsResponse.data);

        const commentsResponse = await axios.get(`/api/courses/${id}/comments`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Курс авахад алдаа гарлаа', error);
      }
    };

    fetchCourse();
  }, [id]);

  const handleLoadedMetadata = (id) => {
    const video = videoRefs.current[id];
    if (video) {
      setDuration((prev) => ({
        ...prev,
        [id]: video.duration,
      }));
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDeleteLesson = async (lessonId) => {
    const confirmed = window.confirm('Энэ хичээлийг устгахдаа итгэлтэй байна уу?');
    if (!confirmed) return; // Хэрэв баталгаажуулахгүй бол устгахгүй

    try {
      await axios.delete(`/api/lessons/${lessonId}`);
      setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
    } catch (error) {
      console.error('Хичээл устгахад алдаа гарлаа', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (newComment.trim() === "") return;

    try {
      const response = await axios.post(`/api/courses/${id}/comments`, {
        content: newComment,
        user_id: user.id, // Хэрэглэгчийн ID
      });
      setComments([...comments, response.data]);
      setNewComment(""); // Текстийг цэвэрлэх
    } catch (error) {
      console.error('Сэтгэгдэл хадгалахад алдаа гарлаа', error);
    }
  };
  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm('Энэ сэтгэгдлийг устгахдаа итгэлтэй байна уу?');
    if (!confirmed) return; // Хэрэв баталгаажуулахгүй бол устгахгүй
  
    try {
      await axios.delete(`/api/courses/comments/${commentId}`);
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Сэтгэгдэл устгахад алдаа гарлаа', error);
    }
  };
  

  if (!course) return <div className="p-6 text-center text-gray-500">Ачааллаж байна...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{course.name}</h2>
        <p className="text-lg text-gray-600">{course.description}</p>
      </header>

      <div className="mb-6">
        <button
          onClick={handleBackClick}
          className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
        >
          Буцах
        </button>
      </div>

      <div className="mb-6">
        {user && user.role === 'teacher' && ( // Шинэ хичээл үүсгэх эрхтэй бол
          <Link
            to={`/courses/${id}/create-lesson`}
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg shadow-md hover:bg-primary-bright transition duration-300"
          >
            Шинэ хичээл үүсгэх
          </Link>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Хичээлүүд</h3>
        <ul className="space-y-4">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="bg-white shadow-md rounded-lg p-4 hover:bg-gray-50 transition duration-300 flex items-center justify-between">
              <Link to={`/lessons/${lesson.id}`} className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                <span className="font-semibold">Хичээл {lesson.lesson_number}:</span> {lesson.title}
              </Link>
              <div className="flex space-x-4 items-center">
                {lesson.video_url && (
                  <p className="text-gray-600">
                    {duration[lesson.id] !== undefined
                      ? `Бичлэг хугацаа: ${Math.floor(duration[lesson.id] / 60)}:${Math.floor(duration[lesson.id] % 60).toString().padStart(2, '0')}`
                      : 'Хугацааг харуулахад алдаа гарлаа...'}
                  </p>
                )}
                {lesson.video_url ? (
                  <video
                    ref={(el) => (videoRefs.current[lesson.id] = el)}
                    src={`http://localhost:5000/${lesson.video_url}`}
                    onLoadedMetadata={() => handleLoadedMetadata(lesson.id)}
                    style={{ display: 'none' }}
                  />
                ) : (
                  <div className="text-gray-600">Видео байхгүй</div>
                )}
                {user && user.role === 'teacher' && ( // Хичээлийг устгах эрхтэй бол
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                  >
                    Устгах
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Сэтгэгдлүүд</h3>
  <ul className="space-y-4 mb-6">
    {comments.map((comment) => (
      <li key={comment.id} className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Бичсэн: {comment.firstname}</p>
          <p className="text-gray-800">{comment.content}</p>
        </div>
        {user && user.role === 'teacher' && ( // Хэрэв хэрэглэгч багш бол устгах боломжтой
          <button
            onClick={() => handleDeleteComment(comment.id)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
          >
            Устгах
          </button>
        )}
      </li>
    ))}
  </ul>

      {user && (
        <form onSubmit={handleAddComment} className="bg-white shadow-md rounded-lg p-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            rows="3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Сэтгэгдэл бичих..."
          ></textarea>
          <button
            type="submit"
            className="mt-2 bg-primary text-white px-6 py-2 rounded-lg shadow-md hover:bg-primary-bright transition duration-300"
          >
            Сэтгэгдэл оруулах
          </button>
        </form>
      )}
    </div>

    </div>
  );
};

export default CourseDetail;
