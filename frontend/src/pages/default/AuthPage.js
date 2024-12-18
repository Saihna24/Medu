import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthPage = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) navigate('/auth');
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleForgotPassword = useCallback(() => {
    navigate('/resetPass');
  }, [navigate]);

  const handleSubmit = async (event) => {
  event.preventDefault();
  setError('');
  setSuccess('');

  if (!isLogin && password !== repassword) {
    setError('Нууц үгүүд тохирохгүй байна');
    return;
  }

  try {
    const endpoint = isLogin ? 'login' : 'register';
    const body = isLogin
      ? JSON.stringify({ email, password })
      : JSON.stringify({ email, password, firstname, lastname });

    const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const data = await response.json();

    if (response.ok) {
      if (isLogin) {
        localStorage.setItem('token', data.token);
        login(data);

        // Хэрэглэгчийн үүргийг серверээс авах
        const userResponse = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const userData = await userResponse.json();

        if (userResponse.ok) {
          if (userData.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (userData.role === 'teacher') {
            navigate('/teacher-dashboard');
          } else {
            navigate('/courses');
          }
        } else {
          setError(userData.error || 'Хэрэглэгчийн үүрэг тодорхойлогдсонгүй');
        }
      } else {
        setSuccess('Бүртгэл амжилттай! И-мэйлээ шалгаж баталгаажуулах кодоо авна уу.');
        setIsVerificationPending(true);
      }
    } else {
      setError(data.error || 'Юу ч буруу байна');
    }
  } catch (err) {
    setError('Сүлжээний алдаа');
    console.error(err);
  }
};



  const handleVerification = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await response.json();

      if (response.ok) {
        const loginResponse = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem('token', loginData.token);
          login(loginData);
          navigate('/courses');
        } else {
          setError(loginData.error || 'Нэвтрэх алдаа');
        }
      } else {
        setError(data.error || 'Баталгаажуулалт амжилтгүй');
      }
    } catch (err) {
      setError('Сүлжээний алдаа');
      console.error(err);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          {isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
        </h1>
        {!isVerificationPending && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">И-мэйл</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isVerificationPending}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Нууц үг</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isVerificationPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? 'хаах' : 'харах'}
                </button>
              </div>
            </div>
            {!isLogin && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Нууц үг дахин оруулах</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={repassword}
                      onChange={(e) => setRepassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={isVerificationPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? 'хаах' : 'харах'}
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Нэр</label>
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={isVerificationPending}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Овог</label>
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={isVerificationPending}
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full mb-4"
              disabled={isVerificationPending}
            >
              {isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
            </button>
          </form>
        )}
        {isVerificationPending && (
          <form onSubmit={handleVerification} className="mt-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Баталгаажуулах код</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
            >
              Баталгаажуулах
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-gray-600">
          {isLogin ? 'Шинэ хэрэглэгч үү? ' : 'Хэрэв бүртгэлтэй бол? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 font-semibold"
          >
            {isLogin ? 'Бүртгүүлэх' : 'Нэвтрэх'}
          </button>
        </p>
        <p className="mt-4 text-center text-gray-600">
        {isLogin && (
            <button
              onClick={handleForgotPassword}
              // className="text-blue-500 underline"
              className="text-blue-500 font-semibold"
            >
              Нууц үгээ мартсан эсвэл шинэчлэх?
            </button>
          )}
        </p>
        <p className="mt-4 text-center text-gray-600">
          <a
            href="/register-teacher"
            className="text-blue-500 font-semibold"
          >
            Багшаар бүртгүүлэх
          </a>
        </p>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {success && <p className="mt-4 text-green-600 text-center">{success}</p>}
      </div>
    </main>
  );
};

export default AuthPage;
