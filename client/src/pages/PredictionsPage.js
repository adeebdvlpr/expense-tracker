import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppLayout from '../components/AppLayout';
import PredictionCard from '../components/PredictionCard';
import { predictions as predictionsApi, getMe } from '../utils/api';
import { formatMoney } from '../utils/money';

const RISK_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'low', label: 'Low Risk' },
];

const PredictionsPage = () => {
  const theme = useTheme();
  const [predictionsList, setPredictionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('all');
  const [userCurrency, setUserCurrency] = useState('USD');
  const [annualIncome, setAnnualIncome] = useState(null);

  useEffect(() => {
    Promise.all([
      predictionsApi.getAll(),
      getMe(),
    ])
      .then(([predsRes, user]) => {
        setPredictionsList(predsRes.data);
        if (user && user.currency) setUserCurrency(user.currency);
        if (user && user.monthlyIncome) setAnnualIncome(user.monthlyIncome * 12);
      })
      .catch((err) => console.error('Failed to load predictions:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (deletedId) => {
    setPredictionsList((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const filtered = useMemo(() => {
    if (riskFilter === 'all') return predictionsList;
    return predictionsList.filter((p) => p.riskRating === riskFilter);
  }, [predictionsList, riskFilter]);

  const totalBurden = useMemo(
    () => predictionsList.reduce((sum, p) => sum + (p.projectedCost || 0), 0),
    [predictionsList]
  );

  const burdenPct = annualIncome && annualIncome > 0
    ? ((totalBurden / annualIncome) * 100).toFixed(1)
    : null;

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h1" sx={{ mb: 0.5 }}>
          Financial Advisory
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          AI-powered advisory insights generated from your assets and life events.
        </Typography>

        {/* Global Advisory Summary — Sober Dashboard */}
        {!loading && predictionsList.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '14px',
              p: 3,
              mb: 3,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Projected Burden
              </Typography>
              <Typography variant="h2" color="primary.main" sx={{ mt: 0.25 }}>
                {formatMoney(totalBurden, userCurrency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                across {predictionsList.length} insight{predictionsList.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            {burdenPct !== null && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Burden vs. Annual Income
                </Typography>
                <Typography variant="h2" color={parseFloat(burdenPct) > 100 ? 'error.main' : 'text.primary'} sx={{ mt: 0.25 }}>
                  {burdenPct}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of your annual income ({formatMoney(annualIncome, userCurrency)})
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Risk Filter Bar */}
        {!loading && predictionsList.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={riskFilter}
              exclusive
              onChange={(_, val) => { if (val !== null) setRiskFilter(val); }}
              size="small"
            >
              {RISK_FILTERS.map(({ value, label }) => (
                <ToggleButton key={value} value={value} sx={{ textTransform: 'none', px: 2 }}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : predictionsList.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No advisory insights yet. Navigate to Assets or Life Events and click "Consult AI Advisor" to get started.
          </Typography>
        ) : filtered.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No insights match the selected risk filter.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p._id}>
                <PredictionCard prediction={p} onDelete={handleDelete} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </AppLayout>
  );
};

export default PredictionsPage;
