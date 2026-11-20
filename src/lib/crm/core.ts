// Lógica pura del CRM de colaboradores: fechas, carné, licencias y cobertura.
export const ROLES = ['Mostrador y cortes', 'Elaborados', 'Caja', 'Limpieza y cámara'] as const;
export type Rol = (typeof ROLES)[number];
export const TURNOS = ['Mañana', 'Tarde', 'Domingo'] as const;
export type Turno = (typeof TURNOS)[number];
export type EstadoLaboral = 'activo' | 'licencia' | 'baja';
export type Licencia = { id: string; inicio: string; fin: string };
export type Colaborador = {
  id: string;
  nombre: string;
  rol: Rol;
  fechaIngreso: string;
  turnos: Turno[];
  fechaVencimientoCarne: string;
  estadoLaboral: EstadoLaboral;
  licencias: Licencia[];
  notas: string;
  fechaCreacion: string;
  fechaActualizacion: string;
};

export const MINIMO_POR_TURNO = 2;
export const HORARIOS: Record<Turno, { dias: string; horas: string }> = {
  Mañana: { dias: 'Lunes a sábado', horas: '08:00 a 12:30' },
  Tarde: { dias: 'Lunes a sábado', horas: '16:00 a 20:00' },
  Domingo: { dias: 'Domingo', horas: '08:00 a 12:30' },
};
// Feriados no laborables (mes-día) en que el local cierra.
export const FERIADOS_CIERRE = ['01-01', '05-01', '07-18', '08-25', '12-25'];

/** Fecha de hoy en Uruguay (YYYY-MM-DD). */
export function hoyISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Montevideo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
const toUTC = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
export const esFechaValida = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const t = new Date(toUTC(iso));
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === iso && Number(iso.slice(0, 4)) >= 1900;
};
export const diasEntre = (desde: string, hasta: string) => Math.round((toUTC(hasta) - toUTC(desde)) / 86400000);
export const sumarDias = (iso: string, n: number) => new Date(toUTC(iso) + n * 86400000).toISOString().slice(0, 10);
export const formatoFecha = (iso: string) => (esFechaValida(iso) ? iso.split('-').reverse().join('/') : '—');
export const esDomingo = (iso: string) => new Date(toUTC(iso)).getUTCDay() === 0;
export const localCerrado = (iso: string) => FERIADOS_CIERRE.includes(iso.slice(5));

export type EstadoCarne = 'vigente' | 'porVencer' | 'vencido' | 'sinFecha';
export function estadoCarne(venc: string, hoy: string): { estado: EstadoCarne; dias: number } {
  if (!esFechaValida(venc)) return { estado: 'sinFecha', dias: 0 };
  const dias = diasEntre(hoy, venc);
  return { estado: dias < 0 ? 'vencido' : dias <= 30 ? 'porVencer' : 'vigente', dias };
}

export const enLicenciaEn = (c: Colaborador, fecha: string) => c.licencias.some((l) => l.inicio <= fecha && fecha <= l.fin);
/** Estado efectivo hoy: baja manda; una licencia vigente hoy o el estado «licencia» sin fin pasado cuentan como licencia. */
export function estadoEfectivo(c: Colaborador, hoy: string): EstadoLaboral {
  if (c.estadoLaboral === 'baja') return 'baja';
  if (c.estadoLaboral === 'licencia' || enLicenciaEn(c, hoy)) return 'licencia';
  return 'activo';
}
export const disponibleEn = (c: Colaborador, turno: Turno, fecha: string) =>
  estadoEfectivo(c, fecha) === 'activo' && c.turnos.includes(turno);

export function cobertura(lista: Colaborador[], hoy: string) {
  return TURNOS.map((turno) => {
    const disponibles = lista.filter((c) => disponibleEn(c, turno, hoy));
    return { turno, ...HORARIOS[turno], disponibles, cantidad: disponibles.length, falta: Math.max(0, MINIMO_POR_TURNO - disponibles.length) };
  });
}

export function resumen(lista: Colaborador[], hoy: string) {
  const noBaja = lista.filter((c) => c.estadoLaboral !== 'baja');
  const carnes = noBaja.map((c) => ({ c, ...estadoCarne(c.fechaVencimientoCarne, hoy) }));
  return {
    activos: noBaja.filter((c) => estadoEfectivo(c, hoy) === 'activo').length,
    enLicencia: noBaja.filter((c) => estadoEfectivo(c, hoy) === 'licencia'),
    vigentes: carnes.filter((x) => x.estado === 'vigente').length,
    porVencer: carnes.filter((x) => x.estado === 'porVencer'),
    vencidos: carnes.filter((x) => x.estado === 'vencido'),
    cobertura: cobertura(lista, hoy),
  };
}

export type Borrador = { nombre: string; rol: string; fechaIngreso: string; turnos: string[]; fechaVencimientoCarne: string; estadoLaboral: string; notas: string };
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
export const mismoNombre = (a: string, b: string) => norm(a) === norm(b);

export function validar(b: Borrador, lista: Colaborador[], hoy: string, idActual?: string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!b.nombre.trim()) e.nombre = 'Escribí el nombre completo.';
  else if (lista.some((c) => c.id !== idActual && mismoNombre(c.nombre, b.nombre))) e.nombre = 'Ya existe un colaborador con ese nombre.';
  if (!(ROLES as readonly string[]).includes(b.rol)) e.rol = 'Elegí un rol de la lista.';
  if (!esFechaValida(b.fechaIngreso)) e.fechaIngreso = 'Indicá una fecha de ingreso válida.';
  else if (b.fechaIngreso > hoy) e.fechaIngreso = 'La fecha de ingreso no puede ser futura.';
  if (b.turnos.length === 0) e.turnos = 'Elegí al menos un turno.';
  if (!esFechaValida(b.fechaVencimientoCarne)) e.fechaVencimientoCarne = 'Indicá una fecha de vencimiento válida.';
  if (!['activo', 'licencia', 'baja'].includes(b.estadoLaboral)) e.estadoLaboral = 'Elegí un estado.';
  return e;
}
export function validarRenovacion(fecha: string, hoy: string): string | null {
  if (!esFechaValida(fecha)) return 'Indicá una fecha válida.';
  if (fecha < hoy) return 'La nueva fecha no puede estar en el pasado.';
  return null;
}
export function validarLicencia(inicio: string, fin: string): string | null {
  if (!esFechaValida(inicio) || !esFechaValida(fin)) return 'Indicá fechas de inicio y fin válidas.';
  if (fin < inicio) return 'La fecha de fin no puede ser anterior al inicio.';
  return null;
}

export function datosIniciales(hoy: string): Colaborador[] {
  const ahora = new Date().toISOString();
  const mk = (n: number, nombre: string, rol: Rol, turnos: Turno[], dias: number | null, estado: EstadoLaboral, ingresoDias: number, licencias: Licencia[] = [], notas = ''): Colaborador => ({
    id: `col-${n}`, nombre, rol, turnos, estadoLaboral: estado, licencias, notas,
    fechaIngreso: sumarDias(hoy, -ingresoDias),
    fechaVencimientoCarne: dias === null ? '' : sumarDias(hoy, dias),
    fechaCreacion: ahora, fechaActualizacion: ahora,
  });
  return [
    mk(1, 'Lucía Fernández', 'Mostrador y cortes', ['Mañana', 'Domingo'], 210, 'activo', 1400),
    mk(2, 'Andrea Méndez', 'Caja', ['Mañana', 'Tarde'], 160, 'activo', 900),
    mk(3, 'Martín Suárez', 'Mostrador y cortes', ['Tarde', 'Domingo'], 14, 'licencia', 700, [{ id: 'lic-1', inicio: sumarDias(hoy, -3), fin: sumarDias(hoy, 11) }], 'Licencia médica.'),
    mk(4, 'Sofía Olivera', 'Elaborados', ['Mañana', 'Tarde'], 95, 'activo', 400),
    mk(5, 'Bruno Acosta', 'Limpieza y cámara', ['Tarde'], -5, 'activo', 200, [], 'Tiene que renovar el carné.'),
    mk(6, 'Pablo Rodríguez', 'Mostrador y cortes', ['Mañana'], null, 'baja', 1200),
  ];
}
