import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMovements } from '@/lib/services/movement.service';
import MovementList from '@/components/features/MovementList';

export default async function ReturnListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const movements = await getMovements({ type: 'RETOUR' });
  const canCreate = ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'].includes(session.user.role);

  return (
    <MovementList
      title="Retours"
      subtitle="Liste de tous les retours de medicaments"
      movements={movements}
      createHref="/movements/return/new"
      createLabel="Nouveau retour"
      canCreate={canCreate}
    />
  );
}
