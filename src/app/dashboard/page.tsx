'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/utils/api';

interface Enrollment {
  id: number;
  progress: number;
  status: string;
  course: {
    id: number;
    title: string;
    description: string;
    teacher: { name: string };
    _count: { lessons: number };
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  teacher: { name: string; email: string };
  _count: { lessons: number; enrollments: number };
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    async function loadDashboardData() {
      if (!user) return;
      try {
        if (user.role === 'STUDENT') {
          const data = await fetchApi('/enrollments');
          if (data && data.enrollments) {
            setEnrollments(data.enrollments);
          }
        } else {
          // TEACHER or ADMIN
          const data = await fetchApi('/courses');
          if (data && data.courses) {
            setAllCourses(data.courses);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, authLoading, router]);

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción eliminará permanentemente todas sus lecciones e inscripciones.')) {
      return;
    }

    try {
      await fetchApi(`/courses/${courseId}`, { method: 'DELETE' });
      // Update state
      setAllCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el curso.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  // Render Student Dashboard
  const renderStudentDashboard = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Mi Aprendizaje</h1>
          <p>Revisa tus cursos inscritos y reanuda tus clases donde las dejaste.</p>
        </div>
        <Link href="/courses" className="btn btn-primary">
          Explorar Más Cursos
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>📚</span>
          <h3>Aún no te has inscrito en ningún curso</h3>
          <p style={{ marginTop: '8px', marginBottom: '24px' }}>
            Explora el catálogo para registrarte en tu primer curso.
          </p>
          <Link href="/courses" className="btn btn-primary">
            Ver Cursos Disponibles
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-student">
                    {enrollment.status === 'COMPLETED' ? 'Completado' : 'En Curso'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {enrollment.course._count.lessons} Lecciones
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{enrollment.course.title}</h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '20px'
                }}>
                  {enrollment.course.description}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Progreso</span>
                    <strong>{enrollment.progress}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${enrollment.progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      borderRadius: 'var(--radius-full)'
                    }}></div>
                  </div>
                </div>
              </div>

              <div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '12px 0' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Instructor: <strong>{enrollment.course.teacher.name}</strong>
                </p>
                <Link href={`/courses/${enrollment.course.id}/learn`} className="btn btn-primary btn-full">
                  Continuar Lección &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render Teacher Dashboard
  const renderTeacherDashboard = () => {
    const myCourses = allCourses.filter(course => course.teacherId === user.id);

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem' }}>Panel de Docente</h1>
            <p>Crea cursos y publica lecciones para tus estudiantes.</p>
          </div>
          <Link href="/dashboard/courses/new" className="btn btn-primary">
            ➕ Crear Nuevo Curso
          </Link>
        </div>

        {myCourses.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>👨‍🏫</span>
            <h3>No tienes cursos publicados</h3>
            <p style={{ marginTop: '8px', marginBottom: '24px' }}>
              Crea tu primer curso para empezar a subir contenido educativo.
            </p>
            <Link href="/dashboard/courses/new" className="btn btn-primary">
              Crear mi Primer Curso
            </Link>
          </div>
        ) : (
          <div className="card-grid">
            {myCourses.map((course) => (
              <div key={course.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{course.title}</h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '20px'
                  }}>
                    {course.description}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <span>Lecciones: <strong style={{ color: 'var(--text-primary)' }}>{course._count.lessons}</strong></span>
                    <span>Inscritos: <strong style={{ color: 'var(--text-primary)' }}>{course._count.enrollments}</strong></span>
                  </div>
                </div>

                <div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '12px 0' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href={`/dashboard/courses/${course.id}/lessons`} className="btn btn-primary btn-full" style={{ padding: '8px 0', fontSize: '0.9rem' }}>
                      📋 Gestionar Lecciones
                    </Link>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/dashboard/courses/${course.id}/edit`} className="btn btn-secondary" style={{ flex: 1, padding: '8px 0', fontSize: '0.85rem' }}>
                        ✏️ Editar Info
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="btn btn-danger"
                        style={{ flex: 1, padding: '8px 0', fontSize: '0.85rem' }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Admin Dashboard
  const renderAdminDashboard = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Panel de Administración Global</h1>
          <p>Administración general del catálogo de cursos de la institución.</p>
        </div>
        <Link href="/dashboard/courses/new" className="btn btn-primary">
          ➕ Crear Curso como Admin
        </Link>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🎓</span>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', textTransform: 'uppercase' }}>Cursos Totales</h4>
          <strong style={{ fontSize: '2rem', display: 'block', marginTop: '6px' }}>{allCourses.length}</strong>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>👥</span>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', textTransform: 'uppercase' }}>Matrículas Activas</h4>
          <strong style={{ fontSize: '2rem', display: 'block', marginTop: '6px' }}>
            {allCourses.reduce((acc, curr) => acc + (curr._count?.enrollments || 0), 0)}
          </strong>
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Todos los Cursos en el Sistema</h2>

      {allCourses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          No hay cursos en el sistema.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Título</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Docente</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Estudiantes</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>Lecciones</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {allCourses.map((course) => (
                <tr key={course.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '16px 20px' }}>{course.id}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '500' }}>{course.title}</td>
                  <td style={{ padding: '16px 20px' }}>{course.teacher.name}</td>
                  <td style={{ padding: '16px 20px' }}>{course._count.enrollments}</td>
                  <td style={{ padding: '16px 20px' }}>{course._count.lessons}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link href={`/dashboard/courses/${course.id}/lessons`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Lecciones
                      </Link>
                      <Link href={`/dashboard/courses/${course.id}/edit`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <main className="page-wrapper">
      <div className="container">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '30px' }}>
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {user.role === 'STUDENT' && renderStudentDashboard()}
        {user.role === 'TEACHER' && renderTeacherDashboard()}
        {user.role === 'ADMIN' && renderAdminDashboard()}
      </div>
    </main>
  );
}
