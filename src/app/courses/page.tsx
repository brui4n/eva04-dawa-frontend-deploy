'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';

interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  teacher: { name: string; email: string };
  _count: { lessons: number; enrollments: number };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await fetchApi('/courses');
        if (data && data.courses) {
          setCourses(data.courses);
        }
      } catch (err: any) {
        setError(err.message || 'No se pudieron cargar los cursos.');
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase()) ||
    course.teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="page-wrapper">
      <div className="container">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Catálogo de Cursos</h1>
          <p>Explora nuestra oferta académica y comienza a capacitarte hoy mismo.</p>
        </header>

        {/* Search Bar */}
        <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por título, descripción o docente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: '8px 0', width: '100%', fontSize: '1.05rem' }}
          />
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '12px' }}>
            <div className="spinner"></div>
            <p>Cargando catálogo...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass-panel" style={{ padding: '80px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>📚</span>
            <h3>No se encontraron cursos</h3>
            <p style={{ marginTop: '8px' }}>
              {search ? 'Intenta buscando con palabras clave diferentes.' : 'Actualmente no hay cursos publicados.'}
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {filteredCourses.map((course) => (
              <article key={course.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  {course.imageUrl ? (
                    <div style={{
                      height: '160px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      position: 'relative'
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      height: '160px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      📖
                    </div>
                  )}
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                    {course.title}
                  </h2>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '16px'
                  }}>
                    {course.description}
                  </p>
                </div>
                <div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Instructor: <strong>{course.teacher.name}</strong></span>
                    <span>Lecciones: <strong>{course._count.lessons}</strong></span>
                  </div>
                  <Link href={`/courses/${course.id}`} className="btn btn-primary btn-full" style={{ marginTop: '16px', padding: '10px 0' }}>
                    Ver Detalles
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
