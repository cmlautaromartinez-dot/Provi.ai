'use client';

import { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full bg-cream-50 flex justify-center overflow-hidden">
      <div className="relative w-full md:max-w-[520px] h-screen bg-white flex flex-col overflow-hidden md:shadow-soft">
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
