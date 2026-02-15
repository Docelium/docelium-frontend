import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ScienceIcon from '@mui/icons-material/Science';
import MedicationIcon from '@mui/icons-material/Medication';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InventoryIcon from '@mui/icons-material/Inventory';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch statistics
  const [studyCount, medicationCount, movementCount, stockItemCount] = await Promise.all([
    prisma.study.count({ where: { isActive: true } }),
    prisma.medication.count({ where: { status: { not: 'WITHDRAWN' } } }),
    prisma.movement.count(),
    prisma.stockItem.count({ where: { status: 'AVAILABLE' } }),
  ]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Bienvenue, {session?.user?.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Protocoles actifs"
            value={studyCount}
            icon={<ScienceIcon sx={{ color: 'white' }} />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Medicaments"
            value={medicationCount}
            icon={<MedicationIcon sx={{ color: 'white' }} />}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Mouvements"
            value={movementCount}
            icon={<SwapHorizIcon sx={{ color: 'white' }} />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Articles en stock"
            value={stockItemCount}
            icon={<InventoryIcon sx={{ color: 'white' }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
