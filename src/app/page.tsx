import { Panel } from '@/components/crm/panel';
import { Pagina } from '@/components/crm/ui';

export default function Home() {
  return (
    <Pagina descripcion="Cómo está el equipo hoy: turnos, licencias y carnés de manipulación." titulo="Panel">
      <Panel />
    </Pagina>
  );
}
