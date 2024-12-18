import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Link импортлох

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/my-courses', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Token-ийг localStorage-с авсан
                    }
                });

                // Сургалтын дэлгэрэнгүй мэдээллийг авахын тулд курсийн ID-ийг ашиглан хүсэлт явуулна
                const courseDetailsPromises = response.data.map(async (course) => {
                    const courseResponse = await axios.get(`http://localhost:5000/api/courses/${course.course_id}`);
                    return courseResponse.data;
                });

                const courseDetails = await Promise.all(courseDetailsPromises);
                setCourses(courseDetails);

            } catch (err) {
                setError('Error fetching courses');
                console.error(err);
            }
        };

        fetchCourses();
    }, []);

    if (error) return <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>;

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Миний сургалтууд</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white p-6 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                        {course.image && (
                            <div className="relative w-full h-40 overflow-hidden rounded-lg mb-4">
                                <img
                                    src={`http://localhost:5000/coursesImg/${course.image}`}
                                    alt={course.title}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{course.name}</h2>
                            <p className="text-gray-700 mb-4">{course.description}</p>
                            <Link
                                to={`/courses/${course.id}`}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-bright focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Хичээлээ үзэх
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;
