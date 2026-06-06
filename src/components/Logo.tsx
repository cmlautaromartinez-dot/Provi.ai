export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-extrabold shadow-pop"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        p
      </div>
      <span className="font-display font-extrabold text-ink-900 tracking-tight" style={{ fontSize: size * 0.6 }}>
        provi<span className="text-brand-500">.</span>AI
      </span>
    </div>
  );
}
