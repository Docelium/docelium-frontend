import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import NavigationProgress from '@/components/layout/NavigationProgress';
import SessionProvider from '@/components/providers/SessionProvider';
import { ToastProvider } from '@/contexts/ToastContext';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <SessionProvider>
      <ToastProvider>
        <Suspense>
          <NavigationProgress />
        </Suspense>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Header userName={session.user.name} userRole={session.user.role} />
          <Sidebar userRole={session.user.role} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              minHeight: '100vh',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            <Toolbar />
            <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>{children}</Box>
          </Box>
        </Box>
      </ToastProvider>
    </SessionProvider>
  );
}
