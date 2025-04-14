import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { RouterProvider } from 'react-router-dom'
import router from './router.tsx'
import { ContextProvider } from './contexts/ContextsProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContextProvider>
      <RouterProvider router={router}/>
    </ContextProvider>
  </StrictMode>,
)
