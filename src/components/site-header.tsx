import Link from 'next/link';

import { SalirButton } from '@/components/crm/acceso';
import { NavLinks } from '@/components/crm/nav-links';
import { hasShell, site } from '@/lib/site';

// Encabezado de todas las rutas (layout.tsx), visible solo con la sesión abierta: marca, dos enlaces y Salir.
export function SiteHeader() {
  if (!hasShell()) return null;
  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          className="order-1 flex min-w-0 flex-1 items-center gap-3 font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex-none"
          href="/"
        >
          {site.logo ? (
            <img alt="" className="h-9 w-auto" src={site.logo} />
          ) : (
            <span aria-hidden className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-paper font-display text-base font-bold text-brand">
              C
            </span>
          )}
          <span className="truncate">{site.name}</span>
        </Link>
        <nav aria-label="Principal" className="order-3 flex w-full gap-2 md:order-2 md:w-auto md:flex-1">
          <NavLinks links={site.nav} />
        </nav>
        <SalirButton className="order-2 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/60 px-4 text-sm font-semibold transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:order-3" />
      </div>
    </header>
  );
}
