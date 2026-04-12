import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Portal } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TourStepCard from './TourStepCard';
import { updateMe } from '../../utils/api';

// Each step declares the route to navigate to and the DOM element to spotlight.
// targetId must match an `id` attribute on a rendered element.
const STEPS = [
  {
    icon: TrendingUpIcon,
    title: 'Welcome to Ledgic',
    body: 'Ledgic is your Strategic Financial Advisor — it analyses your income, spending, assets, and life events to surface spending trade-offs and savings opportunities before they become regrets.',
    route: '/app',
    targetId: null,
    showChecklist: false,
  },
  {
    icon: DashboardIcon,
    title: 'Your Financial Dashboard',
    body: 'The Dashboard shows your Money Feed, budget progress, and savings goals at a glance. The Financial Advisory page runs a live 50/30/20 analysis and lets you chat with your AI advisor.',
    route: '/app',
    targetId: 'tour-dashboard',
    showChecklist: false,
  },
  {
    icon: AccountBalanceIcon,
    title: 'Set Your Monthly Income',
    body: 'Enter your income on the Account page — this is the foundation of every budget analysis, 50/30/20 audit, and AI recommendation Ledgic generates for you.',
    route: '/account',
    targetId: 'tour-monthly-income',
    showChecklist: false,
  },
  {
    icon: LocationOnIcon,
    title: 'Add Your Location',
    body: 'Add your city and country so the AI can benchmark your spending against real regional costs. Without a location, projections won\'t be location-specific.',
    route: '/account',
    targetId: 'tour-location',
    showChecklist: false,
  },
  {
    icon: AutoAwesomeIcon,
    title: 'You\'re Ready for Your Financial Audit',
    body: 'Once your income and location are set, head to the Dashboard & start adding your expenses. The AI will stress-test your finances, flag gaps, and generate a personalised savings strategy.',
    route: '/app',
    targetId: null,
    showChecklist: true,
  },
];

// Apply spotlight styles directly to a DOM element.
function applyHighlight(el, primaryColor) {
  el.style.position = 'relative';
  el.style.zIndex = '1250';
  el.style.outline = `3px solid ${primaryColor}`;
  el.style.boxShadow = `0 0 0 8px ${primaryColor}2e, 0 0 28px ${primaryColor}1a`;
  el.style.borderRadius = '10px';
  el.style.transition = 'box-shadow 0.35s ease, outline 0.35s ease';
}

// Remove only the properties applyHighlight set.
function removeHighlight(el) {
  el.style.position = '';
  el.style.zIndex = '';
  el.style.outline = '';
  el.style.boxShadow = '';
  el.style.borderRadius = '';
  el.style.transition = '';
}

/**
 * OnboardingTour — interactive, navigation-aware guided tour for new users.
 *
 * Replaces the static Dialog from Change #6 with a docked TourStepCard overlay
 * (rendered via Portal) + a semi-transparent dim overlay. Each step navigates
 * to its declared route and spotlights a specific DOM element by ID.
 *
 * Props:
 *   user       — user profile object (from getMe())
 *   onComplete — callback fired once the tour is dismissed (skip or finish)
 */
const OnboardingTour = ({ user, onComplete }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(() => {
    const saved = sessionStorage.getItem('onboarding_step');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const goToStep = (step) => {
    sessionStorage.setItem('onboarding_step', step);
    setActiveStep(step);
  };
  const [cardDock, setCardDock] = useState('bottom');
  const highlightedElRef = useRef(null);
  const measureTimerRef = useRef(null);

  const step = STEPS[activeStep];

  // Navigate to the step's route whenever the step changes.
  useEffect(() => {
    if (!user || user.onboardingCompleted) return;
    navigate(step.route);
  }, [activeStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Spotlight: dim the page, highlight the target element, scroll it into view,
  // then measure its final viewport position to decide card dock (top vs bottom).
  useEffect(() => {
    if (!user || user.onboardingCompleted) return;

    // Clear any existing highlight and pending measure first.
    if (highlightedElRef.current) {
      removeHighlight(highlightedElRef.current);
      highlightedElRef.current = null;
    }
    if (measureTimerRef.current) {
      clearTimeout(measureTimerRef.current);
      measureTimerRef.current = null;
    }

    if (!step.targetId) {
      setCardDock('bottom');
      return;
    }

    const primaryColor = theme.palette.primary.main;

    // Delay allows the navigation + render to settle before querying the DOM.
    const timer = setTimeout(() => {
      const el = document.getElementById(step.targetId);
      if (!el) return;
      highlightedElRef.current = el;
      applyHighlight(el, primaryColor);

      // Scroll the spotlighted element to the center of the viewport.
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // After smooth scroll settles, measure where the element landed and
      // dock the card away from it if it ends up in the lower viewport half.
      measureTimerRef.current = setTimeout(() => {
        if (!highlightedElRef.current) return;
        const rect = highlightedElRef.current.getBoundingClientRect();
        setCardDock(rect.bottom > window.innerHeight * 0.55 ? 'top' : 'bottom');
      }, 520);
    }, 480);

    return () => {
      clearTimeout(timer);
      if (measureTimerRef.current) {
        clearTimeout(measureTimerRef.current);
        measureTimerRef.current = null;
      }
      if (highlightedElRef.current) {
        removeHighlight(highlightedElRef.current);
        highlightedElRef.current = null;
      }
    };
  }, [activeStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Final cleanup when the component unmounts (tour dismissed).
  useEffect(() => {
    return () => {
      if (highlightedElRef.current) {
        removeHighlight(highlightedElRef.current);
        highlightedElRef.current = null;
      }
    };
  }, []);

  // Render nothing if the tour has already been completed.
  if (!user || user.onboardingCompleted) return null;

  const clearHighlightNow = () => {
    if (highlightedElRef.current) {
      removeHighlight(highlightedElRef.current);
      highlightedElRef.current = null;
    }
  };

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      handleFinish();
    } else {
      goToStep(activeStep + 1);
    }
  };

  const handleBack = () => goToStep(activeStep - 1);

  const handleSkip = async () => {
    clearHighlightNow();
    sessionStorage.removeItem('onboarding_step');
    try {
      await updateMe({ onboardingCompleted: true });
    } catch (_) {
      // Non-fatal
    }
    onComplete();
  };

  const handleFinish = async () => {
    clearHighlightNow();
    sessionStorage.removeItem('onboarding_step');
    try {
      await updateMe({ onboardingCompleted: true });
    } catch (_) {
      // Non-fatal
    }
    onComplete();
  };

  return (
    <Portal>
      {/* Dim overlay — pointer-events: none so the user can still interact with
          spotlighted elements. z-index sits below the AppBar (1100) so the
          navigation header remains visible and its pulsing tab is always legible. */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.48)',
          zIndex: 1099,
          pointerEvents: 'none',
        }}
      />

      {/* Docked instruction card */}
      <TourStepCard
        step={step}
        stepIndex={activeStep}
        totalSteps={STEPS.length}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
        user={user}
        dockTop={cardDock === 'top'}
      />
    </Portal>
  );
};

export default OnboardingTour;
