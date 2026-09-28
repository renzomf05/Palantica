import React, { useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const MobileLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('palantica_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('palantica_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <div className={`app-container ${isHome ? 'editorial-app-container' : ''}`}>
        <main className={`main-content ${isHome ? 'editorial-main-content' : ''}`}>{children}</main>
      </div>
      <BottomNav />
    </div>
  );
};
