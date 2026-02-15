'use client';

import { useState, use } from 'react';
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
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useToast } from '@/contexts/ToastContext';

const steps = [
  { id: 'A', label: 'Identification' },
  { id: 'B', label: 'Posologie' },
  { id: 'C', label: 'Preparation & Reconstitution' },
  { id: 'D', label: 'Securite & Compliance' },
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
  { value: 'WITHDRAWN', label: 'Retiré' },
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

const complianceMethods = [
  { value: 'PILL_COUNT', label: 'Comptage de comprimes' },
  { value: 'DIARY', label: 'Journal patient' },
  { value: 'ELECTRONIC', label: 'Electronique' },
  { value: 'OTHER', label: 'Autre' },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function NewMedicationPage({ params }: Props) {
  const { id: studyId } = use(params);
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
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
    hazardCategories: [] as string[],
    wasteCategory: '',
    destructionPolicyDetails: '',
    complianceRequired: false,
    complianceMethod: '',
    iwrsRequired: false,
    requiresEsign: false,
    isBlinded: false,
    isPediatric: false,
    administrationRoute: '',
    status: 'DRAFT',
    initialSupplyMode: '',
    resupplyMode: '',
    treatmentAssignmentMode: '',
  });

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
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
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/studies/${studyId}/medications`, {
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
          destructionPolicyDetails: formData.destructionPolicyDetails || undefined,
          complianceRequired: formData.complianceRequired,
          complianceMethod: formData.complianceMethod || undefined,
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
      router.push(`/studies/${studyId}/medications`);
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
      return formData.code.trim() !== '' && formData.name.trim() !== '';
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.iwrsRequired}
                      onChange={handleSwitchChange('iwrsRequired')}
                    />
                  }
                  label="IWRS requis"
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
              <TextField
                fullWidth
                label="Politique de destruction"
                value={formData.destructionPolicyDetails}
                onChange={handleChange('destructionPolicyDetails')}
                multiline
                rows={2}
              />
            </Grid>
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
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          component={Link}
          href={`/studies/${studyId}/medications`}
          startIcon={<ArrowBackIcon />}
          color="inherit"
        >
          Retour
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        Nouveau medicament
      </Typography>

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
