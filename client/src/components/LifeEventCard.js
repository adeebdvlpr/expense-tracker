import React, { useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTheme } from '@mui/material/styles';
import { formatMoney } from '../utils/money';
import { predictions } from '../utils/api';

const TYPE_LABELS = {
  pet:               'Pet',
  college:           'College / Education',
  vehicle_ownership: 'Vehicle Ownership',
  medical:           'Medical',
  eldercare:         'Eldercare',
  wedding:           'Wedding',
  home_purchase:     'Home Purchase',
  home_renovation:   'Home Renovation',
  new_baby:          'New Baby',
  retirement:        'Retirement',
  relocation:        'Relocation',
  other:             'Other',
};

const CARE_LEVEL_LABELS = {
  in_home:         'In-Home Care',
  assisted_living: 'Assisted Living',
  memory_care:     'Memory Care',
};

const FREQ_SUFFIX = {
  one_time: ' (one-time)',
  monthly:  '/mo',
  annual:   '/yr',
};

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Typography variant="body2" color="text.secondary">
      {label}: <strong>{value}</strong>
    </Typography>
  );
}

function TypeDetails({ lifeEvent, currency }) {
  const { type, details: d = {} } = lifeEvent;

  if (type === 'pet') {
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        {(d.petName || d.species) && (
          <Typography variant="body2" color="text.secondary">
            {[d.petName, d.species].filter(Boolean).join(' · ')}
          </Typography>
        )}
        <DetailRow label="Age" value={d.age != null ? `${d.age} yr${d.age !== 1 ? 's' : ''}` : null} />
      </Stack>
    );
  }

  if (type === 'college') {
    const yearRange = d.startYear && d.endYear
      ? `${d.startYear}–${d.endYear}`
      : (d.startYear || d.endYear || null);
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <DetailRow label="Student"     value={d.studentName} />
        <DetailRow label="Institution" value={d.institution} />
        <DetailRow label="Years"       value={yearRange} />
      </Stack>
    );
  }

  if (type === 'vehicle_ownership') {
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <DetailRow label="Vehicle" value={d.vehicleDescription} />
      </Stack>
    );
  }

  if (type === 'medical') {
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <DetailRow label="Condition" value={d.condition} />
      </Stack>
    );
  }

  if (type === 'eldercare') {
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <DetailRow label="Person"     value={d.personName} />
        <DetailRow label="Care level" value={d.careLevel ? (CARE_LEVEL_LABELS[d.careLevel] || d.careLevel) : null} />
      </Stack>
    );
  }

  return null;
}

const LifeEventCard = ({ lifeEvent, currency = 'USD', onEdit, onToggleActive, onDelete, onPredictSuccess, onPredictError }) => {
  const theme = useTheme();
  const [predicting, setPredicting] = useState(false);
  const d = lifeEvent.details || {};

  const handlePredict = async () => {
    setPredicting(true);
    try {
      await predictions.generateForLifeEvent(lifeEvent._id);
      if (onPredictSuccess) onPredictSuccess();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to generate prediction.';
      if (onPredictError) onPredictError(message);
    } finally {
      setPredicting(false);
    }
  };

  const costDisplay = d.estimatedCost != null
    ? `${formatMoney(d.estimatedCost, currency)}${FREQ_SUFFIX[d.costFrequency] || ''}`
    : null;

  const targetDisplay = d.targetDate
    ? new Date(d.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

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
        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Name + type + active badge */}
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {lifeEvent.name}
            </Typography>
            <Chip
              label={TYPE_LABELS[lifeEvent.type] || lifeEvent.type}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ flexShrink: 0 }}
            />
            <Chip
              label={lifeEvent.isActive ? 'Active' : 'Inactive'}
              size="small"
              color={lifeEvent.isActive ? 'success' : 'default'}
              sx={{ flexShrink: 0 }}
            />
          </Stack>

          {/* Universal fields */}
          <Stack spacing={0.25}>
            <DetailRow label="Est. cost" value={costDisplay} />
            <DetailRow label="Target"    value={targetDisplay} />
          </Stack>

          {/* Type-specific details */}
          <TypeDetails lifeEvent={lifeEvent} currency={currency} />
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title="Consult AI Advisor">
            <span>
              <IconButton size="small" color="primary" onClick={handlePredict} disabled={predicting}>
                {predicting
                  ? <CircularProgress size={18} color="inherit" />
                  : <AutoAwesomeIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(lifeEvent)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={lifeEvent.isActive ? 'Mark inactive' : 'Mark active'}>
            <IconButton size="small" onClick={() => onToggleActive(lifeEvent)}>
              {lifeEvent.isActive
                ? <PauseIcon fontSize="small" />
                : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete(lifeEvent._id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default LifeEventCard;
