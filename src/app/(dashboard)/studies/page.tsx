import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudies } from '@/lib/services/study.service';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import { StudyStatus, StudyPhase, BlindingType } from '@prisma/client';
import LinkButton from '@/components/ui/LinkButton';

const statusColors: Record<StudyStatus, 'default' | 'primary' | 'warning' | 'error' | 'info' | 'success'> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  TEMPORARILY_SUSPENDED: 'warning',
  CLOSED_TO_ENROLLMENT: 'info',
  CLOSED_TO_TREATMENT: 'info',
  TERMINATED: 'error',
  ARCHIVED: 'default',
};

const statusLabels: Record<StudyStatus, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  TEMPORARILY_SUSPENDED: 'Suspendu',
  CLOSED_TO_ENROLLMENT: 'Ferme inclusions',
  CLOSED_TO_TREATMENT: 'Ferme traitement',
  TERMINATED: 'Termine',
  ARCHIVED: 'Archive',
};

const phaseLabels: Record<StudyPhase, string> = {
  I: 'Phase I',
  Ia: 'Phase Ia',
  Ib: 'Phase Ib',
  I_II: 'Phase I/II',
  II: 'Phase II',
  IIa: 'Phase IIa',
  IIb: 'Phase IIb',
  III: 'Phase III',
  IIIa: 'Phase IIIa',
  IIIb: 'Phase IIIb',
  IIIc: 'Phase IIIc',
  IV: 'Phase IV',
  OTHER: 'Autre',
};

const blindingLabels: Record<BlindingType, string> = {
  NONE: 'Ouvert',
  SINGLE: 'Simple aveugle',
  DOUBLE: 'Double aveugle',
  TRIPLE: 'Triple aveugle',
};

function getEffectiveStatus(protocolStatus: StudyStatus, siteActivationDate: Date | string | null): StudyStatus {
  if (protocolStatus === 'DRAFT' && siteActivationDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(siteActivationDate) <= today) {
      return 'ACTIVE';
    }
  }
  return protocolStatus;
}

export default async function StudiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const studies = await getStudies(session.user.id, session.user.role);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Protocoles</Typography>
        {['ADMIN', 'PHARMACIEN'].includes(session.user.role) && (
          <LinkButton
            href="/studies/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Nouveau protocole
          </LinkButton>
        )}
      </Box>

      {studies.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun protocole
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Commencez par creer un nouveau protocole pour gerer vos essais cliniques.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {studies.map((study) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={study.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {study.codeInternal}
                    </Typography>
                    <Chip
                      label={statusLabels[getEffectiveStatus(study.protocolStatus, study.siteActivationDate)]}
                      color={statusColors[getEffectiveStatus(study.protocolStatus, study.siteActivationDate)]}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {study.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {(study.phases || []).map((p: StudyPhase) => (
                      <Chip key={p} label={phaseLabels[p]} size="small" variant="outlined" />
                    ))}
                    <Chip label={study.sponsor} size="small" variant="outlined" />
                    <Chip label={blindingLabels[study.blinded]} size="small" variant="outlined" />
                  </Box>
                  {study.therapeuticArea && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {study.therapeuticArea}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {study._count.medications} medicament(s)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {study._count.movements} mouvement(s)
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <LinkButton href={`/studies/${study.id}`} size="small">
                    Voir details
                  </LinkButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
