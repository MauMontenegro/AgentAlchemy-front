import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Asegúrate de que este elemento exista en tu HTML
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