import { MouseEvent } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextsProvider';
import axiosInstance from '../lib/axios';

export default function DefaultLayout() {
  const { user, token } = useStateContext();

  if (!token) {
    return <Navigate to="/login" />;
  }

  const { setUser, setToken } = useStateContext();

  const onLogout = async (ev: MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    
    try {
      await axiosInstance.post('/admin/logout');
      // Hapus token jeung user data
      setUser(null);
      setToken(null);
      
      // Redirect ka halaman login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Tetep logout sacara lokal sanajan API na gagal
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  return (
    <div id="defaultLayout">
      {/* Sidebar */}
     

        {/* Content */}
        <main>
          <Outlet />
        </main>
      </div>

  );
}
