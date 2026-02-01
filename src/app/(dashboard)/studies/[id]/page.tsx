import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudyById } from '@/lib/services/study.service';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { StudyStatus, StudyPhase, DestructionPolicy, BlindingType } from '@prisma/client';
import LinkButton from '@/components/ui/LinkButton';
import AuditTrail from '@/components/features/AuditTrail';

const statusLabels: Record<StudyStatus, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  TEMPORARILY_SUSPENDED: 'Suspendu temporairement',
  CLOSED_TO_ENROLLMENT: 'Ferme aux inclusions',
  CLOSED_TO_TREATMENT: 'Ferme aux traitements',
  TERMINATED: 'Termine',
  ARCHIVED: 'Archive',
};

const statusColors: Record<StudyStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  TEMPORARILY_SUSPENDED: 'warning',
  CLOSED_TO_ENROLLMENT: 'info',
  CLOSED_TO_TREATMENT: 'info',
  TERMINATED: 'error',
  ARCHIVED: 'default',
};

const phaseLabels: Record<StudyPhase, string> = {
  I: 'Phase I',
  I_II: 'Phase I/II',
  II: 'Phase II',
  III: 'Phase III',
  IV: 'Phase IV',
  OTHER: 'Autre',
};

const destructionPolicyLabels: Record<DestructionPolicy, string> = {
  LOCAL: 'Destruction locale',
  SPONSOR: 'Retour promoteur',
  MIXED: 'Mixte',
};

const blindingLabels: Record<BlindingType, string> = {
  NONE: 'Ouvert',
  SINGLE: 'Simple aveugle',
  DOUBLE: 'Double aveugle',
  TRIPLE: 'Triple aveugle',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudyDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const study = await getStudyById(id, session.user.id, session.user.role);
  if (!study) {
    notFound();
  }

  const canEdit = ['ADMIN', 'PHARMACIEN'].includes(session.user.role) && study.protocolStatus !== 'ARCHIVED';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <LinkButton href="/studies" startIcon={<ArrowBackIcon />} color="inherit">
          Retour
        </LinkButton>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {study.codeInternal}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {study.title}
          </Typography>
        </Box>
        {canEdit && (
          <LinkButton
            href={`/studies/${study.id}/edit`}
            variant="outlined"
            startIcon={<EditIcon />}
          >
            Modifier
          </LinkButton>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations generales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Statut
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={statusLabels[study.protocolStatus]}
                      color={statusColors[study.protocolStatus]}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Phase
                  </Typography>
                  <Typography variant="body2">{phaseLabels[study.phase]}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Promoteur
                  </Typography>
                  <Typography variant="body2">{study.sponsor}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Politique destruction
                  </Typography>
                  <Typography variant="body2">
                    {destructionPolicyLabels[study.destructionPolicy]}
                  </Typography>
                  {study.destructionPolicy === 'MIXED' && study.destructionPolicyDetails && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {study.destructionPolicyDetails}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Type d'aveugle
                  </Typography>
                  <Typography variant="body2">{blindingLabels[study.blinded]}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Patient requis dispensation
                  </Typography>
                  <Typography variant="body2">
                    {study.requiresPatientForDispensation ? 'Oui' : 'Non'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Suivi temperature
                  </Typography>
                  <Typography variant="body2">
                    {study.temperatureTrackingEnabled ? 'Active' : 'Inactif'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dates
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Date de debut
                  </Typography>
                  <Typography variant="body2">
                    {study.startDate
                      ? new Date(study.startDate).toLocaleDateString('fr-FR')
                      : 'Non definie'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Date de fin prevue
                  </Typography>
                  <Typography variant="body2">
                    {study.expectedEndDate
                      ? new Date(study.expectedEndDate).toLocaleDateString('fr-FR')
                      : 'Non definie'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Date de fin effective
                  </Typography>
                  <Typography variant="body2">
                    {study.actualEndDate
                      ? new Date(study.actualEndDate).toLocaleDateString('fr-FR')
                      : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Medicaments
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {study._count.medications}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Articles en stock
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {study._count.stockItems}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Mouvements
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {study._count.movements}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Periodes comptables
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {study._count.accountingPeriods}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Utilisateurs assignes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {study.userAssignments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucun utilisateur assigne
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {study.userAssignments.map((assignment) => (
                    <Box key={assignment.id}>
                      <Typography variant="body2" fontWeight="medium">
                        {assignment.user.firstName} {assignment.user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {assignment.user.role}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {assignment.user.email}
                        </Typography>
                      </Box>
                      {assignment.user.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {assignment.user.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Commentaires par bloc */}
      {study.blockComments && Object.keys(study.blockComments as Record<string, string>).length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Commentaires
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Object.entries(study.blockComments as Record<string, string>).map(([blockId, comment]) => (
                <Box key={blockId}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Bloc {blockId}
                  </Typography>
                  <Typography variant="body2">{comment}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Historique des modifications */}
      <AuditTrail studyId={study.id} />
    </Box>
  );
}
