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
import AddIcon from '@mui/icons-material/Add';
import { MovementType } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import LinkButton from '@/components/ui/LinkButton';

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

interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  movementDate: Date | string;
  study: { id: string; codeInternal: string; title: string };
  medication: { id: string; code: string; name: string } | null;
  stockItem: { id: string; batchNumber: string } | null;
  performedBy: { id: string; firstName: string; lastName: string };
}

interface MovementListProps {
  title: string;
  subtitle: string;
  movements: Movement[];
  createHref: string;
  createLabel: string;
  canCreate: boolean;
  hideHeader?: boolean;
}

export default function MovementList({
  title,
  subtitle,
  movements,
  createHref,
  createLabel,
  canCreate,
  hideHeader,
}: MovementListProps) {
  return (
    <Box>
      {!hideHeader && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          {canCreate && (
            <LinkButton
              href={createHref}
              variant="contained"
              startIcon={<AddIcon />}
            >
              {createLabel}
            </LinkButton>
          )}
        </Box>
      )}

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
