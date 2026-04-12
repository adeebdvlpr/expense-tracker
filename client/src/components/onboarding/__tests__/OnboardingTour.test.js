import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import OnboardingTour from '../OnboardingTour';

// Mock react-router-dom so useNavigate works outside a real Router context.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the api module so tests make no real network calls.
jest.mock('../../../utils/api', () => ({
  updateMe: jest.fn().mockResolvedValue({ onboardingCompleted: true }),
}));

const { updateMe } = require('../../../utils/api');

const theme = createTheme();

function renderTour(userProps = {}, onComplete = jest.fn()) {
  const user = { onboardingCompleted: false, ...userProps };
  return render(
    <ThemeProvider theme={theme}>
      <OnboardingTour user={user} onComplete={onComplete} />
    </ThemeProvider>
  );
}

describe('OnboardingTour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Existing behaviour ────────────────────────────────────────────────────

  it('renders the tour when onboardingCompleted is false', () => {
    renderTour({ onboardingCompleted: false });
    expect(screen.getByText('Welcome to Ledgic')).toBeInTheDocument();
  });

  it('does not render when onboardingCompleted is true', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <OnboardingTour user={{ onboardingCompleted: true }} onComplete={jest.fn()} />
      </ThemeProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onComplete (and thus triggers checklist notifications) only after Finish is clicked', async () => {
    const onComplete = jest.fn();
    renderTour({ onboardingCompleted: false }, onComplete);

    expect(onComplete).not.toHaveBeenCalled();

    // Navigate through all steps (5 total, 4 Next clicks)
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

    // Now on the last step — Finish Setup button should be visible
    const finishBtn = screen.getByRole('button', { name: /finish setup/i });
    fireEvent.click(finishBtn);

    await waitFor(() => expect(updateMe).toHaveBeenCalledWith({ onboardingCompleted: true }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  // ── Change #7 assertions ─────────────────────────────────────────────────

  it('calls navigate when transitioning between steps', async () => {
    renderTour({ onboardingCompleted: false });

    // Initial render navigates to step 0 route (/app) via useEffect.
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/app'));

    // Advance to step 1 (Dashboard → still /app).
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/app'));

    // Advance to step 2 (Income → /account).
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/account'));
  });

  it('Skip button calls updateMe with onboardingCompleted:true and fires onComplete', async () => {
    const onComplete = jest.fn();
    renderTour({ onboardingCompleted: false }, onComplete);

    fireEvent.click(screen.getByRole('button', { name: /skip tour/i }));

    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ onboardingCompleted: true })
    );
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  it('Next button is always enabled regardless of field state (no deadlocks)', () => {
    renderTour({ onboardingCompleted: false });

    // Step 0: Next should be enabled.
    const nextBtn = screen.getByRole('button', { name: /^next$/i });
    expect(nextBtn).not.toBeDisabled();

    // Advance to step 2 (income field step).
    fireEvent.click(nextBtn);
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

    // Next is still enabled — no field fill required to proceed.
    expect(screen.getByRole('button', { name: /^next$/i })).not.toBeDisabled();
  });
});
