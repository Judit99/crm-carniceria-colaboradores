import type { Metadata } from 'next';

import { NuevoColaborador } from '@/components/crm/formulario';

export const metadata: Metadata = { title: 'Añadir colaborador' };

export default function Page() {
  return <NuevoColaborador />;
}
