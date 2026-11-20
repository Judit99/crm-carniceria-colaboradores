'use client';

import Link from 'next/link';

import { btn, cardCls, Icon, plural } from './ui';

import { type Colaborador, MINIMO_POR_TURNO, formatoFecha, resumen } from '@/lib/crm/core';
import { useColaboradores, useHoy } from '@/lib/crm/store';


type Alerta = { id: string; tono: 'rojo' | 'amarillo' | 'neutro'; texto: string; icono: 'alert' | 'card' | 'leave' };

const TURNO_FRASE = { Mañana: 'El turno de la mañana', Tarde: 'El turno de la tarde', Domingo: 'El domingo' } as const;

function hastaCuando(c: Colaborador, hoy: string) {
  const activas = c.licencias.filter((l) => l.inicio <= hoy && hoy <= l.fin).map((l) => l.fin);
  const fin = activas.sort().at(-1);
  return fin ? `hasta el ${formatoFecha(fin)}` : 'sin fecha de regreso cargada';
}

export function Panel() {
  const { lista, listo } = useColaboradores();
  const hoy = useHoy();

  if (!listo) return <Esqueleto />;

  const r = resumen(lista, hoy);
  const fecha = new Intl.DateTimeFormat('es-UY', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(`${hoy}T12:00:00Z`),
  );

  const alertas: Alerta[] = [];
  for (const t of r.cobertura) {
    if (t.falta === 0) continue;
    const quien = t.cantidad === 0 ? 'no tiene a nadie disponible' : 'queda con una sola persona';
    const falta = t.falta === 1 ? 'Falta cubrir un puesto.' : `Faltan cubrir ${String(t.falta)} puestos.`;
    alertas.push({ id: `cob-${t.turno}`, tono: 'amarillo', texto: `¡Ojo! ${TURNO_FRASE[t.turno]} ${quien}. ${falta}`, icono: 'alert' });
  }
  for (const v of r.vencidos) {
    alertas.push({
      id: `ven-${v.c.id}`,
      tono: 'rojo',
      texto: `El carné de ${v.c.nombre} está vencido desde hace ${plural(Math.abs(v.dias), 'día', 'días')}.`,
      icono: 'card',
    });
  }
  for (const v of r.porVencer) {
    const cuando = v.dias === 0 ? 'vence hoy' : v.dias === 1 ? 'vence mañana' : `vence en ${String(v.dias)} días`;
    alertas.push({ id: `pv-${v.c.id}`, tono: 'amarillo', texto: `El carné de ${v.c.nombre} ${cuando}. Recordá renovarlo.`, icono: 'card' });
  }
  for (const c of r.enLicencia) {
    alertas.push({ id: `lic-${c.id}`, tono: 'neutro', texto: `${c.nombre} está de licencia ${hastaCuando(c, hoy)}.`, icono: 'leave' });
  }

  const indicadores = [
    { label: 'Colaboradores activos', valor: r.activos, cls: 'bg-ink text-white', span: 'col-span-2 md:col-span-1' },
    { label: 'De licencia', valor: r.enLicencia.length, cls: 'border border-line bg-white text-ink', span: '' },
    { label: 'Carnés vigentes', valor: r.vigentes, cls: 'bg-ok text-white', span: '' },
    { label: 'Por vencer', valor: r.porVencer.length, cls: 'bg-accent text-ink', span: '' },
    { label: 'Vencidos', valor: r.vencidos.length, cls: 'bg-brand text-white', span: '' },
  ];

  return (
    <div className="grid gap-12">
      <p className="-mt-4 text-base capitalize text-ink/80">{fecha}</p>

      <section aria-label="Indicadores">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {indicadores.map((i) => (
            <div className={`flex min-w-0 flex-col justify-between gap-6 rounded-card p-4 sm:p-5 ${i.cls} ${i.span}`} key={i.label}>
              <dt className="text-sm font-bold leading-5">{i.label}</dt>
              <dd className="font-display text-6xl leading-none font-extrabold tabular-nums sm:text-7xl">{i.valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="h-cobertura">
        <h2 className="mb-1 font-display text-2xl font-bold sm:text-3xl" id="h-cobertura">
          Cobertura por turnos
        </h2>
        <p className="mb-5 max-w-prose text-base leading-7 text-ink/80">
          Cada turno necesita al menos {MINIMO_POR_TURNO} personas activas. No cuentan quienes están de licencia o de baja.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {r.cobertura.map((t) => {
            const ok = t.falta === 0;
            const casillas = Math.max(MINIMO_POR_TURNO, t.cantidad);
            return (
              <article className={`${cardCls} flex flex-col overflow-hidden`} key={t.turno}>
                <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold ${ok ? 'bg-ok text-white' : 'bg-accent text-ink'}`}>
                  <Icon className="size-4" name={ok ? 'check' : 'alert'} />
                  {ok ? 'Cobertura correcta' : 'Turno corto'}
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{t.turno}</h3>
                    <p className="text-sm text-ink/80">
                      {t.dias} · {t.horas}
                    </p>
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="font-display text-6xl leading-none font-extrabold tabular-nums">{t.cantidad}</p>
                    <p className="pb-1 text-sm font-semibold leading-4">
                      {t.cantidad === 1 ? 'disponible' : 'disponibles'}
                    </p>
                  </div>
                  <div>
                    <div aria-hidden className="flex gap-1.5">
                      {Array.from({ length: casillas }, (_, n) => (
                        <span
                          className={`h-3 flex-1 rounded-sm ${n < t.cantidad ? (ok ? 'bg-ok' : 'bg-accent') : 'border-2 border-dashed border-ink/40'}`}
                          key={n}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-ink/80">Mínimo requerido: {MINIMO_POR_TURNO}</p>
                    {!ok ? (
                      <p className="mt-1 text-sm font-bold">{t.falta === 1 ? 'Falta 1 persona' : `Faltan ${String(t.falta)} personas`}</p>
                    ) : null}
                  </div>
                  <div className="mt-auto border-t border-line pt-3">
                    {t.disponibles.length ? (
                      <ul className="grid gap-1 text-sm">
                        {t.disponibles.map((c) => (
                          <li className="break-words" key={c.id}>
                            {c.nombre}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-ink/80">Nadie disponible en este turno.</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="h-alertas">
        <h2 className="mb-5 font-display text-2xl font-bold sm:text-3xl" id="h-alertas">
          Alertas
        </h2>
        {alertas.length === 0 ? (
          <div className="flex items-start gap-3 rounded-card bg-ok p-5 text-white">
            <Icon className="mt-0.5 size-6" name="check" />
            <p className="text-lg font-semibold leading-7">Todo en orden. Los turnos están cubiertos y los carnés al día.</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {alertas.map((a) => (
              <li
                className={`${cardCls} flex flex-col gap-3 border-l-8 p-4 sm:flex-row sm:items-center sm:justify-between ${
                  a.tono === 'rojo' ? 'border-l-brand' : a.tono === 'amarillo' ? 'border-l-accent' : 'border-l-ink/50'
                }`}
                key={a.id}
              >
                <p className="flex min-w-0 items-start gap-3 text-base leading-7">
                  <Icon className={`mt-1 size-5 ${a.tono === 'rojo' ? 'text-brand' : 'text-ink'}`} name={a.icono} />
                  <span className="break-words">{a.texto}</span>
                </p>
                <Link className={`${btn.small} shrink-0`} href="/colaboradores">
                  Ver colaboradores
                  <Icon className="size-4" name="arrow" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Esqueleto() {
  return (
    <div aria-busy="true" aria-label="Cargando el panel" className="grid gap-12" role="status">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div className={`h-36 animate-pulse rounded-card bg-ink/10 ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`} key={i} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div className="h-72 animate-pulse rounded-card bg-ink/10" key={i} />
        ))}
      </div>
    </div>
  );
}
