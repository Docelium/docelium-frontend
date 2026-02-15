'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScienceIcon from '@mui/icons-material/Science';
import MedicationIcon from '@mui/icons-material/Medication';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import DeleteIcon from '@mui/icons-material/Delete';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { UserRole } from '@prisma/client';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

interface SidebarProps {
  userRole: UserRole;
}

interface NavItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Protocoles',
    path: '/studies',
    icon: <ScienceIcon />,
  },
  {
    title: 'Medicaments',
    path: '/medications',
    icon: <MedicationIcon />,
  },
  {
    title: 'Mouvements',
    icon: <SwapHorizIcon />,
    children: [
      {
        title: 'Tous les mouvements',
        path: '/movements',
        icon: <SwapHorizIcon />,
      },
      {
        title: 'Reception',
        path: '/movements/reception',
        icon: <LocalShippingIcon />,
        roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'],
      },
      {
        title: 'Dispensation',
        path: '/movements/dispensation',
        icon: <LocalPharmacyIcon />,
        roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'],
      },
      {
        title: 'Retour',
        path: '/movements/return',
        icon: <AssignmentReturnIcon />,
        roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'],
      },
      {
        title: 'Destruction',
        path: '/movements/destruction',
        icon: <DeleteIcon />,
        roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'],
      },
      {
        title: 'Transfert',
        path: '/movements/transfer',
        icon: <MoveUpIcon />,
        roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'],
      },
    ],
  },
  {
    title: 'Stock',
    path: '/stock',
    icon: <InventoryIcon />,
  },
  {
    title: 'Utilisateurs',
    path: '/users',
    icon: <PeopleIcon />,
    roles: ['ADMIN'],
  },
];

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Mouvements: true,
  });

  const handleToggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    // /studies/[id]/medications/... should match "Medicaments", not "Protocoles"
    if (path === '/studies' && pathname.includes('/medications')) return false;
    if (path === '/medications' && pathname.includes('/medications')) return true;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospitalIcon color="primary" />
            <Typography variant="h6" color="primary" fontWeight="bold">
              DOCELIUM
            </Typography>
          </Box>
        )}
        {collapsed && <LocalHospitalIcon color="primary" />}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      <List component="nav" sx={{ px: 1 }}>
        {filteredNavItems.map((item) => (
          <Box key={item.title}>
            {item.children ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleToggleMenu(item.title)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 40,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText primary={item.title} />
                        {openMenus[item.title] ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
                {!collapsed && (
                  <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.filter((child) => !child.roles || child.roles.includes(userRole)).map((child) => (
                        <ListItem key={child.title} disablePadding sx={{ pl: 2 }}>
                          <ListItemButton
                            component={Link}
                            href={child.path || '#'}
                            selected={isActive(child.path)}
                            sx={{
                              borderRadius: 1,
                              mb: 0.5,
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.title}
                              primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path || '#'}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.title} />}
                </ListItemButton>
              </ListItem>
            )}
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
