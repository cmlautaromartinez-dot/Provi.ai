'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Search, Bot, Package, User, LayoutDashboard, PlusCircle, ListOrdered, Store } from 'lucide-react';
import { useStore } from '@/lib/store';
import Logo from '@/components/Logo';

const buyerTabs = [
  { href: '/home',     label: 'Para vos',  icon: Sparkles },
  { href: '/explorar', label: 'Explorar',  icon: Search },
  { href: '/provibot', label: 'Provi',     icon: Bot,         accent: true },
  { href: '/pedidos',  label: 'Pedidos',   icon: Package },
  { href: '/perfil',   label: 'Perfil',    icon: User },
];

const sellerTabs = [
  { href: '/vendedor',           label: 'Inicio',    icon: LayoutDashboard },
  { href: '/vendedor/pedidos',   label: 'Pedidos',   icon: ListOrdered },
  { href: '/vendedor/publicar',  label: 'Publicar',  icon: PlusCircle,  accent: true },
  { href: '/vendedor/productos', label: 'Productos', icon: Store },
  { href: '/vendedor/perfil',    label: 'Perfil',    icon: User },
];

export default function BottomNav() {
  const path = usePathname();
  const { role } = useStore();
  const tabs = role === 'vendedor' ? sellerTabs : buyerTabs;

  function isActive(href: string) {
    return path === href || (href !== '/home' && href !== '/vendedor' && path.startsWith(href));
  }

  return (
    <>
      {/* ── Mobile bottom bar ─────────────────────── */}
      <nav className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-ink-200 px-2 pt-2 pb-3 z-40">
        <div className="flex items-end justify-around">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = isActive(t.href);
            if (t.accent) {
              return (
                <Link key={t.href} href={t.href} className="-mt-6 flex flex-col items-center gap-1">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-pop flex items-center justify-center text-white">
                    <Icon size={26} strokeWidth={2.4} />
                  </span>
                  <span className="text-[10px] font-semibold text-ink-700">{t.label}</span>
                </Link>
              );
            }
            return (
              <Link key={t.href} href={t.href} className="flex flex-col items-center gap-1 px-2 py-1">
                <Icon size={22} strokeWidth={2.2} className={active ? 'text-brand-500' : 'text-ink-400'} />
                <span className={`text-[10px] font-semibold ${active ? 'text-brand-500' : 'text-ink-500'}`}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Desktop sidebar (fixed left) ─────────── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 bg-white border-r border-ink-200 flex-col z-40 shadow-card">
        <div className="px-5 py-6 border-b border-ink-100">
          <Logo size={32} />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  t.accent
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-pop'
                    : active
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-ink-600 hover:bg-cream-100'
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-ink-100 text-[11px] text-ink-400">
          provi.AI · BETA
        </div>
      </aside>
    </>
  );
}
