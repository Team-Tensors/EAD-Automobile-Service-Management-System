import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContext.tsx'
import './globals.css'
import App from './App.tsx'

// Use BASE_URL from Vite config for proper routing
const basename = import.meta.env.BASE_URL

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
