import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModuleNavigation from './ModuleNavigation';
import OCRAgentPage from './OCRAgentPage';


const OCRModulePage = () => {
  const agents = [
    {
      id: 'ocr',
      name: 'Agente OCR',
      path: '/modules/ocr/agent',
      description: 'Reconocimiento Óptico de Caracteres y Procesamiento de Documentos'
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Module Navigation */}
      <ModuleNavigation 
        moduleTitle="OCR y Documentos" 
        agents={agents}
      />
      
      {/* Agent Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          {/* Default redirect to OCR Agent */}
          <Route path="/" element={<Navigate to="/modules/ocr/agent" replace />} />
          <Route path="/agent" element={<OCRAgentPage />} />

        </Routes>
      </div>
    </div>
  );
};

export default OCRModulePage;