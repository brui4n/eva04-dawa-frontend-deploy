'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'badge badge-admin';
      case 'TEACHER': return 'badge badge-teacher';
      default: return 'badge badge-student';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'TEACHER': return 'Docente';
      default: return 'Estudiante';
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="nav-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)'}}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Lumina<span style={{color: 'var(--primary)'}}>LMS</span></span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link href="/courses" className={`nav-link ${pathname === '/courses' ? 'active' : ''}`}>
              Cursos
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href="/dashboard" className={`nav-link ${pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {user.name}
                </span>
                <span className={getRoleBadgeClass(user.role)}>
                  {getRoleName(user.role)}
                </span>
              </li>
              <li>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className={`nav-link ${pathname === '/login' ? 'active' : ''}`}>
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  Registrarse
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
