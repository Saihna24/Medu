import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Видео хугацааг олох функц
const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      resolve(video.duration);
    };

    video.onerror = () => {
      reject('Видео хугацааг авахад алдаа гарлаа');
    };
  });
};

const CreateLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessonNumber, setLessonNumber] = useState('');
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(''); // Шинэ state
  const [exercises, setExercises] = useState([{ question: '', answers: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);

  // Файл сонгосны дараа видео хугацааг авах
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const duration = await getVideoDuration(file);
        setVideoFile(file);
        setVideoDuration(duration); // Хугацааг шинэчлэх
      } catch (error) {
        console.error('Видео хугацааг олохдоо алдаа гарлаа:', error);
      }
    }
  };

  // Хичээл үүсгэх функц
  const handleCreateLesson = async (e) => {
    e.preventDefault();
  
    const validExercises = exercises.map(ex => ({
      question: ex.question.trim() || '',
      answer1: ex.answers[0].trim() || '',
      answer2: ex.answers[1].trim() || '',
      answer3: ex.answers[2].trim() || '',
      answer4: ex.answers[3].trim() || '',
      correct_answer: ex.correctAnswer || 0,
      explanation: ex.explanation.trim() || ''
    }));
  
    const formData = new FormData();
    formData.append('lesson_number', lessonNumber);
    formData.append('title', title);
    formData.append('video', videoFile);
    formData.append('video_duration', videoDuration); // Хугацааг нэмэх
    formData.append('exercises', JSON.stringify(validExercises));
  
    try {
      await axios.post(`/api/courses/${id}/lessons`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/courses/${id}`);
    } catch (error) {
      console.error('Хичээл үүсгэхэд алдаа гарлаа', error.response?.data || error);
    }
  };

  // Дасгалын мэдээлэл өөрчлөх функц
  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    if (field === 'question') {
      newExercises[index].question = value;
    } else if (field === 'answers') {
      newExercises[index].answers = value;
    } else if (field === 'correctAnswer') {
      newExercises[index].correctAnswer = value;
    } else if (field === 'explanation') {
      newExercises[index].explanation = value;
    }
    setExercises(newExercises);
  };

  // Дасгал хасах функц
  const handleRemoveExercise = (index) => {
    const newExercises = exercises.filter((_, idx) => idx !== index);
    setExercises(newExercises);
  };

  // Дасгал нэмэх функц
  const addExercise = () => {
    setExercises([...exercises, { question: '', answers: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Шинэ Хичээл Үүсгэх</h2>
      <form onSubmit={handleCreateLesson} className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold">Хичээлийн Дугаар:</label>
          <input
            type="number"
            value={lessonNumber}
            onChange={(e) => setLessonNumber(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold">Гарчиг:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold">Видео Файл:</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg text-sm file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-lg file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold">Дасгалууд:</label>
          {exercises.map((exercise, index) => (
            <div key={index} className="bg-gray-50 p-4 border border-gray-200 rounded-lg mb-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold">Асуулт:</label>
                <input
                  type="text"
                  value={exercise.question}
                  onChange={(e) => handleExerciseChange(index, 'question', e.target.value)}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {exercise.answers.map((answer, ansIndex) => (
                <div key={ansIndex} className="mb-2">
                  <label className="block text-gray-700 text-sm font-semibold">Хариулт {ansIndex + 1}:</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleExerciseChange(index, 'answers', exercise.answers.map((a, idx) => idx === ansIndex ? e.target.value : a))}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
              <div className="mb-2">
                <label className="block text-gray-700 text-sm font-semibold">Зөв Хариулт:</label>
                <select
                  value={exercise.correctAnswer}
                  onChange={(e) => handleExerciseChange(index, 'correctAnswer', parseInt(e.target.value))}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Хариулт 1</option>
                  <option value={1}>Хариулт 2</option>
                  <option value={2}>Хариулт 3</option>
                  <option value={3}>Хариулт 4</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold">Зөв Хариултын Шалтгаан:</label>
                <textarea
                  value={exercise.explanation}
                  onChange={(e) => handleExerciseChange(index, 'explanation', e.target.value)}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveExercise(index)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Дасгалыг Хасах
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Дасгал Нэмэх
          </button>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Хичээл Үүсгэх
        </button>
      </form>
    </div>
  );
};

export default CreateLesson;
