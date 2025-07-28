import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Disable react-pdf worker to prevent CDN loading
if (typeof window !== 'undefined') {
  window.pdfjsLib = null;
  // Prevent react-pdf from loading
  window.pdfjs = { disableWorker: true };
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('No se encontró el elemento "root". Verifica tu archivo HTML.');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}