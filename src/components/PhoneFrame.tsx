'use client';

import { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cream-100 via-ink-100 to-cream-50 flex items-center justify-center md:p-6">
      <div className="relative w-full md:max-w-[420px] min-h-screen md:min-h-[860px] md:max-h-[900px] bg-white md:rounded-[2.5rem] md:shadow-2xl overflow-hidden md:border-[10px] md:border-ink-900 flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {children}
        </div>
      </div>
    </div>
  );
}
