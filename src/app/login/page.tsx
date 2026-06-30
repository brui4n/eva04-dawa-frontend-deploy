'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!email || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingrese un correo electrónico válido.');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Inténtelo de nuevo.');
    }
  };

  return (
    <main className="page-wrapper flex-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '2.5rem' }}>🔐</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: '12px', marginBottom: '8px' }}>Iniciar Sesión</h2>
            <p>Accede a tu cuenta de Lumina LMS</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Correo Electrónico</label>
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="password-input">Contraseña</label>
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ padding: '12px 0' }}
            >
              {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : 'Ingresar'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            ¿No tienes una cuenta?{' '}
            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
