'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useToast } from '@/contexts/ToastContext';

interface Study {
  id: string;
  codeInternal: string;
  title: string;
  protocolStatus: string;
}

const steps = [
  { id: 'A', label: 'Identification' },
  { id: 'B', label: 'Posologie' },
  { id: 'C', label: 'Preparation & Reconstitution' },
  { id: 'D', label: 'Securite & Compliance' },
  { id: 'E', label: 'Stockage & Temperature' },
  { id: 'F', label: 'Regles Avancees' },
];

const medicationTypes = [
  { value: 'IMP', label: 'IMP - Medicament experimental' },
  { value: 'NIMP', label: 'NIMP - Medicament non-experimental' },
];

const dosageForms = [
  { value: 'TABLET', label: 'Comprime' },
  { value: 'CAPSULE', label: 'Gelule' },
  { value: 'INJECTION', label: 'Injection' },
  { value: 'SOLUTION', label: 'Solution' },
  { value: 'CREAM', label: 'Creme' },
  { value: 'PATCH', label: 'Patch' },
  { value: 'INHALER', label: 'Inhalateur' },
  { value: 'SUPPOSITORY', label: 'Suppositoire' },
  { value: 'POWDER', label: 'Poudre' },
  { value: 'GEL', label: 'Gel' },
  { value: 'SPRAY', label: 'Spray' },
  { value: 'DROPS', label: 'Gouttes' },
  { value: 'OTHER', label: 'Autre' },
];

const storageConditions = [
  { value: 'ROOM_TEMPERATURE', label: 'Temperature ambiante' },
  { value: 'REFRIGERATED', label: 'Refrigere (2-8C)' },
  { value: 'FROZEN', label: 'Congele' },
  { value: 'CONTROLLED_ROOM_TEMPERATURE', label: 'Temperature controlee' },
  { value: 'PROTECT_FROM_LIGHT', label: 'Proteger de la lumiere' },
  { value: 'OTHER', label: 'Autre' },
];

const doseTypes = [
  { value: 'FIXED', label: 'Dose fixe' },
  { value: 'PER_KG', label: 'Par kg' },
  { value: 'PER_M2', label: 'Par m\u00b2' },
];

const countingUnits = [
  { value: 'UNIT', label: 'Unite' },
  { value: 'BOX', label: 'Boite' },
  { value: 'VIAL', label: 'Flacon' },
  { value: 'AMPOULE', label: 'Ampoule' },
  { value: 'SYRINGE', label: 'Seringue' },
  { value: 'BOTTLE', label: 'Bouteille' },
  { value: 'SACHET', label: 'Sachet' },
  { value: 'BLISTER', label: 'Blister' },
  { value: 'KIT', label: 'Kit' },
  { value: 'OTHER', label: 'Autre' },
];

const administrationRoutes = [
  { value: 'IV', label: 'Intraveineuse (IV)' },
  { value: 'PO', label: 'Orale (PO)' },
  { value: 'SC', label: 'Sous-cutanee (SC)' },
  { value: 'IM', label: 'Intramusculaire (IM)' },
  { value: 'TOPICAL', label: 'Topique' },
  { value: 'INHALED', label: 'Inhalee' },
  { value: 'RECTAL', label: 'Rectale' },
  { value: 'TRANSDERMAL', label: 'Transdermique' },
  { value: 'OPHTHALMIC', label: 'Ophtalmique' },
  { value: 'OTHER', label: 'Autre' },
];

const medicationStatuses = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'WITHDRAWN', label: 'Retire' },
];

const hazardCategories = [
  { value: 'CYTOTOXIQUE', label: 'Cytotoxique' },
  { value: 'RADIOACTIF', label: 'Radioactif' },
  { value: 'BIOLOGIQUE', label: 'Biologique' },
  { value: 'CMR', label: 'CMR (Cancerogene, Mutagene, Reprotoxique)' },
];

const wasteCategories = [
  { value: 'DASRI', label: 'DASRI' },
  { value: 'DAOM', label: 'DAOM' },
  { value: 'AUTRE', label: 'Autre' },
];

const destructionPolicies = [
  { value: 'LOCAL', label: 'Locale' },
  { value: 'SPONSOR', label: 'Sponsor' },
  { value: 'MIXED', label: 'Mixte' },
];

const complianceMethods = [
  { value: 'PILL_COUNT', label: 'Comptage de comprimes' },
  { value: 'DIARY', label: 'Journal patient' },
  { value: 'ELECTRONIC', label: 'Electronique' },
  { value: 'OTHER', label: 'Autre' },
];

interface MedicationFormData {
  studyId: string;
  code: string;
  name: string;
  dciName: string;
  type: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  storageCondition: string;
  storageInstructions: string;
  countingUnit: string;
  unitsPerPackage: number;
  doseType: string;
  dosage: string;
  packaging: string;
  protocolRequiredDose: string;
  doseRounding: string;
  requiresAnthropometricData: boolean;
  requiresPreparation: boolean;
  preparationInstructions: string;
  requiresReconstitution: boolean;
  reconstitutionInstructions: string;
  stabilityAfterPreparation: string;
  dilutionType: string;
  dilutionVolume: string;
  dilutionFinalConcentration: string;
  dilutionSolution: string;
  requiredEquipments: string;
  hazardCategories: string[];
  wasteCategory: string;
  destructionPolicy: string;
  destructionPolicyDetails: string;
  complianceRequired: boolean;
  complianceMethod: string;
  temperatureMonitoringRequired: boolean;
  stabilityAfterOpening: string;
  excursionPolicy: string;
  iwrsPerMovement: { reception: boolean; dispensation: boolean; retour: boolean };
  isAtmp: boolean;
  dosageEscalationScheme: string;
  customLogFields: { name: string; type: string; movementTypes: string[] }[];
  requiresEsign: boolean;
  isBlinded: boolean;
  isPediatric: boolean;
  administrationRoute: string;
  status: string;
  initialSupplyMode: string;
  resupplyMode: string;
  treatmentAssignmentMode: string;
}

// Donnees initiales vides
const initialFormData: MedicationFormData = {
  studyId: '',
  code: '',
  name: '',
  dciName: '',
  type: 'IMP',
  dosageForm: 'TABLET',
  strength: '',
  manufacturer: '',
  storageCondition: 'ROOM_TEMPERATURE',
  storageInstructions: '',
  countingUnit: 'UNIT',
  unitsPerPackage: 1,
  doseType: '',
  dosage: '',
  packaging: '',
  protocolRequiredDose: '',
  doseRounding: '',
  requiresAnthropometricData: false,
  requiresPreparation: false,
  preparationInstructions: '',
  requiresReconstitution: false,
  reconstitutionInstructions: '',
  stabilityAfterPreparation: '',
  dilutionType: '',
  dilutionVolume: '',
  dilutionFinalConcentration: '',
  dilutionSolution: '',
  requiredEquipments: '',
  hazardCategories: [],
  wasteCategory: '',
  destructionPolicy: '',
  destructionPolicyDetails: '',
  complianceRequired: false,
  complianceMethod: '',
  temperatureMonitoringRequired: false,
  stabilityAfterOpening: '',
  excursionPolicy: '',
  iwrsPerMovement: { reception: false, dispensation: false, retour: false },
  isAtmp: false,
  dosageEscalationScheme: '',
  customLogFields: [],
  requiresEsign: false,
  isBlinded: false,
  isPediatric: false,
  administrationRoute: '',
  status: 'DRAFT',
  initialSupplyMode: '',
  resupplyMode: '',
  treatmentAssignmentMode: '',
};

// Donnees de test pre-remplies
const testFormData: MedicationFormData = {
  studyId: '', // Sera rempli automatiquement si un seul protocole
  code: 'MED-TEST-001',
  name: 'Medicament Test XYZ 100mg',
  dciName: 'Paracetamol',
  type: 'IMP',
  dosageForm: 'TABLET',
  strength: '100mg',
  manufacturer: 'Pharma Test Labs',
  storageCondition: 'REFRIGERATED',
  storageInstructions: 'Conserver entre 2 et 8 degres. Ne pas congeler.',
  countingUnit: 'BOX',
  unitsPerPackage: 30,
  doseType: 'FIXED',
  dosage: '200mg par prise',
  packaging: 'Boite de 30 comprimes',
  protocolRequiredDose: '200mg 2x/jour pendant 14 jours',
  doseRounding: 'Arrondi au comprime superieur',
  requiresAnthropometricData: false,
  requiresPreparation: false,
  preparationInstructions: '',
  requiresReconstitution: false,
  reconstitutionInstructions: '',
  stabilityAfterPreparation: '',
  dilutionType: '',
  dilutionVolume: '',
  dilutionFinalConcentration: '',
  dilutionSolution: '',
  requiredEquipments: '',
  hazardCategories: ['CYTOTOXIQUE'],
  wasteCategory: 'DASRI',
  destructionPolicy: 'MIXED',
  destructionPolicyDetails: 'Destruction locale selon procedure PUI',
  complianceRequired: true,
  complianceMethod: 'PILL_COUNT',
  temperatureMonitoringRequired: true,
  stabilityAfterOpening: '28 jours apres ouverture a temperature ambiante',
  excursionPolicy: 'Max 72h hors refrigeration, signaler au promoteur',
  iwrsPerMovement: { reception: true, dispensation: true, retour: false },
  isAtmp: false,
  dosageEscalationScheme: 'Escalade 3+3, dose initiale 50mg',
  customLogFields: [{ name: 'Temperature', type: 'TEXT', movementTypes: ['RECEPTION', 'DISPENSATION', 'RETOUR'] }],
  requiresEsign: false,
  isBlinded: true,
  isPediatric: false,
  administrationRoute: 'PO',
  status: 'DRAFT',
  initialSupplyMode: 'AUTO',
  resupplyMode: 'MANUEL',
  treatmentAssignmentMode: 'IRT',
};

export default function NewMedicationPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingStudies, setLoadingStudies] = useState(true);
  const [error, setError] = useState('');
  const [studies, setStudies] = useState<Study[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<MedicationFormData>(initialFormData);

  // Filter studies that can receive medications (not ARCHIVED or TERMINATED)
  const availableStudies = studies.filter(
    (s) => !['ARCHIVED', 'TERMINATED'].includes(s.protocolStatus)
  );

  // Single study mode: if only one study is available, auto-select it
  const singleStudyMode = availableStudies.length === 1;
  const selectedStudy = availableStudies.find((s) => s.id === formData.studyId);

  useEffect(() => {
    async function fetchStudies() {
      try {
        const response = await fetch('/api/studies');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des protocoles');
        }
        const data = await response.json();
        setStudies(data.data);

        // Auto-select if only one study available
        const available = data.data.filter(
          (s: Study) => !['ARCHIVED', 'TERMINATED'].includes(s.protocolStatus)
        );
        if (available.length === 1) {
          setFormData((prev) => ({ ...prev, studyId: available[0].id }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoadingStudies(false);
      }
    }

    fetchStudies();
  }, []);

  // Toggle mode test - pre-remplit ou vide les champs
  const handleTestModeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setTestMode(enabled);

    if (enabled) {
      setFormData((prev) => ({
        ...testFormData,
        studyId: prev.studyId,
      }));
    } else {
      setFormData((prev) => ({
        ...initialFormData,
        studyId: prev.studyId,
      }));
    }
  };

  const handleChange =
    (field: string) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: unknown } }
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSwitchChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  const handleHazardToggle = (value: string) => () => {
    setFormData((prev) => {
      const current = prev.hazardCategories;
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, hazardCategories: next };
    });
  };

  const handleSubmit = async () => {
    if (!formData.studyId) {
      setError('Veuillez selectionner un protocole');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dciName: formData.dciName || undefined,
          administrationRoute: formData.administrationRoute || undefined,
          doseType: formData.doseType || undefined,
          dosage: formData.dosage || undefined,
          packaging: formData.packaging || undefined,
          protocolRequiredDose: formData.protocolRequiredDose || undefined,
          doseRounding: formData.doseRounding || undefined,
          preparationInstructions: formData.preparationInstructions || undefined,
          reconstitutionInstructions: formData.reconstitutionInstructions || undefined,
          stabilityAfterPreparation: formData.stabilityAfterPreparation || undefined,
          dilutionType: formData.dilutionType || undefined,
          dilutionVolume: formData.dilutionVolume || undefined,
          dilutionFinalConcentration: formData.dilutionFinalConcentration || undefined,
          dilutionSolution: formData.dilutionSolution || undefined,
          requiredEquipments: formData.requiredEquipments || undefined,
          hazardCategories: formData.hazardCategories,
          wasteCategory: formData.wasteCategory || undefined,
          destructionPolicy: formData.destructionPolicy || undefined,
          destructionPolicyDetails: formData.destructionPolicyDetails || undefined,
          complianceRequired: formData.complianceRequired,
          complianceMethod: formData.complianceMethod || undefined,
          stabilityAfterOpening: formData.stabilityAfterOpening || undefined,
          excursionPolicy: formData.excursionPolicy || undefined,
          iwrsPerMovement: formData.iwrsPerMovement,
          isAtmp: formData.isAtmp,
          dosageEscalationScheme: formData.dosageEscalationScheme || undefined,
          customLogFields: formData.customLogFields.length > 0 ? formData.customLogFields : undefined,
          initialSupplyMode: formData.initialSupplyMode || undefined,
          resupplyMode: formData.resupplyMode || undefined,
          treatmentAssignmentMode: formData.treatmentAssignmentMode || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la creation');
      }

      showSuccess('Medicament cree avec succes');
      router.push('/medications');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return formData.code.trim() !== '' && formData.name.trim() !== '' && formData.studyId !== '';
    }
    return true;
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Protocol Selection */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Protocole
              </Typography>
              {singleStudyMode ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: '100%' }}>
                  <Chip
                    label={`${selectedStudy?.codeInternal} - ${selectedStudy?.title && selectedStudy.title.length > 40 ? selectedStudy.title.substring(0, 40) + '...' : selectedStudy?.title}`}
                    color="primary"
                    variant="outlined"
                    sx={{ maxWidth: '70%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                    (Seul protocole disponible)
                  </Typography>
                </Box>
              ) : (
                <FormControl fullWidth required>
                  <InputLabel>Protocole</InputLabel>
                  <Select
                    value={formData.studyId}
                    label="Protocole"
                    onChange={(e) => handleChange('studyId')(e as { target: { value: unknown } })}
                  >
                    {availableStudies.map((study) => (
                      <MenuItem key={study.id} value={study.id}>
                        {study.codeInternal} - {study.title.length > 40 ? study.title.substring(0, 40) + '...' : study.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nom Molecule"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="DCI (Denomination Commune Internationale)"
                value={formData.dciName}
                onChange={handleChange('dciName')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Code Molecule"
                value={formData.code}
                onChange={handleChange('code')}
                required
                helperText="Ex: MED-001"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => handleChange('type')(e as { target: { value: unknown } })}
                >
                  {medicationTypes.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Forme galenique</InputLabel>
                <Select
                  value={formData.dosageForm}
                  label="Forme galenique"
                  onChange={(e) => handleChange('dosageForm')(e as { target: { value: unknown } })}
                >
                  {dosageForms.map((f) => (
                    <MenuItem key={f.value} value={f.value}>
                      {f.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Dosage"
                value={formData.strength}
                onChange={handleChange('strength')}
                placeholder="Ex: 100mg, 5mg/ml"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Fabricant"
                value={formData.manufacturer}
                onChange={handleChange('manufacturer')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Unite de comptage</InputLabel>
                <Select
                  value={formData.countingUnit}
                  label="Unite de comptage"
                  onChange={(e) => handleChange('countingUnit')(e as { target: { value: unknown } })}
                >
                  {countingUnits.map((u) => (
                    <MenuItem key={u.value} value={u.value}>
                      {u.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Unites par conditionnement"
                type="number"
                value={formData.unitsPerPackage}
                onChange={handleChange('unitsPerPackage')}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Route d&apos;administration</InputLabel>
                <Select
                  value={formData.administrationRoute}
                  label="Route d'administration"
                  onChange={(e) => handleChange('administrationRoute')(e as { target: { value: unknown } })}
                >
                  <MenuItem value="">
                    <em>Non definie</em>
                  </MenuItem>
                  {administrationRoutes.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status}
                  label="Statut"
                  onChange={(e) => handleChange('status')(e as { target: { value: unknown } })}
                >
                  {medicationStatuses.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.isPediatric}
                      onChange={handleSwitchChange('isPediatric')}
                    />
                  }
                  label="Formulation pediatrique"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.isBlinded}
                      onChange={handleSwitchChange('isBlinded')}
                    />
                  }
                  label="Produit en aveugle"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Approvisionnement initial</InputLabel>
                <Select
                  value={formData.initialSupplyMode}
                  label="Approvisionnement initial"
                  onChange={(e) => handleChange('initialSupplyMode')(e as { target: { value: unknown } })}
                >
                  <MenuItem value="">
                    <em>Non defini</em>
                  </MenuItem>
                  <MenuItem value="MANUEL">Manuel</MenuItem>
                  <MenuItem value="AUTO">Automatique</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Reapprovisionnement</InputLabel>
                <Select
                  value={formData.resupplyMode}
                  label="Reapprovisionnement"
                  onChange={(e) => handleChange('resupplyMode')(e as { target: { value: unknown } })}
                >
                  <MenuItem value="">
                    <em>Non defini</em>
                  </MenuItem>
                  <MenuItem value="MANUEL">Manuel</MenuItem>
                  <MenuItem value="AUTO">Automatique</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Attribution des traitements</InputLabel>
                <Select
                  value={formData.treatmentAssignmentMode}
                  label="Attribution des traitements"
                  onChange={(e) => handleChange('treatmentAssignmentMode')(e as { target: { value: unknown } })}
                >
                  <MenuItem value="">
                    <em>Non defini</em>
                  </MenuItem>
                  <MenuItem value="IRT">IRT</MenuItem>
                  <MenuItem value="MANUEL">Manuel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type de dose</InputLabel>
                <Select
                  value={formData.doseType}
                  label="Type de dose"
                  onChange={(e) => handleChange('doseType')(e as { target: { value: unknown } })}
                >
                  <MenuItem value="">
                    <em>Non defini</em>
                  </MenuItem>
                  {doseTypes.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Dosage"
                value={formData.dosage}
                onChange={handleChange('dosage')}
                placeholder="Ex: 200mg par prise"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Conditionnement"
                value={formData.packaging}
                onChange={handleChange('packaging')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Dose requise selon protocole"
                value={formData.protocolRequiredDose}
                onChange={handleChange('protocolRequiredDose')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Arrondi de dose"
                value={formData.doseRounding}
                onChange={handleChange('doseRounding')}
              />
            </Grid>
            {!!(formData.doseType === 'PER_KG' || formData.doseType === 'PER_M2') && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.requiresAnthropometricData}
                      onChange={handleSwitchChange('requiresAnthropometricData')}
                    />
                  }
                  label="Donnees anthropometriques requises"
                />
              </Grid>
            )}
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.requiresPreparation}
                    onChange={handleSwitchChange('requiresPreparation')}
                  />
                }
                label="Preparation requise"
              />
            </Grid>
            {!!formData.requiresPreparation && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Instructions de preparation"
                  value={formData.preparationInstructions ?? ''}
                  onChange={handleChange('preparationInstructions')}
                  multiline
                  rows={3}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.requiresReconstitution}
                    onChange={handleSwitchChange('requiresReconstitution')}
                  />
                }
                label="Reconstitution requise"
              />
            </Grid>
            {!!formData.requiresReconstitution && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Instructions de reconstitution"
                  value={formData.reconstitutionInstructions ?? ''}
                  onChange={handleChange('reconstitutionInstructions')}
                  multiline
                  rows={3}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Stabilite apres preparation/reconstitution"
                value={formData.stabilityAfterPreparation}
                onChange={handleChange('stabilityAfterPreparation')}
                placeholder="Ex: 24h a temperature ambiante"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Type de dilution"
                value={formData.dilutionType}
                onChange={handleChange('dilutionType')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Volume de dilution"
                value={formData.dilutionVolume}
                onChange={handleChange('dilutionVolume')}
                placeholder="Ex: 250ml"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Concentration finale"
                value={formData.dilutionFinalConcentration}
                onChange={handleChange('dilutionFinalConcentration')}
                placeholder="Ex: 1mg/ml"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Solution de dilution"
                value={formData.dilutionSolution}
                onChange={handleChange('dilutionSolution')}
                placeholder="Ex: NaCl 0.9%, Glucose 5%"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Equipements requis"
                value={formData.requiredEquipments}
                onChange={handleChange('requiredEquipments')}
                multiline
                rows={3}
                placeholder="Ex: CSTD, filtre 0.2um, protection lumiere"
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Categories de danger
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {hazardCategories.map((h) => (
                  <FormControlLabel
                    key={h.value}
                    control={
                      <Checkbox
                        checked={formData.hazardCategories.includes(h.value)}
                        onChange={handleHazardToggle(h.value)}
                      />
                    }
                    label={h.label}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Categorie de dechets</InputLabel>
                <Select
                  value={formData.wasteCategory}
                  label="Categorie de dechets"
                  onChange={(e) => handleChange('wasteCategory')(e as { target: { value: unknown } })}
                >
                  <MenuItem value="">
                    <em>Non definie</em>
                  </MenuItem>
                  {wasteCategories.map((w) => (
                    <MenuItem key={w.value} value={w.value}>
                      {w.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Politique de destruction</InputLabel>
                <Select
                  value={formData.destructionPolicy}
                  label="Politique de destruction"
                  onChange={(e) => handleChange('destructionPolicy')(e as { target: { value: unknown } })}
                >
                  <MenuItem value="">
                    <em>Non definie</em>
                  </MenuItem>
                  {destructionPolicies.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {formData.destructionPolicy === 'MIXED' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Details politique de destruction"
                  value={formData.destructionPolicyDetails}
                  onChange={handleChange('destructionPolicyDetails')}
                  multiline
                  rows={2}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.complianceRequired}
                    onChange={handleSwitchChange('complianceRequired')}
                  />
                }
                label="Compliance requise"
              />
            </Grid>
            {!!formData.complianceRequired && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Methode de compliance</InputLabel>
                  <Select
                    value={formData.complianceMethod}
                    label="Methode de compliance"
                    onChange={(e) => handleChange('complianceMethod')(e as { target: { value: unknown } })}
                  >
                    <MenuItem value="">
                      <em>Non definie</em>
                    </MenuItem>
                    {complianceMethods.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        );
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Condition de stockage</InputLabel>
                <Select
                  value={formData.storageCondition}
                  label="Condition de stockage"
                  onChange={(e) => handleChange('storageCondition')(e as { target: { value: unknown } })}
                >
                  {storageConditions.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Instructions de stockage"
                value={formData.storageInstructions}
                onChange={handleChange('storageInstructions')}
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.temperatureMonitoringRequired}
                    onChange={handleSwitchChange('temperatureMonitoringRequired')}
                  />
                }
                label="Monitoring temperature requis"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Stabilite apres ouverture / decongelation"
                value={formData.stabilityAfterOpening}
                onChange={handleChange('stabilityAfterOpening')}
                multiline
                rows={2}
                placeholder="Ex: 28 jours apres ouverture a temperature ambiante"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Politique d'excursion"
                value={formData.excursionPolicy}
                onChange={handleChange('excursionPolicy')}
                multiline
                rows={2}
                placeholder="Ex: Max 72h hors refrigeration, signaler au promoteur"
              />
            </Grid>
          </Grid>
        );
      case 5:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                IWRS par type de mouvement
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formData.iwrsPerMovement.reception}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          iwrsPerMovement: { ...prev.iwrsPerMovement, reception: e.target.checked },
                        }))
                      }
                    />
                  }
                  label="Reception"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formData.iwrsPerMovement.dispensation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          iwrsPerMovement: { ...prev.iwrsPerMovement, dispensation: e.target.checked },
                        }))
                      }
                    />
                  }
                  label="Dispensation"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!formData.iwrsPerMovement.retour}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          iwrsPerMovement: { ...prev.iwrsPerMovement, retour: e.target.checked },
                        }))
                      }
                    />
                  }
                  label="Retour"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.isAtmp}
                    onChange={handleSwitchChange('isAtmp')}
                  />
                }
                label="ATMP (Medicament de therapie innovante)"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Schema dose / escalade"
                value={formData.dosageEscalationScheme}
                onChange={handleChange('dosageEscalationScheme')}
                multiline
                rows={3}
                placeholder="Ex: Escalade 3+3, dose initiale 50mg..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Champs personnalises pour logs de comptabilite
              </Typography>
              {formData.customLogFields.map((field, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    label="Nom du champ"
                    value={field.name}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        customLogFields: prev.customLogFields.map((f, i) =>
                          i === index ? { ...f, name: e.target.value } : f
                        ),
                      }));
                    }}
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={field.type}
                      label="Type"
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          customLogFields: prev.customLogFields.map((f, i) =>
                            i === index ? { ...f, type: e.target.value as string } : f
                          ),
                        }));
                      }}
                    >
                      <MenuItem value="TEXT">Texte</MenuItem>
                      <MenuItem value="NUMBER">Nombre</MenuItem>
                      <MenuItem value="BOOLEAN">Booleen</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel>Types de mouvement</InputLabel>
                    <Select
                      multiple
                      value={field.movementTypes}
                      label="Types de mouvement"
                      onChange={(e) => {
                        const value = e.target.value as string[];
                        if (value.length === 0) return;
                        setFormData((prev) => ({
                          ...prev,
                          customLogFields: prev.customLogFields.map((f, i) =>
                            i === index ? { ...f, movementTypes: value } : f
                          ),
                        }));
                      }}
                      renderValue={(selected) =>
                        (selected as string[]).map((v) => {
                          const labels: Record<string, string> = { RECEPTION: 'Reception', DISPENSATION: 'Dispensation', RETOUR: 'Retour' };
                          return labels[v] || v;
                        }).join(', ')
                      }
                    >
                      {[
                        { value: 'RECEPTION', label: 'Reception' },
                        { value: 'DISPENSATION', label: 'Dispensation' },
                        { value: 'RETOUR', label: 'Retour' },
                      ].map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          <Checkbox checked={field.movementTypes.includes(opt.value)} />
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        customLogFields: prev.customLogFields.filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              {formData.customLogFields.length < 10 && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      customLogFields: [...prev.customLogFields, { name: '', type: 'TEXT', movementTypes: ['RECEPTION', 'DISPENSATION', 'RETOUR'] }],
                    }));
                  }}
                  variant="outlined"
                  size="small"
                >
                  Ajouter un champ
                </Button>
              )}
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  if (loadingStudies) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (availableStudies.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            component={Link}
            href="/medications"
            startIcon={<ArrowBackIcon />}
            color="inherit"
          >
            Retour
          </Button>
        </Box>
        <Alert severity="warning">
          Aucun protocole disponible pour ajouter des medicaments. Les protocoles archives ou
          termines ne peuvent pas recevoir de nouveaux medicaments.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          component={Link}
          href="/medications"
          startIcon={<ArrowBackIcon />}
          color="inherit"
        >
          Retour
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Nouveau medicament
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={testMode}
              onChange={handleTestModeToggle}
              color="warning"
            />
          }
          label={
            <Typography variant="body2" color={testMode ? 'warning.main' : 'text.secondary'}>
              Mode test (pre-remplir)
            </Typography>
          }
        />
      </Box>

      {testMode && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Mode test active - Tous les champs sont pre-remplis avec des donnees de demonstration
        </Alert>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.id} completed={index < activeStep}>
                <StepLabel
                  onClick={() => setActiveStep(index)}
                  sx={{
                    cursor: 'pointer',
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

          <Box sx={{ minHeight: 300, px: 2 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Precedent
            </Button>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Etape {activeStep + 1} / {steps.length}
              </Typography>
              <Button
                variant="outlined"
                color="success"
                startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={loading || !isStepValid()}
              >
                Creer
              </Button>
              {activeStep < steps.length - 1 && (
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
