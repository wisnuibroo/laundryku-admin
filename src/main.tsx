import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { RouterProvider } from 'react-router-dom'
import route from './route.tsx'
import { ContextProvider } from './contexts/ContextsProvider.tsx'

// Pastikan elemen root ada sebelum merender aplikasi
const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ContextProvider>
        <RouterProvider router={route}/>
      </ContextProvider>
    </StrictMode>,
  )
} else {
  console.error('Elemen root tidak ditemukan!')
}
