import React from 'react';
import { NavLink } from 'react-router-dom';
import { Newspaper, Layers, MessageSquare, MessagesSquare, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Noticias', path: '/', icon: Newspaper },
    { label: 'Paletas', path: '/paletas', icon: Layers },
    { label: 'Feed', path: '/feed', icon: MessageSquare },
    { label: 'Foro', path: '/foro', icon: MessagesSquare },
    { label: 'Perfil', path: '/perfil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-50 shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-zinc-400 font-medium hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex items-center justify-center">
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                  {isActive && (
                    <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
