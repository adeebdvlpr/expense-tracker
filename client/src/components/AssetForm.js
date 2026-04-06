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
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ASSET_TYPES = [
  { value: 'home_system', label: 'Home System' },
  { value: 'appliance',   label: 'Appliance' },
  { value: 'vehicle',     label: 'Vehicle' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other',       label: 'Other' },
];

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good',      label: 'Good' },
  { value: 'fair',      label: 'Fair' },
  { value: 'poor',      label: 'Poor' },
];

const EMPTY_FORM = {
  name: '',
  type: '',
  brand: '',
  condition: '',
  purchaseYear: '',
  purchasePrice: '',
  warrantyLengthYears: '',
  warrantyExpiryDate: '',
  make: '',
  vehicleModel: '',
  mileage: '',
  subtype: '',
  materialType: '',
};

const AssetForm = ({ open, onClose, onSave, asset = null }) => {
  const isEdit = Boolean(asset);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (open) {
      setApiError('');
      setErrors({});
      if (asset) {
        setForm({
          name:               asset.name               || '',
          type:               asset.type               || '',
          brand:              asset.brand              || '',
          condition:          asset.condition          || '',
          purchaseYear:       asset.purchaseYear       != null ? String(asset.purchaseYear)       : '',
          purchasePrice:      asset.purchasePrice      != null ? String(asset.purchasePrice)      : '',
          warrantyLengthYears: asset.warrantyLengthYears != null ? String(asset.warrantyLengthYears) : '',
          warrantyExpiryDate: asset.warrantyExpiryDate
            ? new Date(asset.warrantyExpiryDate).toISOString().slice(0, 10)
            : '',
          make:         asset.make         || '',
          vehicleModel: asset.vehicleModel || '',
          mileage:      asset.mileage      != null ? String(asset.mileage) : '',
          subtype:      asset.subtype      || '',
          materialType: asset.materialType || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, asset]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.type)        errs.type = 'Type is required.';
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
      const payload = { name: form.name.trim(), type: form.type };

      if (form.brand.trim())              payload.brand               = form.brand.trim();
      if (form.condition)                 payload.condition           = form.condition;
      if (form.purchaseYear !== '')       payload.purchaseYear        = Number(form.purchaseYear);
      if (form.purchasePrice !== '')      payload.purchasePrice       = Number(form.purchasePrice);
      if (form.warrantyLengthYears !== '') payload.warrantyLengthYears = Number(form.warrantyLengthYears);
      if (form.warrantyExpiryDate)        payload.warrantyExpiryDate  = form.warrantyExpiryDate;

      if (form.type === 'vehicle') {
        if (form.make.trim())        payload.make         = form.make.trim();
        if (form.vehicleModel.trim()) payload.vehicleModel = form.vehicleModel.trim();
        if (form.mileage !== '')     payload.mileage      = Number(form.mileage);
      }

      if (form.type === 'home_system') {
        if (form.subtype.trim())      payload.subtype      = form.subtype.trim();
        if (form.materialType.trim()) payload.materialType = form.materialType.trim();
      }

      await onSave(payload);
      onClose();
    } catch (e) {
      setApiError(e?.response?.data?.message || e.message || 'Failed to save asset.');
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
        <Typography variant="h3">{isEdit ? 'Edit Asset' : 'Add Asset'}</Typography>
        <IconButton onClick={onClose} size="small" edge="end" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {apiError && <Alert severity="error" sx={{ mb: 0.5 }}>{apiError}</Alert>}

        {/* Name */}
        <TextField
          size="small"
          label="Asset name"
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
          {ASSET_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>

        {/* Brand */}
        <TextField
          size="small"
          label="Brand"
          value={form.brand}
          onChange={set('brand')}
          fullWidth
          helperText="Optional"
        />

        {/* Condition */}
        <TextField
          size="small"
          select
          label="Condition"
          value={form.condition}
          onChange={set('condition')}
          fullWidth
          helperText="Optional"
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {CONDITIONS.map((c) => (
            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
          ))}
        </TextField>

        {/* Purchase Year + Price */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            size="small"
            label="Purchase year"
            type="number"
            value={form.purchaseYear}
            onChange={set('purchaseYear')}
            slotProps={{ htmlInput: { min: 1900, max: new Date().getFullYear() } }}
            helperText="Optional"
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="Purchase price"
            type="number"
            value={form.purchasePrice}
            onChange={set('purchasePrice')}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            helperText="Optional"
            sx={{ flex: 1 }}
          />
        </Box>

        {/* Warranty */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            size="small"
            label="Warranty (years)"
            type="number"
            value={form.warrantyLengthYears}
            onChange={set('warrantyLengthYears')}
            slotProps={{ htmlInput: { min: 0, step: '0.5' } }}
            helperText="Optional"
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="Warranty expiry"
            type="date"
            value={form.warrantyExpiryDate}
            onChange={set('warrantyExpiryDate')}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Optional"
            sx={{ flex: 1 }}
          />
        </Box>

        {/* Vehicle-specific fields */}
        {form.type === 'vehicle' && (
          <>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                size="small"
                label="Make"
                value={form.make}
                onChange={set('make')}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Model"
                value={form.vehicleModel}
                onChange={set('vehicleModel')}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              size="small"
              label="Mileage"
              type="number"
              value={form.mileage}
              onChange={set('mileage')}
              slotProps={{ htmlInput: { min: 0 } }}
              fullWidth
              helperText="Optional"
            />
          </>
        )}

        {/* Home-system-specific fields */}
        {form.type === 'home_system' && (
          <>
            <TextField
              size="small"
              label="Subtype"
              value={form.subtype}
              onChange={set('subtype')}
              placeholder="e.g. roof, hvac"
              fullWidth
              helperText="Optional"
            />
            <TextField
              size="small"
              label="Material type"
              value={form.materialType}
              onChange={set('materialType')}
              fullWidth
              helperText="Optional"
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="text" color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Asset'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetForm;
