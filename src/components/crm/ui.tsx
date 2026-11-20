'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';

import { type EstadoCarne, type EstadoLaboral } from '@/lib/crm/core';

export const DEMO = 'Esta es una demo. Guardar cambios no contacta con el negocio';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60';
export const btn = {
  primary: `${base} min-h-12 bg-brand px-5 text-white hover:bg-brand-dark`,
  secondary: `${base} min-h-12 border-2 border-brand bg-white px-5 text-brand hover:bg-brand/5`,
  small: `${base} min-h-11 border border-ink/30 bg-white px-3 text-sm text-ink hover:border-brand hover:text-brand`,
  smallDanger: `${base} min-h-11 border border-ink/30 bg-white px-3 text-sm text-brand hover:border-brand hover:bg-brand/5`,
};
export const inputCls =
  'min-h-12 w-full rounded-lg border border-ink/40 bg-white px-3 text-base text-ink transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30';
export const cardCls = 'rounded-card border border-line bg-white';

const PATHS = {
  check: 'M20 6 9 17l-5-5',
  alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01',
  plus: 'M12 5v14M5 12h14',
  pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  trash: 'M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v6M14 11v6',
  calendar: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  card: 'M3 5h18v14H3zM7 10h4M7 14h6M15 10h2',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-5-5',
  x: 'M6 6l12 12M18 6 6 18',
  logout: 'M9 21H5V3h4M16 17l5-5-5-5M21 12H9',
  users: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  back: 'M19 12H5M12 19l-7-7 7-7',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v5M12 8h.01',
  leave: 'M12 3v2M4.2 7.2l1.4 1.4M19.8 7.2l-1.4 1.4M2 14h20M5 14a7 7 0 0 1 14 0M12 14v6',
};
export function Icon({ name, className = 'size-5' }: { name: keyof typeof PATHS; className?: string }) {
  return (
    <svg
      aria-hidden
      className={`${className} shrink-0`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export const plural = (n: number, uno: string, varios: string) => `${String(n)} ${n === 1 ? uno : varios}`;

export function textoCarne(estado: EstadoCarne, dias: number) {
  if (estado === 'sinFecha') return 'Sin fecha de vencimiento';
  if (estado === 'vencido') return `Vencido hace ${plural(Math.abs(dias), 'día', 'días')}`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `Vence en ${String(dias)} días`;
}

const carneStyle: Record<EstadoCarne, { cls: string; label: string }> = {
  vigente: { cls: 'bg-ok text-white', label: 'Vigente' },
  porVencer: { cls: 'bg-accent text-ink', label: 'Por vencer' },
  vencido: { cls: 'bg-brand text-white', label: 'Vencido' },
  sinFecha: { cls: 'bg-ink/10 text-ink', label: 'Sin fecha' },
};
export function CarneChip({ estado }: { estado: EstadoCarne }) {
  const s = carneStyle[estado];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${s.cls}`}>
      <Icon className="size-3.5" name={estado === 'vigente' ? 'check' : estado === 'sinFecha' ? 'info' : 'alert'} />
      {s.label}
    </span>
  );
}

const laboralStyle: Record<EstadoLaboral, { cls: string; label: string }> = {
  activo: { cls: 'border border-ok text-ok', label: 'Activo' },
  licencia: { cls: 'bg-ink/10 text-ink', label: 'De licencia' },
  baja: { cls: 'bg-ink text-white', label: 'Dado de baja' },
};
export function LaboralChip({ estado }: { estado: EstadoLaboral }) {
  const s = laboralStyle[estado];
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

export function Pagina({
  titulo,
  descripcion,
  accion,
  atras,
  children,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  atras?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {atras ? (
        <Link className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand hover:underline" href={atras.href}>
          <Icon className="size-4" name="back" />
          {atras.label}
        </Link>
      ) : null}
      <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold tracking-tight break-words sm:text-4xl">{titulo}</h1>
          {descripcion ? <p className="mt-2 max-w-prose text-base leading-7 text-ink/80">{descripcion}</p> : null}
        </div>
        {accion}
      </div>
      {children}
    </main>
  );
}

export function Esqueleto({ filas = 3, className = 'h-40' }: { filas?: number; className?: string }) {
  return (
    <div aria-busy="true" aria-label="Cargando" className="grid gap-4 md:grid-cols-2" role="status">
      {Array.from({ length: filas }, (_, i) => (
        <div className={`animate-pulse rounded-card bg-ink/10 ${className}`} key={i} />
      ))}
    </div>
  );
}

export function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  return (
    <dialog
      aria-labelledby="modal-titulo"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-card bg-white p-0 text-ink backdrop:bg-ink/60"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      ref={ref}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line p-5">
        <h2 className="font-display text-xl font-bold break-words" id="modal-titulo">
          {titulo}
        </h2>
        <button
          aria-label="Cerrar"
          className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          onClick={onClose}
          type="button"
        >
          <Icon name="x" />
        </button>
      </div>
      <div className="grid gap-4 p-5">{children}</div>
    </dialog>
  );
}

export function NotaDemo() {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-paper p-3 text-sm leading-6 text-ink/80">
      <Icon className="mt-0.5 size-4" name="info" />
      {DEMO}.
    </p>
  );
}

export function ErrorCampo({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p className="flex items-start gap-1.5 text-sm font-semibold text-brand" id={id} role="alert">
      <Icon className="mt-0.5 size-4" name="alert" />
      {msg}
    </p>
  ) : null;
}

export function ErrorGeneral({ msg }: { msg?: string }) {
  return msg ? (
    <div className="flex items-start gap-2 rounded-lg border-2 border-brand bg-brand/5 p-3 text-sm font-semibold text-brand" role="alert">
      <Icon className="mt-0.5 size-4" name="alert" />
      {msg}
    </div>
  ) : null;
}
