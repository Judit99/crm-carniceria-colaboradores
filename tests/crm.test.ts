// Pruebas de lógica. Fecha de referencia fija: 2026-03-10 (martes). Ejecutar: npx tsx tests/crm.test.ts
import assert from 'node:assert/strict';
import { cobertura, datosIniciales, estadoCarne, resumen, validar, validarRenovacion } from '../src/lib/crm/core';
const HOY = '2026-03-10';
const base = () => datosIniciales(HOY); // copia nueva cada vez
let l = base();
const man = () => cobertura(l, HOY).find((c) => c.turno === 'Mañana')!;
assert.equal(man().cantidad, 3);
// Prueba 1: licencia baja la cobertura
const dom = () => cobertura(l, HOY).find((c) => c.turno === 'Domingo')!;
assert.equal(dom().cantidad, 1); // Martín en licencia
l = l.map((c) => c.id === 'col-1' ? { ...c, estadoLaboral: 'licencia', licencias: [{ id: 'x', inicio: HOY, fin: '2026-03-20' }] } : c);
assert.equal(dom().cantidad, 0);
assert.equal(l.length, 6);
l = l.map((c) => c.id === 'col-1' ? { ...c, estadoLaboral: 'activo', licencias: [] } : c);
assert.equal(dom().cantidad, 1);
// Prueba 2: carné
assert.equal(estadoCarne('2026-04-09', HOY).estado, 'porVencer'); // 30 días
assert.equal(estadoCarne('2026-04-10', HOY).estado, 'vigente');
assert.equal(estadoCarne('2026-03-10', HOY).estado, 'porVencer'); // 0 días
assert.equal(estadoCarne('2026-03-09', HOY).estado, 'vencido');
assert.equal(resumen(l, HOY).porVencer.length, 1);
l = l.map((c) => c.id === 'col-3' ? { ...c, fechaVencimientoCarne: '2027-03-10' } : c);
assert.equal(resumen(l, HOY).porVencer.length, 0);
// Prueba 3: validaciones
const b = { nombre: 'Nueva', rol: 'Caja', fechaIngreso: '2026-01-01', turnos: ['Tarde'], fechaVencimientoCarne: '2027-01-01', estadoLaboral: 'activo', notas: '' };
assert.deepEqual(validar(b, l, HOY), {});
assert.ok(validar({ ...b, nombre: ' ' }, l, HOY).nombre);
assert.ok(validar({ ...b, nombre: 'lucia fernandez' }, l, HOY).nombre);
assert.ok(validar({ ...b, turnos: [] }, l, HOY).turnos);
assert.ok(validar({ ...b, fechaIngreso: '2026-12-01' }, l, HOY).fechaIngreso);
assert.ok(validarRenovacion('2026-03-09', HOY));
assert.equal(validarRenovacion('2026-03-10', HOY), null);
// Bajas no cuentan
assert.equal(resumen(l, HOY).activos, 4);
console.log('Todas las pruebas pasan');
