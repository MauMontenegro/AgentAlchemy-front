import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import HomePage from './components/HomePage';
import ResearchModulePage from './components/ResearchModulePage';

function App() {
  console.log('App component rendered');
  
  return (
    <Router>
      <Routes>
        {/* Layout principal con sidebar modular */}
        <Route path="/" element={<MainLayout />}>
          {/* Página principal */}
          <Route index element={<HomePage />} />
          
          {/* Módulo Research & News */}
          <Route path="modules/research/*" element={<ResearchModulePage />} />
          
          {/* Otros módulos (placeholder para futuro desarrollo) */}
          <Route path="modules/ocr" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Módulo OCR</h1>
              <p className="text-gray-600">Este módulo estará disponible próximamente.</p>
            </div>
          } />
          
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
