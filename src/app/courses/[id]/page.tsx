'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/utils/api';

interface Lesson {
  id: number;
  title: string;
  order: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  teacher: { name: string; email: string };
  lessons: Lesson[];
  _count: { enrollments: number };
}

export default function CourseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadCourseAndStatus() {
      try {
        // Load course details
        const data = await fetchApi(`/courses/${id}`);
        if (data && data.course) {
          setCourse(data.course);
        }

        // Check if student is already enrolled
        if (user && user.role === 'STUDENT') {
          try {
            const enrollData = await fetchApi(`/enrollments/course/${id}`);
            if (enrollData && enrollData.enrollment) {
              setEnrolled(true);
            }
          } catch (e) {
            // Not enrolled is represented by 404, which is expected
            setEnrolled(false);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar detalles del curso.');
      } finally {
        setLoading(false);
      }
    }

    loadCourseAndStatus();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'STUDENT') {
      return;
    }

    setEnrollLoading(true);
    try {
      await fetchApi('/enrollments/enroll', {
        method: 'POST',
        body: JSON.stringify({ courseId: Number(id) })
      });
      setEnrolled(true);
      router.push(`/courses/${id}/learn`);
    } catch (err: any) {
      alert(err.message || 'Error al inscribirse.');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <main className="page-wrapper">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>{error || 'Curso no encontrado.'}</div>
          </div>
          <Link href="/courses" className="btn btn-secondary">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const isCourseOwner = user && (course.teacherId === user.id || user.role === 'ADMIN');

  return (
    <main className="page-wrapper">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Course Header */}
        <section className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              flex: '1 1 120px',
              fontSize: '4.5rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              borderRadius: 'var(--radius-md)',
              padding: '20px 0',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              📖
            </div>
            <div style={{ flex: '3 1 360px' }}>
              <h1 style={{ fontSize: '2.3rem', marginBottom: '12px' }}>{course.title}</h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {course.description}
              </p>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span>Docente: <strong style={{ color: 'var(--text-primary)' }}>{course.teacher.name}</strong></span>
                <span>Inscritos: <strong style={{ color: 'var(--text-primary)' }}>{course._count.enrollments}</strong></span>
                <span>Lecciones: <strong style={{ color: 'var(--text-primary)' }}>{course.lessons.length}</strong></span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '30px 0' }} />

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            {user ? (
              user.role === 'STUDENT' ? (
                enrolled ? (
                  <Link href={`/courses/${id}/learn`} className="btn btn-primary" style={{ padding: '12px 30px' }}>
                    Continuar Aprendizaje 🚀
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="btn btn-primary"
                    disabled={enrollLoading}
                    style={{ padding: '12px 30px' }}
                  >
                    {enrollLoading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : 'Inscribirme en este Curso'}
                  </button>
                )
              ) : isCourseOwner ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link href={`/dashboard/courses/${id}/lessons`} className="btn btn-primary">
                    Gestionar Lecciones (CRUD)
                  </Link>
                  <Link href={`/dashboard/courses/${id}/edit`} className="btn btn-secondary">
                    Editar Curso
                  </Link>
                </div>
              ) : (
                <div className="badge badge-teacher">Iniciado como Docente/Administrador</div>
              )
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ padding: '12px 30px' }}>
                Inicia sesión para inscribirte
              </Link>
            )}
            
            <Link href="/courses" className="btn btn-secondary">
              Volver al Catálogo
            </Link>
          </div>
        </section>

        {/* Syllabus / Syllabus Section */}
        <section className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Contenido del Curso (Syllabus)
          </h2>

          {course.lessons.length === 0 ? (
            <p style={{ fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              El instructor aún no ha agregado lecciones a este curso.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {course.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    gap: '16px'
                  }}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.1)',
                    color: 'var(--primary)',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ fontWeight: '500', flex: 1 }}>{lesson.title}</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lección {lesson.order}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
