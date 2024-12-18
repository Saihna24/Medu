import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo2 from '../assets/logo2.png';
import { useAuth } from '../context/AuthContext';

const StudentHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/'); // Гарахад дараа нүүр хуудас руу шилжүүлэх
  };

  return (
    <header className="bg-primary text-white py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo2} alt="Online Courses Logo" className="h-10" />
        </Link>

        {/* Sidebar Toggle Button */}
        <button 
          className="sm:hidden text-white text-2xl"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? '×' : '☰'}
        </button>

        {/* Sidebar for small screens */}
        <div 
          className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} sm:hidden`}
          onClick={closeSidebar}
        >
          <div className="flex flex-col p-4 bg-gray-800 text-white" onClick={(e) => e.stopPropagation()}>
            <button 
              className="text-white text-2xl mb-4"
              onClick={() => setIsSidebarOpen(false)}
            >
              &times;
            </button>
            <Link
              to="/"
              className={`px-4 py-2 mb-2 rounded-full ${isActive('/') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
              onClick={closeSidebar}
            >
              Нүүр
            </Link>
            <Link
              to="/courses"
              className={`px-4 py-2 mb-2 rounded-full ${isActive('/courses') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
              onClick={closeSidebar}
            >
              Сургалт
            </Link>
            {user && ( // Хэрэв хэрэглэгч нэвтэрсэн бол л харуулах
              <Link
                to="/my-courses"
                className={`px-4 py-2 mb-2 rounded-full ${isActive('/my-courses') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
                onClick={closeSidebar}
              >
                Миний сургалтууд
              </Link>
            )}
            <Link
              to="/about"
              className={`px-4 py-2 mb-2 rounded-full ${isActive('/about') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
              onClick={closeSidebar}
            >
              Бидний тухай
            </Link>
            {!user ? (
              <Link
                to="/auth"
                className={`px-4 py-2 mb-2 rounded-full ${isActive('/auth') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
                onClick={closeSidebar}
              >
                Нэвтрэх/Бүртгүүлэх
              </Link>
            ) : (
              <>
                <Link
                  to="/profile"
                  className={`px-4 py-2 mb-2 rounded-full ${isActive('/profile') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
                  onClick={closeSidebar}
                >
                  Миний бүртгэл
                </Link>
                <button 
                  className="px-4 py-2 mb-2 rounded-full hover:bg-red-500 text-white"
                  onClick={handleLogout}
                >
                  Гарах
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation for large screens */}
        <nav className="hidden sm:flex items-center space-x-4">
          <Link
            to="/"
            className={`px-4 py-2 rounded-full ${isActive('/') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
          >
            Нүүр
          </Link>
          <Link
            to="/courses"
            className={`px-4 py-2 rounded-full ${isActive('/courses') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
          >
            Сургалт
          </Link>
          {user && ( // Хэрэв хэрэглэгч нэвтэрсэн бол л харуулах
            <Link
              to="/my-courses"
              className={`px-4 py-2 rounded-full ${isActive('/my-courses') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
            >
              Миний сургалтууд
            </Link>
          )}
          <Link
            to="/about"
            className={`px-4 py-2 rounded-full ${isActive('/about') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
          >
            Бидний тухай
          </Link>
          {!user ? (
            <Link
              to="/auth"
              className={`px-4 py-2 rounded-full ${isActive('/auth') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
            >
              Нэвтрэх/Бүртгүүлэх
            </Link>
          ) : (
            <>
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-full ${isActive('/profile') ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
              >
                Миний бүртгэл
              </Link>
              <button 
                className="px-4 py-2 rounded-full hover:bg-red-500 text-white"
                onClick={handleLogout}
              >
                Гарах
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default StudentHeader;
