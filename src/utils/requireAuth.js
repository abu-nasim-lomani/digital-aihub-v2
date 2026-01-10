import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to require admin authentication for actions
 * Returns a function that checks if user is admin, and redirects to login if not
 */
export const useRequireAuth = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (action = 'perform this action') => {
    if (!currentUser) {
      const currentPath = window.location.pathname;
      const shouldProceed = window.confirm(
        `You need to be logged in as admin to ${action}. Would you like to login now?`
      );
      if (shouldProceed) {
        navigate(`/admin?redirect=${encodeURIComponent(currentPath)}`);
      }
      return false;
    }
    
    // Check if user is admin
    if (!currentUser.isAdmin) {
      alert('Only administrators can perform this action. Please log in as admin.');
      return false;
    }
    
    return true;
  };

  return { requireAuth, isAuthenticated: !!currentUser, isAdmin: currentUser?.isAdmin || false };
};
