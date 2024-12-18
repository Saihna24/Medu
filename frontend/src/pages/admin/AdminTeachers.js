import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [teacherRequests, setTeacherRequests] = useState([]);
    const [lessonRequests, setLessonRequests] = useState([]);
    const [editTeacher, setEditTeacher] = useState(null); // Засах хэлбэрийн state
    const [updatedTeacher, setUpdatedTeacher] = useState({}); // Шинэчлэгдсэн багшийн мэдээлэл

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/teachers');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTeachers(data);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        const fetchRequests = async () => {
            try {
                const teacherRequestsResponse = await fetch('http://localhost:5000/api/teacher-requests');
                const lessonRequestsResponse = await fetch('http://localhost:5000/api/requests');

                if (!teacherRequestsResponse.ok || !lessonRequestsResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const teacherRequestsData = await teacherRequestsResponse.json();
                const lessonRequestsData = await lessonRequestsResponse.json();

                setTeacherRequests(teacherRequestsData);
                setLessonRequests(lessonRequestsData);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        fetchTeachers();
        fetchRequests();
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return 'Тодорхойгүй';
        }
        return date.toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/teachers/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setTeachers(teachers.filter(teacher => teacher.id !== id));
            } else {
                console.error('Delete failed:', await response.json());
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleEdit = (teacher) => {
        setEditTeacher(teacher);
        setUpdatedTeacher(teacher); // Засах үед эдгээр мэдээллийг анхдагчаар оруулах
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/teachers/${editTeacher.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedTeacher)
            });
            if (response.ok) {
                const updatedData = await response.json();
                setTeachers(teachers.map(teacher =>
                    teacher.id === updatedData.id ? updatedData : teacher
                ));
                setEditTeacher(null);
                setUpdatedTeacher({});
            } else {
                console.error('Update failed:', await response.json());
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleRequestsClick = () => {
        navigate('/admin-requests', { state: { teacherRequests, lessonRequests } });
    };

    return (
        <div className="flex flex-col h-screen p-6 space-y-6">
            {/* Багшийн мэдээлэл хэсэг */}
            <div className="flex-3 bg-white shadow-md rounded-lg p-6 max-h-screen overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Багшийн мэдээлэл</h1>
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={handleRequestsClick} 
                        className="bg-primary text-white hover:bg-primary-bright px-4 py-2 rounded"
                    >
                        Багшийн хүсэлтүүдийг харуулах
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-[90%] bg-white border border-gray-300 mx-auto">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="py-1 px-2 text-left border-r border-gray-300">ID</th>
                                <th className="py-1 px-2 text-left border-r border-gray-300">Зураг</th>
                                <th className="py-1 px-2 text-left border-r border-gray-300">Огноо</th>
                                <th className="py-1 px-2 text-left border-r border-gray-300">И-мэйл</th>
                                <th className="py-1 px-2 text-left border-r border-gray-300">Нэр</th>
                                <th className="py-1 px-2 text-left border-r border-gray-300">Овог</th>
                                <th className="py-1 px-2 text-left border-r border-gray-300">Хичээл</th>
                                <th className="py-1 px-2 text-left border-r border-gray-300">Туршлага</th>
                                <th className="py-1 px-2">Үйлдэл</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => (
                                <tr key={teacher.id} className="border-b border-gray-300">
                                    <td className="py-1 px-2 border-r border-gray-300">{teacher.id}</td>
                                    <td className="py-1 px-2 border-r border-gray-300">
                                        <img
                                            src={`http://localhost:5000/${teacher.image}`}
                                            alt="Зураг"
                                            className="w-20 h-20 object-cover rounded-full"
                                        />
                                    </td>
                                    <td className="py-1 px-2 border-r border-gray-300">{formatDate(teacher.created_at)}</td>
                                    <td className="py-1 px-2 border-r border-gray-300">{teacher.email}</td>
                                    <td className="py-1 px-2 border-r border-gray-300">{teacher.firstname}</td>
                                    <td className="py-1 px-2 border-r border-gray-300">{teacher.lastname}</td>
                                    <td className="py-1 px-2 border-r border-gray-300">{teacher.subject}</td>
                                    <td className="py-1 px-2 border-r border-gray-300 w-[200px] overflow-hidden text-ellipsis">
                                        {teacher.experience}
                                    </td>
                                    <td className="py-1 px-2">
                                        <button 
                                            onClick={() => handleEdit(teacher)} 
                                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                        >
                                            Засах
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(teacher.id)} 
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            Устгах
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Засах хэлбэр */}
            {editTeacher && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-xl font-bold mb-4">Багшийн мэдээллийг засах</h2>
                        <label className="block mb-2">Нэр:</label>
                        <input
                            type="text"
                            value={updatedTeacher.firstname || ''}
                            onChange={(e) => setUpdatedTeacher({...updatedTeacher, firstname: e.target.value})}
                            className="border border-gray-300 p-2 w-full mb-2"
                        />
                        <label className="block mb-2">Овог:</label>
                        <input
                            type="text"
                            value={updatedTeacher.lastname || ''}
                            onChange={(e) => setUpdatedTeacher({...updatedTeacher, lastname: e.target.value})}
                            className="border border-gray-300 p-2 w-full mb-2"
                        />
                        <label className="block mb-2">И-мэйл:</label>
                        <input
                            type="email"
                            value={editTeacher.email || ''}
                            disabled
                            className="border border-gray-300 p-2 w-full mb-2 bg-gray-100"
                        />
                        <label className="block mb-2">Хичээл:</label>
                        <input
                            type="text"
                            value={updatedTeacher.subject || ''}
                            onChange={(e) => setUpdatedTeacher({...updatedTeacher, subject: e.target.value})}
                            className="border border-gray-300 p-2 w-full mb-2"
                        />
                        <label className="block mb-2">Туршлага:</label>
                        <textarea
                            value={updatedTeacher.experience || ''}
                            onChange={(e) => setUpdatedTeacher({...updatedTeacher, experience: e.target.value})}
                            className="border border-gray-300 p-2 w-full mb-4"
                        />
                        <div className="flex justify-end">
                            <button 
                                onClick={handleUpdate} 
                                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Хадгалах
                            </button>
                            <button 
                                onClick={() => setEditTeacher(null)} 
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Цуцлах
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
