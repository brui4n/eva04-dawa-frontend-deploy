'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/utils/api';

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!id) return;

    async function loadCourseDetails() {
      try {
        const data = await fetchApi(`/courses/${id}`);
        if (data && data.course) {
          const { course } = data;
          
          // Verify ownership or Admin role
          if (course.teacherId !== user?.id && user?.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
          }

          setTitle(course.title);
          setDescription(course.description);
          setImageUrl(course.imageUrl || '');
        }
      } catch (err: any) {
        setError(err.message || 'Error al obtener los detalles del curso.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadCourseDetails();
    }
  }, [id, user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    setSaveLoading(true);
    try {
      await fetchApi(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, imageUrl })
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar los cambios.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (authLoading || loading) {
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
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Editar Información del Curso</h1>
            <p>Realiza las modificaciones necesarias para actualizar el syllabus y metadatos.</p>
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
                disabled={saveLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description-input">Descripción *</label>
              <textarea
                id="description-input"
                className="form-textarea"
                placeholder="Proporciona una descripción clara y detallada..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saveLoading}
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
                disabled={saveLoading}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saveLoading}
                style={{ flex: 1, padding: '12px 0' }}
              >
                {saveLoading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : 'Guardar Cambios'}
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
