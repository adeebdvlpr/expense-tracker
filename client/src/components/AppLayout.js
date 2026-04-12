import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import OnboardingTour from './onboarding/OnboardingTour';
import { getMe, triggerChecklistNotifications } from '../utils/api';

const AppLayout = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => {}); // silent — auth failure handled by axios interceptor
  }, []);

  const handleTourComplete = async () => {
    // Mark tour done in local state immediately so the overlay disappears
    setUser((prev) => (prev ? { ...prev, onboardingCompleted: true } : prev));
    // Create persistent checklist notifications for any missing critical fields
    try {
      await triggerChecklistNotifications();
      // Dispatch a bell-refresh event so NotificationBell picks up the new items
      window.dispatchEvent(new Event('ledgic:checklist-created'));
    } catch (_) {
      // Non-fatal
    }
  };

  const tourActive = Boolean(user && !user.onboardingCompleted);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader tourActive={tourActive} />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
      <AppFooter />
      {tourActive && (
        <OnboardingTour user={user} onComplete={handleTourComplete} />
      )}
    </Box>
  );
};

export default AppLayout;
