import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 text-center gap-4">
      <span className="text-6xl">🍽️</span>
      <h1 className="font-display font-extrabold text-2xl">Página no encontrada</h1>
      <p className="text-ink-500 text-sm">Esa cocina todavía no abrió.</p>
      <Link href="/" className="mt-4 px-6 py-3 rounded-2xl bg-brand-500 text-white font-semibold">
        Volver al inicio
      </Link>
    </div>
  );
}
