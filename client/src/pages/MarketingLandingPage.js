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
  useTheme,
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
    body: 'The kind of complete read on your finances that used to require sitting down with an accountant — available the moment you need it.',
    accent: true,
    fullWidth: true,
  },
  {
    title: "Plan for what's actually coming.",
    body: 'Baby, home purchase, retirement, relocation — log the life event and see the real projected cost before it arrives.',
    accent: true,
    fullWidth: false,
  },
  {
    title: 'Your stuff is costing you money. Know exactly how much.',
    body: 'Depreciation, warranty timelines, replacement years — your assets are tracked and modeled automatically.',
    accent: false,
    fullWidth: false,
  },
  {
    title: 'Nothing slips through.',
    body: 'Every subscription, recurring bill, and repeating charge is logged, categorized, and surfaced. No more forgotten charges.',
    accent: false,
    fullWidth: false,
  },
  {
    title: 'A framework for every dollar.',
    body: 'See in real time whether your spending aligns with how you actually want to live — needs, wants, and savings in balance.',
    accent: false,
    fullWidth: false,
  },
  {
    title: 'Built around how you actually spend.',
    body: 'Create your own spending categories — the platform automatically maps them into your financial framework. No rigid lists. No manual sorting. Your money, organized your way.',
    accent: true,
    fullWidth: false,
  },
  {
    title: 'Goals built around your real life.',
    body: 'Not generic targets. Savings goals derived from your actual situation, assets, upcoming expenses, and life plans.',
    accent: false,
    fullWidth: false,
  },
];

const UNDER_THE_HOOD_CARDS = [
  {
    title: 'Every prediction is auditable',
    body: 'Each projection stores its full reasoning chain — so nothing is a black box.',
  },
  {
    title: 'Location-aware by design',
    body: 'Projections are calibrated to regional cost-of-living data. Your city matters.',
  },
  {
    title: "Sessions that don't expire on you",
    body: 'Dual-token architecture with silent refresh. Stay in your flow — no mid-session logouts.',
  },
  {
    title: 'Rate-limited and hardened',
    body: 'Every sensitive route is rate-limited, Helmet-secured, and logged with correlation IDs. Security is structural, not bolted on.',
  },
  {
    title: 'Risk-rated, not just projected',
    body: "Predictions aren't just numbers — each one carries a risk rating and opportunity cost narrative, so you understand what inaction means.",
  },
];

const SCREENSHOT_TABS = [
  { label: 'Dashboard', width: 900, height: 560 },
  { label: 'Financial Advisory', width: 900, height: 560 },
  { label: 'Goals', width: 900, height: 560 },
  { label: 'Assets', width: 900, height: 560 },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Connect your complete financial picture',
    body: 'Add expenses, income, assets, and life events. The more context Ledgic has, the more precise its understanding of your situation.',
  },
  {
    step: '02',
    title: 'Get your financial picture',
    body: 'Ledgic analyzes everything and surfaces risks, opportunities, and forward-looking projections — grounded in your actual data, reasoned with large language model intelligence.',
  },
  {
    step: '03',
    title: 'Act with confidence',
    body: 'Your advisor generates savings targets and goals built around your real situation — not generic advice. The kind of clarity that used to require a personal accounting firm. All of it private, all of it yours.',
  },
];

const MarketingLandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [screenshotTab, setScreenshotTab] = React.useState(0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Nav */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={(t) => ({
          backgroundColor: alpha(t.palette.background.default, 0.7),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${t.palette.divider}`,
        })}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <BrandMark />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Desktop only: Under the Hood + first pipe */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, cursor: 'pointer', color: 'text.primary' }}
                  onClick={() => scrollTo('under-the-hood')}
                >
                  Under the Hood
                </Typography>
                <Typography sx={{ mx: 1.5, color: 'text.disabled', userSelect: 'none' }}>|</Typography>
              </Box>

              {/* Sign in — visible on all breakpoints */}
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, cursor: 'pointer', color: 'text.primary' }}
                onClick={() => navigate('/auth')}
              >
                Sign in
              </Typography>

              {/* Desktop only: second pipe */}
              <Typography
                sx={{ mx: 1.5, color: 'text.disabled', userSelect: 'none', display: { xs: 'none', md: 'block' } }}
              >
                |
              </Typography>

              {/* Get started — always visible, retains button appearance */}
              <Button
                variant="contained"
                onClick={() => navigate('/auth?tab=register')}
                sx={{ ml: { xs: 2, md: 0 } }}
              >
                Get started
              </Button>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h1" sx={{ fontWeight: 900, letterSpacing: -1, mb: 1.5 }}>
              <Box component="span">Your finances, </Box>
              <Box component="span" sx={{ color: 'primary.main' }}>finally understood.</Box>
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

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 0 }}>
              <Button size="large" variant="contained" onClick={() => navigate('/auth?tab=register')}>
                Create account
              </Button>
              <Button size="large" variant="outlined" onClick={() => navigate('/auth')}>
                Sign in
              </Button>
            </Stack>

            <Typography
              variant="body2"
              onClick={() => scrollTo('how-it-works')}
              sx={{
                color: 'text.secondary',
                cursor: 'pointer',
                mt: 1.5,
                display: 'inline-block',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              See how it works ↓
            </Typography>
          </Grid>

          {/* Floating graphic area */}
          <Grid size={{ xs: 12, md: 6 }}>
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
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 2,
          px: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          Google OAuth. HttpOnly tokens. Rate-limited auth. Your data never leaves your account.
        </Typography>
      </Box>

      {/* How It Works */}
      <Container maxWidth="lg" id="how-it-works" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 5 }}>
          How it works
        </Typography>

        {/* Desktop: flex row with › connectors */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'stretch' }}>
          {HOW_IT_WORKS_STEPS.map((s, idx) => (
            <React.Fragment key={s.step}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  flex: 1,
                  borderRadius: '14px',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: alpha(theme.palette.primary.main, 0.18),
                    mb: 1.5,
                    lineHeight: 1,
                  }}
                >
                  {s.step}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75 }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.body}
                </Typography>
              </Paper>
              {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Typography sx={{ color: 'text.disabled', fontSize: '1.5rem', lineHeight: 1 }}>›</Typography>
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Mobile: stacked column */}
        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
          {HOW_IT_WORKS_STEPS.map((s) => (
            <Paper
              key={s.step}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '14px',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: alpha(theme.palette.primary.main, 0.18),
                  mb: 1.5,
                  lineHeight: 1,
                }}
              >
                {s.step}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75 }}>
                {s.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {s.body}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Container>

      {/* Feature Cards */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={2}>
          {FEATURE_CARDS.map((f) => (
            <Grid key={f.title} item xs={12} sm={f.fullWidth ? 12 : 6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '14px',
                  ...(f.accent
                    ? { bgcolor: 'primary.main' }
                    : {
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                      }),
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 0.75,
                    color: f.accent ? '#ffffff' : 'text.primary',
                  }}
                >
                  {f.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: f.accent ? alpha('#ffffff', 0.82) : 'text.secondary' }}
                >
                  {f.body}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* See It In Action */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          See it in action
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          A platform built for depth, not just tracking.
        </Typography>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '14px',
            border: `1px solid ${theme.palette.divider}`,
            p: 3,
          }}
        >
          <Tabs
            value={screenshotTab}
            onChange={(_, v) => setScreenshotTab(v)}
            TabIndicatorProps={{ style: { backgroundColor: theme.palette.primary.main } }}
            sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            {SCREENSHOT_TABS.map((t) => (
              <Tab
                key={t.label}
                label={t.label}
                sx={{ '&.Mui-selected': { color: 'primary.main' } }}
              />
            ))}
          </Tabs>
          {SCREENSHOT_TABS.map((t, i) => (
            <Box key={t.label} role="tabpanel" hidden={screenshotTab !== i}>
              {screenshotTab === i && (
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: `${t.width} / ${t.height}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="h6" color="text.disabled">
                    {t.label}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {t.width} × {t.height} — drop screenshot at client/src/assets/screenshots/{t.label.toLowerCase().replace(/ /g, '-')}.png
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      </Container>

      {/* Under the Hood */}
      <Box
        id="under-the-hood"
        sx={{
          bgcolor: theme.palette.secondary.main,
          py: 8,
          px: { xs: 3, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff', mb: 1 }}>
            Under the Hood
          </Typography>
          <Typography variant="body1" sx={{ color: alpha('#ffffff', 0.65), mb: 4 }}>
            Built to the standard of tools you'd pay a firm to use.
          </Typography>
          <Grid container spacing={2}>
            {UNDER_THE_HOOD_CARDS.map((c, idx) => (
              <Grid key={c.title} item xs={12} sm={idx < 4 ? 6 : 12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: '14px',
                    bgcolor: alpha('#ffffff', 0.07),
                    border: `1px solid ${alpha('#ffffff', 0.12)}`,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.75 }}>
                    {c.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.70) }}>
                    {c.body}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

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
