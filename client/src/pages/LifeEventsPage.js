import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { getLifeEvents, createLifeEvent, updateLifeEvent, deleteLifeEvent } from '../utils/api';
import AppLayout from '../components/AppLayout';
import LifeEventCard from '../components/LifeEventCard';
import LifeEventForm from '../components/LifeEventForm';

export default function LifeEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState(0); // 0 = Active, 1 = Inactive

  const [formOpen, setFormOpen]               = useState(false);
  const [editingEvent, setEditingEvent]       = useState(null);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success', action: null });
  const openSnack  = (message, severity = 'success', action = null) => setSnack({ open: true, message, severity, action });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const handlePredictSuccess = () => {
    openSnack(
      'Prediction generated!',
      'success',
      <Button size="small" color="inherit" onClick={() => navigate('/predictions')}>View</Button>,
    );
  };

  const handlePredictError = (message) => {
    openSnack(message, 'error');
  };

  const currency = 'USD';

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLifeEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      openSnack('Failed to load life events.', 'error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const activeEvents   = events.filter((e) => e.isActive);
  const inactiveEvents = events.filter((e) => !e.isActive);
  const displayedEvents = activeTab === 0 ? activeEvents : inactiveEvents;

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
  };

  const handleSave = async (payload) => {
    try {
      if (editingEvent) {
        const updated = await updateLifeEvent(editingEvent._id, payload);
        setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
        openSnack('Life event updated.');
      } else {
        const created = await createLifeEvent(payload);
        setEvents((prev) => [created, ...prev]);
        openSnack('Life event added.');
      }
      handleCloseForm();
    } catch (err) {
      openSnack(err?.response?.data?.message || 'Failed to save life event.', 'error');
      throw err; // keep dialog open on error
    }
  };

  const handleToggleActive = async (ev) => {
    try {
      const updated = await updateLifeEvent(ev._id, { isActive: !ev.isActive });
      setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
      openSnack(updated.isActive ? 'Marked as active.' : 'Marked as inactive.');
    } catch {
      openSnack('Failed to update life event.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this life event? This cannot be undone.')) return;
    try {
      await deleteLifeEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      openSnack('Life event deleted.');
    } catch {
      openSnack('Failed to delete life event.', 'error');
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="h4" sx={{fontWeight: 800 }}>Life Events</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Track ongoing circumstances that affect your long-term finances.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: '10px', flexShrink: 0 }}
          >
            Add Life Event
          </Button>
        </Stack>

        {/* Loading bar */}
        {loading && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

        {/* Active / Inactive tabs */}
        {!loading && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab label={`Active (${activeEvents.length})`} />
            <Tab label={`Inactive (${inactiveEvents.length})`} />
          </Tabs>
        )}

        {/* Content */}
        {!loading && displayedEvents.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '14px',
              textAlign: 'center',
              background: 'rgba(247, 249, 252, 0.9)',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {events.length === 0
                ? 'No life events yet. Add one to start tracking your ongoing financial commitments.'
                : activeTab === 0
                  ? 'No active life events. Events you pause will appear in the Inactive tab.'
                  : 'No inactive life events.'}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {displayedEvents.map((ev) => (
              <LifeEventCard
                key={ev._id}
                lifeEvent={ev}
                currency={currency}
                onEdit={handleOpenEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onPredictSuccess={handlePredictSuccess}
                onPredictError={handlePredictError}
              />
            ))}
          </Stack>
        )}

      </Container>

      {/* Add / Edit Dialog */}
      <LifeEventForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        lifeEvent={editingEvent}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={snack.action ? 6000 : 4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled" action={snack.action} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
