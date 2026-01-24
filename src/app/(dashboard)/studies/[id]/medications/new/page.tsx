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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useToast } from '@/contexts/ToastContext';

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
  params: Promise<{ id: string }>;
}

export default function NewMedicationPage({ params }: Props) {
  const { id: studyId } = use(params);
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
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
    iwrsRequired: false,
    requiresEsign: false,
    isBlinded: false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/studies/${studyId}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
                        checked={formData.isBlinded}
                        onChange={handleSwitchChange('isBlinded')}
                      />
                    }
                    label="Produit en aveugle"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.iwrsRequired}
                        onChange={handleSwitchChange('iwrsRequired')}
                      />
                    }
                    label="IWRS requis"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.requiresEsign}
                        onChange={handleSwitchChange('requiresEsign')}
                      />
                    }
                    label="E-signature destruction"
                  />
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <Button component={Link} href={`/studies/${studyId}/medications`}>
                Annuler
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Creer'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
