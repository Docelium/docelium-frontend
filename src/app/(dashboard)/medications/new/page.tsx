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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useToast } from '@/contexts/ToastContext';

interface Study {
  id: string;
  codeInternal: string;
  title: string;
  protocolStatus: string;
}

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

// Donnees initiales vides
const initialFormData = {
  studyId: '',
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
};

// Donnees de test pre-remplies
const testFormData = {
  studyId: '', // Sera rempli automatiquement si un seul protocole
  code: 'MED-TEST-001',
  name: 'Medicament Test XYZ 100mg',
  type: 'IMP',
  dosageForm: 'TABLET',
  strength: '100mg',
  manufacturer: 'Pharma Test Labs',
  storageCondition: 'REFRIGERATED',
  storageInstructions: 'Conserver entre 2 et 8 degres. Ne pas congeler.',
  countingUnit: 'BOX',
  unitsPerPackage: 30,
  iwrsRequired: true,
  requiresEsign: false,
  isBlinded: true,
};

export default function NewMedicationPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingStudies, setLoadingStudies] = useState(true);
  const [error, setError] = useState('');
  const [studies, setStudies] = useState<Study[]>([]);
  const [testMode, setTestMode] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

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
      // Pre-remplir avec donnees de test, en conservant le studyId selectionne
      setFormData((prev) => ({
        ...testFormData,
        studyId: prev.studyId, // Conserver le protocole selectionne
      }));
    } else {
      // Revenir aux donnees initiales, en conservant le studyId
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        body: JSON.stringify(formData),
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

      <Card sx={{ maxWidth: '100%' }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ maxWidth: '100%' }}>
              {/* Protocol Selection */}
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Protocole
                </Typography>
                {singleStudyMode ? (
                  // Single study: display as read-only chip
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
                  // Multiple studies: show selector
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

              {/* Divider */}
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                  Informations du medicament
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Dosage"
                  value={formData.strength}
                  onChange={handleChange('strength')}
                  placeholder="Ex: 100mg, 5mg/ml"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Fabricant"
                  value={formData.manufacturer}
                  onChange={handleChange('manufacturer')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <FormControl fullWidth required>
                  <InputLabel>Condition de stockage</InputLabel>
                  <Select
                    value={formData.storageCondition}
                    label="Condition de stockage"
                    onChange={(e) =>
                      handleChange('storageCondition')(e as { target: { value: unknown } })
                    }
                  >
                    {storageConditions.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Instructions de stockage"
                  value={formData.storageInstructions}
                  onChange={handleChange('storageInstructions')}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <FormControl fullWidth required>
                  <InputLabel>Unite de comptage</InputLabel>
                  <Select
                    value={formData.countingUnit}
                    label="Unite de comptage"
                    onChange={(e) =>
                      handleChange('countingUnit')(e as { target: { value: unknown } })
                    }
                  >
                    {countingUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>
                        {u.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Unites par conditionnement"
                  type="number"
                  value={formData.unitsPerPackage}
                  onChange={handleChange('unitsPerPackage')}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
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
              <Button component={Link} href="/medications">
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.studyId}
              >
                {loading ? <CircularProgress size={24} /> : 'Creer'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
