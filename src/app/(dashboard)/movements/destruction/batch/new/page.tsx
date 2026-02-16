'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import DateField from '@/components/DateField';

interface Study {
  id: string;
  codeInternal: string;
  title: string;
}

interface Medication {
  id: string;
  code: string;
  name: string;
}

interface EligibleItem {
  id: string;
  batchNumber: string;
  kitNumber: string | null;
  currentQuantity: number;
  expiryDate: string | null;
  status: string;
  source: 'EXPIRED' | 'RETURNED_PATIENT';
  medication: {
    id: string;
    code: string;
    name: string;
    countingUnit: string;
  };
  returnPatientId?: string;
  returnVisitNumber?: string;
}

interface SelectedItem {
  stockItemId: string;
  medicationId: string;
  quantity: number;
}

const destructionMethods = [
  { value: 'INCINERATION', label: 'Incineration' },
  { value: 'CHEMICAL', label: 'Destruction chimique' },
  { value: 'RETURN_TO_SPONSOR', label: 'Retour au promoteur' },
  { value: 'OTHER', label: 'Autre' },
];

const sourceLabels: Record<string, { label: string; color: 'error' | 'warning' }> = {
  EXPIRED: { label: 'Expire', color: 'error' },
  RETURNED_PATIENT: { label: 'Retour patient', color: 'warning' },
};

export default function BatchDestructionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const canCreate = ['ADMIN', 'PHARMACIEN'].includes(session?.user?.role ?? '');

  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [studies, setStudies] = useState<Study[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [studyId, setStudyId] = useState('');
  const [medicationFilter, setMedicationFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  // Eligible items
  const [eligibleItems, setEligibleItems] = useState<EligibleItem[]>([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Batch params
  const [destructionMethod, setDestructionMethod] = useState('');
  const [destructionDate, setDestructionDate] = useState('');
  const [destructionLocation, setDestructionLocation] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [witnessFn, setWitnessFn] = useState('');
  const [notes, setNotes] = useState('');

  // Load studies
  useEffect(() => {
    fetch('/api/studies')
      .then((res) => res.json())
      .then((result) => setStudies(result.data || []))
      .catch(console.error);
  }, []);

  // Load medications when study changes
  useEffect(() => {
    if (studyId) {
      fetch(`/api/studies/${studyId}/medications`)
        .then((res) => res.json())
        .then((result) => setMedications(result.data || []))
        .catch(console.error);
    } else {
      setMedications([]);
    }
    setMedicationFilter('');
    setEligibleItems([]);
    setSelectedIds(new Set());
    setQuantities({});
  }, [studyId]);

  // Fetch eligible items
  const fetchEligibleItems = useCallback(async () => {
    if (!studyId) return;
    setLoadingItems(true);
    try {
      const params = new URLSearchParams({ studyId });
      if (medicationFilter) params.set('medicationId', medicationFilter);
      if (batchFilter) params.set('batchNumber', batchFilter);

      const res = await fetch(`/api/destruction-batches/eligible-items?${params}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur lors du chargement');

      setEligibleItems(result.data || []);
      setSelectedIds(new Set());
      setQuantities({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoadingItems(false);
    }
  }, [studyId, medicationFilter, batchFilter]);

  useEffect(() => {
    if (studyId) {
      fetchEligibleItems();
    }
  }, [studyId, medicationFilter, fetchEligibleItems]);

  // Debounce batch filter search
  useEffect(() => {
    if (!studyId) return;
    const timeout = setTimeout(() => fetchEligibleItems(), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchFilter]);

  // Selection handlers
  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === eligibleItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleItems.map((i) => i.id)));
    }
  };

  const handleQuantityChange = (id: string, value: number, max: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.min(value, max)),
    }));
  };

  const getQuantity = (item: EligibleItem) => {
    return quantities[item.id] ?? item.currentQuantity;
  };

  // Submit
  const handleSubmit = async () => {
    if (!destructionMethod) {
      setError('La methode de destruction est requise');
      return;
    }
    setLoading(true);
    setError('');

    const items: SelectedItem[] = eligibleItems
      .filter((i) => selectedIds.has(i.id))
      .map((i) => ({
        stockItemId: i.id,
        medicationId: i.medication.id,
        quantity: getQuantity(i),
      }));

    try {
      const res = await fetch('/api/destruction-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyId,
          destructionMethod,
          destructionDate: destructionDate || undefined,
          destructionLocation: destructionLocation || undefined,
          witnessName: witnessName || undefined,
          witnessFn: witnessFn || undefined,
          notes: notes || undefined,
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la creation');
      }

      router.push('/movements/destruction');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (!canCreate) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Acces refuse. Seuls les pharmaciens et administrateurs peuvent creer des batches de destruction.
        </Alert>
      </Box>
    );
  }

  const selectedCount = selectedIds.size;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Batch destruction
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selectionner les elements eligibles a la destruction groupee
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Section A: Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtres
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Protocole</InputLabel>
                <Select
                  value={studyId}
                  label="Protocole"
                  onChange={(e) => setStudyId(e.target.value)}
                >
                  {studies.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.codeInternal} - {s.title.length > 30 ? s.title.substring(0, 30) + '...' : s.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={!studyId}>
                <InputLabel>Medicament</InputLabel>
                <Select
                  value={medicationFilter}
                  label="Medicament"
                  onChange={(e) => setMedicationFilter(e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {medications.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.code} - {m.name.length > 30 ? m.name.substring(0, 30) + '...' : m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Lot / DLU"
                placeholder="Rechercher par numero de lot..."
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                disabled={!studyId}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Section B: Eligible items table */}
      {studyId && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Elements eligibles ({eligibleItems.length})
              </Typography>
              {selectedCount > 0 && (
                <Chip label={`${selectedCount} selectionne(s)`} color="primary" />
              )}
            </Box>

            {loadingItems ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : eligibleItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Aucun element eligible a la destruction pour ce protocole.
                <br />
                Seuls les lots expires (DLU depassee) ou retournes par un patient sont eligibles a la destruction groupee.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.size === eligibleItems.length && eligibleItems.length > 0}
                          indeterminate={selectedIds.size > 0 && selectedIds.size < eligibleItems.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Medicament</TableCell>
                      <TableCell>Lot</TableCell>
                      <TableCell>Kit ID</TableCell>
                      <TableCell>DLU</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell align="right">Qte dispo</TableCell>
                      <TableCell>Unite</TableCell>
                      <TableCell>Origine retour</TableCell>
                      <TableCell>Quarantaine</TableCell>
                      <TableCell align="right">Qte a detruire</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eligibleItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const sourceInfo = sourceLabels[item.source];
                      return (
                        <TableRow key={item.id} hover selected={isSelected}>
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected} onChange={() => handleToggle(item.id)} />
                          </TableCell>
                          <TableCell>
                            {item.medication.code} - {item.medication.name}
                          </TableCell>
                          <TableCell>{item.batchNumber}</TableCell>
                          <TableCell>{item.kitNumber || '—'}</TableCell>
                          <TableCell>
                            {item.expiryDate
                              ? new Date(item.expiryDate).toLocaleDateString('fr-FR')
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sourceInfo?.label ?? item.source}
                              color={sourceInfo?.color ?? 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{item.currentQuantity}</TableCell>
                          <TableCell>{item.medication.countingUnit}</TableCell>
                          <TableCell>
                            {item.source === 'RETURNED_PATIENT' && item.returnPatientId
                              ? `${item.returnPatientId}${item.returnVisitNumber ? ` / V${item.returnVisitNumber}` : ''}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.status === 'QUARANTINE' ? 'Oui' : 'Non'}
                              color={item.status === 'QUARANTINE' ? 'warning' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ minWidth: 100 }}>
                            {isSelected ? (
                              <TextField
                                type="number"
                                size="small"
                                value={getQuantity(item)}
                                onChange={(e) =>
                                  handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1, item.currentQuantity)
                                }
                                inputProps={{ min: 1, max: item.currentQuantity }}
                                sx={{ width: 80 }}
                              />
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section C: Batch parameters */}
      {selectedCount > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Parametres du batch
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Methode de destruction</InputLabel>
                  <Select
                    value={destructionMethod}
                    label="Methode de destruction"
                    onChange={(e) => setDestructionMethod(e.target.value)}
                  >
                    {destructionMethods.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DateField
                  fullWidth
                  label="Date de destruction"
                  value={destructionDate}
                  onChange={(e) => setDestructionDate(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Lieu de destruction"
                  value={destructionLocation}
                  onChange={(e) => setDestructionLocation(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nom du temoin"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Fonction du temoin"
                  value={witnessFn}
                  onChange={(e) => setWitnessFn(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <Button onClick={() => router.back()}>Annuler</Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleSubmit}
                disabled={loading || selectedCount === 0 || !destructionMethod}
              >
                {loading ? <CircularProgress size={24} /> : `Creer batch destruction (${selectedCount})`}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
