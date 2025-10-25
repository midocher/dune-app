import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// NOUVEAU: Import du BrowserRouter
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* NOUVEAU: L'application est enveloppée dans le routeur */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

