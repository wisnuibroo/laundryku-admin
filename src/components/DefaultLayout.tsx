import { MouseEvent } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextsProvider';

export default function DefaultLayout() {
  const { user, token } = useStateContext();

  if (!token) {
    return <Navigate to="/login" />;
  }

  const onLogout = (ev: MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    // Tambahkan logika logout di sini jika perlu
  };

  return (
    <div id="defaultLayout">
      {/* Sidebar */}
      <aside>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/dashboard"> dan </Link>
        <Link to="/users">Users</Link>
      </aside>
      <div className="content">
        {/* Header */}
        <header>
          <div>
            {user?.name}
            <a href="#" onClick={onLogout} className="btn-logout">
              Logout
            </a>
          </div>
        </header>

        {/* Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
