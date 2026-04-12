import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import ProfileChecklist from './ProfileChecklist';

/**
 * TourStepCard — a non-modal instruction card docked to the bottom of the screen.
 *
 * Props:
 *   step        — current STEPS entry ({ icon, title, body, showChecklist })
 *   stepIndex   — 0-based index of the current step
 *   totalSteps  — total number of steps
 *   onNext      — called when user clicks Next / Finish Setup
 *   onBack      — called when user clicks Back
 *   onSkip      — called when user clicks Skip tour (marks onboarding complete immediately)
 *   user        — user profile object (passed to ProfileChecklist)
 */
const TourStepCard = ({ step, stepIndex, totalSteps, onNext, onBack, onSkip, user, dockTop }) => {
  const theme = useTheme();
  const Icon = step.icon;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <Box
      sx={{
        position: 'fixed',
        ...(dockTop ? { top: 72 } : { bottom: 24 }),
        left: '50%',
        transform: 'translateX(-50%)',
        width: { xs: 'calc(100vw - 32px)', sm: 500 },
        zIndex: 1301,
        borderRadius: '14px',
        bgcolor: 'background.paper',
        boxShadow: '0 8px 40px rgba(0,0,0,0.24)',
        border: `1px solid ${theme.palette.divider}`,
        p: 3,
      }}
    >
      {/* Header: icon + title + skip */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5, gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: `${theme.palette.primary.main}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 20, color: 'primary.main' }} />
        </Box>

        <Typography variant="h3" sx={{ flex: 1, pt: 0.5 }}>
          {step.title}
        </Typography>

        <Button
          size="small"
          onClick={onSkip}
          sx={{ textTransform: 'none', color: 'text.secondary', flexShrink: 0, mt: -0.5 }}
        >
          Skip tour
        </Button>
      </Box>

      {/* Body */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.65, mb: 2, pl: '56px' }}
      >
        {step.body}
      </Typography>

      {/* Profile checklist (last step only) */}
      {step.showChecklist && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: '10px',
            bgcolor: theme.palette.action.hover,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
            Before you start — check your profile
          </Typography>
          <ProfileChecklist user={user} />
        </Box>
      )}

      {/* Footer: progress dots + back / next */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: '56px' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <Box
            key={i}
            sx={{
              width: i === stepIndex ? 20 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: i === stepIndex ? 'primary.main' : 'action.disabled',
              transition: 'width 0.25s ease',
            }}
          />
        ))}

        <Box sx={{ flex: 1 }} />

        <Button
          onClick={onBack}
          disabled={isFirst}
          sx={{ textTransform: 'none' }}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={onNext}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          {isLast ? 'Finish Setup' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default TourStepCard;
