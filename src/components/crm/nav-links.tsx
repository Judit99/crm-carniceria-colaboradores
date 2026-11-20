'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <>
      {links.map((l) => {
        const activo = l.href === '/' ? path === '/' : path.startsWith(l.href);
        return (
          <Link
            aria-current={activo ? 'page' : undefined}
            className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex-none ${
              activo ? 'bg-paper text-brand' : 'text-white hover:bg-white/15'
            }`}
            href={l.href}
            key={l.href}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
