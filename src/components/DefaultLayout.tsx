import { Navigate, Outlet } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextsProvider';

export default function DefaultLayout() {
  const { token } = useStateContext();

  if (!token) {
    return <Navigate to="/landing/page" />
  }

  return (
    <div>
      <Outlet />
    </div>
  )
}
