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
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LIFE_EVENT_TYPES = [
  { value: 'pet',               label: 'Pet' },
  { value: 'college',           label: 'College / Education' },
  { value: 'vehicle_ownership', label: 'Vehicle Ownership' },
  { value: 'medical',           label: 'Medical' },
  { value: 'eldercare',         label: 'Eldercare' },
  { value: 'other',             label: 'Other' },
];

const CARE_LEVELS = [
  { value: 'in_home',          label: 'In-Home Care' },
  { value: 'assisted_living',  label: 'Assisted Living' },
  { value: 'memory_care',      label: 'Memory Care' },
];

const EMPTY_FORM = {
  name: '',
  type: '',
  isActive: true,
  // pet
  petName: '',
  species: '',
  age: '',
  estimatedMonthlyVetCost: '',
  // college
  studentName: '',
  institution: '',
  startYear: '',
  endYear: '',
  estimatedAnnualCost: '',
  // vehicle_ownership
  vehicleDescription: '',
  vehicleEstimatedAnnualCost: '',
  // medical
  condition: '',
  estimatedMonthlyCost: '',
  // eldercare
  personName: '',
  careLevel: '',
  eldercareEstimatedMonthlyCost: '',
};

const LifeEventForm = ({ open, onClose, onSave, lifeEvent = null }) => {
  const isEdit = Boolean(lifeEvent);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (open) {
      setApiError('');
      setErrors({});
      if (lifeEvent) {
        const d = lifeEvent.details || {};
        setForm({
          name:     lifeEvent.name     || '',
          type:     lifeEvent.type     || '',
          isActive: lifeEvent.isActive !== undefined ? lifeEvent.isActive : true,
          // pet
          petName:                 d.petName                 || '',
          species:                 d.species                 || '',
          age:                     d.age                     != null ? String(d.age) : '',
          estimatedMonthlyVetCost: d.estimatedMonthlyVetCost != null ? String(d.estimatedMonthlyVetCost) : '',
          // college
          studentName:          d.studentName          || '',
          institution:          d.institution          || '',
          startYear:            d.startYear            != null ? String(d.startYear) : '',
          endYear:              d.endYear              != null ? String(d.endYear)   : '',
          estimatedAnnualCost:  d.estimatedAnnualCost  != null ? String(d.estimatedAnnualCost) : '',
          // vehicle_ownership
          vehicleDescription:            d.vehicleDescription            || '',
          vehicleEstimatedAnnualCost:    d.estimatedAnnualCost           != null ? String(d.estimatedAnnualCost) : '',
          // medical
          condition:            d.condition            || '',
          estimatedMonthlyCost: d.estimatedMonthlyCost != null ? String(d.estimatedMonthlyCost) : '',
          // eldercare
          personName:                    d.personName                    || '',
          careLevel:                     d.careLevel                     || '',
          eldercareEstimatedMonthlyCost: d.estimatedMonthlyCost          != null ? String(d.estimatedMonthlyCost) : '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, lifeEvent]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setSwitch = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.type)        errs.type = 'Type is required.';
    return errs;
  };

  const buildDetails = () => {
    const d = {};
    const t = form.type;

    if (t === 'pet') {
      if (form.petName.trim())                 d.petName                 = form.petName.trim();
      if (form.species.trim())                 d.species                 = form.species.trim();
      if (form.age !== '')                     d.age                     = Number(form.age);
      if (form.estimatedMonthlyVetCost !== '') d.estimatedMonthlyVetCost = Number(form.estimatedMonthlyVetCost);
    } else if (t === 'college') {
      if (form.studentName.trim())            d.studentName         = form.studentName.trim();
      if (form.institution.trim())            d.institution         = form.institution.trim();
      if (form.startYear !== '')              d.startYear           = Number(form.startYear);
      if (form.endYear !== '')               d.endYear             = Number(form.endYear);
      if (form.estimatedAnnualCost !== '')    d.estimatedAnnualCost = Number(form.estimatedAnnualCost);
    } else if (t === 'vehicle_ownership') {
      if (form.vehicleDescription.trim())         d.vehicleDescription  = form.vehicleDescription.trim();
      if (form.vehicleEstimatedAnnualCost !== '')  d.estimatedAnnualCost = Number(form.vehicleEstimatedAnnualCost);
    } else if (t === 'medical') {
      if (form.condition.trim())            d.condition            = form.condition.trim();
      if (form.estimatedMonthlyCost !== '') d.estimatedMonthlyCost = Number(form.estimatedMonthlyCost);
    } else if (t === 'eldercare') {
      if (form.personName.trim())                    d.personName            = form.personName.trim();
      if (form.careLevel)                            d.careLevel             = form.careLevel;
      if (form.eldercareEstimatedMonthlyCost !== '') d.estimatedMonthlyCost  = Number(form.eldercareEstimatedMonthlyCost);
    }

    return d;
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
        name:     form.name.trim(),
        type:     form.type,
        isActive: form.isActive,
        details:  buildDetails(),
      };

      await onSave(payload);
      onClose();
    } catch (e) {
      setApiError(e?.response?.data?.message || e.message || 'Failed to save life event.');
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
      slotProps={{ paper: { sx: { borderRadius: '14px' } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h3">{isEdit ? 'Edit Life Event' : 'Add Life Event'}</Typography>
        <IconButton onClick={onClose} size="small" edge="end" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {apiError && <Alert severity="error" sx={{ mb: 0.5 }}>{apiError}</Alert>}

        {/* Name */}
        <TextField
          size="small"
          label="Event name"
          value={form.name}
          onChange={set('name')}
          required
          fullWidth
          error={Boolean(errors.name)}
          helperText={errors.name}
        />

        {/* Type */}
        <TextField
          size="small"
          select
          label="Type"
          value={form.type}
          onChange={set('type')}
          required
          fullWidth
          error={Boolean(errors.type)}
          helperText={errors.type}
        >
          {LIFE_EVENT_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>

        {/* isActive */}
        <FormControlLabel
          control={
            <Switch
              checked={form.isActive}
              onChange={setSwitch('isActive')}
              color="success"
            />
          }
          label="Active"
        />

        {/* ── Pet detail fields ── */}
        {form.type === 'pet' && (
          <>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                size="small"
                label="Pet name"
                value={form.petName}
                onChange={set('petName')}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Species"
                value={form.species}
                onChange={set('species')}
                placeholder="e.g. Dog, Cat"
                helperText="Optional"
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                size="small"
                label="Age (years)"
                type="number"
                value={form.age}
                onChange={set('age')}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Est. monthly vet cost"
                type="number"
                value={form.estimatedMonthlyVetCost}
                onChange={set('estimatedMonthlyVetCost')}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
            </Box>
          </>
        )}

        {/* ── College detail fields ── */}
        {form.type === 'college' && (
          <>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                size="small"
                label="Student name"
                value={form.studentName}
                onChange={set('studentName')}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Institution"
                value={form.institution}
                onChange={set('institution')}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                size="small"
                label="Start year"
                type="number"
                value={form.startYear}
                onChange={set('startYear')}
                slotProps={{ htmlInput: { min: 2000, max: 2060, step: 1 } }}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="End year"
                type="number"
                value={form.endYear}
                onChange={set('endYear')}
                slotProps={{ htmlInput: { min: 2000, max: 2060, step: 1 } }}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              size="small"
              label="Est. annual cost"
              type="number"
              value={form.estimatedAnnualCost}
              onChange={set('estimatedAnnualCost')}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              fullWidth
              helperText="Optional"
            />
          </>
        )}

        {/* ── Vehicle ownership detail fields ── */}
        {form.type === 'vehicle_ownership' && (
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Vehicle description"
              value={form.vehicleDescription}
              onChange={set('vehicleDescription')}
              placeholder="e.g. 2019 Honda Civic"
              fullWidth
              helperText="Optional"
            />
            <TextField
              size="small"
              label="Est. annual cost (insurance + maintenance)"
              type="number"
              value={form.vehicleEstimatedAnnualCost}
              onChange={set('vehicleEstimatedAnnualCost')}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              fullWidth
              helperText="Optional"
            />
          </Stack>
        )}

        {/* ── Medical detail fields ── */}
        {form.type === 'medical' && (
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Condition"
              value={form.condition}
              onChange={set('condition')}
              placeholder="e.g. Diabetes, Physical therapy"
              fullWidth
              helperText="Optional"
            />
            <TextField
              size="small"
              label="Est. monthly cost"
              type="number"
              value={form.estimatedMonthlyCost}
              onChange={set('estimatedMonthlyCost')}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              fullWidth
              helperText="Optional"
            />
          </Stack>
        )}

        {/* ── Eldercare detail fields ── */}
        {form.type === 'eldercare' && (
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Person name"
              value={form.personName}
              onChange={set('personName')}
              fullWidth
              helperText="Optional"
            />
            <TextField
              size="small"
              select
              label="Care level"
              value={form.careLevel}
              onChange={set('careLevel')}
              fullWidth
              helperText="Optional"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {CARE_LEVELS.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Est. monthly cost"
              type="number"
              value={form.eldercareEstimatedMonthlyCost}
              onChange={set('eldercareEstimatedMonthlyCost')}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              fullWidth
              helperText="Optional"
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="text" color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Life Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LifeEventForm;
