'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '@/contexts/ToastContext';

interface DeleteStudyButtonProps {
  studyId: string;
  codeInternal: string;
  iconOnly?: boolean;
}

export default function DeleteStudyButton({ studyId, codeInternal, iconOnly = false }: DeleteStudyButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/studies/${studyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      showSuccess(`Protocole ${codeInternal} supprime avec succes`);
      setOpen(false);
      router.push('/studies');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {iconOnly ? (
        <Tooltip title="Supprimer">
          <IconButton size="small" color="error" onClick={() => setOpen(true)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setOpen(true)}
        >
          Supprimer
        </Button>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Supprimer le protocole</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Etes-vous sur de vouloir supprimer le protocole <strong>{codeInternal}</strong> ?
            Cette action est irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : <DeleteIcon />}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
