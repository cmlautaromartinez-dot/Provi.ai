'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Rutas que tienen sidebar (BottomNav desktop)
const APP_ROUTES = [
  '/home', '/explorar', '/provibot', '/pedidos', '/perfil',
  '/carrito', '/checkout', '/producto', '/vendedor',
];

export default function PhoneFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  const hasNav = APP_ROUTES.some(r => path === r || path.startsWith(r + '/') || path.startsWith(r));

  return (
    <div className="min-h-screen w-full bg-cream-100">
      <div className="relative w-full min-h-screen bg-white flex flex-col">
        <div className={`flex-1 overflow-y-auto no-scrollbar relative flex flex-col ${hasNav ? 'md:ml-56' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
