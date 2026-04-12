import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

/**
 * Evaluates a user's profile and active goals for completeness.
 * Returns an array of field descriptors — each has: key, label, route, complete.
 */
export function evaluateCriticalFields(user, goals = []) {
  return [
    {
      key: 'income',
      label: 'Monthly Income',
      description: 'Required for budget planning and 50/30/20 analysis.',
      route: '/account',
      complete: Boolean(user?.monthlyIncome),
    },
    {
      key: 'residence',
      label: 'Primary Residence',
      description: 'Used to regionalise AI cost projections.',
      route: '/account',
      complete: Boolean(user?.location?.city || user?.location?.country),
    },
    {
      key: 'goal',
      label: 'Financial Goal',
      description: 'Required for the AI to generate savings recommendations.',
      route: '/goals',
      complete: goals.length > 0,
    },
  ];
}

/**
 * Returns the completeness percentage (0–100) based on critical fields.
 */
export function getCompletenessPercent(user, goals = []) {
  const fields = evaluateCriticalFields(user, goals);
  const completed = fields.filter((f) => f.complete).length;
  return Math.round((completed / fields.length) * 100);
}

/**
 * Renders a compact checklist of critical profile fields.
 * Props:
 *   user   — user profile object (from getMe())
 *   goals  — array of active Goal objects (optional; defaults to [])
 */
const ProfileChecklist = ({ user, goals = [] }) => {
  const theme = useTheme();
  const fields = evaluateCriticalFields(user, goals);
  const pct = getCompletenessPercent(user, goals);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Profile completeness:{' '}
        <Box component="span" sx={{ fontWeight: 700, color: pct === 100 ? theme.palette.success.main : theme.palette.warning.main }}>
          {pct}%
        </Box>
      </Typography>

      <List disablePadding dense>
        {fields.map((field) => (
          <ListItem key={field.key} disableGutters sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {field.complete ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={field.label}
              secondary={field.complete ? null : field.description}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: field.complete ? 400 : 600,
                color: field.complete ? 'text.secondary' : 'text.primary',
              }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ProfileChecklist;
