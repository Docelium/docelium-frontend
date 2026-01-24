'use client';

import { useRouter } from 'next/navigation';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { MedicationType, DosageForm, StorageCondition } from '@prisma/client';

const typeLabels: Record<MedicationType, string> = {
  IMP: 'IMP',
  NIMP: 'NIMP',
};

const typeColors: Record<MedicationType, 'primary' | 'secondary'> = {
  IMP: 'primary',
  NIMP: 'secondary',
};

const dosageFormLabels: Record<DosageForm, string> = {
  TABLET: 'Comprime',
  CAPSULE: 'Gelule',
  INJECTION: 'Injection',
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

const storageLabels: Record<StorageCondition, string> = {
  ROOM_TEMPERATURE: 'Temperature ambiante',
  REFRIGERATED: 'Refrigere (2-8C)',
  FROZEN: 'Congele',
  CONTROLLED_ROOM_TEMPERATURE: 'Temperature controlee',
  PROTECT_FROM_LIGHT: 'Proteger de la lumiere',
  OTHER: 'Autre',
};

interface MedicationTableRowProps {
  medication: {
    id: string;
    code: string;
    name: string;
    type: MedicationType;
    dosageForm: DosageForm;
    strength: string | null;
    storageCondition: StorageCondition;
    _count: {
      stockItems: number;
      movements: number;
    };
  };
  studyId: string;
}

export default function MedicationTableRow({ medication, studyId }: MedicationTableRowProps) {
  const router = useRouter();

  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={() => router.push(`/studies/${studyId}/medications/${medication.id}`)}
    >
      <TableCell>
        <Typography variant="body2" fontWeight="bold">
          {medication.code}
        </Typography>
      </TableCell>
      <TableCell>{medication.name}</TableCell>
      <TableCell>
        <Chip
          label={typeLabels[medication.type]}
          color={typeColors[medication.type]}
          size="small"
        />
      </TableCell>
      <TableCell>{dosageFormLabels[medication.dosageForm]}</TableCell>
      <TableCell>{medication.strength || '-'}</TableCell>
      <TableCell>
        <Chip label={storageLabels[medication.storageCondition]} size="small" variant="outlined" />
      </TableCell>
      <TableCell>{medication._count.stockItems}</TableCell>
      <TableCell>{medication._count.movements}</TableCell>
    </TableRow>
  );
}
