# CRM de colaboradores – Carnicería (demo)

Aplicación interna para gestionar colaboradores, turnos, licencias y carnés de manipulador. Tres pantallas: Panel (`/`), Colaboradores (`/colaboradores`) y Alta/Edición (`/colaboradores/nuevo`, `/colaboradores/editar?id=…`).

## Tecnologías
Next.js + React, Tailwind CSS, localStorage. Sin backend ni servicios externos.

## Ejecutar
`npm install` y `npm run dev`. Pruebas: `npx tsx tests/crm.test.ts`.

## Estructura
- `src/lib/crm/core.ts`: tipos y lógica pura (fechas, carné, licencias, cobertura, validaciones, datos iniciales).
- `src/lib/crm/store.ts`: localStorage, acciones y clave de acceso.
- `src/components/crm/`: pantallas y piezas visuales.
- `tests/crm.test.ts`: pruebas con fecha fija 2026-03-10 sobre copias nuevas de los datos.

## Modelo de datos
Colaborador: `id` (inmutable), `nombre`, `rol`, `fechaIngreso`, `turnos[]`, `fechaVencimientoCarne`, `estadoLaboral` (activo/licencia/baja), `licencias[{id,inicio,fin}]`, `notas`, `fechaCreacion`, `fechaActualizacion`.

## localStorage
Clave `carniceria-crm-colaboradores-v1`. Si no existe se cargan los datos iniciales; si existe (aunque sea una lista vacía) se respeta. Cada acción valida, guarda, comprueba la lectura y solo entonces actualiza la pantalla; si falla no cambia nada ni se muestra éxito.

## Datos iniciales
Seis colaboradores ficticios (`datosIniciales` en `core.ts`); los vencimientos son relativos a la fecha de hoy (Uruguay) del primer arranque.

## Clave local
`CLAVE_ACCESO` en `src/lib/crm/store.ts` (por defecto `carniceria2026`). No es autenticación real.

## Licencias
Al dar de alta una licencia (inicio y fin) el colaborador pasa a «De licencia» y conserva sus turnos. «Quitar licencia» borra los períodos y lo vuelve a activar, recuperando la cobertura sin duplicar nada. Una licencia cuyo período incluye hoy también cuenta aunque el estado sea activo.

## Cobertura
Por turno cuentan solo colaboradores activos, con ese turno y sin licencia aplicable hoy. Mínimo 2; si hay menos: «Turno corto» y cuántas personas faltan. Las bajas no cuentan.

## Vencimientos
Hoy = fecha de Montevideo. Más de 30 días: vigente; de 0 a 30: por vencer; pasada: vencido. Se recalcula sola cada pocos segundos. Las bajas no entran en los contadores. Feriados de cierre definidos en `FERIADOS_CIERRE`.
