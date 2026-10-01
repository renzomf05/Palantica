import React, { useState, useEffect, type ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

import { Container } from './Container';

export const MobileLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
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
      <Container className="flex-1 flex flex-col pb-[calc(var(--nav-height)+24px)] md:pb-10">
        <main className="w-full flex-1 py-4 sm:py-6">{children}</main>
      </Container>
      <BottomNav />
    </div>
  );
};
