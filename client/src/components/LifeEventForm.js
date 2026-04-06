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
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LIFE_EVENT_TYPES = [
  { value: 'pet',               label: 'Pet' },
  { value: 'college',           label: 'College / Education' },
  { value: 'vehicle_ownership', label: 'Vehicle Ownership' },
  { value: 'medical',           label: 'Medical' },
  { value: 'eldercare',         label: 'Eldercare' },
  { value: 'wedding',           label: 'Wedding' },
  { value: 'home_purchase',     label: 'Home Purchase' },
  { value: 'home_renovation',   label: 'Home Renovation' },
  { value: 'new_baby',          label: 'New Baby' },
  { value: 'retirement',        label: 'Retirement' },
  { value: 'relocation',        label: 'Relocation' },
  { value: 'other',             label: 'Other' },
];

const COST_FREQUENCIES = [
  { value: 'one_time', label: 'One-time' },
  { value: 'monthly',  label: 'Monthly' },
  { value: 'annual',   label: 'Annual' },
];

const CARE_LEVELS = [
  { value: 'in_home',         label: 'In-Home Care' },
  { value: 'assisted_living', label: 'Assisted Living' },
  { value: 'memory_care',     label: 'Memory Care' },
];

const EMPTY_FORM = {
  name:          '',
  type:          '',
  isActive:      true,
  // universal
  description:   '',
  estimatedCost: '',
  costFrequency: 'one_time',
  targetDate:    '',
  // pet
  petName: '',
  species: '',
  age:     '',
  // college
  studentName: '',
  institution: '',
  startYear:   '',
  endYear:     '',
  // vehicle_ownership
  vehicleDescription: '',
  // medical
  condition: '',
  // eldercare
  personName: '',
  careLevel:  '',
};

const TYPE_SPECIFIC_TYPES = ['pet', 'college', 'vehicle_ownership', 'medical', 'eldercare'];

const LifeEventForm = ({ open, onClose, onSave, lifeEvent = null }) => {
  const isEdit = Boolean(lifeEvent);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (open) {
      setApiError('');
      setErrors({});
      if (lifeEvent) {
        const d = lifeEvent.details || {};
        let targetDate = '';
        if (d.targetDate) {
          const dt = new Date(d.targetDate);
          if (!isNaN(dt)) targetDate = dt.toISOString().slice(0, 10);
        }
        setForm({
          name:     lifeEvent.name     || '',
          type:     lifeEvent.type     || '',
          isActive: lifeEvent.isActive !== undefined ? lifeEvent.isActive : true,
          // universal
          description:   d.description   || '',
          estimatedCost: d.estimatedCost != null ? String(d.estimatedCost) : '',
          costFrequency: d.costFrequency || 'one_time',
          targetDate,
          // pet
          petName: d.petName  || '',
          species: d.species  || '',
          age:     d.age != null ? String(d.age) : '',
          // college
          studentName: d.studentName  || '',
          institution: d.institution  || '',
          startYear:   d.startYear != null ? String(d.startYear) : '',
          endYear:     d.endYear   != null ? String(d.endYear)   : '',
          // vehicle_ownership
          vehicleDescription: d.vehicleDescription || '',
          // medical
          condition: d.condition || '',
          // eldercare
          personName: d.personName || '',
          careLevel:  d.careLevel  || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, lifeEvent]);

  const set       = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setSwitch = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }));

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.type)        errs.type = 'Type is required.';
    return errs;
  };

  const buildDetails = () => {
    const d = {};

    // universal fields
    if (form.description.trim())  d.description  = form.description.trim();
    if (form.estimatedCost !== '') {
      d.estimatedCost = Number(form.estimatedCost);
      d.costFrequency = form.costFrequency;
    }
    if (form.targetDate) d.targetDate = form.targetDate;

    // type-specific enrichment
    const t = form.type;
    if (t === 'pet') {
      if (form.petName.trim()) d.petName = form.petName.trim();
      if (form.species.trim()) d.species = form.species.trim();
      if (form.age !== '')     d.age     = Number(form.age);
    } else if (t === 'college') {
      if (form.studentName.trim())  d.studentName = form.studentName.trim();
      if (form.institution.trim())  d.institution = form.institution.trim();
      if (form.startYear !== '')    d.startYear   = Number(form.startYear);
      if (form.endYear !== '')      d.endYear     = Number(form.endYear);
    } else if (t === 'vehicle_ownership') {
      if (form.vehicleDescription.trim()) d.vehicleDescription = form.vehicleDescription.trim();
    } else if (t === 'medical') {
      if (form.condition.trim()) d.condition = form.condition.trim();
    } else if (t === 'eldercare') {
      if (form.personName.trim()) d.personName = form.personName.trim();
      if (form.careLevel)         d.careLevel  = form.careLevel;
    }

    return d;
  };

  const handleSubmit = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSaving(true);
    setApiError('');

    try {
      await onSave({
        name:     form.name.trim(),
        type:     form.type,
        isActive: form.isActive,
        details:  buildDetails(),
      });
      onClose();
    } catch (e) {
      setApiError(e?.response?.data?.message || e.message || 'Failed to save life event.');
    } finally {
      setSaving(false);
    }
  };

  const hasTypeSpecificFields = TYPE_SPECIFIC_TYPES.includes(form.type);

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

        {/* ── Section 1: Universal fields (always shown) ── */}

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

        {/* Description */}
        <TextField
          size="small"
          label="Description"
          value={form.description}
          onChange={set('description')}
          placeholder="Describe this event..."
          fullWidth
          multiline
          minRows={2}
          helperText="Optional"
        />

        {/* Estimated cost + frequency */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            size="small"
            label="Estimated cost"
            type="number"
            value={form.estimatedCost}
            onChange={set('estimatedCost')}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            helperText="Optional"
            sx={{ flex: 2 }}
          />
          <TextField
            size="small"
            select
            label="Frequency"
            value={form.costFrequency}
            onChange={set('costFrequency')}
            sx={{ flex: 1 }}
          >
            {COST_FREQUENCIES.map((f) => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Target date */}
        <TextField
          size="small"
          label="Target date"
          type="date"
          value={form.targetDate}
          onChange={set('targetDate')}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          helperText="Optional"
        />

        {/* isActive */}
        <FormControlLabel
          control={
            <Switch checked={form.isActive} onChange={setSwitch('isActive')} color="success" />
          }
          label="Active"
        />

        {/* ── Section 2: Type-specific enrichment ── */}
        {hasTypeSpecificFields && (
          <>
            <Divider sx={{ my: 0.5 }} />

            {/* Pet */}
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
                <TextField
                  size="small"
                  label="Age (years)"
                  type="number"
                  value={form.age}
                  onChange={set('age')}
                  slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  helperText="Optional"
                  sx={{ width: '50%' }}
                />
              </>
            )}

            {/* College */}
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
              </>
            )}

            {/* Vehicle ownership */}
            {form.type === 'vehicle_ownership' && (
              <TextField
                size="small"
                label="Vehicle description"
                value={form.vehicleDescription}
                onChange={set('vehicleDescription')}
                placeholder="e.g. 2019 Honda Civic"
                fullWidth
                helperText="Optional"
              />
            )}

            {/* Medical */}
            {form.type === 'medical' && (
              <TextField
                size="small"
                label="Condition"
                value={form.condition}
                onChange={set('condition')}
                placeholder="e.g. Diabetes, Physical therapy"
                fullWidth
                helperText="Optional"
              />
            )}

            {/* Eldercare */}
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
              </Stack>
            )}
          </>
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
