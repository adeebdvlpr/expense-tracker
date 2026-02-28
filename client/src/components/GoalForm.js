import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR'];
const STATUSES = ['active', 'completed', 'archived'];

const EMPTY_FORM = {
  name: '',
  targetAmount: '',
  currentAmount: '',
  targetDate: '',
  notes: '',
  currency: 'USD',
  status: 'active',
};

const GoalForm = ({ open, onClose, onSave, goal = null }) => {
  const isEdit = Boolean(goal);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (open) {
      setApiError('');
      setErrors({});
      if (goal) {
        setForm({
          name: goal.name || '',
          targetAmount: goal.targetAmount != null ? String(goal.targetAmount) : '',
          currentAmount: goal.currentAmount != null ? String(goal.currentAmount) : '0',
          targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : '',
          notes: goal.notes || '',
          currency: goal.currency || 'USD',
          status: goal.status || 'active',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, goal]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (form.name.length > 60) errs.name = 'Name must be 60 characters or fewer.';
    if (form.targetAmount === '' || isNaN(Number(form.targetAmount)) || Number(form.targetAmount) < 0)
      errs.targetAmount = 'Target amount must be a number ≥ 0.';
    if (form.currentAmount !== '' && (isNaN(Number(form.currentAmount)) || Number(form.currentAmount) < 0))
      errs.currentAmount = 'Current amount must be a number ≥ 0.';
    if (form.notes && form.notes.length > 300)
      errs.notes = 'Notes must be 300 characters or fewer.';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSaving(true);
    setApiError('');

    try {
      const payload = {
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        currentAmount: form.currentAmount === '' ? 0 : Number(form.currentAmount),
        currency: form.currency || 'USD',
      };
      if (form.targetDate) payload.targetDate = form.targetDate;
      if (form.notes.trim()) payload.notes = form.notes.trim();
      if (isEdit) payload.status = form.status;

      await onSave(payload);
      onClose();
    } catch (e) {
      setApiError(e?.response?.data?.message || e.message || 'Failed to save goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
      <DialogContent>
        {apiError && <Alert severity="error" sx={{ mb: 1 }}>{apiError}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <TextField
            label="Goal name"
            value={form.name}
            onChange={set('name')}
            inputProps={{ maxLength: 60 }}
            error={Boolean(errors.name)}
            helperText={errors.name || `${form.name.length}/60`}
            required
          />

          <TextField
            label="Target amount"
            type="number"
            value={form.targetAmount}
            onChange={set('targetAmount')}
            inputProps={{ min: 0, step: '0.01' }}
            error={Boolean(errors.targetAmount)}
            helperText={errors.targetAmount}
            required
          />

          <TextField
            label="Current amount"
            type="number"
            value={form.currentAmount}
            onChange={set('currentAmount')}
            inputProps={{ min: 0, step: '0.01' }}
            error={Boolean(errors.currentAmount)}
            helperText={errors.currentAmount || 'How much you have saved so far'}
          />

          <TextField
            label="Target date"
            type="date"
            value={form.targetDate}
            onChange={set('targetDate')}
            InputLabelProps={{ shrink: true }}
            helperText="Optional"
          />

          <TextField
            label="Notes"
            value={form.notes}
            onChange={set('notes')}
            multiline
            rows={2}
            inputProps={{ maxLength: 300 }}
            error={Boolean(errors.notes)}
            helperText={errors.notes || `${form.notes.length}/300 — optional`}
          />

          <TextField
            select
            label="Currency"
            value={form.currency}
            onChange={set('currency')}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>

          {isEdit && (
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={set('status')}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
              ))}
            </TextField>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalForm;
