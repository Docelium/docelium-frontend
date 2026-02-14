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
  // Studies
  CREATE_STUDY: 'Creation du protocole',
  UPDATE_STUDY: 'Modification du protocole',
  UPDATE_STUDY_CONFIG: 'Modification de la configuration',
  ACTIVATE_STUDY: 'Activation du protocole',
  SUSPEND_STUDY: 'Suspension du protocole',
  CLOSE_STUDY: 'Cloture du protocole',
  ARCHIVE_STUDY: 'Archivage du protocole',
  // Medications
  CREATE_MEDICATION: 'Creation du medicament',
  UPDATE_MEDICATION: 'Modification du medicament',
  DEACTIVATE_MEDICATION: 'Desactivation du medicament',
  // Movements
  CREATE_MOVEMENT_RECEPTION: 'Reception',
  CREATE_MOVEMENT_DISPENSATION: 'Dispensation',
  CREATE_MOVEMENT_RETOUR: 'Retour',
  CREATE_MOVEMENT_DESTRUCTION: 'Destruction',
  CREATE_MOVEMENT_TRANSFER: 'Transfert',
  // Stock
  QUARANTINE_STOCK_ITEM: 'Mise en quarantaine',
  RELEASE_STOCK_ITEM: 'Levee de quarantaine',
};

const fieldLabels: Record<string, string> = {
  codeInternal: 'Code interne',
  studyCode: 'Code de l\'etude',
  acronym: 'Acronyme',
  siteNumber: 'Numero de centre',
  euCtNumber: 'Numero EU-CT',
  nctNumber: 'Numero NCT',
  title: 'Titre',
  sponsor: 'Promoteur',
  phase: 'Phase',
  therapeuticArea: 'Indication therapeutique',
  siteActivationDate: 'Date activation site',
  setupDate: 'Date de mise en place',
  siteCenterClosureDate: 'Date de fermeture du centre',
  recruitmentStartDate: 'Debut du recrutement',
  recruitmentSuspensionDate: 'Suspension du recrutement',
  recruitmentEndDate: 'Fin du recrutement',
  expectedRecruitment: 'Recrutement attendu',
  contacts: 'Contacts',
  protocolVersion: 'Version du protocole',
  protocolVersionDate: 'Date de la version',
  amendments: 'Amendements',
  pharmacyManualVersion: 'Version du manuel pharmacie',
  pharmacyManualVersionDate: 'Date version manuel pharmacie',
  euCtrApprovalReference: 'Approbation EU-CTR',
  ethicsApprovalReference: 'Approbation ethique',
  insuranceReference: 'Reference assurance',
  eudamedId: 'ID EUDAMED',
  blinded: 'Type d\'aveugle',
  arms: 'Bras de traitement',
  cohorts: 'Cohortes',
  destructionPolicy: 'Politique de destruction',
  destructionPolicyDetails: 'Details politique de destruction',
  returnPolicy: 'Politique de retour',
  hasIrtSystem: 'Systeme IRT',
  irtSystemName: 'Nom du systeme IRT',
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
  // Medication fields
  code: 'Code',
  name: 'Nom',
  type: 'Type',
  storageCondition: 'Condition de stockage',
  form: 'Forme',
  dosage: 'Dosage',
  // Stock fields
  batchNumber: 'Numero de lot',
  reason: 'Raison',
  status: 'Statut',
  // Movement fields
  quantity: 'Quantite',
  arm: 'Bras de traitement',
};

const actionColors: Record<string, 'success' | 'primary' | 'warning' | 'error' | 'info' | 'grey'> = {
  CREATE_STUDY: 'success',
  UPDATE_STUDY: 'primary',
  UPDATE_STUDY_CONFIG: 'primary',
  ACTIVATE_STUDY: 'success',
  SUSPEND_STUDY: 'warning',
  CLOSE_STUDY: 'info',
  ARCHIVE_STUDY: 'grey',
  CREATE_MEDICATION: 'success',
  UPDATE_MEDICATION: 'primary',
  DEACTIVATE_MEDICATION: 'error',
  CREATE_MOVEMENT_RECEPTION: 'success',
  CREATE_MOVEMENT_DISPENSATION: 'info',
  CREATE_MOVEMENT_RETOUR: 'warning',
  CREATE_MOVEMENT_DESTRUCTION: 'error',
  CREATE_MOVEMENT_TRANSFER: 'primary',
  QUARANTINE_STOCK_ITEM: 'warning',
  RELEASE_STOCK_ITEM: 'success',
};

interface AuditTrailProps {
  studyId?: string;
  entityType?: string;
  entityId?: string;
}

export default function AuditTrail({ studyId, entityType, entityId }: AuditTrailProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url: string;
    if (entityType && entityId) {
      url = `/api/audit?entityType=${entityType}&entityId=${entityId}`;
    } else if (studyId) {
      url = `/api/studies/${studyId}/audit`;
    } else {
      setLoading(false);
      return;
    }

    fetch(url)
      .then((res) => res.json())
      .then((result) => setEvents(result.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studyId, entityType, entityId]);

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
                    {(event.detailsAfter as { changedFields?: string[] }).changedFields && (
                      <Typography variant="caption" color="text.secondary">
                        Champs modifies : {((event.detailsAfter as { changedFields: string[] }).changedFields).map((f) => fieldLabels[f] || f).join(', ')}
                      </Typography>
                    )}
                    {!(event.detailsAfter as { changedFields?: string[] }).changedFields && (event.detailsAfter as { status?: string }).status && (
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
