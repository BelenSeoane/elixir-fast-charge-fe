import { useLocation } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const username = location.state?.username || 'Guest';

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Welcome, {username}!</h1>
    </div>
  );
}
