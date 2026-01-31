'use client';

import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  detailsBefore: Record<string, unknown> | null;
  detailsAfter: Record<string, unknown> | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
}

const actionLabels: Record<string, string> = {
  CREATE_STUDY: 'Creation du protocole',
  UPDATE_STUDY: 'Modification du protocole',
  UPDATE_STUDY_CONFIG: 'Modification de la configuration',
  ACTIVATE_STUDY: 'Activation du protocole',
  SUSPEND_STUDY: 'Suspension du protocole',
  CLOSE_STUDY: 'Cloture du protocole',
  ARCHIVE_STUDY: 'Archivage du protocole',
};

const fieldLabels: Record<string, string> = {
  codeInternal: 'Code interne',
  euCtNumber: 'Numero EU-CT',
  nctNumber: 'Numero NCT',
  title: 'Titre',
  sponsor: 'Promoteur',
  phase: 'Phase',
  therapeuticArea: 'Aire therapeutique',
  siteActivationDate: 'Date activation site',
  expectedRecruitment: 'Recrutement attendu',
  complexityLevel: 'Niveau de complexite',
  contacts: 'Contacts',
  protocolVersion: 'Version du protocole',
  protocolVersionDate: 'Date de la version',
  amendments: 'Amendements',
  euCtrApprovalReference: 'Approbation EU-CTR',
  ethicsApprovalReference: 'Approbation ethique',
  insuranceReference: 'Reference assurance',
  eudamedId: 'ID EUDAMED',
  blinded: 'Type d\'aveugle',
  arms: 'Bras de traitement',
  cohorts: 'Cohortes',
  destructionPolicy: 'Politique de destruction',
  returnPolicy: 'Politique de retour',
  requiresPatientForDispensation: 'Patient requis pour dispensation',
  allowsDispensationWithoutIwrs: 'Dispensation sans IWRS',
  temperatureTrackingEnabled: 'Suivi temperature',
  returnedMaterialReusable: 'Materiel retourne reutilisable',
  dataQualityProfile: 'Profil qualite donnees',
  visitSchedule: 'Calendrier des visites',
  treatmentCycles: 'Cycles de traitement',
  patientConstraints: 'Contraintes patient',
  temperatureGovernance: 'Gouvernance temperature',
  excursionActionRequired: 'Action excursion temperature',
  excursionTimeThreshold: 'Seuil temps excursion',
  iwrsGovernance: 'Gouvernance IWRS',
  protocolRequiredEquipments: 'Equipements requis',
  siteOverrides: 'Personnalisations locales',
  startDate: 'Date de debut',
  expectedEndDate: 'Date de fin prevue',
  blockComments: 'Commentaires',
};

const actionColors: Record<string, 'success' | 'primary' | 'warning' | 'error' | 'info' | 'grey'> = {
  CREATE_STUDY: 'success',
  UPDATE_STUDY: 'primary',
  UPDATE_STUDY_CONFIG: 'primary',
  ACTIVATE_STUDY: 'success',
  SUSPEND_STUDY: 'warning',
  CLOSE_STUDY: 'info',
  ARCHIVE_STUDY: 'grey',
};

interface AuditTrailProps {
  studyId: string;
}

export default function AuditTrail({ studyId }: AuditTrailProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/studies/${studyId}/audit`)
      .then((res) => res.json())
      .then((result) => setEvents(result.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studyId]);

  if (loading) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Historique des modifications
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Timeline position="right" sx={{ p: 0, m: 0, '& .MuiTimelineItem-root:before': { flex: 0, p: 0 } }}>
          {events.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineSeparator>
                <TimelineDot color={actionColors[event.action] || 'grey'} variant="outlined" />
                {index < events.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {actionLabels[event.action] || event.action}
                  </Typography>
                  {event.user && (
                    <Chip
                      label={`${event.user.firstName} ${event.user.lastName}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.timestamp).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
                {event.detailsAfter && (
                  <Box sx={{ mt: 0.5 }}>
                    {event.action === 'UPDATE_STUDY' && (event.detailsAfter as { changedFields?: string[] }).changedFields && (
                      <Typography variant="caption" color="text.secondary">
                        Champs modifies : {((event.detailsAfter as { changedFields: string[] }).changedFields).map((f) => fieldLabels[f] || f).join(', ')}
                      </Typography>
                    )}
                    {event.action !== 'UPDATE_STUDY' && (event.detailsAfter as { status?: string }).status && (
                      <Typography variant="caption" color="text.secondary">
                        Statut : {(event.detailsAfter as { status: string }).status}
                      </Typography>
                    )}
                  </Box>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
