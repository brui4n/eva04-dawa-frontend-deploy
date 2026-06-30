'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/utils/api';

export default function NewCoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description) {
      setError('Por favor, complete todos los campos obligatorios (título y descripción).');
      return;
    }

    setLoading(true);
    try {
      await fetchApi('/courses', {
        method: 'POST',
        body: JSON.stringify({ title, description, imageUrl })
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al crear el curso.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <main className="page-wrapper">
      <div className="container" style={{ maxWidth: '650px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <header style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Crear Nuevo Curso</h1>
            <p>Ingresa la información general de la materia. Luego podrás añadir lecciones.</p>
          </header>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title-input">Título del Curso *</label>
              <input
                id="title-input"
                type="text"
                className="form-input"
                placeholder="Ej. Introducción a Node.js y Bases de Datos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description-input">Descripción *</label>
              <textarea
                id="description-input"
                className="form-textarea"
                placeholder="Proporciona una descripción clara y detallada de lo que aprenderán los alumnos..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                required
              ></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label" htmlFor="image-input">URL de la Imagen de Portada (Opcional)</label>
              <input
                id="image-input"
                type="url"
                className="form-input"
                placeholder="https://ejemplo.com/portada.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1, padding: '12px 0' }}
              >
                {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : 'Crear Curso'}
              </button>
              <Link href="/dashboard" className="btn btn-secondary" style={{ flex: 1, padding: '12px 0' }}>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
