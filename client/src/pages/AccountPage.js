import React, { useContext, useEffect, useState, useMemo } from 'react';
import { getMe, updateMe } from '../utils/api';
import {
  Container, Box, Typography, Alert, CircularProgress,
  TextField, MenuItem, Button, FormControlLabel, Switch, Divider,
  ToggleButtonGroup, ToggleButton, Chip, Paper,
} from '@mui/material';

import AppLayout from '../components/AppLayout';
import { ThemeContext } from '../App';
import { THEMES } from '../theme';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const REASONS = ['Budgeting', 'Saving', 'Debt', 'Tracking', 'Other'];

const INCOME_TYPE_LABELS = {
  monthly: 'Monthly',
  annual: 'Annual',
  weekly: 'Weekly',
  rolling: 'Rolling Income 🌊',
};

const INCOME_AMOUNT_LABELS = {
  monthly: 'Monthly amount',
  annual: 'Annual salary',
  weekly: 'Weekly pay',
};

const AccountPage = () => {
  const { selectedTheme, setSelectedTheme } = useContext(ThemeContext);

  const [profile, setProfile] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [reason, setReason] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [incomeType, setIncomeType] = useState('monthly');
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

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
        setIncomeType(me?.incomeType || 'monthly');
        setCustomCategories(Array.isArray(me?.customCategories) ? me.customCategories : []);
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

  // Monthly equivalent preview
  const monthlyEquivalent = useMemo(() => {
    const val = Number(monthlyIncome);
    if (!val || incomeType === 'rolling') return null;
    if (incomeType === 'annual') return val / 12;
    if (incomeType === 'weekly') return (val * 52) / 12;
    return val; // monthly — same number, no preview needed
  }, [monthlyIncome, incomeType]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (DEFAULT_CATEGORIES.includes(trimmed)) return;
    if (customCategories.includes(trimmed)) return;
    setCustomCategories((prev) => [...prev, trimmed]);
    setNewCategory('');
  };

  const handleDeleteCategory = (cat) => {
    setCustomCategories((prev) => prev.filter((c) => c !== cat));
  };

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
        selectedTheme,
        customCategories,
        incomeType,
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
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            helperText="3-letter code (e.g., USD)"
            inputProps={{ maxLength: 3 }}
          />

          <Divider sx={{ my: 1 }} />

          {/* ── Dashboard widgets ── */}
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

          <Divider sx={{ my: 1 }} />

          {/* ── Theme Picker ── */}
          <Typography variant="h6">Theme</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {THEMES.map((t) => (
              <Box
                key={t.name}
                onClick={() => setSelectedTheme(t.name)}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1,
                  borderRadius: 2,
                  border: selectedTheme === t.name
                    ? `2px solid ${t.primary}`
                    : '2px solid transparent',
                  boxShadow: selectedTheme === t.name ? `0 0 0 2px ${t.primary}33` : 'none',
                  transition: 'border 150ms ease, box-shadow 150ms ease',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: t.primary,
                    border: '2px solid rgba(0,0,0,0.08)',
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', textAlign: 'center', maxWidth: 72 }}>
                  {t.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* ── Expense Categories ── */}
          <Typography variant="h6">Expense Categories</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {DEFAULT_CATEGORIES.map((cat) => (
              <Chip key={cat} label={cat} size="small" />
            ))}
            {customCategories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                onDelete={() => handleDeleteCategory(cat)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              label="New category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
              sx={{ flex: 1 }}
              margin="none"
            />
            <Button
              variant="outlined"
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
              sx={{ mt: 0, height: 40 }}
            >
              Add
            </Button>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* ── Income ── */}
          <Typography variant="h6">Income</Typography>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Income type
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={incomeType}
              exclusive
              onChange={(_e, val) => val && setIncomeType(val)}
            >
              <ToggleButton value="monthly">{INCOME_TYPE_LABELS.monthly}</ToggleButton>
              <ToggleButton value="annual">{INCOME_TYPE_LABELS.annual}</ToggleButton>
              <ToggleButton value="weekly">{INCOME_TYPE_LABELS.weekly}</ToggleButton>
              <ToggleButton value="rolling">{INCOME_TYPE_LABELS.rolling}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {incomeType === 'rolling' ? (
            <Typography variant="body2" color="text.secondary">
              Your income rolls in as it comes. Add income entries from the dashboard.
            </Typography>
          ) : (
            <Box>
              <TextField
                label={INCOME_AMOUNT_LABELS[incomeType] || 'Income amount'}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                helperText="Optional — used for budgets & goals"
                margin="none"
              />
              {incomeType !== 'monthly' && monthlyEquivalent != null && Number(monthlyIncome) > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyEquivalent)}/month
                </Typography>
              )}
            </Box>
          )}

          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default AccountPage;
