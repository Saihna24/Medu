import React, { useState, useEffect } from "react";

export const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [editStudent, setEditStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/students'); // API маршрут
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setStudents(data); // Мэдээллийг state-д хадгалах
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        fetchStudents();
    }, []); // Компонент анх удаа ачаалагдах үед л ажиллана

    // Огноог хүний уншиж болох формат руу хөрвүүлэх функц
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return 'Тодорхойгүй'; // Хэрэв огноо хөрвүүлэхэд алдаа гарвал
        }
        return date.toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Хэрэглэгчийн мэдээллийг устгах
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/students/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setStudents(students.filter(student => student.id !== id));
            } else {
                console.error('Delete failed:', await response.json());
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // Хэрэглэгчийн мэдээллийг шинэчлэх
    const handleUpdate = async (id, updatedStudent) => {
        try {
            const response = await fetch(`http://localhost:5000/api/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStudent),
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(students.map(student => student.id === id ? data : student));
                setEditStudent(null); // Засах модал хаах
            } else {
                console.error('Update failed:', await response.json());
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Сурагчидын мэдээлэл</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="py-2 px-4 text-left border-r border-gray-300">ID</th>
                            <th className="py-2 px-4 text-left border-r border-gray-300">Нэр</th>
                            <th className="py-2 px-4 text-left border-r border-gray-300">Овог</th>
                            <th className="py-2 px-4 text-left border-r border-gray-300">И-мэйл</th>
                            <th className="py-2 px-4 text-left border-r border-gray-300">Бүртгүүлсэн огноо</th>
                            <th className="py-2 px-4 text-left border-r border-gray-300">Хичээлийн тоо</th>
                            <th className="py-2 px-4 text-left border-r border-gray-300">И-мэйл баталгаажуулсан</th>
                            <th className="py-2 px-4 text-left border-r border-gray-300">Роль</th>
                            <th className="py-2 px-4 text-left">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id} className="border-b border-gray-300">
                                <td className="py-2 px-4 border-r border-gray-300">{student.id}</td>
                                <td className="py-2 px-4 border-r border-gray-300">{student.firstname}</td>
                                <td className="py-2 px-4 border-r border-gray-300">{student.lastname}</td>
                                <td className="py-2 px-4 border-r border-gray-300">{student.email}</td>
                                <td className="py-2 px-4 border-r border-gray-300">{formatDate(student.created_at)}</td>
                                <td className="py-2 px-4 border-r border-gray-300">{student.courses_taken}</td>
                                <td className="py-2 px-4 border-r border-gray-300">{student.is_verified ? 'Тийм' : 'Үгүй'}</td>
                                <td className="py-2 px-4 border-r border-gray-300">{student.role}</td>
                                <td className="py-2 px-4">
                                    <button 
                                        onClick={() => setEditStudent(student)}
                                        className="bg-yellow-500 text-white py-1 px-2 rounded mr-2">
                                        Засах
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(student.id)}
                                        className="bg-red-500 text-white py-1 px-2 rounded">
                                        Устгах
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Засах модал */}
            {editStudent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-2">Засах</h2>
                        <label className="block mb-2">Нэр
                            <input
                                type="text"
                                value={editStudent.firstname}
                                onChange={(e) => setEditStudent({ ...editStudent, firstname: e.target.value })}
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </label>
                        <label className="block mb-2">Овог
                            <input
                                type="text"
                                value={editStudent.lastname}
                                onChange={(e) => setEditStudent({ ...editStudent, lastname: e.target.value })}
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </label>
                        <label className="block mb-2">И-мэйл
                            <input
                                type="email"
                                value={editStudent.email}
                                onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </label>
                        <label className="block mb-2">Хичээлийн тоо
                            <input
                                type="number"
                                value={editStudent.courses_taken}
                                onChange={(e) => setEditStudent({ ...editStudent, courses_taken: e.target.value })}
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </label>
                        
                        <label className="block mb-2">Роль
                            <select
                                value={editStudent.role}
                                onChange={(e) => setEditStudent({ ...editStudent, role: e.target.value })}
                                className="border border-gray-300 rounded p-2 w-full"
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={() => handleUpdate(editStudent.id, editStudent)}
                                className="bg-green-500 text-white py-1 px-2 rounded mr-2">
                                Хадгалах
                            </button>
                            <button 
                                onClick={() => setEditStudent(null)}
                                className="bg-gray-500 text-white py-1 px-2 rounded">
                                Хаах
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
