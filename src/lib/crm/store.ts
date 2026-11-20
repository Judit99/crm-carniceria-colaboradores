'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { type Borrador, type Colaborador, type Turno, type Rol, type EstadoLaboral, datosIniciales, hoyISO, validar, validarLicencia, validarRenovacion } from './core';

export const STORAGE_KEY = 'carniceria-crm-colaboradores-v1';
export const CLAVE_ACCESO = 'carniceria2026'; // Clave local de demostración: cámbiala aquí.
export const SESION_KEY = 'carniceria-crm-sesion-v1';

let cache: Colaborador[] | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function leer(): Colaborador[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const ini = datosIniciales(hoyISO());
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ini)); } catch {}
      cache = ini;
    } else {
      const p = JSON.parse(raw);
      cache = Array.isArray(p) ? p : [];
    }
  } catch {
    cache = datosIniciales(hoyISO());
  }
  return cache!;
}

/** Guarda y comprueba la escritura antes de actualizar la interfaz. */
function guardar(siguiente: Colaborador[]): boolean {
  try {
    const txt = JSON.stringify(siguiente);
    localStorage.setItem(STORAGE_KEY, txt);
    if (localStorage.getItem(STORAGE_KEY) !== txt) return false;
  } catch {
    return false;
  }
  cache = siguiente;
  emit();
  return true;
}

export type Resultado = { ok: true } | { ok: false; errores: Record<string, string>; general?: string };
const FALLO: Resultado = { ok: false, errores: {}, general: 'No se pudieron guardar los cambios. No se modificó nada.' };
const ahoraISO = () => new Date().toISOString();
const nuevoId = () => `col-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function aplicar(fn: (l: Colaborador[]) => Colaborador[]): Resultado {
  return guardar(fn(leer())) ? { ok: true } : FALLO;
}

export const acciones = {
  crear(b: Borrador): Resultado {
    const errores = validar(b, leer(), hoyISO());
    if (Object.keys(errores).length) return { ok: false, errores };
    const t = ahoraISO();
    const c: Colaborador = {
      id: nuevoId(), nombre: b.nombre.trim().replace(/\s+/g, ' '), rol: b.rol as Rol, fechaIngreso: b.fechaIngreso,
      turnos: [...new Set(b.turnos)] as Turno[], fechaVencimientoCarne: b.fechaVencimientoCarne,
      estadoLaboral: b.estadoLaboral as EstadoLaboral, licencias: [], notas: b.notas.trim(), fechaCreacion: t, fechaActualizacion: t,
    };
    return aplicar((l) => [...l, c]);
  },
  editar(id: string, b: Borrador): Resultado {
    const errores = validar(b, leer(), hoyISO(), id);
    if (Object.keys(errores).length) return { ok: false, errores };
    return aplicar((l) => l.map((c) => c.id !== id ? c : {
      ...c, nombre: b.nombre.trim().replace(/\s+/g, ' '), rol: b.rol as Rol, fechaIngreso: b.fechaIngreso,
      turnos: [...new Set(b.turnos)] as Turno[], fechaVencimientoCarne: b.fechaVencimientoCarne,
      estadoLaboral: b.estadoLaboral as EstadoLaboral, notas: b.notas.trim(), fechaActualizacion: ahoraISO(),
    }));
  },
  renovarCarne(id: string, fecha: string): Resultado {
    const e = validarRenovacion(fecha, hoyISO());
    if (e) return { ok: false, errores: { fecha: e } };
    return aplicar((l) => l.map((c) => c.id === id ? { ...c, fechaVencimientoCarne: fecha, fechaActualizacion: ahoraISO() } : c));
  },
  /** Alta de licencia: pasa a «licencia» (el colaborador conserva sus turnos). */
  altaLicencia(id: string, inicio: string, fin: string): Resultado {
    const e = validarLicencia(inicio, fin);
    if (e) return { ok: false, errores: { fin: e } };
    return aplicar((l) => l.map((c) => c.id !== id || c.estadoLaboral === 'baja' ? c : {
      ...c, estadoLaboral: 'licencia', licencias: [...c.licencias, { id: `lic-${Date.now().toString(36)}`, inicio, fin }], fechaActualizacion: ahoraISO(),
    }));
  },
  /** Quita todas las licencias y vuelve a activo: recupera la cobertura. */
  quitarLicencia(id: string): Resultado {
    return aplicar((l) => l.map((c) => c.id !== id ? c : { ...c, estadoLaboral: c.estadoLaboral === 'licencia' ? 'activo' : c.estadoLaboral, licencias: [], fechaActualizacion: ahoraISO() }));
  },
  borrar(id: string): Resultado {
    return aplicar((l) => l.filter((c) => c.id !== id));
  },
};

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const vacio: Colaborador[] = [];

/** Lista de colaboradores (vacía en el servidor) y listo=true una vez en el navegador. */
export function useColaboradores() {
  const lista = useSyncExternalStore(subscribe, leer, () => vacio);
  const [listo, setListo] = useState(false);
  useEffect(() => setListo(true), []);
  return { lista, listo };
}

/** Fecha de hoy que se actualiza sola (cada minuto y al volver a la pestaña). */
export function useHoy() {
  const [hoy, setHoy] = useState(() => hoyISO());
  useEffect(() => {
    const f = () => setHoy(hoyISO());
    const t = setInterval(f, 30000);
    document.addEventListener('visibilitychange', f);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', f); };
  }, []);
  return hoy;
}
