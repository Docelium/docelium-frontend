import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMovements } from '@/lib/services/movement.service';
import MovementList from '@/components/features/MovementList';

export default async function DestructionListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const movements = await getMovements({ type: 'DESTRUCTION' });
  const canCreate = ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'].includes(session.user.role);

  return (
    <MovementList
      title="Destructions"
      subtitle="Liste de toutes les destructions de medicaments"
      movements={movements}
      createHref="/movements/destruction/new"
      createLabel="Nouvelle destruction"
      canCreate={canCreate}
    />
  );
}
