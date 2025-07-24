import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModuleNavigation from './ModuleNavigation';
import OCRAgentPage from './OCRAgentPage';
import ChatAgent from './ChatAgent';

const OCRModulePage = () => {
  const agents = [
    {
      id: 'ocr',
      name: 'OCR Agent',
      path: '/modules/ocr/agent',
      description: 'Optical Character Recognition and Document Processing'
    },
    {
      id: 'chat',
      name: 'Chat Agent',
      path: '/modules/ocr/chat',
      description: 'AI Assistant with chat interface'
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Module Navigation */}
      <ModuleNavigation 
        moduleTitle="OCR & Documents" 
        agents={agents}
      />
      
      {/* Agent Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          {/* Default redirect to OCR Agent */}
          <Route path="/" element={<Navigate to="/modules/ocr/agent" replace />} />
          <Route path="/agent" element={<OCRAgentPage />} />
          <Route path="/chat" element={<ChatAgent />} />
        </Routes>
      </div>
    </div>
  );
};

export default OCRModulePage;