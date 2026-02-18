import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Paper,
  Grid,
  Chip,
} from '@mui/material';

const BrandMark = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <img src="/Ledgic.png" alt="Ledgic logo" style={{ width: 138, height: 'auto' }} />
    {/* <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
     
    </Typography> */}
  </Box>
);

const FloatingChip = ({ label, sx }) => (
  <Paper
    elevation={0}
    sx={{
      px: 1.5,
      py: 1,
      borderRadius: 999,
      border: (t) => `1px solid ${t.palette.divider}`,
      bgcolor: 'background.paper',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      ...sx,
    }}
  >
    <Chip size="small" label={label} variant="outlined" />
  </Paper>
);

const MarketingLandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Nav */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <BrandMark />

            <Stack direction="row" spacing={1} alignItems="center">
              <Button color="inherit" onClick={() => navigate('/auth')}>
                Sign in
              </Button>
              <Button variant="contained" onClick={() => navigate('/auth')}>
                Get started
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
        <Grid container spacing={{xs: 4, md: 6}} alignItems="center">
          <Grid size={{xs: 12,  md: 6}}> 
            <Typography variant="h1" sx={{ fontWeight: 900, letterSpacing: -1, mb: 2 }}>
              Spend with confidence.
              <Box component="span" sx={{ color: 'primary.main' }}>
                {' '}Track your money in minutes.
              </Box>
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
              Ledgic is a modern expense dashboard that turns everyday spending into clear insights:
              totals, category breakdowns, and simple trends — without the clutter.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
              <Button size="large" variant="contained" onClick={() => navigate('/auth')}>
                Create account
              </Button>
              <Button size="large" variant="outlined" onClick={() => navigate('/auth')}>
                Sign in
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Chip label="React + MUI" variant="outlined" />
              <Chip label="Node + Express" variant="outlined" />
              <Chip label="MongoDB" variant="outlined" />
            </Stack>
          </Grid>

          {/* Floating graphic area */}
          <Grid size={{xs: 12,  md: 6}}> 
            <Box
                sx={{
                    width: '100%',
                    display: 'grid',
                    placeItems: { xs: 'center', md: 'end' }, // right-align on desktop
                    animation: 'floatHero 6s ease-in-out infinite',
                    '@keyframes floatHero': {
                        '0%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-10px)' },
                        '100%': { transform: 'translateY(0px)' },
                    },
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 620 }}>
                    <img
                        src="/ledgic-hero4.svg"
                        alt="Ledgic dashboard preview"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={2}>
          {[
            {
              title: 'Add expenses quickly',
              body: 'A clean form with validation that stays out of your way.',
            },
            {
              title: 'See what changed',
              body: 'Recent expenses list with clear amounts + categories.',
            },
            {
              title: 'Understand categories',
              body: 'A polished chart view to spot trends at a glance.',
            },
          ].map((f) => (
            <Grid key={f.title} item xs={12} md={4}>
              <Paper sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="h3" sx={{ mb: 0.75 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.body}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 6, pt: 3, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Ledgic — built as a portfolio-grade expense platform.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MarketingLandingPage;
