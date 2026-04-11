import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

const navItems = [
  { to: '/buyers', label: 'Buyers' },
  { to: '/buyers/upload', label: 'Upload CSV' },
  { to: '/documents', label: 'Documents' },
  { to: '/progress', label: 'Progress' },
  { to: '/payments', label: 'Payments' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/projects', label: 'Projects' },
  { to: '/units', label: 'Units' },
];

export function AppShell() {
  const { admin, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1 className="sidebar__title">Unitary Care Admin</h1>
          <p className="sidebar__subtitle">Developer operations dashboard</p>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__profile">
            <strong>{admin?.fullName ?? 'Admin'}</strong>
            <span>{admin?.email ?? ''}</span>
          </div>
          <button type="button" className="button button--secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
