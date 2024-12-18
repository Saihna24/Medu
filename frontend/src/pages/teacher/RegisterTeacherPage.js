import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterTeacherPage = () => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [subject, setSubject] = useState('');
  const [experience, setExperience] = useState('');
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setPasswordError('');

    if (!validatePassword(password)) {
      setPasswordError('Нууц үг 8 тэмдэгттэй, 1 том үсэг, 1 тоо, 1 тэмдэгт агуулсан байх ёстой');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('subject', subject);
    formData.append('experience', experience);
    if (image) formData.append('image', image);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:5000/api/request-teacher', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('Багшийн хүсэлт амжилттай илгээлээ!');
        setTimeout(() => navigate('/auth'), 2000); // 2 секунд хүлээж, /auth хуудас руу шилжих
      } else {
        const data = await response.json();
        toast.error(data.error || 'Юу ч буруу байна');
        setError(data.error || 'Юу ч буруу байна');
      }
    } catch (err) {
      toast.error('Сүлжээний алдаа');
      setError('Сүлжээний алдаа');
      console.error(err);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Багшаар бүртгүүлэх
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Нэр</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#99FFA9]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Овог</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#99FFA9]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">И-мэйл</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#99FFA9]"
              required
            />
          </div>
          <div className="mb-4 flex flex-col">
            <label className="block text-gray-700 mb-2">Нууц үг</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`p-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#99FFA9]`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
              >
                {showPassword ? 'хаах' : 'харах'}
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Хичээлийн чиглэл</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#99FFA9]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ажлын туршлага</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#99FFA9]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Зураг</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="border border-gray-300 rounded-lg w-full"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#99FFA9] text-gray-800 py-2 px-4 rounded-lg shadow-md hover:bg-[#80e09d]"
          >
            Илгээх
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full text-blue-600  hover:text-blue-800 mr-4"
          >
           Буцах
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </main>
  );
};

export default RegisterTeacherPage;
