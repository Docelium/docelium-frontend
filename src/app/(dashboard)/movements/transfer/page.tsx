'use client';

import { useState, useEffect } from 'react';
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

interface StockItem {
  id: string;
  batchNumber: string;
  currentQuantity: number;
  storageLocation: string | null;
}

export default function TransferPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const canCreate = ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'].includes(session?.user?.role ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studies, setStudies] = useState<Study[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [formData, setFormData] = useState({
    studyId: '',
    medicationId: '',
    stockItemId: '',
    quantity: '',
    movementDate: new Date().toISOString().split('T')[0],
    transferFromLocation: '',
    transferToLocation: '',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/studies')
      .then((res) => res.json())
      .then((result) => setStudies(result.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.studyId) {
      fetch(`/api/studies/${formData.studyId}/medications`)
        .then((res) => res.json())
        .then((result) => setMedications(result.data || []))
        .catch(console.error);
    }
  }, [formData.studyId]);

  useEffect(() => {
    if (formData.studyId && formData.medicationId) {
      fetch(`/api/stock?studyId=${formData.studyId}&medicationId=${formData.medicationId}&status=AVAILABLE`)
        .then((res) => res.json())
        .then((result) => setStockItems(result.data || []))
        .catch(console.error);
    }
  }, [formData.studyId, formData.medicationId]);

  useEffect(() => {
    const selectedStock = stockItems.find((s) => s.id === formData.stockItemId);
    if (selectedStock?.storageLocation) {
      setFormData((prev) => ({
        ...prev,
        transferFromLocation: selectedStock.storageLocation || '',
      }));
    }
  }, [formData.stockItemId, stockItems]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TRANSFER',
          ...formData,
          quantity: parseInt(formData.quantity, 10),
          movementDate: formData.movementDate ? new Date(formData.movementDate) : new Date(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la creation');
      }

      router.push('/movements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const selectedStock = stockItems.find((s) => s.id === formData.stockItemId);

  if (!canCreate) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Acces refuse. Seuls les pharmaciens et techniciens peuvent creer des mouvements.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nouveau transfert
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Transferer des medicaments vers un autre emplacement
      </Typography>

      <Card sx={{ maxWidth: '100%' }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ maxWidth: '100%' }}>
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <FormControl fullWidth required>
                  <InputLabel>Protocole</InputLabel>
                  <Select
                    value={formData.studyId}
                    label="Protocole"
                    onChange={(e) => handleChange('studyId')(e as { target: { value: unknown } })}
                  >
                    {studies.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.codeInternal} - {s.title.length > 40 ? s.title.substring(0, 40) + '...' : s.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                <FormControl fullWidth required disabled={!formData.studyId}>
                  <InputLabel>Medicament</InputLabel>
                  <Select
                    value={formData.medicationId}
                    label="Medicament"
                    onChange={(e) => handleChange('medicationId')(e as { target: { value: unknown } })}
                  >
                    {medications.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.code} - {m.name.length > 40 ? m.name.substring(0, 40) + '...' : m.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required disabled={!formData.medicationId}>
                  <InputLabel>Lot</InputLabel>
                  <Select
                    value={formData.stockItemId}
                    label="Lot"
                    onChange={(e) => handleChange('stockItemId')(e as { target: { value: unknown } })}
                  >
                    {stockItems.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.batchNumber} - Qty: {s.currentQuantity}
                        {s.storageLocation && ` (${s.storageLocation})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Quantite a transferer"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange('quantity')}
                  required
                  inputProps={{ min: 1, max: selectedStock?.currentQuantity || undefined }}
                  helperText={selectedStock ? `Maximum disponible: ${selectedStock.currentQuantity}` : ''}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Emplacement source"
                  value={formData.transferFromLocation}
                  onChange={handleChange('transferFromLocation')}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Emplacement destination"
                  value={formData.transferToLocation}
                  onChange={handleChange('transferToLocation')}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Date du transfert"
                  type="date"
                  value={formData.movementDate}
                  onChange={handleChange('movementDate')}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <Button onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Transferer'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
