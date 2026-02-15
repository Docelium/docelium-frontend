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

const hazardCategories = [
  { value: 'CYTOTOXIQUE', label: 'Cytotoxique' },
  { value: 'RADIOACTIF', label: 'Radioactif' },
  { value: 'BIOLOGIQUE', label: 'Biologique' },
  { value: 'CMR', label: 'CMR (Cancerogene, Mutagene, Reprotoxique)' },
];

const wasteCategories = [
  { value: 'DASRI', label: 'DASRI' },
  { value: 'DAOM', label: 'DAOM' },
  { value: 'CYTOTOXIQUE', label: 'Cytotoxique' },
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

// Donnees initiales vides
const initialFormData = {
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
  hazardCategories: [] as string[],
  wasteCategory: '',
  destructionPolicy: '',
  complianceRequired: false,
  complianceMethod: '',
  iwrsRequired: false,
  requiresEsign: false,
  isBlinded: false,
  isPediatric: false,
  administrationRoute: '',
  initialSupplyMode: '',
  resupplyMode: '',
  treatmentAssignmentMode: '',
};

// Donnees de test pre-remplies
const testFormData = {
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
  hazardCategories: ['CYTOTOXIQUE'] as string[],
  wasteCategory: 'DASRI',
  destructionPolicy: 'LOCAL',
  complianceRequired: true,
  complianceMethod: 'PILL_COUNT',
  iwrsRequired: true,
  requiresEsign: false,
  isBlinded: true,
  isPediatric: false,
  administrationRoute: 'PO',
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

  const handleHazardToggle = (value: string) => () => {
    setFormData((prev) => {
      const current = prev.hazardCategories;
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, hazardCategories: next };
    });
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
        body: JSON.stringify({
          ...formData,
          dciName: formData.dciName || undefined,
          administrationRoute: formData.administrationRoute || undefined,
          hazardCategories: formData.hazardCategories,
          wasteCategory: formData.wasteCategory || undefined,
          destructionPolicy: formData.destructionPolicy || undefined,
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

              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Nom Molecule"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="DCI (Denomination Commune Internationale)"
                  value={formData.dciName}
                  onChange={handleChange('dciName')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Route d&apos;administration</InputLabel>
                  <Select
                    value={formData.administrationRoute}
                    label="Route d'administration"
                    onChange={(e) =>
                      handleChange('administrationRoute')(e as { target: { value: unknown } })
                    }
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
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
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

            {/* Securite & Compliance */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 4 }}>
              Securite & Compliance
            </Typography>
            <Grid container spacing={3} sx={{ maxWidth: '100%', mt: 1 }}>
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
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
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
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
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
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
                <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
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
