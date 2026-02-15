'use client';

import { useState, useEffect, use } from 'react';
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

interface Props {
  params: Promise<{ id: string; medId: string }>;
}

interface MedicationFormData {
  code: string;
  name: string;
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
  iwrsRequired: boolean;
  requiresEsign: boolean;
  isBlinded: boolean;
}

export default function EditMedicationPage({ params }: Props) {
  const { id: studyId, medId } = use(params);
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<MedicationFormData>({
    code: '',
    name: '',
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
    iwrsRequired: false,
    requiresEsign: false,
    isBlinded: false,
  });

  useEffect(() => {
    async function fetchMedication() {
      try {
        const response = await fetch(`/api/studies/${studyId}/medications/${medId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push(`/studies/${studyId}/medications`);
            return;
          }
          throw new Error('Erreur lors du chargement du medicament');
        }

        const data = await response.json();
        const med = data.data;

        setFormData({
          code: med.code || '',
          name: med.name || '',
          type: med.type || 'IMP',
          dosageForm: med.dosageForm || 'TABLET',
          strength: med.strength || '',
          manufacturer: med.manufacturer || '',
          storageCondition: med.storageCondition || 'ROOM_TEMPERATURE',
          storageInstructions: med.storageInstructions || '',
          countingUnit: med.countingUnit || 'UNIT',
          unitsPerPackage: med.unitsPerPackage || 1,
          doseType: med.doseType || '',
          dosage: med.dosage || '',
          packaging: med.packaging || '',
          protocolRequiredDose: med.protocolRequiredDose || '',
          doseRounding: med.doseRounding || '',
          requiresAnthropometricData: med.requiresAnthropometricData || false,
          requiresPreparation: med.requiresPreparation || false,
          preparationInstructions: med.preparationInstructions || '',
          requiresReconstitution: med.requiresReconstitution || false,
          reconstitutionInstructions: med.reconstitutionInstructions || '',
          stabilityAfterPreparation: med.stabilityAfterPreparation || '',
          dilutionType: med.dilutionType || '',
          dilutionVolume: med.dilutionVolume || '',
          dilutionFinalConcentration: med.dilutionFinalConcentration || '',
          dilutionSolution: med.dilutionSolution || '',
          requiredEquipments: med.requiredEquipments || '',
          iwrsRequired: med.iwrsRequired || false,
          requiresEsign: med.requiresEsign || false,
          isBlinded: med.isBlinded || false,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchMedication();
  }, [studyId, medId, router]);

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

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/studies/${studyId}/medications/${medId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
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
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise a jour');
      }

      showSuccess('Medicament mis a jour avec succes');
      router.push(`/studies/${studyId}/medications`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      showError(message);
    } finally {
      setSaving(false);
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
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Code"
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
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
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
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.requiresEsign}
                      onChange={handleSwitchChange('requiresEsign')}
                    />
                  }
                  label="E-signature destruction"
                />
              </Box>
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
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

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
        Modifier le medicament
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {formData.code} - {formData.name}
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
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={saving || !isStepValid()}
              >
                Enregistrer
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
