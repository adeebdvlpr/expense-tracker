import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Snackbar,
  Alert,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTheme } from '@mui/material/styles';
import { formatMoney } from '../utils/money';
import { createGoal, predictions as predictionsApi } from '../utils/api';

function confidenceColor(confidence, theme) {
  switch (confidence) {
    case 'high':   return theme.palette.success.main;
    case 'medium': return theme.palette.info.main;
    case 'low':    return theme.palette.warning.main;
    default:       return theme.palette.text.secondary;
  }
}

const PredictionCard = ({ prediction, onDelete }) => {
  const theme = useTheme();
  const { _id, title, summary, projectedCost, projectedDate, monthlySavingsTarget, confidence, riskRating, opportunityCost, currency } = prediction;
  const chipColor = confidenceColor(confidence, theme);
  const isHighRisk = riskRating === 'high';

  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleCommitGoal = async () => {
    setCommitting(true);
    try {
      const notes = monthlySavingsTarget
        ? `AI Advisory: save ${formatMoney(monthlySavingsTarget, currency || 'USD')}/mo toward this goal.`
        : 'Generated from AI Advisory Insight.';

      await createGoal({
        name: title,
        targetAmount: projectedCost,
        currentAmount: 0,
        targetDate: projectedDate || undefined,
        notes,
        currency: currency || 'USD',
        source: 'ai',
        predictionId: _id,
      });

      setCommitted(true);
      setSnack({ open: true, message: 'Goal created! View it on your Goals page.', severity: 'success' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create goal. Please try again.';
      setSnack({ open: true, message: msg, severity: 'error' });
    } finally {
      setCommitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await predictionsApi.delete(_id);
      if (onDelete) onDelete(_id);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to delete insight.', severity: 'error' });
      setDeleting(false);
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: isHighRisk
            ? `2px solid ${theme.palette.error.main}`
            : `1px solid ${theme.palette.divider}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header: title + risk/confidence chips + delete */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1, mr: 1, gap: 0.5 }}>
              {isHighRisk && (
                <WarningAmberIcon sx={{ color: theme.palette.error.main, fontSize: 18, mt: 0.25, flexShrink: 0 }} />
              )}
              <Typography variant="h3" sx={{ flex: 1 }}>
                {title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              {riskRating && (
                <Chip
                  label={`${riskRating} risk`}
                  size="small"
                  sx={{
                    backgroundColor: isHighRisk ? theme.palette.error.main : riskRating === 'medium' ? theme.palette.warning.main : theme.palette.success.main,
                    color: theme.palette.getContrastText(isHighRisk ? theme.palette.error.main : riskRating === 'medium' ? theme.palette.warning.main : theme.palette.success.main),
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              )}
              <Chip
                label={confidence}
                size="small"
                sx={{
                  backgroundColor: chipColor,
                  color: theme.palette.getContrastText(chipColor),
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              />
              <Tooltip title="Delete insight">
                <span>
                  <IconButton size="small" onClick={handleDelete} disabled={deleting} sx={{ color: theme.palette.error.main }}>
                    {deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>

          {/* Advisor's Guidance */}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Advisor's Guidance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 2 }}>
            {summary}
          </Typography>

          {/* Estimated Advisory Cost */}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Estimated Advisory Cost
          </Typography>
          <Typography variant="h3" color="primary.main" sx={{ mt: 0.25 }}>
            {formatMoney(projectedCost, currency || 'USD')}
          </Typography>

          {/* Monthly savings target */}
          {monthlySavingsTarget != null && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Suggested monthly savings: <strong>{formatMoney(monthlySavingsTarget, currency || 'USD')}/mo</strong>
            </Typography>
          )}

          {/* Opportunity cost */}
          {opportunityCost && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
              {opportunityCost}
            </Typography>
          )}

          {/* Progress toward this goal — defaults to 0% (not yet started) */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Savings progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                0%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={0}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.action.disabledBackground,
                '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.info.main },
              }}
            />
          </Box>

          {/* Spacer to push button to bottom */}
          <Box sx={{ flex: 1 }} />

          {/* Commit to Goal button */}
          <Button
            variant="contained"
            size="small"
            fullWidth
            disabled={committing || committed}
            onClick={handleCommitGoal}
            sx={{ mt: 2 }}
          >
            {committing
              ? <CircularProgress size={16} color="inherit" />
              : committed
              ? 'Goal Created'
              : 'Commit to this Goal'}
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PredictionCard;
