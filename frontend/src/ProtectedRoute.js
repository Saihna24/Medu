import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth'); // Нэвтрэх шаардлагагүй бол нэвтрэх хуудас руу шилжүүлнэ
    }
  }, [user, navigate]);

  return user ? children : null;
};

export default ProtectedRoute;
