'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type SubmitEvent } from 'react';

import { btn, cardCls, ErrorCampo, ErrorGeneral, Esqueleto, Icon, inputCls, NotaDemo, Pagina } from './ui';

import { type Borrador, type Colaborador, ROLES, TURNOS } from '@/lib/crm/core';
import { acciones, useColaboradores, useHoy } from '@/lib/crm/store';


const ESTADOS = [
  { valor: 'activo', label: 'Activo', ayuda: 'Trabaja y cuenta para la cobertura.' },
  { valor: 'licencia', label: 'De licencia', ayuda: 'No cuenta para la cobertura.' },
  { valor: 'baja', label: 'Dado de baja', ayuda: 'Ya no trabaja. Sigue en la lista.' },
];

export function NuevoColaborador() {
  const hoy = useHoy();
  return (
    <Pagina atras={{ href: '/colaboradores', label: 'Volver a colaboradores' }} descripcion="Completá los datos de la persona que se suma al equipo." titulo="Añadir colaborador">
      <Formulario
        confirmacion={(n) => `${n} se añadió al equipo.`}
        inicial={{ nombre: '', rol: '', fechaIngreso: hoy, turnos: [], fechaVencimientoCarne: '', estadoLaboral: 'activo', notas: '' }}
        onGuardar={(b) => acciones.crear(b)}
        textoBoton="Guardar colaborador"
      />
    </Pagina>
  );
}

export function EditarColaborador() {
  const id = useSearchParams().get('id') ?? '';
  const { lista, listo } = useColaboradores();
  const c = lista.find((x) => x.id === id);
  const atras = { href: '/colaboradores', label: 'Volver a colaboradores' };

  if (!listo) {
    return (
      <Pagina atras={atras} titulo="Editar colaborador">
        <Esqueleto filas={1} />
      </Pagina>
    );
  }
  if (!c) {
    return (
      <Pagina atras={atras} titulo="Editar colaborador">
        <div className={`${cardCls} flex flex-col items-start gap-4 p-6 sm:p-8`}>
          <span className="inline-flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon className="size-6" name="alert" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">No encontramos a ese colaborador</h2>
            <p className="mt-1 max-w-prose text-base leading-7 text-ink/80">
              Puede que ya se haya borrado o que el enlace esté incompleto. Volvé a la lista y elegí de nuevo.
            </p>
          </div>
          <Link className={btn.primary} href="/colaboradores">
            Ir a la lista de colaboradores
          </Link>
        </div>
      </Pagina>
    );
  }
  return (
    <Pagina atras={atras} descripcion="Cambiá lo que haga falta y guardá." titulo={`Editar a ${c.nombre}`}>
      <Formulario
        confirmacion={(n) => `Los cambios de ${n} se guardaron.`}
        inicial={desde(c)}
        key={c.id}
        onGuardar={(b) => acciones.editar(c.id, b)}
        textoBoton="Guardar cambios"
      />
    </Pagina>
  );
}

const desde = (c: Colaborador): Borrador => ({
  nombre: c.nombre,
  rol: c.rol,
  fechaIngreso: c.fechaIngreso,
  turnos: [...c.turnos],
  fechaVencimientoCarne: c.fechaVencimientoCarne,
  estadoLaboral: c.estadoLaboral,
  notas: c.notas,
});

function Formulario({
  inicial,
  onGuardar,
  textoBoton,
  confirmacion,
}: {
  inicial: Borrador;
  onGuardar: (b: Borrador) => ReturnType<typeof acciones.crear>;
  textoBoton: string;
  confirmacion: (nombre: string) => string;
}) {
  const router = useRouter();
  const [b, setB] = useState<Borrador>(inicial);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | undefined>();
  const [hecho, setHecho] = useState('');

  useEffect(() => {
    if (!hecho) return;
    const t = setTimeout(() => { router.push('/colaboradores'); }, 2200);
    return () => { clearTimeout(t); };
  }, [hecho, router]);

  const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) => { setB((p) => ({ ...p, [k]: v })); };

  function enviar(e: SubmitEvent) {
    e.preventDefault();
    const r = onGuardar(b);
    if (r.ok) {
      setErrores({});
      setGeneral(undefined);
      setHecho(confirmacion(b.nombre.trim().replace(/\s+/g, ' ')));
    } else {
      setErrores(r.errores);
      setGeneral(r.general);
    }
  }

  if (hecho) {
    return (
      <div className="grid max-w-2xl gap-4 rounded-card border-2 border-ok bg-white p-6 sm:p-8" role="status">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-ok text-white">
          <Icon className="size-6" name="check" />
        </span>
        <h2 className="font-display text-2xl font-bold break-words">{hecho}</h2>
        <p className="text-base leading-7 text-ink/80">Te llevamos de vuelta a la lista de colaboradores.</p>
        <NotaDemo />
        <Link className={`${btn.primary} w-full sm:w-fit`} href="/colaboradores">
          Volver ahora
        </Link>
      </div>
    );
  }

  const err = (k: string) => (errores[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${k}-error` } : {});

  return (
    <form className={`${cardCls} grid max-w-3xl gap-6 p-4 sm:p-8`} noValidate onSubmit={enviar}>
      <div className="grid gap-2">
        <label className="text-sm font-semibold" htmlFor="nombre">
          Nombre completo
        </label>
        <input autoComplete="off" className={inputCls} id="nombre" name="nombre" onChange={(e) => { set('nombre', e.target.value); }} type="text" value={b.nombre} {...err('nombre')} />
        <ErrorCampo id="nombre-error" msg={errores.nombre} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <label className="text-sm font-semibold" htmlFor="rol">
            Rol
          </label>
          <select className={inputCls} id="rol" name="rol" onChange={(e) => { set('rol', e.target.value); }} value={b.rol} {...err('rol')}>
            <option value="">Elegí un rol</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ErrorCampo id="rol-error" msg={errores.rol} />
        </div>
        <div className="grid content-start gap-2">
          <label className="text-sm font-semibold" htmlFor="fechaIngreso">
            Fecha de ingreso
          </label>
          <input className={inputCls} id="fechaIngreso" name="fechaIngreso" onChange={(e) => { set('fechaIngreso', e.target.value); }} type="date" value={b.fechaIngreso} {...err('fechaIngreso')} />
          <ErrorCampo id="fechaIngreso-error" msg={errores.fechaIngreso} />
        </div>
      </div>

      <fieldset aria-describedby={errores.turnos ? 'turnos-error' : undefined} className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">Turnos</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TURNOS.map((t) => (
            <label
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-ink/40 bg-white px-3 text-base transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40"
              key={t}
            >
              <input
                checked={b.turnos.includes(t)}
                className="size-5 accent-brand"
                name="turnos"
                onChange={(e) => { set('turnos', e.target.checked ? [...b.turnos, t] : b.turnos.filter((x) => x !== t)); }}
                type="checkbox"
                value={t}
              />
              {t}
            </label>
          ))}
        </div>
        <ErrorCampo id="turnos-error" msg={errores.turnos} />
      </fieldset>

      <div className="grid gap-2">
        <label className="text-sm font-semibold" htmlFor="fechaVencimientoCarne">
          Fecha de vencimiento del carné
        </label>
        <input
          className={`${inputCls} sm:max-w-xs`}
          id="fechaVencimientoCarne"
          name="fechaVencimientoCarne"
          onChange={(e) => { set('fechaVencimientoCarne', e.target.value); }}
          type="date"
          value={b.fechaVencimientoCarne}
          {...err('fechaVencimientoCarne')}
        />
        <ErrorCampo id="fechaVencimientoCarne-error" msg={errores.fechaVencimientoCarne} />
      </div>

      <fieldset aria-describedby={errores.estadoLaboral ? 'estadoLaboral-error' : undefined} className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">Estado laboral</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {ESTADOS.map((s) => (
            <label
              className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-ink/40 bg-white p-3 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40"
              key={s.valor}
            >
              <input
                checked={b.estadoLaboral === s.valor}
                className="mt-0.5 size-5 accent-brand"
                name="estadoLaboral"
                onChange={() => { set('estadoLaboral', s.valor); }}
                type="radio"
                value={s.valor}
              />
              <span>
                <span className="block text-base font-semibold">{s.label}</span>
                <span className="block text-sm leading-5 text-ink/80">{s.ayuda}</span>
              </span>
            </label>
          ))}
        </div>
        <ErrorCampo id="estadoLaboral-error" msg={errores.estadoLaboral} />
      </fieldset>

      <div className="grid gap-2">
        <label className="text-sm font-semibold" htmlFor="notas">
          Notas <span className="font-normal text-ink/70">(opcional)</span>
        </label>
        <textarea className={`${inputCls} min-h-28 py-3`} id="notas" name="notas" onChange={(e) => { set('notas', e.target.value); }} rows={4} value={b.notas} {...err('notas')} />
        <ErrorCampo id="notas-error" msg={errores.notas} />
      </div>

      <ErrorGeneral msg={general} />
      {Object.keys(errores).length > 0 && !general ? <ErrorGeneral msg="Revisá los campos marcados y volvé a guardar. No se perdió nada de lo que escribiste." /> : null}
      <NotaDemo />
      <div className="grid gap-3 sm:flex">
        <button className={`${btn.primary} sm:min-w-56`} type="submit">
          {textoBoton}
        </button>
        <Link className={btn.secondary} href="/colaboradores">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
