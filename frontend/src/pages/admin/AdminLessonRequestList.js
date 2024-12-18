import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminRequestList = () => {
    const [requests, setRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/requests');
                setRequests(response.data.filter(req => req.status === 'pending'));
                setApprovedRequests(response.data.filter(req => req.status === 'approved'));
            } catch (error) {
                setError('Серверийн алдаа');
                console.error(error);
            }
        };
        fetchRequests();
    }, []);

    const handleAction = async (id, action) => {
        try {
            const response = await axios.patch(`http://localhost:5000/api/requests/${id}`, { action });
            console.log('Request updated:', response.data);
            setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
            if (action === 'approve') {
                setApprovedRequests(prevRequests => [...prevRequests, response.data]);
            }
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/requests/${id}`);
            setApprovedRequests(prevRequests => prevRequests.filter(req => req.id !== id));
        } catch (error) {
            setError('Серверийн алдаа');
            console.error('API Error:', error.response?.data || error.message);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col overflow-y-auto max-h-96">
                    <h3 className="text-2xl font-semibold mb-4">Хүлээгдэж буй хүсэлтүүд</h3>
                    <ul className="space-y-6 mb-8">
                        {requests.length > 0 ? (
                            requests.map((request) => (
                                <li key={request.id} className="border-b border-gray-300 pb-4">
                                    <p><strong>Хичээлийн нэр:</strong> {request.title}</p>
                                    <p><strong>Тайлбар:</strong> {request.description}</p>
                                    <p><strong>Статус:</strong> <span className='text-yellow-400'>{'Хүлээгдэж байна'}</span></p>
                                    <p><strong>Багшийн И-мэйл:</strong> {request.teacher_email}</p>
                                    <div className="flex space-x-4 mt-4">
                                        <button
                                            onClick={() => handleAction(request.id, 'approve')}
                                            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                                        >
                                            Зөвшөөрөх
                                        </button>
                                        <button
                                            onClick={() => handleAction(request.id, 'reject')}
                                            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                                        >
                                            Татгалзах
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-center text-gray-600">Хүсэлтүүд байхгүй байна.</p>
                        )}
                    </ul>
                </div>

                <div className="flex flex-col overflow-y-auto max-h-96">
                    <h3 className="text-2xl font-semibold mb-4">Зөвшөөрсөн хүсэлтүүд</h3>
                    <ul className="space-y-6">
                        {approvedRequests.length > 0 ? (
                            approvedRequests.map((request) => (
                                <li key={request.id} className="border-b border-gray-300 pb-4">
                                    <p><strong>Хичээлийн нэр:</strong> {request.title}</p>
                                    <p><strong>Тайлбар:</strong> {request.description}</p>
                                    <p><strong>Статус:</strong> <span className="text-green-600">Зөвшөөрөгдсөн</span></p>
                                    <p><strong>Багшийн И-мэйл:</strong> {request.teacher_email}</p>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleDelete(request.id)}
                                            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                                        >
                                            Устгах
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-center text-gray-600">Зөвшөөрсөн хүсэлтүүд байхгүй байна.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminRequestList;
