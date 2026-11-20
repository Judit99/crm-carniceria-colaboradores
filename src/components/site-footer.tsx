import { hasShell, site } from '@/lib/site';

export function SiteFooter() {
  if (!hasShell()) return null;
  return (
    <footer className="border-t-2 border-ink py-8 text-sm text-ink/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 sm:px-6 md:flex-row md:justify-between">
        <p className="font-semibold text-ink">{site.name}</p>
        <p>Uso interno del equipo. Los datos se guardan solo en este navegador.</p>
      </div>
    </footer>
  );
}
