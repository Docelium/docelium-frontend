'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

// 11 étapes selon la SPEC
const steps = [
  { id: 'A', label: 'Identification' },
  { id: 'B', label: 'Contacts' },
  { id: 'C', label: 'Reglementaire' },
  { id: 'D', label: 'Parametres operationnels' },
  { id: 'E', label: 'Qualite donnees' },
  { id: 'G', label: 'Calendrier visites' },
  { id: 'H', label: 'Contraintes patient' },
  { id: 'I', label: 'Temperature' },
  { id: 'L', label: 'IWRS' },
  { id: 'M', label: 'Equipements' },
  { id: 'N', label: 'Site local' },
];

// Enumerations selon la SPEC
const phases = [
  { value: 'I', label: 'Phase I' },
  { value: 'I_II', label: 'Phase I/II' },
  { value: 'II', label: 'Phase II' },
  { value: 'III', label: 'Phase III' },
  { value: 'IV', label: 'Phase IV' },
  { value: 'OTHER', label: 'Autre' },
];

const complexityLevels = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Eleve' },
];

const blindingTypes = [
  { value: 'NONE', label: 'Ouvert' },
  { value: 'SINGLE', label: 'Simple aveugle' },
  { value: 'DOUBLE', label: 'Double aveugle' },
  { value: 'TRIPLE', label: 'Triple aveugle' },
];

const destructionPolicies = [
  { value: 'LOCAL', label: 'Destruction locale' },
  { value: 'SPONSOR', label: 'Retour au sponsor' },
  { value: 'MIXED', label: 'Mixte' },
];

const returnPolicies = [
  { value: 'LOCAL_STOCK', label: 'Retour en stock local' },
  { value: 'SPONSOR_RETURN', label: 'Retour au sponsor' },
];

const temperatureGovernances = [
  { value: '', label: 'Non defini' },
  { value: 'BASIC', label: 'Basique' },
  { value: 'FULL', label: 'Complet avec alertes' },
];

const iwrsIntegrationModes = [
  { value: 'MANUAL', label: 'Saisie manuelle' },
  { value: 'CSV', label: 'Import CSV' },
  { value: 'API', label: 'Integration API' },
];

const contactRoles = [
  { value: 'PI', label: 'Investigateur Principal (PI)' },
  { value: 'SC', label: 'Coordinateur d\'etude (SC)' },
  { value: 'CRA', label: 'CRA Promoteur' },
  { value: 'PM', label: 'Project Manager' },
];

const weightReferences = [
  { value: 'BASELINE', label: 'Poids baseline' },
  { value: 'CURRENT', label: 'Poids actuel' },
];

interface Contact {
  role: 'PI' | 'SC' | 'CRA' | 'PM';
  name: string;
  email: string;
  phone: string;
}

interface Amendment {
  version: string;
  date: string;
}

interface VisitScheduleItem {
  visit_code: string;
  day: number;
  requires_dispense: boolean;
}

interface LocalProcedure {
  name: string;
  reference: string;
}

interface FormData {
  // BLOC A - Identification
  codeInternal: string;
  euCtNumber: string;
  nctNumber: string;
  title: string;
  sponsor: string;
  phase: string;
  therapeuticArea: string;
  siteActivationDate: string;
  expectedRecruitment: string;
  complexityLevel: string;

  // BLOC B - Contacts
  contacts: Contact[];

  // BLOC C - Regulatory
  protocolVersion: string;
  protocolVersionDate: string;
  amendments: Amendment[];
  euCtrApprovalReference: string;
  ethicsApprovalReference: string;
  insuranceReference: string;
  eudamedId: string;

  // BLOC D - Parametres operationnels
  blinded: string;
  arms: string[];
  cohorts: string[];
  destructionPolicy: string;
  returnPolicy: string;
  requiresPatientForDispensation: boolean;
  allowsDispensationWithoutIwrs: boolean;
  temperatureTrackingEnabled: boolean;
  returnedMaterialReusable: boolean;

  // BLOC E - Data Quality Profile
  requiresDoubleSignature: boolean;
  requiresPharmacistSignature: boolean;
  requiresWeightRecencyDays: string;
  commentRequiredOnOverride: boolean;

  // BLOC G - Visit Schedule
  visitSchedule: VisitScheduleItem[];
  cycleLength: string;
  maxCycles: string;

  // BLOC H - Patient Constraints
  minAge: string;
  maxAge: string;
  minWeight: string;
  requiresRecentWeightDays: string;
  weightVariationThreshold: string;
  weightReference: string;

  // BLOC I - Temperature
  temperatureGovernance: string;
  excursionActionRequired: boolean;
  excursionTimeThreshold: string;

  // BLOC L - IWRS
  iwrsIntegration: boolean;
  iwrsIntegrationMode: string;
  iwrsAllowsPartialData: boolean;
  iwrsRequiresVisitCode: boolean;
  iwrsEndpoint: string;

  // BLOC M - Equipment
  protocolRequiredEquipments: string[];

  // BLOC N - Site Overrides
  requiresLocalQuarantineStep: boolean;
  requiresExtraReceptionFields: string[];
  localProcedureReferences: LocalProcedure[];

  // Dates
  startDate: string;
  expectedEndDate: string;
}

const initialFormData: FormData = {
  codeInternal: '',
  euCtNumber: '',
  nctNumber: '',
  title: '',
  sponsor: '',
  phase: 'III',
  therapeuticArea: '',
  siteActivationDate: '',
  expectedRecruitment: '',
  complexityLevel: 'LOW',
  contacts: [],
  protocolVersion: '',
  protocolVersionDate: '',
  amendments: [],
  euCtrApprovalReference: '',
  ethicsApprovalReference: '',
  insuranceReference: '',
  eudamedId: '',
  blinded: 'NONE',
  arms: [],
  cohorts: [],
  destructionPolicy: 'LOCAL',
  returnPolicy: 'LOCAL_STOCK',
  requiresPatientForDispensation: true,
  allowsDispensationWithoutIwrs: false,
  temperatureTrackingEnabled: false,
  returnedMaterialReusable: false,
  requiresDoubleSignature: false,
  requiresPharmacistSignature: true,
  requiresWeightRecencyDays: '',
  commentRequiredOnOverride: true,
  visitSchedule: [],
  cycleLength: '',
  maxCycles: '',
  minAge: '18',
  maxAge: '',
  minWeight: '',
  requiresRecentWeightDays: '',
  weightVariationThreshold: '',
  weightReference: 'CURRENT',
  temperatureGovernance: '',
  excursionActionRequired: false,
  excursionTimeThreshold: '',
  iwrsIntegration: false,
  iwrsIntegrationMode: 'MANUAL',
  iwrsAllowsPartialData: false,
  iwrsRequiresVisitCode: false,
  iwrsEndpoint: '',
  protocolRequiredEquipments: [],
  requiresLocalQuarantineStep: false,
  requiresExtraReceptionFields: [],
  localProcedureReferences: [],
  startDate: '',
  expectedEndDate: '',
};

// Helper to format date for input field
function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function EditStudyPage() {
  const router = useRouter();
  const params = useParams();
  const studyId = params.id as string;
  const { showSuccess, showError } = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStudy, setLoadingStudy] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Fetch existing study data
  useEffect(() => {
    async function fetchStudy() {
      try {
        const response = await fetch(`/api/studies/${studyId}`);
        if (!response.ok) {
          throw new Error('Protocole non trouve');
        }
        const result = await response.json();
        const study = result.data;

        // Map study data to form data
        setFormData({
          codeInternal: study.codeInternal || '',
          euCtNumber: study.euCtNumber || '',
          nctNumber: study.nctNumber || '',
          title: study.title || '',
          sponsor: study.sponsor || '',
          phase: study.phase || 'III',
          therapeuticArea: study.therapeuticArea || '',
          siteActivationDate: formatDateForInput(study.siteActivationDate),
          expectedRecruitment: study.expectedRecruitment?.toString() || '',
          complexityLevel: study.complexityLevel || 'LOW',
          contacts: study.contacts || [],
          protocolVersion: study.protocolVersion || '',
          protocolVersionDate: formatDateForInput(study.protocolVersionDate),
          amendments: study.amendments || [],
          euCtrApprovalReference: formatDateForInput(study.euCtrApprovalReference),
          ethicsApprovalReference: study.ethicsApprovalReference || '',
          insuranceReference: study.insuranceReference || '',
          eudamedId: study.eudamedId || '',
          blinded: study.blinded || 'NONE',
          arms: study.arms || [],
          cohorts: study.cohorts || [],
          destructionPolicy: study.destructionPolicy || 'LOCAL',
          returnPolicy: study.returnPolicy || 'LOCAL_STOCK',
          requiresPatientForDispensation: study.requiresPatientForDispensation ?? true,
          allowsDispensationWithoutIwrs: study.allowsDispensationWithoutIwrs ?? false,
          temperatureTrackingEnabled: study.temperatureTrackingEnabled ?? false,
          returnedMaterialReusable: study.returnedMaterialReusable ?? false,
          requiresDoubleSignature: study.dataQualityProfile?.requires_double_signature ?? false,
          requiresPharmacistSignature: study.dataQualityProfile?.requires_pharmacist_signature ?? true,
          requiresWeightRecencyDays: study.dataQualityProfile?.requires_weight_recency_days?.toString() || '',
          commentRequiredOnOverride: study.dataQualityProfile?.comment_required_on_override ?? true,
          visitSchedule: study.visitSchedule || [],
          cycleLength: study.treatmentCycles?.cycle_length?.toString() || '',
          maxCycles: study.treatmentCycles?.max_cycles?.toString() || '',
          minAge: study.patientConstraints?.min_age?.toString() || '18',
          maxAge: study.patientConstraints?.max_age?.toString() || '',
          minWeight: study.patientConstraints?.min_weight?.toString() || '',
          requiresRecentWeightDays: study.patientConstraints?.requires_recent_weight_days?.toString() || '',
          weightVariationThreshold: study.patientConstraints?.weight_variation_threshold?.toString() || '',
          weightReference: study.patientConstraints?.weight_reference || 'CURRENT',
          temperatureGovernance: study.temperatureGovernance || '',
          excursionActionRequired: study.excursionActionRequired ?? false,
          excursionTimeThreshold: study.excursionTimeThreshold || '',
          iwrsIntegration: study.iwrsGovernance?.iwrs_integration ?? false,
          iwrsIntegrationMode: study.iwrsGovernance?.iwrs_integration_mode || 'MANUAL',
          iwrsAllowsPartialData: study.iwrsGovernance?.iwrs_allows_partial_data ?? false,
          iwrsRequiresVisitCode: study.iwrsGovernance?.iwrs_requires_visit_code ?? false,
          iwrsEndpoint: study.iwrsGovernance?.iwrs_endpoint || '',
          protocolRequiredEquipments: study.protocolRequiredEquipments || [],
          requiresLocalQuarantineStep: study.siteOverrides?.requires_local_quarantine_step ?? false,
          requiresExtraReceptionFields: study.siteOverrides?.requires_extra_reception_fields || [],
          localProcedureReferences: study.siteOverrides?.local_procedure_references || [],
          startDate: formatDateForInput(study.startDate),
          expectedEndDate: formatDateForInput(study.expectedEndDate),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        showError('Erreur lors du chargement du protocole');
      } finally {
        setLoadingStudy(false);
      }
    }
    fetchStudy();
  }, [studyId, showError]);

  // Temporaire pour les champs texte
  const [newArm, setNewArm] = useState('');
  const [newCohort, setNewCohort] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newExtraField, setNewExtraField] = useState('');

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSwitchChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Gestion des contacts (BLOC B)
  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { role: 'PI', name: '', email: '', phone: '' }],
    }));
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  const removeContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  // Gestion des amendments (BLOC C)
  const addAmendment = () => {
    setFormData((prev) => ({
      ...prev,
      amendments: [...prev.amendments, { version: '', date: '' }],
    }));
  };

  const updateAmendment = (index: number, field: keyof Amendment, value: string) => {
    setFormData((prev) => ({
      ...prev,
      amendments: prev.amendments.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    }));
  };

  const removeAmendment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amendments: prev.amendments.filter((_, i) => i !== index),
    }));
  };

  // Gestion des bras (BLOC D)
  const addArm = () => {
    if (newArm.trim()) {
      setFormData((prev) => ({ ...prev, arms: [...prev.arms, newArm.trim()] }));
      setNewArm('');
    }
  };

  const removeArm = (index: number) => {
    setFormData((prev) => ({ ...prev, arms: prev.arms.filter((_, i) => i !== index) }));
  };

  // Gestion des cohortes (BLOC D)
  const addCohort = () => {
    if (newCohort.trim()) {
      setFormData((prev) => ({ ...prev, cohorts: [...prev.cohorts, newCohort.trim()] }));
      setNewCohort('');
    }
  };

  const removeCohort = (index: number) => {
    setFormData((prev) => ({ ...prev, cohorts: prev.cohorts.filter((_, i) => i !== index) }));
  };

  // Gestion du calendrier de visites (BLOC G)
  const addVisit = () => {
    setFormData((prev) => ({
      ...prev,
      visitSchedule: [...prev.visitSchedule, { visit_code: '', day: 1, requires_dispense: false }],
    }));
  };

  const updateVisit = (index: number, field: keyof VisitScheduleItem, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      visitSchedule: prev.visitSchedule.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  };

  const removeVisit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      visitSchedule: prev.visitSchedule.filter((_, i) => i !== index),
    }));
  };

  // Gestion des equipements (BLOC M)
  const addEquipment = () => {
    if (newEquipment.trim()) {
      setFormData((prev) => ({
        ...prev,
        protocolRequiredEquipments: [...prev.protocolRequiredEquipments, newEquipment.trim()],
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      protocolRequiredEquipments: prev.protocolRequiredEquipments.filter((_, i) => i !== index),
    }));
  };

  // Gestion des champs extra reception (BLOC N)
  const addExtraField = () => {
    if (newExtraField.trim()) {
      setFormData((prev) => ({
        ...prev,
        requiresExtraReceptionFields: [...prev.requiresExtraReceptionFields, newExtraField.trim()],
      }));
      setNewExtraField('');
    }
  };

  const removeExtraField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requiresExtraReceptionFields: prev.requiresExtraReceptionFields.filter((_, i) => i !== index),
    }));
  };

  // Gestion des procedures locales (BLOC N)
  const addLocalProcedure = () => {
    setFormData((prev) => ({
      ...prev,
      localProcedureReferences: [...prev.localProcedureReferences, { name: '', reference: '' }],
    }));
  };

  const updateLocalProcedure = (index: number, field: keyof LocalProcedure, value: string) => {
    setFormData((prev) => ({
      ...prev,
      localProcedureReferences: prev.localProcedureReferences.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removeLocalProcedure = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      localProcedureReferences: prev.localProcedureReferences.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Construire les donnees selon le format attendu par l'API
      const payload = {
        // BLOC A
        codeInternal: formData.codeInternal,
        euCtNumber: formData.euCtNumber || null,
        nctNumber: formData.nctNumber || null,
        title: formData.title,
        sponsor: formData.sponsor,
        phase: formData.phase,
        therapeuticArea: formData.therapeuticArea || null,
        siteActivationDate: formData.siteActivationDate ? new Date(formData.siteActivationDate) : null,
        expectedRecruitment: formData.expectedRecruitment ? parseInt(formData.expectedRecruitment) : null,
        complexityLevel: formData.complexityLevel,

        // BLOC B
        contacts: formData.contacts.length > 0 ? formData.contacts : null,

        // BLOC C
        protocolVersion: formData.protocolVersion || null,
        protocolVersionDate: formData.protocolVersionDate ? new Date(formData.protocolVersionDate) : null,
        amendments: formData.amendments.length > 0 ? formData.amendments : null,
        euCtrApprovalReference: formData.euCtrApprovalReference ? new Date(formData.euCtrApprovalReference) : null,
        ethicsApprovalReference: formData.ethicsApprovalReference || null,
        insuranceReference: formData.insuranceReference || null,
        eudamedId: formData.eudamedId || null,

        // BLOC D
        blinded: formData.blinded,
        arms: formData.arms.length > 0 ? formData.arms : null,
        cohorts: formData.cohorts.length > 0 ? formData.cohorts : null,
        destructionPolicy: formData.destructionPolicy,
        returnPolicy: formData.returnPolicy,
        requiresPatientForDispensation: formData.requiresPatientForDispensation,
        allowsDispensationWithoutIwrs: formData.allowsDispensationWithoutIwrs,
        temperatureTrackingEnabled: formData.temperatureTrackingEnabled,
        returnedMaterialReusable: formData.returnedMaterialReusable,

        // BLOC E
        dataQualityProfile: {
          requires_double_signature: formData.requiresDoubleSignature,
          requires_pharmacist_signature: formData.requiresPharmacistSignature,
          requires_weight_recency_days: formData.requiresWeightRecencyDays
            ? parseInt(formData.requiresWeightRecencyDays)
            : null,
          comment_required_on_override: formData.commentRequiredOnOverride,
        },

        // BLOC G
        visitSchedule: formData.visitSchedule.length > 0 ? formData.visitSchedule : null,
        treatmentCycles:
          formData.cycleLength || formData.maxCycles
            ? {
                cycle_length: formData.cycleLength ? parseInt(formData.cycleLength) : null,
                max_cycles: formData.maxCycles ? parseInt(formData.maxCycles) : null,
              }
            : null,

        // BLOC H
        patientConstraints: {
          min_age: formData.minAge ? parseInt(formData.minAge) : null,
          max_age: formData.maxAge ? parseInt(formData.maxAge) : null,
          min_weight: formData.minWeight ? parseFloat(formData.minWeight) : null,
          requires_recent_weight_days: formData.requiresRecentWeightDays
            ? parseInt(formData.requiresRecentWeightDays)
            : null,
          weight_variation_threshold: formData.weightVariationThreshold
            ? parseFloat(formData.weightVariationThreshold)
            : null,
          weight_reference: formData.weightReference,
        },

        // BLOC I
        temperatureGovernance: formData.temperatureGovernance || null,
        excursionActionRequired: formData.excursionActionRequired,
        excursionTimeThreshold: formData.excursionTimeThreshold || null,

        // BLOC L
        iwrsGovernance: formData.iwrsIntegration
          ? {
              iwrs_integration: formData.iwrsIntegration,
              iwrs_integration_mode: formData.iwrsIntegrationMode,
              iwrs_allows_partial_data: formData.iwrsAllowsPartialData,
              iwrs_requires_visit_code: formData.iwrsRequiresVisitCode,
              iwrs_endpoint: formData.iwrsEndpoint || null,
            }
          : null,

        // BLOC M
        protocolRequiredEquipments: formData.protocolRequiredEquipments,

        // BLOC N
        siteOverrides: {
          requires_local_quarantine_step: formData.requiresLocalQuarantineStep,
          requires_extra_reception_fields: formData.requiresExtraReceptionFields,
          local_procedure_references: formData.localProcedureReferences,
        },

        // Dates
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        expectedEndDate: formData.expectedEndDate ? new Date(formData.expectedEndDate) : null,
      };

      const response = await fetch(`/api/studies/${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la modification');
      }

      showSuccess(`Protocole "${formData.codeInternal}" modifie avec succes`);
      router.push(`/studies/${studyId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      // BLOC A - Identification
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc A - Identification du Protocole
            </Typography>

            <TextField
              label="Code interne *"
              value={formData.codeInternal}
              onChange={handleChange('codeInternal')}
              required
              helperText="Ex: ONC-2024-TRIAL-01 (majuscules, chiffres, tirets)"
            />

            <TextField
              label="Titre complet *"
              value={formData.title}
              onChange={handleChange('title')}
              required
              multiline
              rows={2}
              helperText="Minimum 10 caracteres"
            />

            <TextField
              label="Sponsor/Promoteur *"
              value={formData.sponsor}
              onChange={handleChange('sponsor')}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl required sx={{ flex: 1 }}>
                <InputLabel>Phase</InputLabel>
                <Select
                  value={formData.phase}
                  label="Phase"
                  onChange={(e) => handleChange('phase')(e as { target: { value: unknown } })}
                >
                  {phases.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl required sx={{ flex: 1 }}>
                <InputLabel>Complexite</InputLabel>
                <Select
                  value={formData.complexityLevel}
                  label="Complexite"
                  onChange={(e) => handleChange('complexityLevel')(e as { target: { value: unknown } })}
                >
                  {complexityLevels.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Aire therapeutique"
              value={formData.therapeuticArea}
              onChange={handleChange('therapeuticArea')}
              helperText="Ex: ONCOLOGY, CARDIOLOGY, etc."
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Numero EU-CT"
                value={formData.euCtNumber}
                onChange={handleChange('euCtNumber')}
                helperText="Format: 2024-000567-29"
                sx={{ flex: 1 }}
              />

              <TextField
                label="Numero NCT"
                value={formData.nctNumber}
                onChange={handleChange('nctNumber')}
                helperText="Format: NCT05687266"
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Date d'activation site"
                type="date"
                value={formData.siteActivationDate}
                onChange={handleChange('siteActivationDate')}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
              />

              <TextField
                label="Recrutement attendu"
                type="number"
                value={formData.expectedRecruitment}
                onChange={handleChange('expectedRecruitment')}
                helperText="Nombre de patients"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        );

      // BLOC B - Contacts
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc B - Organisation & Contacts
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Ajoutez les contacts cles du protocole : PI, SC, CRA, PM.
            </Typography>

            {formData.contacts.map((contact, index) => (
              <Card key={`contact-${index}`} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={contact.role}
                      label="Role"
                      onChange={(e) => updateContact(index, 'role', e.target.value as string)}
                    >
                      {contactRoles.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                          {r.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton onClick={() => removeContact(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Nom"
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <TextField
                    label="Telephone"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                </Box>
              </Card>
            ))}

            <Button startIcon={<AddIcon />} onClick={addContact} variant="outlined">
              Ajouter un contact
            </Button>
          </Box>
        );

      // BLOC C - Regulatory
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc C - Identifiants Reglementaires
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Version du protocole"
                value={formData.protocolVersion}
                onChange={handleChange('protocolVersion')}
                helperText="Ex: V5.0"
                sx={{ flex: 1 }}
              />

              <TextField
                label="Date de la version"
                type="date"
                value={formData.protocolVersionDate}
                onChange={handleChange('protocolVersionDate')}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              label="Reference approbation ethique (CPP)"
              value={formData.ethicsApprovalReference}
              onChange={handleChange('ethicsApprovalReference')}
            />

            <TextField
              label="Date approbation EU-CTR"
              type="date"
              value={formData.euCtrApprovalReference}
              onChange={handleChange('euCtrApprovalReference')}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Reference assurance"
              value={formData.insuranceReference}
              onChange={handleChange('insuranceReference')}
            />

            <TextField
              label="ID EUDAMED"
              value={formData.eudamedId}
              onChange={handleChange('eudamedId')}
              helperText="Si dispositif medical"
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Amendements
            </Typography>

            {formData.amendments.map((amendment, index) => (
              <Box key={`amendment-${index}`} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Version"
                  value={amendment.version}
                  onChange={(e) => updateAmendment(index, 'version', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Date"
                  type="date"
                  value={amendment.date}
                  onChange={(e) => updateAmendment(index, 'date', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
                <IconButton onClick={() => removeAmendment(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button startIcon={<AddIcon />} onClick={addAmendment} variant="outlined" size="small">
              Ajouter un amendement
            </Button>
          </Box>
        );

      // BLOC D - Parametres operationnels
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc D - Parametres Operationnels
            </Typography>

            <FormControl>
              <InputLabel>Type d&apos;aveugle</InputLabel>
              <Select
                value={formData.blinded}
                label="Type d'aveugle"
                onChange={(e) => handleChange('blinded')(e as { target: { value: unknown } })}
              >
                {blindingTypes.map((b) => (
                  <MenuItem key={b.value} value={b.value}>
                    {b.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2">Bras de traitement</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {formData.arms.map((arm, index) => (
                <Chip key={`arm-${index}`} label={arm} onDelete={() => removeArm(index)} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Ex: Bras A"
                value={newArm}
                onChange={(e) => setNewArm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArm();
                  }
                }}
              />
              <Button onClick={addArm} variant="outlined" size="small">
                Ajouter
              </Button>
            </Box>

            <Typography variant="subtitle2">Cohortes</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {formData.cohorts.map((cohort, index) => (
                <Chip key={`cohort-${index}`} label={cohort} onDelete={() => removeCohort(index)} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Ex: Cohorte 1"
                value={newCohort}
                onChange={(e) => setNewCohort(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCohort();
                  }
                }}
              />
              <Button onClick={addCohort} variant="outlined" size="small">
                Ajouter
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Politique de destruction</InputLabel>
                <Select
                  value={formData.destructionPolicy}
                  label="Politique de destruction"
                  onChange={(e) => handleChange('destructionPolicy')(e as { target: { value: unknown } })}
                >
                  {destructionPolicies.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Politique de retour</InputLabel>
                <Select
                  value={formData.returnPolicy}
                  label="Politique de retour"
                  onChange={(e) => handleChange('returnPolicy')(e as { target: { value: unknown } })}
                >
                  {returnPolicies.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiresPatientForDispensation}
                  onChange={handleSwitchChange('requiresPatientForDispensation')}
                />
              }
              label="Patient obligatoire pour dispensation"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.allowsDispensationWithoutIwrs}
                  onChange={handleSwitchChange('allowsDispensationWithoutIwrs')}
                />
              }
              label="Dispensation sans IWRS autorisee"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.temperatureTrackingEnabled}
                  onChange={handleSwitchChange('temperatureTrackingEnabled')}
                />
              }
              label="Suivi temperature active"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.returnedMaterialReusable}
                  onChange={handleSwitchChange('returnedMaterialReusable')}
                />
              }
              label="Materiel retourne reutilisable"
            />
          </Box>
        );

      // BLOC E - Data Quality Profile
      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc E - Profil Qualite des Donnees
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Parametrage de la rigueur documentaire du protocole.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiresDoubleSignature}
                  onChange={handleSwitchChange('requiresDoubleSignature')}
                />
              }
              label="Double signature requise"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiresPharmacistSignature}
                  onChange={handleSwitchChange('requiresPharmacistSignature')}
                />
              }
              label="Signature pharmacien requise"
            />

            <TextField
              label="Poids patient recent requis (jours)"
              type="number"
              value={formData.requiresWeightRecencyDays}
              onChange={handleChange('requiresWeightRecencyDays')}
              helperText="Ex: 7 (laisser vide si non requis)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.commentRequiredOnOverride}
                  onChange={handleSwitchChange('commentRequiredOnOverride')}
                />
              }
              label="Commentaire obligatoire sur derogation"
            />
          </Box>
        );

      // BLOC G - Visit Schedule
      case 5:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc G - Calendrier des Visites
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Definissez le calendrier des visites et le schema de traitement.
            </Typography>

            <Typography variant="subtitle2">Cycles de traitement</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Duree d'un cycle (jours)"
                type="number"
                value={formData.cycleLength}
                onChange={handleChange('cycleLength')}
                helperText="Ex: 21"
                sx={{ flex: 1 }}
              />

              <TextField
                label="Nombre max de cycles"
                type="number"
                value={formData.maxCycles}
                onChange={handleChange('maxCycles')}
                helperText="Ex: 6"
                sx={{ flex: 1 }}
              />
            </Box>

            <Typography variant="subtitle2">Calendrier des visites</Typography>

            {formData.visitSchedule.map((visit, index) => (
              <Card key={`visit-${index}`} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    label="Code visite"
                    value={visit.visit_code}
                    onChange={(e) => updateVisit(index, 'visit_code', e.target.value)}
                    helperText="Ex: C1D1, C1D8"
                    sx={{ flex: 1, minWidth: 120 }}
                  />
                  <TextField
                    label="Jour"
                    type="number"
                    value={visit.day}
                    onChange={(e) => updateVisit(index, 'day', Number.parseInt(e.target.value) || 1)}
                    sx={{ width: 100 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={visit.requires_dispense}
                        onChange={(e) => updateVisit(index, 'requires_dispense', e.target.checked)}
                      />
                    }
                    label="Dispensation"
                  />
                  <IconButton onClick={() => removeVisit(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}

            <Button startIcon={<AddIcon />} onClick={addVisit} variant="outlined">
              Ajouter une visite
            </Button>
          </Box>
        );

      // BLOC H - Patient Constraints
      case 6:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc H - Contraintes Patient
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Age minimum"
                type="number"
                value={formData.minAge}
                onChange={handleChange('minAge')}
                helperText="Ex: 18"
                sx={{ flex: 1 }}
              />

              <TextField
                label="Age maximum"
                type="number"
                value={formData.maxAge}
                onChange={handleChange('maxAge')}
                helperText="Optionnel"
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              label="Poids minimum (kg)"
              type="number"
              value={formData.minWeight}
              onChange={handleChange('minWeight')}
              helperText="Optionnel"
            />

            <TextField
              label="Poids recent requis (jours)"
              type="number"
              value={formData.requiresRecentWeightDays}
              onChange={handleChange('requiresRecentWeightDays')}
              helperText="Delai max en jours pour le poids"
            />

            <TextField
              label="Seuil variation poids (%)"
              type="number"
              value={formData.weightVariationThreshold}
              onChange={handleChange('weightVariationThreshold')}
              helperText="Ex: 10 pour 10%"
            />

            <FormControl>
              <InputLabel>Reference poids pour calcul dose</InputLabel>
              <Select
                value={formData.weightReference}
                label="Reference poids pour calcul dose"
                onChange={(e) => handleChange('weightReference')(e as { target: { value: unknown } })}
              >
                {weightReferences.map((w) => (
                  <MenuItem key={w.value} value={w.value}>
                    {w.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      // BLOC I - Temperature
      case 7:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc I - Gouvernance Temperature
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Politique de gestion de la chaine du froid.
            </Typography>

            <FormControl>
              <InputLabel>Niveau de gouvernance temperature</InputLabel>
              <Select
                value={formData.temperatureGovernance}
                label="Niveau de gouvernance temperature"
                onChange={(e) => handleChange('temperatureGovernance')(e as { target: { value: unknown } })}
              >
                {temperatureGovernances.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.excursionActionRequired}
                  onChange={handleSwitchChange('excursionActionRequired')}
                />
              }
              label="Action requise sur excursion temperature"
            />

            <TextField
              label="Seuil temps excursion"
              value={formData.excursionTimeThreshold}
              onChange={handleChange('excursionTimeThreshold')}
              helperText="Ex: 30m, 2h"
            />

            {formData.temperatureTrackingEnabled && !formData.temperatureGovernance && (
              <Alert severity="warning">
                Le suivi temperature est active mais aucun niveau de gouvernance n&apos;est defini.
              </Alert>
            )}
          </Box>
        );

      // BLOC L - IWRS
      case 8:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc L - Gouvernance IWRS
            </Typography>

            <FormControlLabel
              control={
                <Switch checked={formData.iwrsIntegration} onChange={handleSwitchChange('iwrsIntegration')} />
              }
              label="Integration IWRS activee"
            />

            {formData.iwrsIntegration && (
              <>
                <FormControl>
                  <InputLabel>Mode d&apos;integration</InputLabel>
                  <Select
                    value={formData.iwrsIntegrationMode}
                    label="Mode d'integration"
                    onChange={(e) => handleChange('iwrsIntegrationMode')(e as { target: { value: unknown } })}
                  >
                    {iwrsIntegrationModes.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.iwrsAllowsPartialData}
                      onChange={handleSwitchChange('iwrsAllowsPartialData')}
                    />
                  }
                  label="Donnees partielles acceptees"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.iwrsRequiresVisitCode}
                      onChange={handleSwitchChange('iwrsRequiresVisitCode')}
                    />
                  }
                  label="Code visite requis"
                />

                {formData.iwrsIntegrationMode === 'API' && (
                  <TextField
                    label="URL endpoint IWRS"
                    value={formData.iwrsEndpoint}
                    onChange={handleChange('iwrsEndpoint')}
                    placeholder="https://iwrs.example.com/api"
                  />
                )}

                {formData.iwrsIntegrationMode === 'MANUAL' && !formData.allowsDispensationWithoutIwrs && (
                  <Alert severity="info">
                    En mode MANUAL, il est recommande d&apos;autoriser la dispensation sans IWRS.
                  </Alert>
                )}
              </>
            )}
          </Box>
        );

      // BLOC M - Equipment
      case 9:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc M - Equipements Requis
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Equipements obligatoires pour ce protocole : CSTD, filtres, protecteurs lumiere, etc.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {formData.protocolRequiredEquipments.map((equipment, index) => (
                <Chip key={`equipment-${index}`} label={equipment} onDelete={() => removeEquipment(index)} />
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Ex: Filtre 0.2 um"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEquipment();
                  }
                }}
                sx={{ flex: 1 }}
              />
              <Button onClick={addEquipment} variant="outlined" size="small">
                Ajouter
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Exemples: Systeme CSTD, Filtre 0.2 um, Protecteur lumiere, Tubulure specifique, Pompe a perfusion
            </Typography>
          </Box>
        );

      // BLOC N - Site Overrides
      case 10:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bloc N - Personnalisations Locales
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Personnalisations specifiques au centre/PUI.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiresLocalQuarantineStep}
                  onChange={handleSwitchChange('requiresLocalQuarantineStep')}
                />
              }
              label="Etape quarantaine locale requise"
            />

            <Typography variant="subtitle2">Champs supplementaires reception</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {formData.requiresExtraReceptionFields.map((field, index) => (
                <Chip key={`extrafield-${index}`} label={field} onDelete={() => removeExtraField(index)} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Ex: Numero colis"
                value={newExtraField}
                onChange={(e) => setNewExtraField(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addExtraField();
                  }
                }}
              />
              <Button onClick={addExtraField} variant="outlined" size="small">
                Ajouter
              </Button>
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              References procedures locales
            </Typography>

            {formData.localProcedureReferences.map((proc, index) => (
              <Box key={`proc-${index}`} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Nom"
                  value={proc.name}
                  onChange={(e) => updateLocalProcedure(index, 'name', e.target.value)}
                  helperText="Ex: Gestion des receptions"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Reference"
                  value={proc.reference}
                  onChange={(e) => updateLocalProcedure(index, 'reference', e.target.value)}
                  helperText="Ex: PUI-ONC-2024-11"
                  sx={{ flex: 1 }}
                />
                <IconButton onClick={() => removeLocalProcedure(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button startIcon={<AddIcon />} onClick={addLocalProcedure} variant="outlined" size="small">
              Ajouter une procedure
            </Button>

            <Typography variant="subtitle2" sx={{ mt: 3 }}>
              Dates du protocole
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Date de debut"
                type="date"
                value={formData.startDate}
                onChange={handleChange('startDate')}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Date de fin prevue"
                type="date"
                value={formData.expectedEndDate}
                onChange={handleChange('expectedEndDate')}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0: // BLOC A - obligatoire: codeInternal, title, sponsor, phase
        return formData.codeInternal && formData.title && formData.sponsor && formData.phase;
      default:
        return true;
    }
  };

  if (loadingStudy) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button component={Link} href={`/studies/${studyId}`} startIcon={<ArrowBackIcon />} color="inherit">
          Retour
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        Modifier le protocole
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modification du protocole {formData.codeInternal}
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, overflowX: 'auto' }}>
            {steps.map((step) => (
              <Step key={step.id}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  {step.id}. {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ minHeight: 400, px: 2 }}>{renderStepContent(activeStep)}</Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Precedent
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Etape {activeStep + 1} / {steps.length}
              </Typography>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleSubmit} disabled={loading || !isStepValid()}>
                  {loading ? <CircularProgress size={24} /> : 'Enregistrer les modifications'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} disabled={!isStepValid()}>
                  Suivant
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
