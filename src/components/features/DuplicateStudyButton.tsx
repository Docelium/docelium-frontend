'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useToast } from '@/contexts/ToastContext';

interface DuplicateStudyButtonProps {
  studyId: string;
  codeInternal: string;
  iconOnly?: boolean;
}

export default function DuplicateStudyButton({ studyId, codeInternal, iconOnly = false }: DuplicateStudyButtonProps) {
  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState(`${codeInternal}_COPIE`);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showInfo, showSuccess, showError } = useToast();

  const handleOpen = () => {
    setNewCode(`${codeInternal}_COPIE`);
    setOpen(true);
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
    }
  };

  const handleDuplicate = async () => {
    if (!newCode.trim()) return;

    setLoading(true);
    showInfo('Duplication du protocole en cours...');

    try {
      const response = await fetch(`/api/studies/${studyId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeInternal: newCode.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la duplication');
      }

      const { data } = await response.json();
      showSuccess('Protocole duplique avec succes');
      setOpen(false);
      router.push(`/studies/${data.id}/edit`);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erreur lors de la duplication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {iconOnly ? (
        <Tooltip title="Dupliquer">
          <IconButton size="small" onClick={handleOpen}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={handleOpen}
        >
          Dupliquer
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Dupliquer le protocole</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Code interne du nouveau protocole"
            fullWidth
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            disabled={loading}
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleDuplicate}
            variant="contained"
            disabled={loading || !newCode.trim()}
            startIcon={loading ? <CircularProgress size={18} /> : <ContentCopyIcon />}
          >
            {loading ? 'Duplication...' : 'Dupliquer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
