import React, { useEffect, useState } from 'react';
import { getMe, updateMe } from '../utils/api';
import {
  Container, Box, Typography, Alert, CircularProgress,
  TextField, MenuItem, Button, FormControlLabel, Switch, Divider,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';

import AppLayout from '../components/AppLayout';

const REASONS = ['Budgeting', 'Saving', 'Debt', 'Tracking', 'Other'];

const AccountPage = () => {
  const [profile, setProfile] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [reason, setReason] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [currency, setCurrency] = useState('USD');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [prefs, setPrefs] = useState({
    showExpenseChart: true,
    showBudgetWidget: true,
    showGoalsWidget: true,
    chartType: 'pie',
  });

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const me = await getMe();
        setProfile(me);

        setDateOfBirth(me?.dateOfBirth ? new Date(me.dateOfBirth).toISOString().slice(0, 10) : '');
        setReason(me?.reason || '');
        setMonthlyIncome(typeof me?.monthlyIncome === 'number' ? String(me.monthlyIncome) : (me?.monthlyIncome ? String(me.monthlyIncome) : ''));
        setCurrency(me?.currency || 'USD');
        setPrefs({
          showExpenseChart: me?.dashboardPrefs?.showExpenseChart ?? true,
          showBudgetWidget: me?.dashboardPrefs?.showBudgetWidget ?? true,
          showGoalsWidget: me?.dashboardPrefs?.showGoalsWidget ?? true,
          chartType: me?.dashboardPrefs?.chartType ?? 'pie',
        });
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        dateOfBirth: dateOfBirth || null,
        reason: reason || null,
        monthlyIncome: monthlyIncome === '' ? null : Number(monthlyIncome),
        currency: currency || 'USD',
        dashboardPrefs: prefs,
      };

      const updated = await updateMe(payload);
      setProfile(updated);
      setSuccess('Profile updated!');
    } catch (e) {
      const apiMsg = e.response?.data?.message;
      const fieldErrors = e.response?.data?.errors?.map(x => `${x.field}: ${x.message}`).join(' | ');
      setError(fieldErrors || apiMsg || e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="sm" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Account</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Username" value={profile?.username || ''} disabled />
          <TextField label="Email" value={profile?.email || ''} disabled />

          <TextField
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Optional"
          />

          <TextField
            select
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            helperText="Optional"
          >
            <MenuItem value="">(None)</MenuItem>
            {REASONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>

          <TextField
            label="Monthly income"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            type="number"
            inputProps={{ min: 0, step: '0.01' }}
            helperText="Optional — used for budgets & goals"
          />

          <TextField
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            helperText="3-letter code (e.g., USD)"
            inputProps={{ maxLength: 3 }}
          />

          <Divider sx={{ my: 1 }} />

          <Typography variant="h6">Dashboard widgets</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={prefs.showExpenseChart}
                onChange={(e) => setPrefs((p) => ({ ...p, showExpenseChart: e.target.checked }))}
              />
            }
            label="Spending breakdown chart"
          />
          <FormControlLabel
            control={
              <Switch
                checked={prefs.showBudgetWidget}
                onChange={(e) => setPrefs((p) => ({ ...p, showBudgetWidget: e.target.checked }))}
              />
            }
            label="Budget overview widget"
          />
          <FormControlLabel
            control={
              <Switch
                checked={prefs.showGoalsWidget}
                onChange={(e) => setPrefs((p) => ({ ...p, showGoalsWidget: e.target.checked }))}
              />
            }
            label="Goals widget"
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Chart type (spending breakdown)
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={prefs.chartType}
              exclusive
              onChange={(_e, val) => val && setPrefs((p) => ({ ...p, chartType: val }))}
            >
              <ToggleButton value="pie">Pie</ToggleButton>
              <ToggleButton value="bar">Bar</ToggleButton>
              <ToggleButton value="line">Line</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default AccountPage;
