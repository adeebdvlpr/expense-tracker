import React from 'react';
import { Box } from '@mui/material';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

const AppLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <AppFooter />
    </Box>
  );
};

export default AppLayout;
