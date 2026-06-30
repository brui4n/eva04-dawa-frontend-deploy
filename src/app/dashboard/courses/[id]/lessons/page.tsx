'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/utils/api';

interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl: string | null;
  order: number;
}

interface Course {
  id: number;
  title: string;
  teacherId: number;
  lessons: Lesson[];
}

export default function ManageLessonsPage() {
  const { id } = useParams(); // course ID
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states (handles both Create and Update)
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [order, setOrder] = useState('0');

  const loadCourseLessons = async () => {
    try {
      const data = await fetchApi(`/courses/${id}`);
      if (data && data.course) {
        // Verify ownership
        if (data.course.teacherId !== user?.id && user?.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
        setCourse(data.course);
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener las lecciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id && user) {
      loadCourseLessons();
    }
  }, [id, user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !content) {
      setError('Por favor, complete los campos obligatorios (título y contenido).');
      return;
    }

    setFormLoading(true);
    try {
      if (editingLessonId) {
        // UPDATE Lesson
        await fetchApi(`/lessons/${editingLessonId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title,
            content,
            videoUrl: videoUrl || null,
            order: Number(order)
          })
        });
      } else {
        // CREATE Lesson
        await fetchApi(`/lessons/course/${id}`, {
          method: 'POST',
          body: JSON.stringify({
            title,
            content,
            videoUrl: videoUrl || null,
            order: Number(order)
          })
        });
      }

      // Reset form
      resetForm();
      // Reload lessons list
      await loadCourseLessons();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la lección.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setContent(lesson.content);
    setVideoUrl(lesson.videoUrl || '');
    setOrder(String(lesson.order));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (lessonId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta lección? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await fetchApi(`/lessons/${lessonId}`, { method: 'DELETE' });
      await loadCourseLessons();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la lección.');
    }
  };

  const resetForm = () => {
    setEditingLessonId(null);
    setTitle('');
    setContent('');
    setVideoUrl('');
    setOrder('0');
  };

  if (authLoading || loading) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <main className="page-wrapper">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Materia: {course.title}</span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '4px' }}>Gestionar Lecciones (Syllabus)</h1>
          </div>
          <Link href="/dashboard" className="btn btn-secondary">
            &larr; Volver al Dashboard
          </Link>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '32px' }}>
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {/* Form Column - Left */}
          <section className="glass-panel" style={{ flex: '1 1 450px', padding: '30px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>
              {editingLessonId ? '✏️ Editar Lección' : '➕ Agregar Nueva Lección'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="lesson-title">Título de la Lección *</label>
                <input
                  id="lesson-title"
                  type="text"
                  className="form-input"
                  placeholder="Ej. 1. Introducción al entorno de ejecución"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lesson-order">Número de Orden</label>
                <input
                  id="lesson-order"
                  type="number"
                  className="form-input"
                  placeholder="0, 1, 2..."
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lesson-video">URL del Video de YouTube (Opcional)</label>
                <input
                  id="lesson-video"
                  type="text"
                  className="form-input"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="lesson-content">Contenido de la Lección (Texto/Markdown) *</label>
                <textarea
                  id="lesson-content"
                  className="form-textarea"
                  placeholder="Escribe la materia, explicaciones teóricas o instrucciones..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={formLoading}
                  required
                  style={{ minHeight: '200px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px 0' }}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                  ) : editingLessonId ? (
                    'Guardar Lección'
                  ) : (
                    'Crear Lección'
                  )}
                </button>
                
                {editingLessonId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px 0' }}
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* List Column - Right */}
          <section style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Syllabus Actual ({course.lessons.length} Lecciones)</h2>

            {course.lessons.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Este curso no tiene lecciones aún. Utiliza el formulario de la izquierda para agregar la primera.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {course.lessons.map((lesson) => (
                  <article
                    key={lesson.id}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '20px',
                      borderLeft: editingLessonId === lesson.id ? '4px solid var(--primary)' : '1px solid var(--border-glass)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orden: {lesson.order}</span>
                      <h3 style={{ fontSize: '1.1rem', marginTop: '2px', color: 'var(--text-primary)' }}>{lesson.title}</h3>
                      <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '6px'
                      }}>
                        {lesson.content}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => handleEditClick(lesson)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(lesson.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
