'use client';

import { useState, useSyncExternalStore, type SubmitEvent, type ReactNode } from 'react';

import { btn, ErrorGeneral, Icon, inputCls } from './ui';

import { CLAVE_ACCESO, SESION_KEY } from '@/lib/crm/store';


const EVENTO = 'carniceria-sesion';
type Estado = 'cargando' | 'dentro' | 'fuera';

function suscribir(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENTO, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(EVENTO, cb);
  };
}
function leerSesion(): Estado {
  try {
    return localStorage.getItem(SESION_KEY) === 'ok' ? 'dentro' : 'fuera';
  } catch {
    return 'fuera';
  }
}

export function SalirButton({ className }: { className?: string }) {
  return (
    <button
      className={className}
      onClick={() => {
        try {
          localStorage.removeItem(SESION_KEY);
        } catch {
          // sin acceso al almacenamiento: la sesión ya no se puede guardar
        }
        window.dispatchEvent(new Event(EVENTO));
      }}
      type="button"
    >
      <Icon className="size-4" name="logout" />
      Salir
    </button>
  );
}

/** Puerta de acceso local: envuelve el contenido y muestra la app solo con la clave de demostración. */
export function Acceso({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const estado = useSyncExternalStore(suscribir, leerSesion, () => 'cargando');
  if (estado === 'cargando') {
    return (
      <div aria-busy="true" aria-label="Cargando" className="flex flex-1 items-center justify-center" role="status">
        <div className="size-10 animate-pulse rounded-lg bg-brand" />
      </div>
    );
  }
  if (estado === 'fuera') return <Puerta />;
  return (
    <>
      {header}
      <div className="flex-1">{children}</div>
      {footer}
    </>
  );
}

function Puerta() {
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  function entrar(e: SubmitEvent) {
    e.preventDefault();
    if (clave !== CLAVE_ACCESO) {
      setError('La clave no es correcta. Revisala e intentá de nuevo.');
      return;
    }
    try {
      localStorage.setItem(SESION_KEY, 'ok');
      if (localStorage.getItem(SESION_KEY) !== 'ok') throw new Error('no guardado');
    } catch {
      setError('No pudimos guardar la sesión en este navegador. Revisá que permita guardar datos del sitio.');
      return;
    }
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <section className="flex flex-col justify-end bg-brand px-6 py-10 text-white sm:px-10 lg:py-16">
        <div className="mx-auto w-full max-w-md lg:mr-0 lg:max-w-lg">
          <p className="mb-6 inline-flex size-12 items-center justify-center rounded-lg bg-paper font-display text-xl font-bold text-brand">C</p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Colaboradores</h1>
          <p className="mt-3 max-w-prose text-lg leading-7 text-white/90">
            Los turnos cubiertos, los carnés al día y las licencias a la vista, en un solo panel.
          </p>
        </div>
      </section>
      <section className="flex items-center px-4 py-10 sm:px-10 lg:py-16">
        <form className="mx-auto grid w-full max-w-md gap-5 lg:ml-0" noValidate onSubmit={entrar}>
          <div>
            <h2 className="font-display text-2xl font-bold">Entrá al panel</h2>
            <p className="mt-1 text-base leading-7 text-ink/80">Ingresá la clave de acceso para ver al equipo.</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor="clave">
              Clave de acceso
            </label>
            <input
              aria-describedby={error ? 'clave-error' : undefined}
              aria-invalid={error ? true : undefined}
              autoComplete="off"
              className={inputCls}
              id="clave"
              name="clave"
              onChange={(e) => {
                setClave(e.target.value);
                setError('');
              }}
              type="password"
              value={clave}
            />
            {error ? (
              <div id="clave-error">
                <ErrorGeneral msg={error} />
              </div>
            ) : null}
          </div>
          <button className={`${btn.primary} w-full`} type="submit">
            <Icon name="lock" />
            Entrar
          </button>
          <div className="rounded-card border border-line bg-white p-4 text-sm leading-6">
            <p className="font-semibold">
              Clave de demostración: <code className="rounded font-mono text-base font-bold text-brand">{CLAVE_ACCESO}</code>
            </p>
            <p className="mt-2 text-ink/80">
              Acceso local de demostración. Esta clave no verifica tu identidad ni ofrece autenticación real.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
