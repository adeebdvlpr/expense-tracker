import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as LandingArt } from '../animations/Landing-Page-Animaton.svg';
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
  alpha,
  Tabs,
  Tab,
} from '@mui/material';



const BrandMark = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <img src="/Ledgic.png" alt="Ledgic logo" style={{ width: 138, height: 'auto' }} />
  </Box>
);

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const FEATURE_CARDS = [
  {
    title: 'Your financial audit. On demand.',
    body: 'The kind of complete read on your finances that used to require sitting down with an accountant. Available the moment you need it.',
  },
  {
    title: 'Plan for what\'s actually coming.',
    body: 'Baby, home purchase, retirement, relocation! Log the life event and see the real projected cost before it arrives.',
  },
  {
    title: 'Your stuff is costing you money. Know exactly how much.',
    body: 'Depreciation, warranty timelines, replacement years — your assets are tracked and modeled automatically.',
  },
  {
    title: 'Nothing slips through.',
    body: 'Every subscription, recurring bill, and repeating charge is logged, categorized, and surfaced. No more forgotten charges.',
  },
  {
    title: 'A framework for every dollar.',
    body: 'See in real time whether your spending aligns with how you actually want to live — needs, wants, and savings in balance.',
  },
  {
    title: 'Goals built around your real life.',
    body: 'Not generic targets. Savings goals derived from your actual situation, assets, upcoming expenses, and life plans.',
  },
  {
    title: 'Built around how you actually spend.',
    body: 'Create your own spending categories — the platform automatically maps them into your financial framework. No rigid lists. No manual sorting. Your money, organized your way.',
  },
];

const UNDER_THE_HOOD_CARDS = [
  {
    title: 'Every prediction is auditable',
    body: 'Each AI-generated projection stores its full reasoning chain — so nothing is a black box.',
  },
  {
    title: 'Location-aware by design',
    body: 'Projections are calibrated to regional cost-of-living data. Your city matters.',
  },
  {
    title: 'Sessions that don\'t expire on you',
    body: 'Dual-token architecture with silent refresh. Stay in your flow — no mid-session logouts.',
  },
  {
    title: 'Rate-limited and hardened',
    body: 'Every sensitive route is rate-limited, Helmet-secured, and logged with correlation IDs. Security is structural, not bolted on.',
  },
  {
    title: 'Risk-rated, not just projected',
    body: 'Predictions aren\'t just numbers — each one carries a risk rating and opportunity cost narrative, so you understand what inaction means.',
  },
];

const SCREENSHOT_TABS = [
  { label: 'Dashboard', width: 900, height: 560 },
  { label: 'Financial Advisory', width: 900, height: 560 },
  { label: 'Goals', width: 900, height: 560 },
  { label: 'Assets', width: 900, height: 560 },
];

const MarketingLandingPage = () => {
  const navigate = useNavigate();
  const [screenshotTab, setScreenshotTab] = React.useState(0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Nav */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={(theme) => ({
            backgroundColor: alpha(theme.palette.background.default, 0.7),
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <BrandMark />

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="text"
                onClick={() => scrollTo('under-the-hood')}
                sx={{ color: 'text.secondary', fontWeight: 400 }}
              >
                Under the Hood
              </Button>
              <Button variant="contained" onClick={() => navigate('/auth')}>
                Sign in
              </Button>
              <Button variant="contained" onClick={() => navigate('/auth?tab=register')}>
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
            <Typography variant="h1" sx={{ fontWeight: 900, letterSpacing: -1, mb: 1.5 }}>
              Your finances, finally understood.
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 2, maxWidth: 520, fontWeight: 400, fontStyle: 'italic', color: 'text.secondary' }}
            >
              The advisor that tracks every variable — assets, life events, goals, spending, economic pressure — so you always know what's coming.
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
              Ledgic connects your spending, assets, savings goals, and life plans — then runs them through a purpose-built financial intelligence engine, augmented with large language model reasoning, to tell you exactly what it all means and what's coming next.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
              <Button size="large" variant="contained" onClick={() => navigate('/auth?tab=register')}>
                Create account
              </Button>
              <Button size="large" variant="outlined" onClick={() => navigate('/auth')}>
                Sign in
              </Button>
            </Stack>

            <Button
              variant="text"
              onClick={() => scrollTo('how-it-works')}
              sx={{ color: 'text.secondary', fontWeight: 400, px: 0 }}
            >
              See how it works ↓
            </Button>
          </Grid>

          {/* Floating graphic area */}
          <Grid size={{xs: 12,  md: 6}}>
            <Box
                sx={{
                    width: '100%',
                    display: 'grid',
                    placeItems: { xs: 'center', md: 'end' },

                    '@keyframes phoneBob': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                    '100%': { transform: 'translateY(0px)' },
                    },

                    '& #Update-Phone-base': {
                    animation: 'phoneBob 2.8s ease-in-out infinite',
                    transformOrigin: 'center',
                    transformBox: 'fill-box',
                    },
                }}
                >
                <Box sx={{ width: '100%', maxWidth: 620 }}>
                    <LandingArt style={{ width: '100%', height: 'auto', display: 'block' }} />
                </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Trust Strip */}
      <Box
        sx={(theme) => ({
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 1.5,
        })}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Google OAuth. HttpOnly tokens. Rate-limited auth. Your data never leaves your account.
          </Typography>
        </Container>
      </Box>

      {/* How It Works */}
      <Container maxWidth="lg" id="how-it-works" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 5 }}>
          How it works
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              step: '01',
              title: 'Connect your complete financial picture',
              body: 'Add expenses, income, assets, and life events. The more context Ledgic has, the more precise its understanding of your situation.',
            },
            {
              step: '02',
              title: 'Get your complete financial picture',
              body: 'Ledgic analyzes everything and surfaces risks, opportunities, and forward-looking projections — grounded in your actual data, reasoned with large language model intelligence.',
            },
            {
              step: '03',
              title: 'Act with confidence',
              body: 'Your advisor generates savings targets and goals built around your real situation — not generic advice. The kind of clarity that used to require a personal accounting firm. All of it private, all of it yours.',
            },
          ].map((s) => (
            <Grid key={s.step} item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography
                  variant="h1"
                  sx={{ fontWeight: 900, color: 'primary.main', opacity: 0.25, mb: 1.5, lineHeight: 1 }}
                >
                  {s.step}
                </Typography>
                <Typography variant="h3" sx={{ mb: 0.75 }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.body}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Feature Cards */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={2}>
          {FEATURE_CARDS.map((f) => (
            <Grid key={f.title} item xs={12} sm={6} md={4}>
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
      </Container>

      {/* Demo Screenshots */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
          See it in action
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Tabs
            value={screenshotTab}
            onChange={(_, v) => setScreenshotTab(v)}
            sx={{ mb: 3, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
          >
            {SCREENSHOT_TABS.map((t) => (
              <Tab key={t.label} label={t.label} />
            ))}
          </Tabs>
          {SCREENSHOT_TABS.map((t, i) => (
            <Box
              key={t.label}
              role="tabpanel"
              hidden={screenshotTab !== i}
            >
              {screenshotTab === i && (
                <Box
                  sx={(theme) => ({
                    width: '100%',
                    aspectRatio: `${t.width} / ${t.height}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  })}
                >
                  <Typography variant="h3" color="text.disabled">
                    {t.label}
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    {t.width} × {t.height} — drop screenshot at client/src/assets/screenshots/{t.label.toLowerCase().replace(/ /g, '-')}.png
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      </Container>

      {/* Under the Hood */}
      <Container maxWidth="lg" id="under-the-hood" sx={{ pb: 8 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Under the Hood
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Built to the standard of tools you'd pay a firm to use.
        </Typography>
        <Grid container spacing={2}>
          {UNDER_THE_HOOD_CARDS.map((c) => (
            <Grid key={c.title} item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="h3" sx={{ mb: 0.75 }}>
                  {c.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.body}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Box sx={{ pt: 3, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Ledgic
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MarketingLandingPage;
