import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStock } from '@/lib/services/stock.service';
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
import { StockItemStatus, MedicationType } from '@prisma/client';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusLabels: Record<StockItemStatus, string> = {
  AVAILABLE: 'Disponible',
  QUARANTINE: 'Quarantaine',
  RESERVED: 'Reserve',
  EXPIRED: 'Expire',
  DESTROYED: 'Detruit',
  RETURNED_TO_SPONSOR: 'Retourne',
};

const statusColors: Record<StockItemStatus, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  AVAILABLE: 'success',
  QUARANTINE: 'warning',
  RESERVED: 'info',
  EXPIRED: 'error',
  DESTROYED: 'default',
  RETURNED_TO_SPONSOR: 'default',
};

export default async function StockPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const stockItems = await getStock();
  const today = new Date();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stock
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Vue d'ensemble du stock de medicaments
      </Typography>

      <Card>
        {stockItems.length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun stock
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Le stock sera affiche ici apres les premieres receptions.
            </Typography>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Protocole</TableCell>
                  <TableCell>Medicament</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Lot</TableCell>
                  <TableCell>Emplacement</TableCell>
                  <TableCell align="right">Initial</TableCell>
                  <TableCell align="right">Actuel</TableCell>
                  <TableCell>Expiration</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockItems.map((item) => {
                  const daysUntilExpiry = item.expiryDate
                    ? differenceInDays(new Date(item.expiryDate), today)
                    : null;
                  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.study.codeInternal}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {item.medication?.name || item.equipment?.name || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.medication?.code || item.equipment?.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.medication && (
                          <Chip
                            label={item.medication.type}
                            color={item.medication.type === MedicationType.IMP ? 'primary' : 'secondary'}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>{item.batchNumber}</TableCell>
                      <TableCell>{item.storageLocation || '-'}</TableCell>
                      <TableCell align="right">{item.initialQuantity}</TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={item.currentQuantity > 0 ? 'text.primary' : 'text.secondary'}
                        >
                          {item.currentQuantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.expiryDate ? (
                          <Box>
                            <Typography
                              variant="body2"
                              color={isExpired ? 'error.main' : isExpiringSoon ? 'warning.main' : 'text.primary'}
                            >
                              {format(new Date(item.expiryDate), 'dd/MM/yyyy', { locale: fr })}
                            </Typography>
                            {isExpiringSoon && (
                              <Typography variant="caption" color="warning.main">
                                Expire dans {daysUntilExpiry} jours
                              </Typography>
                            )}
                            {isExpired && (
                              <Typography variant="caption" color="error.main">
                                Expire
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[item.status]}
                          color={statusColors[item.status]}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
