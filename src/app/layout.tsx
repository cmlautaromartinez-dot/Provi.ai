import type { Metadata, Viewport } from 'next';
import './globals.css';
import PhoneFrame from '@/components/layout/PhoneFrame';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'provi AI — Tu socio de abastecimiento gastronómico',
  description: 'Conectamos locales gastronómicos: comprá y vendé entre cocinas con IA.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ff6b35',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-ink-100">
        <ToastProvider>
          <PhoneFrame>{children}</PhoneFrame>
        </ToastProvider>
      </body>
    </html>
  );
}
