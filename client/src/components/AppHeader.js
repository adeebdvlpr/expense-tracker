import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme, alpha } from '@mui/material/styles';
import NotificationBell from './NotificationBell';
import { logout } from '../utils/api';

const NAV_TABS = [
  { label: 'Dashboard', path: '/app' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Goals', path: '/goals' },
  { label: 'Recurring', path: '/recurring' },
  { label: 'Assets', path: '/assets' },
  { label: 'Life Events', path: '/life-events' },
  { label: 'Advisory', path: '/predictions' },
  { label: 'Account', path: '/account' },
];

const AppHeader = ({ tourActive = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(); // clears HttpOnly cookies on the server
    } catch {
      // server unreachable — proceed anyway, cookies will expire naturally
    }
    window.location.assign('/');
  };

  // Find current tab index; -1 if no match (falls back gracefully)
  const activeTabIndex = NAV_TABS.findIndex((t) => t.path === location.pathname);

  const handleTabChange = (_, newIndex) => {
    navigate(NAV_TABS[newIndex].path);
  };

  const handleDrawerNav = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => navigate('/app')}
          >
            <img src="/Ledgic.png" alt="Ledgic" style={{ width: 138, height: 'auto' }} />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav tabs */}
          {!isMobile && (
            <Tabs
              value={activeTabIndex === -1 ? false : activeTabIndex}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ '& .MuiTab-root': { fontWeight: 600, minWidth: 80 } }}
            >
              {NAV_TABS.map((tab, i) => (
                <Tab
                  key={tab.path}
                  label={tab.label}
                  sx={
                    tourActive && i === activeTabIndex
                      ? {
                          '@keyframes tourTabPulse': {
                            '0%, 100%': { boxShadow: 'none' },
                            '50%': {
                              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.32)}`,
                            },
                          },
                          animation: 'tourTabPulse 1.8s ease-in-out infinite',
                          borderRadius: '8px',
                        }
                      : undefined
                  }
                />
              ))}
            </Tabs>
          )}

          {/* Desktop notification bell */}
          {!isMobile && <NotificationBell />}

          {/* Desktop logout */}
          {!isMobile && (
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} size="small">
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                  <LogoutIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </IconButton>
            </Tooltip>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(true)} size="small" aria-label="Open navigation menu">
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240, pt: 2 }} role="presentation">
          <Box sx={{ px: 2, pb: 1 }}>
            <img src="/Ledgic.png" alt="Ledgic" style={{ width: 120, height: 'auto' }} />
          </Box>
          <Divider />
          <List>
            {NAV_TABS.map((tab) => (
              <ListItem key={tab.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === tab.path}
                  onClick={() => handleDrawerNav(tab.path)}
                >
                  <ListItemText primary={tab.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem sx={{ justifyContent: 'center', py: 1 }}>
              <NotificationBell />
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default AppHeader;
