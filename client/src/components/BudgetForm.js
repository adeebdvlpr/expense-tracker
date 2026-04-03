import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { CATEGORIES } from '../constants/categories';

const EMPTY_FORM = { period: '', category: '', amount: '' };

/**
 * BudgetForm — MUI Dialog for adding or editing a budget entry.
 *
 * Props:
 *   open          {bool}          — controls Dialog visibility
 *   onClose       {func}          — called when cancelled or closed
 *   onSave        {func}          — called with { period, category, amount }
 *   budget        {object|null}   — null = Add mode, object = Edit mode
 *   defaultPeriod {string}        — YYYY-MM, initial period value in Add mode
 */
export default function BudgetForm({ open, onClose, onSave, budget = null, defaultPeriod = '' }) {
  const isEdit = Boolean(budget);

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset form state when dialog opens or budget changes
  useEffect(() => {
    if (open) {
      setTouched({});
      setSubmittedOnce(false);
      setSaving(false);
      if (budget) {
        setForm({
          period: budget.period || '',
          category: budget.category || '',
          amount: budget.amount != null ? String(budget.amount) : '',
        });
      } else {
        setForm({ period: defaultPeriod || '', category: '', amount: '' });
      }
    }
  }, [open, budget, defaultPeriod]);

  const amountNumber = useMemo(() => Number(form.amount), [form.amount]);

  const errors = useMemo(() => {
    const out = {};
    if (!isEdit && !form.period) out.period = 'Month is required.';
    if (!isEdit && !form.category) out.category = 'Category is required.';
    if (!form.amount || Number.isNaN(amountNumber) || amountNumber <= 0) {
      out.amount = 'Enter a valid amount greater than 0.';
    }
    return out;
  }, [isEdit, form.period, form.category, form.amount, amountNumber]);

  const showError = (field) => Boolean(errors[field] && (submittedOnce || touched[field]));

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async () => {
    setSubmittedOnce(true);
    if (Object.keys(errors).length) return;

    setSaving(true);
    try {
      await onSave({
        period: form.period,
        category: form.category,
        amount: Number(amountNumber.toFixed(2)),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '14px' } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? 'Edit Budget' : 'Add Budget'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, pt: 0.5 }}>
          {/* Period */}
          {isEdit ? (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Month</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.period}</Typography>
            </Box>
          ) : (
            <TextField
              label="Month"
              type="month"
              value={form.period}
              onChange={set('period')}
              onBlur={blur('period')}
              size="small"
              required
              error={showError('period')}
              helperText={showError('period') ? errors.period : ' '}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}

          {/* Category */}
          {isEdit ? (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Category</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.category}</Typography>
            </Box>
          ) : (
            <FormControl
              size="small"
              required
              error={showError('category')}
              fullWidth
              sx={{ mt: 1 }}
            >
              <InputLabel id="budget-form-category-label">Category</InputLabel>
              <Select
                labelId="budget-form-category-label"
                label="Category"
                value={form.category}
                onChange={set('category')}
                onBlur={blur('category')}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {showError('category') ? errors.category : ' '}
              </FormHelperText>
            </FormControl>
          )}

          {/* Amount */}
          <TextField
            label="Amount"
            type="number"
            value={form.amount}
            onChange={set('amount')}
            onBlur={blur('amount')}
            slotProps={{ input: { min: 0, step: '0.01' } }}
            size="small"
            required
            error={showError('amount')}
            helperText={showError('amount') ? errors.amount : ' '}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ mt: isEdit ? 0 : 0 }}
          />

          {!isEdit && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Tip: saving the same category again will overwrite that month's budget (upsert).
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Budget'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
