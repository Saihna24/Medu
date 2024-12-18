import { useState, useEffect } from 'react';

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' // Ensure correct content type is sent
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            // Handle specific status codes if needed
            if (response.status === 401 || response.status === 403) {
              // Unauthorized or forbidden, clear user
              localStorage.removeItem('token');
              setUser(null);
            } else {
              // Other errors, could log or handle differently
              console.error('Failed to fetch user:', response.statusText);
              setUser(null);
            }
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          setUser(null);
        }
      } else {
        // No token, set user to null
        setUser(null);
      }
    };

    fetchUser();

    // Optional: Add cleanup function to reset state on unmount
    return () => {
      setUser(null);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return { user };
};
