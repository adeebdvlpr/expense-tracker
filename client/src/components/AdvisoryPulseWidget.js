import React from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useTheme } from '@mui/material/styles';
import { useAdvisory } from '../context/AdvisoryContext';
import { formatMoney } from '../utils/money';

const SEGMENTS = [
  { key: 'needs',   label: 'Needs',   colorKey: 'success.main' },
  { key: 'wants',   label: 'Wants',   colorKey: 'warning.main' },
  { key: 'savings', label: 'Savings', colorKey: 'primary.main' },
];

const AdvisoryPulseWidget = () => {
  const theme = useTheme();
  const { auditData: audit, auditLoading: loading, auditError: error, refreshAudit } = useAdvisory();

  // Resolve theme color token like 'success.main' to actual hex
  const resolveColor = (token) => {
    const [palette, shade] = token.split('.');
    return theme.palette[palette]?.[shade] || token;
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '14px', p: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Paper>
    );
  }

  if (error || !audit) {
    return (
      <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '14px', p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Could not load advisor overview.
          </Typography>
          <Tooltip title="Retry">
            <span>
              <IconButton size="small" color="primary" onClick={refreshAudit}>
                <AutorenewIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>
    );
  }

  const { needs, wants, savings, currency, pulseInsight } = audit;
  const total = needs + wants + savings;

  // Segment widths — fallback to equal thirds if no spend data
  const widths = total > 0
    ? SEGMENTS.map(({ key }) => ((audit[key] / total) * 100).toFixed(1) + '%')
    : ['33.33%', '33.33%', '33.33%'];

  return (
    <Paper
      elevation={0}
      sx={{  width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: '14px', p: 2, mb: 1 , background:"rgba(247, 249, 252, 0.9)"}}
    >
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h3">
          Advisor Overview
        </Typography>
        <Tooltip title="Refresh">
          <span>
            <IconButton size="small" color="primary" onClick={refreshAudit} disabled={loading}>
              {loading
                ? <CircularProgress size={18} color="inherit" />
                : <AutorenewIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* 3-segment bar */}
      <Box
        sx={{
          display: 'flex',
          height: 14,
          borderRadius: '7px',
          overflow: 'hidden',
          mb: 1,
        }}
      >
        {SEGMENTS.map(({ key, colorKey }, i) => (
          <Box
            key={key}
            sx={{
              width: widths[i],
              bgcolor: resolveColor(colorKey),
              transition: 'width 0.4s ease',
            }}
          />
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3.5, mb: pulseInsight ? 1 : 0 }}>
        {SEGMENTS.map(({ key, label, colorKey }) => {
          const pct = total > 0 ? ((audit[key] / total) * 100).toFixed(0) : 0;
          return (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: resolveColor(colorKey), flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary">
                <strong>{label}</strong> {formatMoney(audit[key], currency)} ({pct}%)
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* AI pulse insight */}
      {pulseInsight && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
          {pulseInsight}
        </Typography>
      )}
    </Paper>
  );
};

export default AdvisoryPulseWidget;
