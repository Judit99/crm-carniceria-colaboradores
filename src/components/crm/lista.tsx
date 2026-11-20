'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type SubmitEvent } from 'react';

import {
  btn,
  cardCls,
  CarneChip,
  ErrorCampo,
  ErrorGeneral,
  Esqueleto,
  Icon,
  inputCls,
  LaboralChip,
  Modal,
  NotaDemo,
  Pagina,
  textoCarne,
} from './ui';

import { type Colaborador, TURNOS, estadoCarne, estadoEfectivo, formatoFecha } from '@/lib/crm/core';
import { acciones, useColaboradores, useHoy, type Resultado } from '@/lib/crm/store';


const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

type Dialogo = { tipo: 'renovar' | 'licencia' | 'borrar'; id: string } | null;

export function ListaColaboradores() {
  const { lista, listo } = useColaboradores();
  const hoy = useHoy();
  const [q, setQ] = useState('');
  const [turno, setTurno] = useState<'Todos' | (typeof TURNOS)[number]>('Todos');
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => { setAviso(''); }, 12000);
    return () => { clearTimeout(t); };
  }, [aviso]);

  const visibles = useMemo(() => {
    const n = norm(q);
    return [...lista]
      .filter((c) => (!n || norm(c.nombre).includes(n)) && (turno === 'Todos' || c.turnos.includes(turno)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }, [lista, q, turno]);

  const anadir = (
    <Link className={`${btn.primary} w-full sm:w-auto`} href="/colaboradores/nuevo">
      <Icon name="plus" />
      Añadir colaborador
    </Link>
  );
  const actual = dialogo ? lista.find((c) => c.id === dialogo.id) : undefined;

  return (
    <Pagina accion={anadir} descripcion="Quién trabaja en cada turno, el estado de cada carné y las licencias en curso." titulo="Colaboradores">
      {!listo ? (
        <Esqueleto filas={4} />
      ) : lista.length === 0 ? (
        <Vacio texto="Todavía no hay colaboradores" detalle="Añadí al primero para empezar a ver la cobertura de los turnos.">
          {anadir}
        </Vacio>
      ) : (
        <>
          <section aria-label="Buscar y filtrar" className={`${cardCls} mb-6 grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end`}>
            <div className="grid gap-2">
              <label className="text-sm font-semibold" htmlFor="buscar">
                Buscar por nombre
              </label>
              <div className="relative">
                <Icon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink/60" name="search" />
                <input
                  autoComplete="off"
                  className={`${inputCls} pl-10`}
                  id="buscar"
                  onChange={(e) => { setQ(e.target.value); }}
                  placeholder="Ej.: Lucía"
                  type="search"
                  value={q}
                />
              </div>
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-semibold">Turno</legend>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                {(['Todos', ...TURNOS] as const).map((t) => (
                  <button
                    aria-pressed={turno === t}
                    className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                      turno === t ? 'border-brand bg-brand text-white' : 'border-ink/30 bg-white text-ink hover:border-brand'
                    }`}
                    key={t}
                    onClick={() => { setTurno(t); }}
                    type="button"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
          </section>

          <p aria-live="polite" className="mb-4 text-sm text-ink/80">
            Mostrando {visibles.length} de {lista.length} colaboradores
          </p>

          {visibles.length === 0 ? (
            <Vacio texto="No encontramos colaboradores con esos filtros" detalle="Probá con otro nombre o con otro turno.">
              <button
                className={btn.secondary}
                onClick={() => {
                  setQ('');
                  setTurno('Todos');
                }}
                type="button"
              >
                Limpiar filtros
              </button>
            </Vacio>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {visibles.map((c) => (
                <Tarjeta c={c} hoy={hoy} key={c.id} onAccion={(tipo) => { setDialogo({ tipo, id: c.id }); }} />
              ))}
            </ul>
          )}
        </>
      )}

      {dialogo && actual ? (
        <>
          {dialogo.tipo === 'renovar' ? (
            <Renovar c={actual} hoy={hoy} onClose={() => { setDialogo(null); }} onHecho={setAviso} />
          ) : dialogo.tipo === 'licencia' ? (
            <Licencia c={actual} hoy={hoy} onClose={() => { setDialogo(null); }} onHecho={setAviso} />
          ) : (
            <Borrar c={actual} onClose={() => { setDialogo(null); }} onHecho={setAviso} />
          )}
        </>
      ) : null}

      {aviso ? (
        <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-card border-2 border-ok bg-white p-4" role="status">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ok text-white">
              <Icon className="size-4" name="check" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold break-words">{aviso}</p>
              <p className="mt-1 text-sm text-ink/80">Esta es una demo. Guardar cambios no contacta con el negocio.</p>
            </div>
            <button
              aria-label="Cerrar aviso"
              className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              onClick={() => { setAviso(''); }}
              type="button"
            >
              <Icon name="x" />
            </button>
          </div>
        </div>
      ) : null}
    </Pagina>
  );
}

function Vacio({ texto, detalle, children }: { texto: string; detalle: string; children: React.ReactNode }) {
  return (
    <div className={`${cardCls} flex flex-col items-start gap-4 p-6 sm:p-8`}>
      <span className="inline-flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="size-6" name="users" />
      </span>
      <div>
        <h2 className="font-display text-xl font-bold">{texto}</h2>
        <p className="mt-1 max-w-prose text-base leading-7 text-ink/80">{detalle}</p>
      </div>
      {children}
    </div>
  );
}

function Tarjeta({ c, hoy, onAccion }: { c: Colaborador; hoy: string; onAccion: (t: 'renovar' | 'licencia' | 'borrar') => void }) {
  const efectivo = estadoEfectivo(c, hoy);
  const carne = estadoCarne(c.fechaVencimientoCarne, hoy);
  const fin = c.licencias.filter((l) => l.fin >= hoy).map((l) => l.fin).sort().at(-1);
  const baja = efectivo === 'baja';
  return (
    <li className={`${cardCls} flex min-w-0 flex-col gap-4 p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight font-bold break-words">{c.nombre}</h3>
          <p className="mt-1 text-sm text-ink/80">{c.rol}</p>
        </div>
        <LaboralChip estado={efectivo} />
      </div>

      <dl className="grid gap-3 text-sm">
        <div className="grid gap-1">
          <dt className="font-semibold text-ink/80">Turnos</dt>
          <dd className="flex flex-wrap gap-1.5">
            {c.turnos.map((t) => (
              <span className="rounded-md border border-ink/30 px-2 py-0.5 text-xs font-semibold" key={t}>
                {t}
              </span>
            ))}
          </dd>
        </div>
        <div className="grid gap-1.5">
          <dt className="font-semibold text-ink/80">Carné de manipulación</dt>
          <dd className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <CarneChip estado={carne.estado} />
            <span className="break-words">
              {carne.estado === 'sinFecha' ? textoCarne(carne.estado, carne.dias) : `${formatoFecha(c.fechaVencimientoCarne)} · ${textoCarne(carne.estado, carne.dias).toLowerCase()}`}
            </span>
          </dd>
        </div>
        {efectivo === 'licencia' ? (
          <div className="grid gap-1">
            <dt className="font-semibold text-ink/80">Licencia</dt>
            <dd>{fin ? `Hasta el ${formatoFecha(fin)}` : 'Sin fecha de regreso cargada'}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-line pt-4 sm:flex sm:flex-wrap">
        <Link className={btn.small} href={`/colaboradores/editar?id=${encodeURIComponent(c.id)}`}>
          <Icon className="size-4" name="pencil" />
          Editar
        </Link>
        {!baja ? (
          <>
            <button className={btn.small} onClick={() => { onAccion('renovar'); }} type="button">
              <Icon className="size-4" name="card" />
              Renovar carné
            </button>
            <button className={btn.small} onClick={() => { onAccion('licencia'); }} type="button">
              <Icon className="size-4" name="leave" />
              Licencia
            </button>
          </>
        ) : null}
        <button className={btn.smallDanger} onClick={() => { onAccion('borrar'); }} type="button">
          <Icon className="size-4" name="trash" />
          Borrar
        </button>
      </div>
    </li>
  );
}

function Renovar({ c, hoy, onClose, onHecho }: { c: Colaborador; hoy: string; onClose: () => void; onHecho: (m: string) => void }) {
  const [fecha, setFecha] = useState('');
  const [res, setRes] = useState<Extract<Resultado, { ok: false }> | null>(null);
  function enviar(e: SubmitEvent) {
    e.preventDefault();
    const r = acciones.renovarCarne(c.id, fecha);
    if (r.ok) {
      onClose();
      onHecho(`Carné de ${c.nombre} renovado hasta el ${formatoFecha(fecha)}.`);
    } else setRes(r);
  }
  const { dias, estado } = estadoCarne(c.fechaVencimientoCarne, hoy);
  return (
    <Modal onClose={onClose} titulo={`Renovar carné de ${c.nombre}`}>
      <form className="grid gap-4" noValidate onSubmit={enviar}>
        <p className="text-sm leading-6 text-ink/80">
          Carné actual: {formatoFecha(c.fechaVencimientoCarne)}
          {estado === 'sinFecha' ? '' : ` (${textoCarne(estado, dias).toLowerCase()})`}.
        </p>
        <div className="grid gap-2">
          <label className="text-sm font-semibold" htmlFor="nueva-fecha">
            Nueva fecha de vencimiento
          </label>
          <input
            aria-describedby={res?.errores.fecha ? 'nueva-fecha-error' : undefined}
            aria-invalid={res?.errores.fecha ? true : undefined}
            className={inputCls}
            id="nueva-fecha"
            name="fecha"
            onChange={(e) => { setFecha(e.target.value); }}
            type="date"
            value={fecha}
          />
          <ErrorCampo id="nueva-fecha-error" msg={res?.errores.fecha} />
        </div>
        <ErrorGeneral msg={res?.general} />
        <NotaDemo />
        <div className="grid gap-2 sm:grid-cols-2">
          <button className={btn.secondary} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className={btn.primary} type="submit">
            Guardar fecha
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Licencia({ c, hoy, onClose, onHecho }: { c: Colaborador; hoy: string; onClose: () => void; onHecho: (m: string) => void }) {
  const tiene = estadoEfectivo(c, hoy) === 'licencia';
  const [inicio, setInicio] = useState(hoy);
  const [fin, setFin] = useState('');
  const [res, setRes] = useState<Extract<Resultado, { ok: false }> | null>(null);

  function alta(e: SubmitEvent) {
    e.preventDefault();
    const r = acciones.altaLicencia(c.id, inicio, fin);
    if (r.ok) {
      onClose();
      onHecho(`Licencia de ${c.nombre} registrada del ${formatoFecha(inicio)} al ${formatoFecha(fin)}.`);
    } else setRes(r);
  }
  function quitar() {
    const r = acciones.quitarLicencia(c.id);
    if (r.ok) {
      onClose();
      onHecho(`Licencia de ${c.nombre} quitada. Vuelve a figurar como activo.`);
    } else setRes(r);
  }

  if (tiene) {
    const periodos = c.licencias.filter((l) => l.fin >= hoy);
    return (
      <Modal onClose={onClose} titulo={`Licencia de ${c.nombre}`}>
        <div className="grid gap-2 text-base leading-7">
          <p className="font-semibold">Está de licencia.</p>
          {periodos.length ? (
            <ul className="grid gap-1">
              {periodos.map((l) => (
                <li className="rounded-lg bg-paper p-3" key={l.id}>
                  Del {formatoFecha(l.inicio)} al {formatoFecha(l.fin)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-paper p-3">Figura de licencia sin un período cargado.</p>
          )}
          <p className="text-sm text-ink/80">Mientras tanto no cuenta para la cobertura de los turnos.</p>
        </div>
        <ErrorGeneral msg={res?.general} />
        <NotaDemo />
        <div className="grid gap-2 sm:grid-cols-2">
          <button className={btn.secondary} onClick={onClose} type="button">
            Cerrar
          </button>
          <button className={btn.primary} onClick={quitar} type="button">
            Quitar licencia
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} titulo={`Licencia de ${c.nombre}`}>
      <form className="grid gap-4" noValidate onSubmit={alta}>
        <p className="text-sm leading-6 text-ink/80">Indicá el período. Durante la licencia no cuenta para la cobertura de sus turnos.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor="lic-inicio">
              Desde
            </label>
            <input className={inputCls} id="lic-inicio" onChange={(e) => { setInicio(e.target.value); }} type="date" value={inicio} />
            <ErrorCampo id="lic-inicio-error" msg={res?.errores.inicio} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor="lic-fin">
              Hasta
            </label>
            <input
              aria-describedby={res?.errores.fin ? 'lic-fin-error' : undefined}
              aria-invalid={res?.errores.fin ? true : undefined}
              className={inputCls}
              id="lic-fin"
              onChange={(e) => { setFin(e.target.value); }}
              type="date"
              value={fin}
            />
          </div>
        </div>
        <ErrorCampo id="lic-fin-error" msg={res?.errores.fin} />
        <ErrorGeneral msg={res?.general} />
        <NotaDemo />
        <div className="grid gap-2 sm:grid-cols-2">
          <button className={btn.secondary} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className={btn.primary} type="submit">
            Registrar licencia
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Borrar({ c, onClose, onHecho }: { c: Colaborador; onClose: () => void; onHecho: (m: string) => void }) {
  const [res, setRes] = useState<Extract<Resultado, { ok: false }> | null>(null);
  function borrar() {
    const r = acciones.borrar(c.id);
    if (r.ok) {
      onClose();
      onHecho(`${c.nombre} fue borrado de la lista.`);
    } else setRes(r);
  }
  return (
    <Modal onClose={onClose} titulo="¿Borrar colaborador?">
      <p className="text-base leading-7">
        Vas a borrar a <strong className="break-words">{c.nombre}</strong>. Esta acción no se puede deshacer. Si solo dejó de trabajar, es mejor marcarlo como
        «Dado de baja» desde Editar.
      </p>
      <ErrorGeneral msg={res?.general} />
      <NotaDemo />
      <div className="grid gap-2 sm:grid-cols-2">
        <button className={btn.secondary} onClick={onClose} type="button">
          Cancelar
        </button>
        <button className={btn.primary} onClick={borrar} type="button">
          Sí, borrar
        </button>
      </div>
    </Modal>
  );
}
