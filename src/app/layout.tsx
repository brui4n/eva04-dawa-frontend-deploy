import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Lumina LMS - Plataforma de Aprendizaje Digital',
  description: 'Publica cursos, gestiona lecciones, inscríbete y realiza un seguimiento detallado de tus avances académicos. La solución educativa definitiva.',
  keywords: 'LMS, cursos, e-learning, educación online, lecciones, progreso',
  authors: [{ name: 'Lumina Team' }],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
