import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudyById } from '@/lib/services/study.service';
import { getMedicationsByStudy } from '@/lib/services/medication.service';
import { notFound } from 'next/navigation';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import LinkButton from '@/components/ui/LinkButton';
import MedicationTableRow from '@/components/features/medication/MedicationTableRow';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudyMedicationsPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const study = await getStudyById(id, session.user.id, session.user.role);
  if (!study) {
    notFound();
  }

  const medications = await getMedicationsByStudy(id);
  const canCreate = ['ADMIN', 'PHARMACIEN'].includes(session.user.role) && study.protocolStatus !== 'ARCHIVED';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <LinkButton href={`/studies/${id}`} startIcon={<ArrowBackIcon />} color="inherit">
          Retour au protocole
        </LinkButton>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Medicaments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Protocole: {study.codeInternal} - {study.title}
          </Typography>
        </Box>
        {canCreate && (
          <LinkButton
            href={`/studies/${id}/medications/new`}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Ajouter un medicament
          </LinkButton>
        )}
      </Box>

      <Card>
        {medications.length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun medicament
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajoutez des medicaments pour commencer a gerer le stock de ce protocole.
            </Typography>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Forme</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Stockage</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Mouvements</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medications.map((med) => (
                  <MedicationTableRow key={med.id} medication={med} studyId={id} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
