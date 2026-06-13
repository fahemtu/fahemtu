import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Font self-hébergée (RGPD + offline) : Plus Jakarta Sans variable, axe normal
// (un seul woff2 par sous-ensemble, tous les poids 200–800). Aucun CDN.
import '@fontsource-variable/plus-jakarta-sans/wght.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
