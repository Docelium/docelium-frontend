'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkButton from '@/components/ui/LinkButton';
import { useToast } from '@/contexts/ToastContext';
import { useSession } from 'next-auth/react';

interface Study {
  id: string;
  codeInternal: string;
  title: string;
  protocolStatus: string;
}

interface Medication {
  id: string;
  code: string;
  name: string;
  type: 'IMP' | 'NIMP';
  dosageForm: string;
  strength?: string;
  storageCondition: string;
  status: 'DRAFT' | 'ACTIVE' | 'WITHDRAWN';
  isBlinded: boolean;
  study: Study;
  _count: {
    stockItems: number;
    movements: number;
  };
}

const dosageFormLabels: Record<string, string> = {
  TABLET: 'Comprime',
  CAPSULE: 'Gelule',
  INJECTION: 'Injectable',
  SOLUTION: 'Solution',
  CREAM: 'Creme',
  PATCH: 'Patch',
  INHALER: 'Inhalateur',
  SUPPOSITORY: 'Suppositoire',
  POWDER: 'Poudre',
  GEL: 'Gel',
  SPRAY: 'Spray',
  DROPS: 'Gouttes',
  OTHER: 'Autre',
};

const storageLabels: Record<string, string> = {
  ROOM_TEMPERATURE: 'Temp. ambiante',
  REFRIGERATED: 'Refrigere',
  FROZEN: 'Congele',
  CONTROLLED_ROOM_TEMPERATURE: 'Temp. controlee',
  PROTECT_FROM_LIGHT: 'Proteger lumiere',
  OTHER: 'Autre',
};

const medicationStatusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  WITHDRAWN: 'Retiré',
};

const medicationStatusColors: Record<string, 'default' | 'success' | 'error'> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  WITHDRAWN: 'error',
};

export default function MedicationsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { data: session } = useSession();
  const canWrite = ['ADMIN', 'PHARMACIEN'].includes(session?.user?.role ?? '');

  const [medications, setMedications] = useState<Medication[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [studyFilter, setStudyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch studies and medications in parallel
        const [studiesRes, medsRes] = await Promise.all([
          fetch('/api/studies'),
          fetch('/api/medications'),
        ]);

        if (!studiesRes.ok || !medsRes.ok) {
          throw new Error('Erreur lors du chargement des donnees');
        }

        const studiesData = await studiesRes.json();
        const medsData = await medsRes.json();

        setStudies(studiesData.data || []);
        setMedications(medsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDeleteClick = (medication: Medication) => {
    setMedicationToDelete(medication);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!medicationToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/studies/${medicationToDelete.study.id}/medications/${medicationToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      setMedications((prev) => prev.filter((m) => m.id !== medicationToDelete.id));
      showSuccess('Medicament desactive avec succes');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setMedicationToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Filter medications
  const filteredMedications = (medications || []).filter((med) => {
    if (studyFilter && med.study.id !== studyFilter) return false;
    if (typeFilter && med.type !== typeFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        med.code.toLowerCase().includes(searchLower) ||
        med.name.toLowerCase().includes(searchLower) ||
        med.study.codeInternal.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Medicaments</Typography>
        {canWrite && (
          <LinkButton href="/medications/new" variant="contained" startIcon={<AddIcon />}>
            Ajouter un medicament
          </LinkButton>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Protocole</InputLabel>
              <Select
                value={studyFilter}
                label="Protocole"
                onChange={(e) => setStudyFilter(e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                {studies.map((study) => (
                  <MenuItem key={study.id} value={study.id}>
                    {study.codeInternal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="IMP">IMP</MenuItem>
                <MenuItem value="NIMP">NIMP</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {filteredMedications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {medications.length === 0
                  ? 'Aucun medicament enregistre'
                  : 'Aucun medicament ne correspond aux filtres'}
              </Typography>
              {medications.length === 0 && canWrite && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/medications/new')}
                  sx={{ mt: 2 }}
                >
                  Ajouter le premier medicament
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Protocole</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Forme</TableCell>
                    <TableCell>Stockage</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMedications.map((medication) => (
                    <TableRow key={medication.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {medication.code}
                          </Typography>
                          {medication.isBlinded && (
                            <Chip label="Aveugle" size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{medication.name}</TableCell>
                      <TableCell>
                        <Link
                          href={`/studies/${medication.study.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Chip
                            label={medication.study.codeInternal}
                            size="small"
                            clickable
                            variant="outlined"
                          />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={medication.type}
                          color={medication.type === 'IMP' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={medicationStatusLabels[medication.status] || medication.status}
                          color={medicationStatusColors[medication.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {dosageFormLabels[medication.dosageForm] || medication.dosageForm}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {storageLabels[medication.storageCondition] || medication.storageCondition}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{medication._count.stockItems}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              router.push(
                                `/studies/${medication.study.id}/medications/${medication.id}`
                              )
                            }
                            title="Voir"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {canWrite && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  router.push(
                                    `/studies/${medication.study.id}/medications/${medication.id}/edit`
                                  )
                                }
                                title="Modifier"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(medication)}
                                title="Supprimer"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Etes-vous sur de vouloir desactiver le medicament{' '}
            <strong>
              {medicationToDelete?.code} - {medicationToDelete?.name}
            </strong>{' '}
            du protocole <strong>{medicationToDelete?.study.codeInternal}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
            {deleting ? 'Suppression...' : 'Desactiver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
