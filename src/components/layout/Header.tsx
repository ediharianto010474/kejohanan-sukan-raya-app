
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEvent } from '@/contexts/EventContext';

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { selectedEvent } = useEvent();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Maklumat Kejohanan', path: '/event-registration', visible: true },
    { name: 'Daftar Peserta', path: '/participant-registration', visible: !!selectedEvent },
    { name: 'Jana Saringan', path: '/generate-heats', visible: !!selectedEvent && isAdmin() },
    { name: 'Senarai Saringan', path: '/heat-list', visible: !!selectedEvent },
    { name: 'Jana Akhir', path: '/generate-finals', visible: !!selectedEvent && isAdmin() },
    { name: 'Acara Akhir', path: '/finals', visible: !!selectedEvent },
    { name: 'Analisis', path: '/analysis', visible: !!selectedEvent },
  ];

  return (
    <header className="bg-athletic-secondary text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full athletic-track"></div>
            <span className="text-xl font-bold">KEJOHANAN OLAHRAGA</span>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {navigation
                  .filter((item) => item.visible)
                  .map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`${
                        isActive(item.path)
                          ? 'text-athletic-light font-bold'
                          : 'hover:text-athletic-gray'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                <div className="ml-4 flex items-center">
                  <span className="mr-4 text-athletic-light">
                    {user.username} ({user.userType})
                  </span>
                  <Button variant="outline" onClick={logout}>
                    Log Keluar
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/">
                <Button variant="outline">Log Masuk</Button>
              </Link>
            )}
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="mt-4 md:hidden">
            {user ? (
              <>
                <div className="flex flex-col space-y-2">
                  {navigation
                    .filter((item) => item.visible)
                    .map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`px-2 py-1 rounded ${
                          isActive(item.path)
                            ? 'bg-athletic-accent text-white font-bold'
                            : 'hover:bg-athletic-secondary hover:text-athletic-gray'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                </div>
                <div className="mt-4 pt-2 border-t border-athletic-accent">
                  <div className="mb-2 text-athletic-light">
                    {user.username} ({user.userType})
                  </div>
                  <Button variant="destructive" onClick={logout}>
                    Log Keluar
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <Button>Log Masuk</Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
