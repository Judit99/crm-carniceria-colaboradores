import type { Metadata } from 'next';
import { Suspense } from 'react';

import { EditarColaborador } from '@/components/crm/formulario';
import { Esqueleto, Pagina } from '@/components/crm/ui';

export const metadata: Metadata = { title: 'Editar colaborador' };

export default function Page() {
  return (
    <Suspense
      fallback={
        <Pagina titulo="Editar colaborador">
          <Esqueleto filas={1} />
        </Pagina>
      }
    >
      <EditarColaborador />
    </Suspense>
  );
}
