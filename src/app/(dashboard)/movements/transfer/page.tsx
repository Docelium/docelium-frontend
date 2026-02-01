import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMovements } from '@/lib/services/movement.service';
import MovementList from '@/components/features/MovementList';

export default async function TransferListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const movements = await getMovements({ type: 'TRANSFER' });
  const canCreate = ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'].includes(session.user.role);

  return (
    <MovementList
      title="Transferts"
      subtitle="Liste de tous les transferts de medicaments"
      movements={movements}
      createHref="/movements/transfer/new"
      createLabel="Nouveau transfert"
      canCreate={canCreate}
    />
  );
}
