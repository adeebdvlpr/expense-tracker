import React from 'react';
import {
  Box,
  Chip,
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
import { useTheme } from '@mui/material/styles';
import { formatMoney } from '../utils/money';

const TYPE_LABELS = {
  pet:               'Pet',
  college:           'College / Education',
  vehicle_ownership: 'Vehicle Ownership',
  medical:           'Medical',
  eldercare:         'Eldercare',
  other:             'Other',
};

const CARE_LEVEL_LABELS = {
  in_home:          'In-Home Care',
  assisted_living:  'Assisted Living',
  memory_care:      'Memory Care',
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
        <DetailRow label="Est. monthly vet cost" value={d.estimatedMonthlyVetCost != null ? `${formatMoney(d.estimatedMonthlyVetCost, currency)}/mo` : null} />
      </Stack>
    );
  }

  if (type === 'college') {
    const yearRange = d.startYear && d.endYear ? `${d.startYear}–${d.endYear}` : (d.startYear || d.endYear || null);
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <DetailRow label="Student" value={d.studentName} />
        <DetailRow label="Institution" value={d.institution} />
        <DetailRow label="Years" value={yearRange} />
        <DetailRow label="Est. annual cost" value={d.estimatedAnnualCost != null ? `${formatMoney(d.estimatedAnnualCost, currency)}/yr` : null} />
      </Stack>
    );
  }

  if (type === 'vehicle_ownership') {
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <DetailRow label="Vehicle" value={d.vehicleDescription} />
        <DetailRow label="Est. annual cost" value={d.estimatedAnnualCost != null ? `${formatMoney(d.estimatedAnnualCost, currency)}/yr` : null} />
      </Stack>
    );
  }

  if (type === 'medical') {
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <DetailRow label="Condition" value={d.condition} />
        <DetailRow label="Est. monthly cost" value={d.estimatedMonthlyCost != null ? `${formatMoney(d.estimatedMonthlyCost, currency)}/mo` : null} />
      </Stack>
    );
  }

  if (type === 'eldercare') {
    return (
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <DetailRow label="Person" value={d.personName} />
        <DetailRow label="Care level" value={d.careLevel ? CARE_LEVEL_LABELS[d.careLevel] || d.careLevel : null} />
        <DetailRow label="Est. monthly cost" value={d.estimatedMonthlyCost != null ? `${formatMoney(d.estimatedMonthlyCost, currency)}/mo` : null} />
      </Stack>
    );
  }

  return null;
}

const LifeEventCard = ({ lifeEvent, currency = 'USD', onEdit, onToggleActive, onDelete }) => {
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

          {/* Type-specific details */}
          <TypeDetails lifeEvent={lifeEvent} currency={currency} />
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
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
