'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface LessonProgress {
  id: number;
  lessonId: number;
  completed: boolean;
}

interface Enrollment {
  id: number;
  progress: number;
  status: string;
  course: {
    title: string;
    lessons: Lesson[];
  };
  lessonProgress: LessonProgress[];
}

export default function LearnPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    // Auth redirect if not logged in
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'STUDENT') {
      setError('Solo los estudiantes inscritos pueden ver esta consola de aprendizaje.');
      setLoading(false);
      return;
    }

    if (!id || !user) return;

    async function loadLearningData() {
      try {
        const data = await fetchApi(`/enrollments/course/${id}`);
        if (data && data.enrollment) {
          setEnrollment(data.enrollment);
          
          // Set first lesson as active by default if lessons exist
          const lessons = data.enrollment.course.lessons;
          if (lessons && lessons.length > 0) {
            setActiveLesson(lessons[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'No estás inscrito en este curso o hubo un error.');
      } finally {
        setLoading(false);
      }
    }

    loadLearningData();
  }, [id, user, authLoading, router]);

  const handleToggleComplete = async (lessonId: number) => {
    if (!enrollment || toggleLoading) return;
    setToggleLoading(true);

    // Find current progress status
    const currentProgress = enrollment.lessonProgress.find(lp => lp.lessonId === lessonId);
    const wasCompleted = currentProgress ? currentProgress.completed : false;
    const newStatus = !wasCompleted;

    try {
      const data = await fetchApi(`/enrollments/${enrollment.id}/lessons/${lessonId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ completed: newStatus }),
      });

      if (data) {
        // Update local state
        setEnrollment(prev => {
          if (!prev) return null;
          
          // Update lessonProgress array
          const updatedProgress = [...prev.lessonProgress];
          const index = updatedProgress.findIndex(lp => lp.lessonId === lessonId);
          if (index !== -1) {
            updatedProgress[index] = { ...updatedProgress[index], completed: newStatus };
          } else {
            updatedProgress.push({ id: 0, lessonId, completed: newStatus });
          }

          return {
            ...prev,
            progress: data.progress,
            status: data.status,
            lessonProgress: updatedProgress,
          };
        });
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el progreso.');
    } finally {
      setToggleLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: number) => {
    if (!enrollment) return false;
    const progressItem = enrollment.lessonProgress.find(lp => lp.lessonId === lessonId);
    return progressItem ? progressItem.completed : false;
  };

  if (authLoading || loading) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <main className="page-wrapper">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>{error || 'No se pudo cargar el curso.'}</div>
          </div>
          <Link href="/courses" className="btn btn-secondary">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const { title: courseTitle, lessons } = enrollment.course;

  return (
    <main style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      {/* Learning Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '16px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estás estudiando:
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{courseTitle}</h1>
        </div>

        {/* Progress Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px', flex: '0 1 auto' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span>Tu progreso</span>
              <strong style={{ color: 'var(--primary)' }}>{enrollment.progress}%</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
              <div style={{
                width: `${enrollment.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease'
              }}></div>
            </div>
          </div>
          {enrollment.progress === 100 && (
            <span style={{ fontSize: '1.5rem' }} title="¡Curso Completado!">🏆</span>
          )}
        </div>
      </header>

      {/* Main Console Interface */}
      <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap' }}>
        {/* Sidebar Navigation */}
        <aside style={{
          flex: '1 1 300px',
          borderRight: '1px solid var(--border-glass)',
          background: 'rgba(0,0,0,0.1)',
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Índice de Lecciones</h3>
          </div>
          
          {lessons.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hay lecciones en este curso.
            </div>
          ) : (
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              {lessons.map((lesson, idx) => {
                const isActive = activeLesson?.id === lesson.id;
                const completed = isLessonCompleted(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-glass)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      gap: '12px',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'background var(--transition-fast)'
                    }}
                  >
                    {/* Checkbox state indicator */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid choosing lesson
                        handleToggleComplete(lesson.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${completed ? 'var(--success)' : 'var(--text-muted)'}`,
                        background: completed ? 'var(--success)' : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {completed && '✓'}
                    </span>
                    
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        Lección {idx + 1}
                      </span>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: isActive ? '600' : '400',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}>
                        {lesson.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          )}
        </aside>

        {/* Content Viewer Panel */}
        <section style={{
          flex: '3 1 600px',
          padding: '40px',
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto',
          background: 'var(--bg-primary)'
        }}>
          {activeLesson ? (
            <article style={{ maxWidth: '750px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Lección activa
                  </span>
                  <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>{activeLesson.title}</h2>
                </div>
                
                {/* Complete Button */}
                <button
                  onClick={() => handleToggleComplete(activeLesson.id)}
                  className={`btn ${isLessonCompleted(activeLesson.id) ? 'btn-secondary' : 'btn-primary'}`}
                  style={{
                    padding: '10px 20px',
                    borderColor: isLessonCompleted(activeLesson.id) ? 'var(--success)' : 'transparent',
                    color: isLessonCompleted(activeLesson.id) ? 'var(--success)' : 'white'
                  }}
                  disabled={toggleLoading}
                >
                  {isLessonCompleted(activeLesson.id) ? '✓ Completada' : 'Marcar como Completada'}
                </button>
              </div>

              {/* Video Embed Placeholder */}
              {activeLesson.videoUrl && (
                <div style={{
                  position: 'relative',
                  paddingBottom: '56.25%', /* 16:9 ratio */
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '32px',
                  border: '1px solid var(--border-glass)',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0
                    }}
                    src={activeLesson.videoUrl.includes('youtube.com/embed') ? activeLesson.videoUrl : `https://www.youtube.com/embed/${activeLesson.videoUrl.split('v=')[1] || activeLesson.videoUrl}`}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Lesson Text Content */}
              <div
                className="glass-panel"
                style={{
                  padding: '30px',
                  lineHeight: '1.8',
                  fontSize: '1.05rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {activeLesson.content}
              </div>
            </article>
          ) : (
            <div className="flex-center" style={{ height: '100%', flexDirection: 'column', color: 'var(--text-muted)', gap: '16px' }}>
              <span style={{ fontSize: '3rem' }}>📖</span>
              <p>Selecciona una lección del índice de la izquierda para comenzar.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
