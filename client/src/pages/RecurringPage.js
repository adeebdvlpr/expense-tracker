import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';

import {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  triggerRecurring,
} from '../utils/api';
import { formatMoney } from '../utils/money';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import AppLayout from '../components/AppLayout';

const INTERVALS = ['daily', 'weekly', 'monthly', 'annual'];

const INTERVAL_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  annual: 'Annual',
};

function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// ─── Add / Edit Dialog ────────────────────────────────────────────────────────

function RecurringForm({ open, onClose, onSave, payment }) {
  const isEdit = Boolean(payment);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [interval, setInterval] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // Reset form state whenever dialog opens or payment changes
  useEffect(() => {
    if (open) {
      setDescription(payment?.description ?? '');
      setAmount(payment?.amount != null ? String(payment.amount) : '');
      setCategory(payment?.category ?? '');
      setInterval(payment?.interval ?? 'monthly');
      setStartDate(
        payment?.startDate
          ? new Date(payment.startDate).toISOString().slice(0, 10)
          : ''
      );
      setEndDate(
        payment?.endDate
          ? new Date(payment.endDate).toISOString().slice(0, 10)
          : ''
      );
      setSaving(false);
      setSubmittedOnce(false);
    }
  }, [open, payment]);

  const errors = {
    description: !description.trim() ? 'Description is required.' : '',
    amount:
      !amount || isNaN(Number(amount)) || Number(amount) < 0
        ? 'Enter a valid amount (0 or greater).'
        : '',
    category: !category ? 'Category is required.' : '',
    interval: !interval ? 'Interval is required.' : '',
    startDate: !startDate ? 'Start date is required.' : '',
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittedOnce(true);
    if (hasErrors) return;

    setSaving(true);
    try {
      const payload = {
        description: description.trim(),
        amount: parseFloat(Number(amount).toFixed(2)),
        category,
        interval,
        startDate,
        endDate: endDate || null,
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  const showError = (field) => submittedOnce && Boolean(errors[field]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '14px' } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h3">{isEdit ? 'Edit Recurring Payment' : 'Add Recurring Payment'}</Typography>
        <IconButton onClick={onClose} size="small" edge="end" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          {/* Row 1: Amount + Category */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              size="small"
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              error={showError('amount')}
              helperText={showError('amount') ? errors.amount : ''}
              slotProps={{
                htmlInput: { min: 0, step: '0.01' },
                input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
              }}
              sx={{ flex: 1 }}
            />

            <FormControl size="small" required error={showError('category')} sx={{ flex: 1 }}>
              <InputLabel id="rec-category-label">Category</InputLabel>
              <Select
                labelId="rec-category-label"
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
              {showError('category') && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Row 2: Description */}
          <TextField
            size="small"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            error={showError('description')}
            helperText={showError('description') ? errors.description : ''}
          />

          {/* Row 3: Interval + Start Date */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FormControl size="small" required error={showError('interval')} sx={{ flex: 1 }}>
              <InputLabel id="rec-interval-label">Interval</InputLabel>
              <Select
                labelId="rec-interval-label"
                label="Interval"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              >
                {INTERVALS.map((i) => (
                  <MenuItem key={i} value={i}>{INTERVAL_LABELS[i]}</MenuItem>
                ))}
              </Select>
              {showError('interval') && (
                <FormHelperText>{errors.interval}</FormHelperText>
              )}
            </FormControl>

            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              error={showError('startDate')}
              helperText={showError('startDate') ? errors.startDate : ''}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Row 4: End Date (optional) */}
          <TextField
            size="small"
            label="End Date (optional)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="text" color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>
            {isEdit ? 'Save Changes' : 'Add Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ─── Payment Card ─────────────────────────────────────────────────────────────

function PaymentCard({ payment, currency, onEdit, onDelete, onTrigger }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '14px',
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        {/* Main info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="h3" noWrap sx={{ flex: 1, minWidth: 0 }}>
              {payment.description}
            </Typography>
            <Chip
              label={INTERVAL_LABELS[payment.interval]}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ flexShrink: 0 }}
            />
          </Stack>

          <Typography variant="body1" fontWeight={600} color="primary.main" sx={{ mb: 0.5 }}>
            {formatMoney(payment.amount, currency)}
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              {payment.category}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next: <strong>{formatDate(payment.nextDueDate)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last logged: {formatDate(payment.lastLoggedDate)}
            </Typography>
          </Stack>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title="Manually log this payment now">
            <IconButton size="small" color="success" onClick={() => onTrigger(payment)}>
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(payment)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete(payment)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecurringPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Inactive

  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const openSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Derive currency from user preferences; fall back to 'USD'
  const currency = 'USD';

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecurring();
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      openSnack('Failed to load recurring payments.', 'error');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const activePayments = payments.filter((p) => p.isActive);
  const inactivePayments = payments.filter((p) => !p.isActive);
  const displayed = activeTab === 0 ? activePayments : inactivePayments;

  const handleOpenAdd = () => {
    setEditingPayment(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (payment) => {
    setEditingPayment(payment);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingPayment(null);
  };

  const handleSave = async (payload) => {
    try {
      if (editingPayment) {
        const updated = await updateRecurring(editingPayment._id, payload);
        setPayments((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
        openSnack('Recurring payment updated.');
      } else {
        const created = await createRecurring(payload);
        setPayments((prev) => [...prev, created]);
        openSnack('Recurring payment added.');
      }
      handleCloseForm();
    } catch (err) {
      openSnack(
        err?.response?.data?.message || 'Failed to save recurring payment.',
        'error'
      );
      throw err; // keep dialog open on error
    }
  };

  const handleDelete = async (payment) => {
    try {
      await deleteRecurring(payment._id);
      setPayments((prev) => prev.filter((p) => p._id !== payment._id));
      openSnack('Recurring payment deleted.');
    } catch {
      openSnack('Failed to delete recurring payment.', 'error');
    }
  };

  const handleTrigger = async (payment) => {
    try {
      const result = await triggerRecurring(payment._id);
      setPayments((prev) =>
        prev.map((p) =>
          p._id === payment._id
            ? { ...p, nextDueDate: result.nextDueDate, lastLoggedDate: new Date().toISOString() }
            : p
        )
      );
      openSnack(`Logged "${payment.description}" and advanced next due date.`);
    } catch {
      openSnack('Failed to log recurring payment.', 'error');
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{fontWeight : 800}}>Recurring Payments</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage and auto-log your repeating expenses.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: '10px', flexShrink: 0 }}
          >
            Add Payment
          </Button>
        </Stack>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label={`Active (${activePayments.length})`} />
          <Tab label={`Inactive (${inactivePayments.length})`} />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : displayed.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '14px',
              textAlign: 'center',
              background: 'rgba(247, 249, 252, 0.9)',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {activeTab === 0
                ? 'No active recurring payments. Add one to get started.'
                : 'No inactive recurring payments.'}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {displayed.map((payment) => (
              <PaymentCard
                key={payment._id}
                payment={payment}
                currency={currency}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onTrigger={handleTrigger}
              />
            ))}
          </Stack>
        )}

      </Container>

      {/* Add / Edit Dialog */}
      <RecurringForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        payment={editingPayment}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
