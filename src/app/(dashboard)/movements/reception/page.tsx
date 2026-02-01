import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMovements } from '@/lib/services/movement.service';
import MovementList from '@/components/features/MovementList';

export default async function ReceptionListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const movements = await getMovements({ type: 'RECEPTION' });
  const canCreate = ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'].includes(session.user.role);

  return (
    <MovementList
      title="Receptions"
      subtitle="Liste de toutes les receptions de medicaments"
      movements={movements}
      createHref="/movements/reception/new"
      createLabel="Nouvelle reception"
      canCreate={canCreate}
    />
  );
}
