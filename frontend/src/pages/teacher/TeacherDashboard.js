import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TeacherRequestForm from './TeacherRequestForm';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchCourses = async () => {
      if (user && user.id) {
        try {
          const response = await axios.get(`/api/courses/teacher/${user.id}`);
          setCourses(response.data);
        } catch (error) {
          console.error('Error fetching courses', error);
        }
      }
    };
    fetchCourses();
  }, [user]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Таны сургалтууд</h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                  {course.image && (
                    <div className="w-full h-48 overflow-hidden rounded-lg mb-2 relative">
                      <img
                        src={`http://localhost:5000/coursesImg/${course.image}`}
                        alt={course.name}
                        className="w-full h-full object-cover absolute top-0 left-0"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
                  <p className="text-gray-700 truncate">{course.description}</p>
                  <Link to={`/courses/${course.id}`} className="text-blue-500 hover:underline mt-2">Дэлгэрэнгүй</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No courses available.</p>
          )}
        </div>
        <div className="col-span-1 lg:col-span-1">
          <TeacherRequestForm />
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
