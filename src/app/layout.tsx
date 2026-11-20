import type { Metadata } from 'next';
import { Open_Sans, Roboto_Slab } from 'next/font/google';
import type { ReactNode } from 'react';

import { Acceso } from '@/components/crm/acceso';
import { DevBanner } from '@/components/dev-banner';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { siteUrl } from '@/lib/seo';
import { site } from '@/lib/site';

import './globals.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await siteUrl()),
    title: { default: site.name, template: `%s · ${site.name}` },
    description: site.description,
    robots: { index: false, follow: false },
    icons: { icon: site.logo || '/site-icon.svg' },
  };
}

const heading = Roboto_Slab({ subsets: ['latin'], variable: '--font-heading', weight: ['500', '600', '700', '800'] });
const body = Open_Sans({ subsets: ['latin'], variable: '--font-body' });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${heading.variable} ${body.variable}`} lang="es">
      <body className="flex min-h-dvh flex-col bg-paper font-sans text-ink antialiased">
        <Acceso header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </Acceso>
        <DevBanner />
      </body>
    </html>
  );
}
