import React, { useEffect, useState } from 'react';
import { getMe, updateMe } from '../utils/api';
import {
  Container, Box, Typography, Alert, CircularProgress,
  TextField, MenuItem, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const REASONS = ['Budgeting', 'Saving', 'Debt', 'Tracking', 'Other'];

const AccountPage = () => {
  const [profile, setProfile] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const me = await getMe();
        setProfile(me);

        // Normalize values for inputs
        setDateOfBirth(me?.dateOfBirth ? new Date(me.dateOfBirth).toISOString().slice(0, 10) : '');
        setReason(me?.reason || '');
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Only send fields you want to update; allow clearing by sending null
      const payload = {
        dateOfBirth: dateOfBirth || null,
        reason: reason || null,
      };

      const updated = await updateMe(payload);
      setProfile(updated);
      setSuccess('Profile updated!');
    } catch (e) {
      // Your validate middleware returns { message, errors: [{field,message}] }
      const apiMsg = e.response?.data?.message;
      const fieldErrors = e.response?.data?.errors?.map(x => `${x.field}: ${x.message}`).join(' | ');
      setError(fieldErrors || apiMsg || e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Account</Typography>
        <Button variant="text" onClick={() => navigate('/')}>Back</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Username" value={profile?.username || ''} disabled />
        <TextField label="Email" value={profile?.email || ''} disabled />

        <TextField
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          InputLabelProps={{ shrink: true }}
          helperText="Optional"
        />

        <TextField
          select
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          helperText="Optional"
        >
          <MenuItem value="">(None)</MenuItem>
          {REASONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>

        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>
    </Container>
  );
};

export default AccountPage;
