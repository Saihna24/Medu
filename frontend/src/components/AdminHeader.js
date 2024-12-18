import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo2 from '../assets/logo2.png';

const AdminHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Идэвхтэй холбоосыг тодорхойлох функц
  const isActive = (path) => location.pathname === path;

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/'); // Гарах үед үндсэн хуудас руу шилжих
  };

  return (
    <header className="bg-primary text-white py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/admin-dashboard" className="flex items-center">
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
              to="/admin-dashboard"
              className={`px-4 py-2 mb-2 rounded-full ${isActive('/admin-dashboard') ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
              onClick={closeSidebar}
            >
              Сургалтын үйл ажиллагаа
            </Link>
            <Link
              to="/admin/students"
              className={`px-4 py-2 mb-2 rounded-full ${isActive('/admin/students') ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
              onClick={closeSidebar}
            >
              Хэрэглэгчид
            </Link>
            <Link
              to="/admin/teachers"
              className={`px-4 py-2 mb-2 rounded-full ${isActive('/admin/teachers') ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
              onClick={closeSidebar}
            >
              Багш нар
            </Link>
            <Link
              to="/profile"
              className={`px-4 py-2 mb-2 rounded-full ${isActive('/profile') ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
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
          </div>
        </div>

        {/* Navigation for large screens */}
        <nav className="hidden sm:flex items-center space-x-4">
          <Link
            to="/admin-dashboard"
            className={`px-4 py-2 rounded-full ${isActive('/admin-dashboard') ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
          >
            Сургалтын үйл ажиллагаа
          </Link>
          <Link
            to="/admin/students"
            className={`px-4 py-2 rounded-full ${isActive('/admin/students') ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
          >
            Хэрэглэгчид
          </Link>
          <Link
            to="/admin/teachers"
            className={`px-4 py-2 rounded-full ${isActive('/admin/teachers') ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
          >
            Багш нар
          </Link>
          <Link
            to="/profile"
            className={`px-4 py-2 rounded-full ${isActive('/profile') ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
          >
            Миний бүртгэл
          </Link>
          <button
            className="px-4 py-2 rounded-full hover:bg-red-500 text-white"
            onClick={handleLogout}
          >
            Гарах
          </button>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
