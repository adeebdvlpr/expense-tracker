import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, Stack, Divider } from '@mui/material';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/app' },
  { label: 'Budgets', to: '/budgets' },
  { label: 'Goals', to: '/goals' },
  { label: 'Account', to: '/account' },
];

const AppFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        py: 2.5,
        px: { xs: 2, sm: 4 },
        mt: 'auto',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Ledgic. All rights reserved.
        </Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              component={RouterLink}
              to={link.to}
              underline="hover"
              color="text.secondary"
              variant="body2"
            >
              {link.label}
            </Link>
          ))}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Link
            href="#about"
            underline="hover"
            color="text.secondary"
            variant="body2"
          >
            About Us
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AppFooter;
