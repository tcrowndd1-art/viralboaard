import { NavLink } from 'react-router-dom';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">ViralBoard</h1>
          <nav className="flex gap-4">
            <NavLink
              to="/data"
              data-testid="nav-data"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700'}`
              }
            >
              Data
            </NavLink>
            <NavLink
              to="/studio"
              data-testid="nav-studio"
              className={({ isActive }) =>
                `px-3 py-2 rounded ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700'}`
              }
            >
              AI Studio
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
