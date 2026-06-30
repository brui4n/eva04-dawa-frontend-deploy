'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingrese un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await register(email, password, name, role);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Inténtelo de nuevo.');
    }
  };

  return (
    <main className="page-wrapper flex-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '2.5rem' }}>✍️</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: '12px', marginBottom: '8px' }}>Crear Cuenta</h2>
            <p>Únete a Lumina LMS y comienza a aprender o enseñar</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name-input">Nombre Completo</label>
              <input
                id="name-input"
                type="text"
                className="form-input"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

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

            <div className="form-group">
              <label className="form-label" htmlFor="role-select">Tipo de Usuario</label>
              <select
                id="role-select"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)' }}
              >
                <option value="STUDENT" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  Estudiante (Quiero aprender)
                </option>
                <option value="TEACHER" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  Docente (Quiero publicar cursos)
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Contraseña</label>
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" htmlFor="confirm-password-input">Confirmar Contraseña</label>
              <input
                id="confirm-password-input"
                type="password"
                className="form-input"
                placeholder="Confirme su contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ padding: '12px 0' }}
            >
              {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : 'Registrarse'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
