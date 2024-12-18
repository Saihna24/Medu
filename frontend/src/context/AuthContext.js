import React, { createContext, useState, useContext, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Импорт зөвшөөрнө

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Токен хүчинтэй эсэхийг шалгах функц
  const isTokenValid = (token) => {
    const decodedToken = jwtDecode(token);
    const now = Date.now() / 1000; // Үзэгдлийн одоогийн цагийг авах
    return decodedToken.exp > now;
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token && isTokenValid(token)) {
        try {
          const decodedToken = jwtDecode(token);
          setUser(decodedToken); // Хэрэглэгчийн мэдээллийг `decodedToken`-оор тохируулах
        } catch (err) {
          console.error('Error decoding token:', err);
          logout();
        }
      } else {
        setUser(null);
        localStorage.removeItem('token'); // Токен хүчинтэй бус бол устгах
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (userData) => {
    try {
      const decodedToken = jwtDecode(userData.token); // Токен задлах
      setUser(decodedToken); // Хэрэглэгчийн мэдээллийг тохируулах
      localStorage.setItem('token', userData.token);
    } catch (err) {
      console.error('Error during login:', err);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('token');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
