
import { ReactNode } from 'react';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Spinner } from '../ui/spinner';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function Layout({ children, requireAuth = true, requireAdmin = false }: LayoutProps) {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Check authentication requirements
  if (requireAuth && !user) {
    return <Navigate to="/" />;
  }

  // Check admin permission requirements
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Maaf, anda tidak mempunyai akses ke halaman ini. Hanya Admin dibenarkan mengakses halaman ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-athletic-secondary text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Kejohanan Olahraga App</p>
        </div>
      </footer>
    </div>
  );
}
