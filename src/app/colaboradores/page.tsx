import type { Metadata } from 'next';

import { ListaColaboradores } from '@/components/crm/lista';

export const metadata: Metadata = { title: 'Colaboradores' };

export default function Page() {
  return <ListaColaboradores />;
}
