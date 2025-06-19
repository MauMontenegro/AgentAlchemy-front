import React from 'react';
import { useAuth } from './AuthContext';

const AdminRoute = ({ children, fallback = null }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return fallback || (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-red-600">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }
  
  return children;
};

export default AdminRoute;