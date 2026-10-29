import { Outlet } from 'react-router';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-page font-sans text-ink">
      <Outlet />
    </div>
  );
}
