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
import { StudyStatus, StudyPhase } from '@prisma/client';
import LinkButton from '@/components/ui/LinkButton';
import DuplicateStudyButton from '@/components/features/DuplicateStudyButton';
import { statusLabels, phaseLabels, blindingLabels } from '@/lib/labels';

const statusColors: Record<StudyStatus, 'default' | 'primary' | 'warning' | 'error' | 'info' | 'success'> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  TEMPORARILY_SUSPENDED: 'warning',
  CLOSED_TO_ENROLLMENT: 'info',
  CLOSED_TO_TREATMENT: 'info',
  TERMINATED: 'error',
  ARCHIVED: 'default',
};

function isPast(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(date) <= today;
}

function getSiteLifecycleTag(closureDate: Date | null, setupDate: Date | null): { label: string; color: 'default' | 'warning' } | null {
  if (isPast(closureDate)) return { label: 'Archive', color: 'default' };
  if (isPast(setupDate)) return { label: 'En attente', color: 'warning' };
  return null;
}

function getRecruitmentTag(
  endDate: Date | null,
  suspensionDate: Date | null,
  startDate: Date | null
): { label: string; color: 'default' | 'success' | 'warning' } | null {
  if (isPast(endDate)) return { label: 'Recrutement termine', color: 'default' };
  if (isPast(suspensionDate)) return { label: 'Recrutement suspendu', color: 'warning' };
  if (isPast(startDate)) return { label: 'Recrutement en cours', color: 'success' };
  return null;
}

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
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Chip
                        label={statusLabels[getEffectiveStatus(study.protocolStatus, study.siteActivationDate)]}
                        color={statusColors[getEffectiveStatus(study.protocolStatus, study.siteActivationDate)]}
                        size="small"
                      />
                      {getSiteLifecycleTag(study.siteCenterClosureDate, study.setupDate) && (
                        <Chip
                          label={getSiteLifecycleTag(study.siteCenterClosureDate, study.setupDate)!.label}
                          color={getSiteLifecycleTag(study.siteCenterClosureDate, study.setupDate)!.color}
                          variant="outlined"
                          size="small"
                        />
                      )}
                      {getRecruitmentTag(study.recruitmentEndDate, study.recruitmentSuspensionDate, study.recruitmentStartDate) && (
                        <Chip
                          label={getRecruitmentTag(study.recruitmentEndDate, study.recruitmentSuspensionDate, study.recruitmentStartDate)!.label}
                          color={getRecruitmentTag(study.recruitmentEndDate, study.recruitmentSuspensionDate, study.recruitmentStartDate)!.color}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
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
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <LinkButton href={`/studies/${study.id}`} size="small">
                    Voir details
                  </LinkButton>
                  {['ADMIN', 'PHARMACIEN'].includes(session.user.role) && (
                    <DuplicateStudyButton studyId={study.id} codeInternal={study.codeInternal} variant="list" />
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
