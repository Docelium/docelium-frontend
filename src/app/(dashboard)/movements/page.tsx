import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMovements } from '@/lib/services/movement.service';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import { MovementType } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const typeLabels: Record<MovementType, string> = {
  RECEPTION: 'Reception',
  DISPENSATION: 'Dispensation',
  RETOUR: 'Retour',
  DESTRUCTION: 'Destruction',
  TRANSFER: 'Transfert',
};

const typeColors: Record<MovementType, 'success' | 'primary' | 'warning' | 'error' | 'info'> = {
  RECEPTION: 'success',
  DISPENSATION: 'primary',
  RETOUR: 'warning',
  DESTRUCTION: 'error',
  TRANSFER: 'info',
};

export default async function MovementsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const movements = await getMovements();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mouvements
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Liste de tous les mouvements de stock
      </Typography>

      <Card>
        {movements.length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun mouvement
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les mouvements apparaitront ici une fois crees.
            </Typography>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Protocole</TableCell>
                  <TableCell>Medicament</TableCell>
                  <TableCell>Lot</TableCell>
                  <TableCell align="right">Quantite</TableCell>
                  <TableCell>Effectue par</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id} hover>
                    <TableCell>
                      {format(new Date(movement.movementDate), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={typeLabels[movement.type]}
                        color={typeColors[movement.type]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{movement.study.codeInternal}</TableCell>
                    <TableCell>{movement.medication?.name || '-'}</TableCell>
                    <TableCell>{movement.stockItem?.batchNumber || '-'}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={
                          movement.type === 'RECEPTION' || movement.type === 'RETOUR'
                            ? 'success.main'
                            : 'error.main'
                        }
                      >
                        {movement.type === 'RECEPTION' || movement.type === 'RETOUR' ? '+' : '-'}
                        {movement.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {movement.performedBy.firstName} {movement.performedBy.lastName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
