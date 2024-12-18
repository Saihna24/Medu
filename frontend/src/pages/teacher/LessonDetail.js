import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await axios.get(`/api/lessons/${id}`);
        setLesson(response.data);
      } catch (error) {
        console.error('Хичээлийг татахад алдаа гарлаа', error);
      }
    };

    fetchLesson();
  }, [id]);

  if (!lesson) return <div className="p-6 bg-gray-100 min-h-screen text-center">Ачааллаж байна...</div>;

  const buildVideoUrl = (path) => `http://localhost:5000/${path}`;

  const handleAnswerClick = (exerciseIndex, answerIndex) => {
    if (user.role === 'teacher') return; // Багшаар нэвтэрсэн үед хариулт сонгох боломжгүй
    if (selectedAnswer && selectedAnswer.exerciseIndex === exerciseIndex) {
      return; // Хэрэв нэг хариулт сонгогдсон бол өөрчлөх боломжгүй байна.
    }
    setSelectedAnswer({ exerciseIndex, answerIndex });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{lesson.title}</h2>
      <p className="text-gray-700 text-lg mb-6">{lesson.description}</p>
      
      <video controls controlsList="nodownload" src={buildVideoUrl(lesson.video_url)} className="w-full h-auto rounded-lg shadow-md mb-6" />

      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Дасгалууд</h3>
        <ul className="space-y-4">
          {lesson.exercises.map((exercise, index) => (
            <li key={index} className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm">
              <p className="font-medium text-gray-800 mb-2">{exercise.question}</p>
              <ul className="space-y-2">
                {['answer1', 'answer2', 'answer3', 'answer4'].map((answerKey, answerIndex) => (
                  <li
                    key={answerIndex}
                    onClick={() => handleAnswerClick(index, answerIndex)}
                    className={`py-2 px-4 rounded cursor-pointer ${
                      user.role === 'teacher'
                        ? answerIndex === exercise.correct_answer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        : selectedAnswer?.exerciseIndex === index
                          ? answerIndex === exercise.correct_answer
                            ? 'bg-green-100 text-green-800'
                            : selectedAnswer.answerIndex === answerIndex
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                    } ${user.role === 'teacher' ? 'cursor-default' : ''}`}
                  >
                    {String.fromCharCode(65 + answerIndex)}: {exercise[answerKey]}
                    {selectedAnswer?.exerciseIndex === index && selectedAnswer?.answerIndex === answerIndex && user.role !== 'teacher' && (
                      <span className="ml-2 text-sm">
                        {exercise.correct_answer === answerIndex ? '' : 'Буруу хариулт'}
                      </span>
                    )}
                    {user.role === 'student' && exercise.correct_answer === answerIndex && (
                      <span className="ml-2 text-sm">
                        {selectedAnswer?.exerciseIndex === index ? (exercise.correct_answer === answerIndex ? 'Зөв хариулт' : 'Буруу хариулт') : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {selectedAnswer?.exerciseIndex === index && (
                <div className="mt-2">
                  <p className="text-gray-700 mt-2">
                   <strong>Зөв хариултын тайлбар: </strong>{exercise.explanation}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <button 
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Курс руу буцах
      </button>
    </div>
  );
};

export default LessonDetail;
