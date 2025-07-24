import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MainLayout from './components/MainLayout';
import HomePage from './components/HomePage';
import ResearchModulePage from './components/ResearchModulePage';
import OCRModulePage from './components/OCRModulePage';
import ChatAgent from './components/ChatAgent';
import AdminRoute from './components/AdminRoute';
import AdminPanel from './components/AdminPanel';

function App() {
  console.log('App component rendered');
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes - Layout principal con sidebar modular */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Página principal */}
            <Route index element={<HomePage />} />
            
            {/* Chat Agent */}
            <Route path="chat" element={<ChatAgent />} />
            
            {/* Módulo Research & News */}
            <Route path="modules/research/*" element={<ResearchModulePage />} />
            
            {/* OCR & Documents Module */}
            <Route path="modules/ocr/*" element={<OCRModulePage />} />
            
            {/* Otros módulos (placeholder para futuro desarrollo) */}
            <Route path="modules/rd" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Módulo I+D</h1>
                <p className="text-gray-600">Este módulo estará disponible próximamente.</p>
              </div>
            } />
            
            <Route path="modules/monitoring" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Módulo Monitoring</h1>
                <p className="text-gray-600">Este módulo estará disponible próximamente.</p>
              </div>
            } />
            
            {/* Admin Panel - Only accessible to admin users */}
            <Route path="admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
          </Route>
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;