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

    // Don't override Content-Type if it's a FormData (file upload)
    const isFormData = options.body && options.body instanceof FormData;
    
    const config = {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(!isFormData && { 'Content-Type': 'application/json' }), // Only set for non-FormData
        ...options.headers,
      },
    };
    
    // Log request details for debugging
    console.log('Sending request to:', endpoint, {
      method: config.method || 'GET',
      headers: config.headers,
      body: isFormData ? '[FormData]' : config.body
    });

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