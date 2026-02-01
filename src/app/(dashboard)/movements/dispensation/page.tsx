import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMovements } from '@/lib/services/movement.service';
import MovementList from '@/components/features/MovementList';

export default async function DispensationListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const movements = await getMovements({ type: 'DISPENSATION' });
  const canCreate = ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'].includes(session.user.role);

  return (
    <MovementList
      title="Dispensations"
      subtitle="Liste de toutes les dispensations de medicaments"
      movements={movements}
      createHref="/movements/dispensation/new"
      createLabel="Nouvelle dispensation"
      canCreate={canCreate}
    />
  );
}
