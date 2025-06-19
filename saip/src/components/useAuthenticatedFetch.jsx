import { useAuth } from './AuthContext';

// Cambiado a una declaración de función nombrada en lugar de una exportación constante
function useAuthenticatedFetch() {
  const { logout } = useAuth();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const authenticatedFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      logout();
      throw new Error('No authentication token found');
    }

    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        logout();
        throw new Error('Session expired');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Request failed');
      }
      
      return response;
    } catch (error) {
      if (error.message === 'Session expired') {
        logout();
      }
      throw error;
    }
  };

  return authenticatedFetch;
}

export default useAuthenticatedFetch;