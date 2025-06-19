import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useAuthenticatedFetch from './useAuthenticatedFetch';

const UserProfile = () => {
  const { user } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ejemplo de cómo hacer una petición autenticada
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch('/users/me');
      const userData = await response.json();
      console.log('User data from server:', userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Perfil de Usuario</h2>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-500">Usuario:</label>
          <p className="text-gray-900">{user?.username}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Email:</label>
          <p className="text-gray-900">{user?.email}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Rol:</label>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user?.role === 'admin' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {user?.role}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={fetchUserData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Actualizar datos'}
        </button>
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;