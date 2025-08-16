import Providers from '@/app/providers'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
