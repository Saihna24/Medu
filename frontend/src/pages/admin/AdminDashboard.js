import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmationModal from './ConfirmationModal';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
  const [newCourse, setNewCourse] = useState({
      name: '',
      description: '',
      image: null,
      teacherId: '',
      category: '', // Шинэ
      price: ''     // Шинэ
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
      const fetchCourses = async () => {
          try {
              const response = await axios.get('/api/courses');
              setCourses(response.data);
          } catch (error) {
              console.error('Error fetching courses', error);
          }
      };
      fetchCourses();
  }, []);

  useEffect(() => {
      const fetchTeachers = async () => {
          try {
              const response = await axios.get('/api/teachers');
              setTeachers(response.data);
          } catch (error) {
              console.error('Error fetching teachers', error);
          }
      };
      fetchTeachers();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newCourse.name);
    formData.append('description', newCourse.description);
    formData.append('teacherId', newCourse.teacherId);
    formData.append('category', newCourse.category); // Төрлийг нэмэх
    formData.append('price', newCourse.price);       // Үнийг нэмэх
    if (newCourse.image) {
      formData.append('image', newCourse.image);
    }
  
    try {
      await axios.post('/api/courses/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const response = await axios.get('/api/courses');
      setCourses(response.data);
      setNewCourse({ name: '', description: '', image: null, teacherId: '', category: '', price: '' });
    } catch (error) {
      console.error('Error creating course', error);
    }
  };

  const handleImageChange = (e) => {
      setNewCourse({ ...newCourse, image: e.target.files[0] });
  };

  const handleDeleteCourse = async (id) => {
      setCourseToDelete(id);
      setModalOpen(true);
  };

  const confirmDeleteCourse = async () => {
      try {
          await axios.delete(`/api/courses/${courseToDelete}`);
          const response = await axios.get('/api/courses');
          setCourses(response.data);
          setModalOpen(false);
          setCourseToDelete(null);
      } catch (error) {
          console.error('Error deleting course', error);
      }
  };

  const cancelDeleteCourse = () => {
      setModalOpen(false);
      setCourseToDelete(null);
  };
  const formatPrice = (price) => {
    return `${price.toLocaleString()} ₮`; // Төгрөгийн тэмдэгттэй
  };
  
  return (
      <div className="flex min-h-screen bg-gray-100">
          <div className="w-3/4 p-6 space-y-4">
              <h2 className="text-2xl font-bold mb-4">Бүх сургалтууд</h2>
              <div className="grid grid-cols-3 gap-4">
                  {courses.map(course => (
                      <div key={course.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col relative">
                          {course.image && (
                              <div className="w-full h-40 overflow-hidden rounded-lg mb-2">
                                  <img
                                      src={`http://localhost:5000/coursesImg/${course.image}`}
                                      alt={course.name}
                                      className="w-full h-full object-cover"
                                  />
                              </div>
                          )}
                          <h2><span className="text-blue-500">Хичээлийн дугаар:</span>{course.id}</h2>
                          <h3 className=" font-semibold mb-2"><span className="text-blue-500">Хичээлийн гарчиг:</span>{course.name}</h3>
                          <p className="text-gray-700 font-semibold truncate"><span className="text-blue-500">Хичээлийн тайлбар:</span>{course.description}</p>
                          <h3 className='font-semibold mb-2'><span className="text-blue-500">Багшын дугаар:</span> {course.teacher_id}</h3>
                          <h3 className='font-semibold mb-2'><span className="text-blue-500">Төрөл:</span> {course.category}</h3>
                          <h3 className='font-semibold mb-2'><span className="text-blue-500">Үнэ:</span> {formatPrice(course.price)}</h3> {/* Төгрөгийн тэмдэгттэйгээр харуулах */}
                          <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                          >
                              Устгах
                          </button>
                      </div>
                  ))}
              </div>
          </div>
          <div className="w-1/4 p-6 bg-white shadow-md">
              <h1 className="text-2xl font-bold mb-4">Шинэ сургалт үүсгэх</h1>
              <form onSubmit={handleCreateCourse}>
                  <div className="mb-4">
                      <label className="block text-lg font-medium mb-2">Хичээлийн нэр:</label>
                      <input
                          type="text"
                          value={newCourse.name}
                          onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                      />
                  </div>
                  <div className="mb-4">
                      <label className="block text-lg font-medium mb-2">Тайлбар:</label>
                      <textarea
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                      />
                  </div>
                  <div className="mb-4">
                      <label className="block text-lg font-medium mb-2">Багш:</label>
                      <select
                          value={newCourse.teacherId}
                          onChange={(e) => setNewCourse({ ...newCourse, teacherId: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                      >
                          <option value="">Сонгоно уу</option>
                          {teachers.map(teacher => (
                              <option key={teacher.id} value={teacher.id}>
                                  {teacher.email}
                              </option>
                          ))}
                      </select>
                  </div>
                  <div className="mb-4">
                      <label className="block text-lg font-medium mb-2">Төрөл:</label>
                      <select
                          value={newCourse.category}
                          onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                      >
                          <option value="">Сонгоно уу</option>
                          {categories.map((cat, index) => (
                              <option key={index} value={cat}>
                                  {cat}
                              </option>
                          ))}
                      </select>
                  </div>
                  <div className="mb-4">
                      <label className="block text-lg font-medium mb-2">Үнэ:</label>
                      <input
                          type="number"
                          step="0.01"
                          value={newCourse.price}
                          onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          required
                      />
                  </div>
                  <div className="mb-4">
                      <label className="block text-lg font-medium mb-2">Хичээлийн зураг:</label>
                      <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg"
                      />
                  </div>
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-bright transition">Үүсгэх</button>
              </form>
          </div>

          {/* Confirmation Modal */}
          <ConfirmationModal
              isOpen={modalOpen}
              onConfirm={confirmDeleteCourse}
              onCancel={cancelDeleteCourse}
              message="Are you sure you want to delete this course?"
          />
      </div>
  );
};

export default AdminDashboard;
