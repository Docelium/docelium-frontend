'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Chip from '@mui/material/Chip';
import { UserRole } from '@prisma/client';

interface HeaderProps {
  userName: string;
  userRole: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  PHARMACIEN: 'Pharmacien',
  TECHNICIEN: 'Technicien',
  ARC: 'ARC',
  AUDITOR: 'Auditeur',
};

const roleColors: Record<UserRole, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  ADMIN: 'primary',
  PHARMACIEN: 'secondary',
  TECHNICIEN: 'success',
  ARC: 'warning',
  AUDITOR: 'info',
};

export default function Header({ userName, userRole }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    signOut({ callbackUrl: '/login' });
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={roleLabels[userRole]}
            color={roleColors[userRole]}
            size="small"
            variant="outlined"
          />
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {userName}
          </Typography>
          <IconButton onClick={handleMenu} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {initials}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2">{userName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {roleLabels[userRole]}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Deconnexion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
