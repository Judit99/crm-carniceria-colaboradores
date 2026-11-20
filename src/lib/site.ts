// Nombre, descripción y enlaces de la app: el encabezado, el pie y los títulos de página lo leen de acá.
export const site = {
  name: 'Carnicería · Colaboradores',
  description: 'Panel interno para organizar turnos, licencias y carnés de manipulación del equipo de la carnicería.',
  /** Sin logo propio: el ícono del navegador usa las iniciales sobre el bordó. */
  logo: '',
  accounts: false,
  verifyEmail: false,
  staffOnly: false,
  captcha: true,
  paidCallsPerVisitorPerMinute: 20,
  admins: [] as string[],
  /** Enlaces del encabezado. */
  nav: [
    { href: '/', label: 'Panel' },
    { href: '/colaboradores', label: 'Colaboradores' },
  ] as { href: string; label: string }[],
  appNav: [] as { href: string; label: string }[],
};

export const hasShell = () => site.accounts || site.nav.length > 0;
