'use client';

import { useEffect, useState, useCallback } from 'react';
import { Role, CartItem } from '@/types';

type Store = {
  userId: string | null;
  role: Role;
  authMethod: string | null;
  permisos: { ubicacion: boolean; camara: boolean; microfono: boolean };
  ubicacion: { lat: number | null; lng: number | null; barrio: string | null; direccion: string | null };
  onboardingCompradorDone: boolean;
  onboardingVendedorDone: boolean;
  cart: CartItem[];
  nombreLocal: string;
  whatsappConectado: boolean;
};

const DEFAULT: Store = {
  userId: null,
  role: null,
  authMethod: null,
  permisos: { ubicacion: false, camara: false, microfono: false },
  ubicacion: { lat: null, lng: null, barrio: null, direccion: null },
  onboardingCompradorDone: false,
  onboardingVendedorDone: false,
  cart: [],
  nombreLocal: '',
  whatsappConectado: false,
};

const KEY = 'provi-ai-store';
const listeners = new Set<() => void>();
let state: Store = DEFAULT;
let hydrated = false;

function load() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  hydrated = true;
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function setState(patch: Partial<Store>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach(l => l());
}

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!hydrated) load();
    const update = () => setTick(t => t + 1);
    listeners.add(update);
    update();
    return () => { listeners.delete(update); };
  }, []);

  const update = useCallback((patch: Partial<Store>) => setState(patch), []);

  const reset = useCallback(() => {
    state = DEFAULT;
    persist();
    listeners.forEach(l => l());
  }, []);

  const addToCart = useCallback((productId: string, cantidad = 1) => {
    const existing = state.cart.find(c => c.productId === productId);
    if (existing) {
      setState({ cart: state.cart.map(c => c.productId === productId ? { ...c, cantidad: c.cantidad + cantidad } : c) });
    } else {
      setState({ cart: [...state.cart, { productId, cantidad }] });
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState({ cart: state.cart.filter(c => c.productId !== productId) });
  }, []);

  const clearCart = useCallback(() => setState({ cart: [] }), []);

  return { ...state, update, reset, addToCart, removeFromCart, clearCart };
}
