'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useToast } from '@/contexts/ToastContext';

interface DownloadPdfButtonProps {
  studyId: string;
  codeInternal: string;
}

export default function DownloadPdfButton({ studyId, codeInternal }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showInfo, showSuccess, showError } = useToast();

  const handleDownload = async () => {
    setLoading(true);
    showInfo('Generation du PDF en cours...');

    try {
      const response = await fetch(`/api/studies/${studyId}/pdf`);

      if (!response.ok) {
        throw new Error('Erreur lors de la generation du PDF');
      }

      const blob = await response.blob();
      const filename = `protocole_${codeInternal.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('PDF telecharge avec succes');
    } catch {
      showError('Erreur lors de la generation du PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={loading ? <CircularProgress size={18} /> : <PictureAsPdfIcon />}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? 'Generation...' : 'Generer PDF'}
    </Button>
  );
}
