import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentHeader from './StudentHeader';
import TeacherHeader from './TeacherHeader';
import AdminHeader from './AdminHeader';

const Header = () => {
  const { user, logout } = useAuth(); // Ensure logout function is available in the AuthContext
  const [headerComponent, setHeaderComponent] = useState(<StudentHeader />);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          setHeaderComponent(<AdminHeader />);
          break;
        case 'teacher':
          setHeaderComponent(<TeacherHeader />);
          break;
        case 'student':
          setHeaderComponent(<StudentHeader />);
          break;
        default:
          setHeaderComponent(<StudentHeader />);
      }
    } else {
      setHeaderComponent(<StudentHeader />);
    }
  }, [user]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Call logout function if user is logged in
      if (user) {
        logout();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, logout]);

  return <>{headerComponent}</>;
};

export default Header;
