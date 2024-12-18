import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        setUser(data);
        setFormData({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email
        });

      } catch (err) {
        console.error('Network error:', err);
        navigate('/auth');
      }
    };

    if (!localStorage.getItem('token')) {
      navigate('/auth');
    } else {
      fetchUser();
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleLogout = () => {
    if (user && user.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (user && user.role === 'teacher') {
      navigate('/teacher-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleSave = async () => {
    if (
      formData.firstname === user.firstname &&
      formData.lastname === user.lastname &&
      formData.email === user.email
    ) {
      toast.error('Та мэдээлэлээ өөрчилсөнгүй.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }
  
      const data = await response.json();
      setUser(data);
      setIsEditing(false);
      toast.success('Мэдээлэл амжилттай өөрчлөгдлөө!');
  
    } catch (err) {
      console.error('Network error:', err);
      toast.error('Failed to update profile.');
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email
    });
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Таны мэдээлэл
        </h1>
        {isEditing ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Нэр</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#99FFA9]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Овог</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#99FFA9]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">И-мэйл</label>
              <p className="p-2 border border-gray-300 rounded-lg bg-gray-200">{formData.email}</p>
            </div>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleSave}
                className="bg-[#99FFA9] text-gray-800 py-2 px-6 rounded-lg shadow-md hover:bg-[#80e09d]"
              >
                Хадгалах
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-gray-600"
              >
                Болих
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Нэр</label>
              <p className="p-2 border border-gray-300 rounded-lg">{user.firstname}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Овог</label>
              <p className="p-2 border border-gray-300 rounded-lg">{user.lastname}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">И-мэйл</label>
              <p className="p-2 border border-gray-300 rounded-lg">{user.email}</p>
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={handleEdit}
                className="bg-yellow-300 text-gray-800 py-2 px-6 rounded-lg shadow-md hover:bg-yellow-400"
              >
                Мэдээлэлээ засах
              </button>
            </div>
          </>
        )}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLogout}
            className="bg-gray-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-gray-600"
          >
            Гарах
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </main>
  );
};

export default ProfilePage;
