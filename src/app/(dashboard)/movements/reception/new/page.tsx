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

export default function ReceptionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const canCreate = ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'].includes(session?.user?.role ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studies, setStudies] = useState<Study[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [formData, setFormData] = useState({
    studyId: '',
    medicationId: '',
    quantity: '',
    movementDate: new Date().toISOString().split('T')[0],
    batchNumber: '',
    expiryDate: '',
    supplierName: '',
    deliveryNoteNumber: '',
    storageLocation: '',
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
    } else {
      setMedications([]);
    }
  }, [formData.studyId]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
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
          type: 'RECEPTION',
          ...formData,
          quantity: parseInt(formData.quantity, 10),
          movementDate: formData.movementDate ? new Date(formData.movementDate) : new Date(),
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la creation');
      }

      router.push('/movements/reception');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

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
        Nouvelle reception
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enregistrer une reception de medicaments
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
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Numero de lot"
                  value={formData.batchNumber}
                  onChange={handleChange('batchNumber')}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Quantite"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange('quantity')}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <DateField
                  fullWidth
                  label="Date de reception"
                  value={formData.movementDate}
                  onChange={handleChange('movementDate')}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <DateField
                  fullWidth
                  label="Date d'expiration"
                  value={formData.expiryDate}
                  onChange={handleChange('expiryDate')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Fournisseur"
                  value={formData.supplierName}
                  onChange={handleChange('supplierName')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Numero de bon de livraison"
                  value={formData.deliveryNoteNumber}
                  onChange={handleChange('deliveryNoteNumber')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Emplacement de stockage"
                  value={formData.storageLocation}
                  onChange={handleChange('storageLocation')}
                  placeholder="Ex: Frigo A, Etagere 2"
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
                {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
