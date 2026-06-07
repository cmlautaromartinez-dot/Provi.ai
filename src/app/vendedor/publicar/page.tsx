'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, isRealUser } from '@/lib/store';
import { createProduct } from '@/lib/products';
import TopBar from '@/components/TopBar';
import { useToast } from '@/components/Toast';
import { Camera, DollarSign, Package2, Tag, FileText, Truck, Check, X } from 'lucide-react';

const CATEGORIAS = ['Pastelería', 'Panadería', 'Viandas', 'Salado', 'Bebidas', 'Lácteos', 'Otro'];
const TAGS = ['Sin TACC', 'Vegano', 'Sin lactosa', 'Orgánico', 'Sin azúcar', 'Apto diabéticos', 'Artesanal'];
const EMOJI_BY_CAT: Record<string, string> = {
  'Pastelería': '🧁',
  'Panadería': '🥖',
  'Viandas': '🥗',
  'Salado': '🥟',
  'Bebidas': '🥤',
  'Lácteos': '🥛',
  'Otro': '🍽️',
};

export default function PublicarPage() {
  const router = useRouter();
  const { userId } = useStore();
  const toast = useToast();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cat, setCat] = useState('Pastelería');
  const [tags, setTags] = useState<string[]>([]);
  const [precio, setPrecio] = useState('');
  const [unidad, setUnidad] = useState('unidad');
  const [stock, setStock] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [comoSeSirve, setComoSeSirve] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fotos, setFotos] = useState<{ url: string; name: string }[]>([]);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  function onFotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const nuevas = files.slice(0, 5 - fotos.length).map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setFotos((prev) => [...prev, ...nuevas]);
    if (fotoInputRef.current) fotoInputRef.current.value = '';
  }

  function quitarFoto(i: number) {
    setFotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function publicar() {
    if (!nombre.trim()) {
      toast.show('Falta el nombre del producto', 'error');
      return;
    }
    if (!precio || isNaN(Number(precio))) {
      toast.show('Falta el precio', 'error');
      return;
    }
    setSubmitting(true);
    // En modo demo (userId no es UUID válido) simulamos el éxito sin tocar Supabase
    if (!isRealUser(userId)) {
      await new Promise((r) => setTimeout(r, 800));
      setSubmitting(false);
      toast.show('¡Producto publicado! 🚀', 'success');
      router.push('/vendedor/productos');
      return;
    }
    const res = await createProduct({
      sellerId: userId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      categoria: cat,
      tags,
      emoji: EMOJI_BY_CAT[cat] || '🍽️',
      precio: Number(precio),
      unidad,
      stock: Number(stock) || 0,
      vencimiento: vencimiento || undefined,
      como_se_sirve: comoSeSirve || undefined,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.show('Error al publicar: ' + res.error, 'error');
      return;
    }
    toast.show('¡Producto publicado! 🚀', 'success');
    router.push('/vendedor/productos');
  }

  function toggle(t: string) {
    setTags(arr => arr.includes(t) ? arr.filter(x => x !== t) : [...arr, t]);
  }

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <TopBar title="Publicar producto" />

      <main className="flex-1 px-4 py-4 pb-32 space-y-4">
        <section className="bg-white rounded-3xl border-2 border-dashed border-ink-200 p-4">
          {fotos.length === 0 ? (
            <button
              onClick={() => fotoInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 py-4 active:scale-[0.99] transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-leaf-100 flex items-center justify-center">
                <Camera size={26} className="text-leaf-600" />
              </div>
              <p className="font-bold text-sm">Subí fotos del producto</p>
              <p className="text-xs text-ink-500">Hasta 5 fotos — cuanto más mejor</p>
            </button>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {fotos.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={f.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => quitarFoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink-900/70 text-white flex items-center justify-center"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                {fotos.length < 5 && (
                  <button
                    onClick={() => fotoInputRef.current?.click()}
                    className="aspect-square rounded-xl bg-leaf-50 border-2 border-dashed border-leaf-300 flex flex-col items-center justify-center text-leaf-700 active:scale-95"
                  >
                    <Camera size={22} />
                    <span className="text-[10px] font-bold mt-1">Sumar</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-ink-500 text-center mt-2">
                {fotos.length}/5 fotos
              </p>
            </>
          )}
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={onFotosChange}
            className="hidden"
          />
        </section>

        <Section icon={Tag} title="Nombre">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Torta Red Velvet artesanal" className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400" />
        </Section>

        <Section icon={Package2} title="Categoría">
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`text-xs font-bold px-3 py-1.5 rounded-xl ${cat === c ? 'bg-leaf-500 text-white' : 'bg-cream-100 text-ink-600'}`}>
                {EMOJI_BY_CAT[c]} {c}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={FileText} title="Descripción">
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalle del producto, ingredientes, etc."
            rows={3}
            className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-leaf-400"
          />
        </Section>

        <Section icon={DollarSign} title="Precio y stock">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-ink-500">Precio</label>
              <input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0" inputMode="numeric" className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-ink-500">Unidad</label>
              <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400">
                <option>unidad</option><option>kg</option><option>caja</option><option>docena</option><option>porción</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-ink-500">Stock disponible</label>
              <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" inputMode="numeric" className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400" />
            </div>
          </div>
        </Section>

        <Section icon={Truck} title="Entrega y conservación">
          <div className="space-y-2">
            <input value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} placeholder="Vencimiento (ej: 3 días refrigerado)" className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400" />
            <input value={comoSeSirve} onChange={(e) => setComoSeSirve(e.target.value)} placeholder="Cómo se sirve (ej: hornear 10 min a 180º)" className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400" />
          </div>
        </Section>

        <Section icon={Tag} title="Tags">
          <div className="flex flex-wrap gap-2">
            {TAGS.map(t => (
              <button key={t} onClick={() => toggle(t)} className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl ${tags.includes(t) ? 'bg-brand-500 text-white' : 'bg-cream-100 text-ink-600'}`}>
                {tags.includes(t) && <Check size={12} strokeWidth={3} />} {t}
              </button>
            ))}
          </div>
        </Section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 md:absolute bg-white border-t border-ink-100 p-4 flex gap-2">
        <button onClick={() => router.back()} className="flex-1 bg-cream-100 rounded-2xl py-3.5 font-bold text-sm">Cancelar</button>
        <button
          onClick={publicar}
          disabled={submitting}
          className="flex-[1.4] bg-leaf-500 active:scale-[0.98] transition rounded-2xl py-3.5 font-bold text-white shadow-soft disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Publicando...
            </>
          ) : 'Publicar producto'}
        </button>
      </footer>
    </div>
  );
}

function Section({ icon: Icon, title, children }: any) {
  return (
    <section className="bg-white rounded-2xl p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-leaf-600" />
        <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700">{title}</p>
      </div>
      {children}
    </section>
  );
}
