import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          const response = await authAPI.me();
          setCurrentUser(response.data);
        } catch {
          // Token invalid or expired
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, user } = response.data;

    // Store token and user
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);

    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      // Always clear local state
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
    }
  };

  const signup = async (email, password, fullName) => {
    const response = await authAPI.signup({ email, password, fullName });

    // Check if account requires approval
    if (response.data.requiresApproval) {
      // Don't auto-login, just return the response
      return response.data;
    }

    // Only auto-login if approval is not required
    const { token, user } = response.data;

    // Store token and user
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);

    return response.data;
  };

  const value = {
    currentUser,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
