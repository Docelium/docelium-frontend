import { getServerSession } from 'next-auth';
import { authOptions, checkPermission } from '@/lib/auth';
import { getMovements } from '@/lib/services/movement.service';
import MovementList from '@/components/features/MovementList';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import LinkButton from '@/components/ui/LinkButton';

export default async function DestructionListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const movements = await getMovements({ type: 'DESTRUCTION' });
  const canCreate = ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'].includes(session.user.role);
  const canBatchCreate = checkPermission(session.user.role, 'DESTRUCTION_BATCH_CREATE');

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Destructions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Liste de toutes les destructions de medicaments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canBatchCreate && (
            <LinkButton
              href="/movements/destruction/batch/new"
              variant="outlined"
              color="error"
            >
              Batch destruction
            </LinkButton>
          )}
          {canCreate && (
            <LinkButton
              href="/movements/destruction/new"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Nouvelle destruction
            </LinkButton>
          )}
        </Box>
      </Box>
      <MovementList
        title="Destructions"
        subtitle="Liste de toutes les destructions de medicaments"
        movements={movements}
        createHref="/movements/destruction/new"
        createLabel="Nouvelle destruction"
        canCreate={false}
        hideHeader
      />
    </>
  );
}
