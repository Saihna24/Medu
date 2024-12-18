import React, { useEffect, useState } from 'react';

const AdminTeacherRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teacher-requests');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError('Серверийн алдаа');
        console.error(err);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setRequests(prevRequests =>
          prevRequests.filter(request => request.id !== id)
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Хүсэлтийн үйлдлийг гүйцэтгэж чадсангүй');
      }
    } catch (err) {
      setError('Сүлжээний алдаа');
      console.error(err);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Багшийн хүсэлтүүд
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <ul className="space-y-6">
          {requests.length > 0 ? (
            requests.map(request => (
              <li key={request.id} className="border-b border-gray-300 pb-4">
                {request.image && (
                  <img
                    src={`http://localhost:5000/${request.image}`}
                    alt="Зураг"
                    className="my-2 w-32 h-32 object-cover rounded-full mx-auto"
                  />
                )}
                <p><strong>И-мэйл:</strong> {request.email}</p>
                <p><strong>Нэр:</strong> {request.firstname}</p>
                <p><strong>Овог:</strong> {request.lastname}</p>
                <p><strong>Хичээлийн чиглэл:</strong> {request.subject}</p>
                <p><strong>Ажлын туршлага:</strong> {request.experience}</p>
                <p><strong>Нууц үг:</strong> {request.password}</p>
                <div className="flex justify-center gap-4 mt-4">
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
    </main>
  );
};

export default AdminTeacherRequestsPage;
