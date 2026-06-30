'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  teacher: { name: string };
  _count: { lessons: number; enrollments: number };
}

export default function LandingPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedCourses() {
      try {
        const data = await fetchApi('/courses');
        if (data && data.courses) {
          // Show top 3 featured courses on home
          setCourses(data.courses.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading featured courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFeaturedCourses();
  }, []);

  return (
    <main className="page-wrapper" style={{ padding: 0 }}>
      {/* Hero Section */}
      <section style={{
        padding: '100px 0 80px 0',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div className="container">
          <span style={{
            display: 'inline-block',
            padding: '6px 12px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#a5b4fc',
            marginBottom: '20px'
          }}>
            NUEVA PLATAFORMA LMS V2.0
          </span>
          <h1 style={{ fontSize: '3.8rem', marginBottom: '24px', fontWeight: '800', lineHeight: 1.1 }}>
            Aprende sin límites con <br />
            <span className="gradient-text">Lumina LMS</span>
          </h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px auto', color: 'var(--text-secondary)' }}>
            Digitaliza tus procesos educativos. Una plataforma premium para profesores, estudiantes y administradores académicos.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
                Ir a mi Dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
                  Comenzar Gratis
                </Link>
                <Link href="/courses" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
                  Explorar Cursos
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '16px' }}>
            Roles y Herramientas a tu Medida
          </h2>
          <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 50px auto' }}>
            Cada actor del proceso tiene su panel de control diseñado para maximizar el avance de la materia.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Estudiantes</h3>
              <p>Inscripción inmediata a cursos, visualización de contenidos multimedia y marcación de avance interactivo.</p>
            </div>

            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--secondary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3>Docentes</h3>
              <p>Creación completa de cursos (CRUD), carga estructurada de lecciones, contenido de texto, enlaces y métricas.</p>
            </div>

            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(217, 70, 239, 0.1)', color: 'var(--accent)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Administradores</h3>
              <p>Monitoreo global de la plataforma, roles seguros y acceso total a las entidades del sistema.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Cursos Destacados</h2>
              <p>Prepárate en las áreas de mayor demanda laboral con instructores expertos.</p>
            </div>
            <Link href="/courses" className="btn btn-secondary" style={{ padding: '10px 20px' }}>
              Ver Todos los Cursos &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="flex-center" style={{ minHeight: '200px', flexDirection: 'column', gap: '12px' }}>
              <div className="spinner"></div>
              <p>Cargando cursos disponibles...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center' }}>
              <p style={{ marginBottom: '20px' }}>Aún no se han publicado cursos en la plataforma.</p>
              {!user || user.role === 'TEACHER' || user.role === 'ADMIN' ? (
                <Link href="/dashboard" className="btn btn-primary">
                  Crear el Primer Curso
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="card-grid">
              {courses.map((course) => (
                <div key={course.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
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
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        📚
                      </div>
                    )}
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{course.title}</h3>
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
                      <span>Docente: <strong>{course.teacher.name}</strong></span>
                      <span>Lecciones: <strong>{course._count.lessons}</strong></span>
                    </div>
                    <Link href={`/courses/${course.id}`} className="btn btn-primary btn-full" style={{ marginTop: '16px', padding: '10px 0' }}>
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '40px 0', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p style={{ fontSize: '0.9rem' }}>&copy; 2026 Lumina LMS. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
            <Link href="/courses" className="nav-link">Cursos</Link>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/register" className="nav-link">Registro</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
