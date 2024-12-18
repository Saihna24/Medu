import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TeacherRequestForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requests, setRequests] = useState([]);
    const [matchedRequests, setMatchedRequests] = useState([]); // Шинээр нэмэгдсэн state
    const { user } = useAuth(); // `useAuth` hook-г ашиглана

    // Хүсэлтүүдийг авах
    useEffect(() => {
        const fetchRequests = async () => {
            if (user?.email) {
                try {
                    const response = await axios.get(`/api/requests?teacher_email=${user.email}`);
                    const requests = response.data;

                    // Хүсэлтүүдийг `requests` state-д хадгалах
                    setRequests(requests);

                    // `user.email`-тэй адил `teacher_email`-тэй бүх хүсэлтүүдийг харуулах
                    const matched = requests.filter(request => request.teacher_email === user.email);
                    setMatchedRequests(matched);

                } catch (error) {
                    console.error('Failed to fetch requests:', error.response?.data || error.message);
                }
            }
        };

        fetchRequests();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.email) {
            alert('User email not found');
            return;
        }
        try {
            await axios.post('/api/requests', { title, description, teacher_email: user.email });
            alert('Request sent successfully');
            setTitle('');
            setDescription('');
            const response = await axios.get(`/api/requests?teacher_email=${user.email}`);
            const requests = response.data;
            setRequests(requests);

            // Update matchedRequests
            const matched = requests.filter(request => request.teacher_email === user.email);
            setMatchedRequests(matched);

        } catch (error) {
            console.error('Request failed:', error.response?.data || error.message);
            alert('Failed to send request');
        }
    };

    const handleDelete = async (requestId) => {
        try {
            await axios.delete(`/api/requests/${requestId}`);
            const response = await axios.get(`/api/requests?teacher_email=${user.email}`);
            const requests = response.data;
            setRequests(requests);

            // Update matchedRequests
            const matched = requests.filter(request => request.teacher_email === user.email);
            setMatchedRequests(matched);

        } catch (error) {
            console.error('Failed to delete request:', error.response?.data || error.message);
            alert('Failed to delete request');
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Шинэ сургалт үүсгэх хүсэлт</h2>
            {user && (
                <div className="mb-4">
                    <p className="text-lg"><strong>Нэвтэрсэн багш:</strong> {user.email}</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Хичээлийн төрөл</label>
                    <input 
                        id="title"
                        type="text" 
                        placeholder="Хичээлийн төрөлөө бичнэ үү" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Хичээлийн тайлбар</label>
                    <textarea 
                        id="description"
                        placeholder="Хичээлийн тайлбараа бичнэ үү" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-bright focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Хүсэлт илгээх
                </button>
            </form>
            
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Миний Хүсэлтүүд</h3>
                <ul className="space-y-4">
                    {matchedRequests.length > 0 ? (
                        matchedRequests.map((request) => (
                            <li key={request.id} className="border border-gray-300 p-4 rounded-md">
                                <h4 className="text-lg"><strong>Хичээлийн төрөл:</strong> {request.title}</h4>
                                <p className="mt-2"><strong>Хичээлийн тайлбар:</strong> {request.description}</p>
                                <p className={`mt-2 text-sm ${request.status === 'approved' ? 'text-green-500' : request.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                                    <strong>Статус:</strong> {request.status === 'approved' ? 'Зөвшөөрөгдсөн' : request.status === 'rejected' ? 'Зөвшөөрөөгүй' : 'Хүлээгдэж байна'}
                                </p>
                                <button 
                                    onClick={() => handleDelete(request.id)}
                                    className="mt-2 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Устгах
                                </button>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-600">Хүсэлтүүд байхгүй байна.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default TeacherRequestForm;
