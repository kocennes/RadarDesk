import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NexusC2Dashboard from './features/c2/NexusC2Dashboard'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NexusC2Dashboard />
  </StrictMode>,
)
