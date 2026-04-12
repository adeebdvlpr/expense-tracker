import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PredictionCard from '../components/PredictionCard';
import { predictions as predictionsApi } from '../utils/api';

const RISK_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'low', label: 'Low Risk' },
];

const PredictionsPage = () => {
  const theme = useTheme();
  const [predictionsList, setPredictionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('all');

  // Conversational advisor state
  const [chatHistory, setChatHistory] = useState([]); // [{ q, a }]
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    predictionsApi.getAll()
      .then((res) => setPredictionsList(res.data))
      .catch((err) => console.error('Failed to load predictions:', err))
      .finally(() => setLoading(false));
  }, []);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleDelete = (deletedId) => {
    setPredictionsList((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleChat = async () => {
    const q = chatInput.trim();
    if (!q) return;
    setChatInput('');
    setChatLoading(true);
    setChatError('');
    try {
      const res = await predictionsApi.advisorChat(q);
      setChatHistory((prev) => [...prev, { q, a: res.data.answer }]);
    } catch {
      setChatError('Could not get a response. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !chatLoading) {
      e.preventDefault();
      handleChat();
    }
  };

  const filtered = useMemo(() => {
    if (riskFilter === 'all') return predictionsList;
    return predictionsList.filter((p) => p.riskRating === riskFilter);
  }, [predictionsList, riskFilter]);

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{fontWeight: 800 ,mb: 0.5 }}>
          Financial Advisory
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          AI-powered advisory insights generated from your assets and life events.
        </Typography>

        {/* Ask Ledgic — conversational advisor */}
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '14px',
            p: 3,
            mb: 3,
          }}
        >
          <Typography variant="h3" sx={{ mb: 0.5 }}>
            Ask Ledgic
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ask about your spending, goals, or future plans.
          </Typography>

          {/* Chat history */}
          {chatHistory.length > 0 && (
            <Box
              sx={{
                maxHeight: 340,
                overflowY: 'auto',
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {chatHistory.map(({ q, a }, i) => (
                <Box key={i}>
                  {/* User question */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                    <Box
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderRadius: '12px 12px 2px 12px',
                        px: 2,
                        py: 1,
                        maxWidth: '75%',
                      }}
                    >
                      <Typography variant="body2">{q}</Typography>
                    </Box>
                  </Box>
                  {/* AI answer */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box
                      sx={{
                        bgcolor: theme.palette.action.hover,
                        borderRadius: '12px 12px 12px 2px',
                        px: 2,
                        py: 1,
                        maxWidth: '80%',
                      }}
                    >
                      <Typography variant="body2" color="text.primary">
                        {a}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              <div ref={chatEndRef} />
            </Box>
          )}

          {/* Input row */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder="Ask about your spending, goals, or future plans..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              disabled={chatLoading}
            />
            <Button
              variant="contained"
              onClick={handleChat}
              disabled={chatLoading || !chatInput.trim()}
              sx={{ minWidth: 80, height: 40, flexShrink: 0 }}
            >
              {chatLoading ? <CircularProgress size={18} color="inherit" /> : 'Ask'}
            </Button>
          </Box>

          {chatError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {chatError}
            </Typography>
          )}
        </Paper>

        {/* Risk Filter Bar */}
        {!loading && predictionsList.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={riskFilter}
              exclusive
              onChange={(_, val) => { if (val !== null) setRiskFilter(val); }}
              size="small"
            >
              {RISK_FILTERS.map(({ value, label }) => (
                <ToggleButton key={value} value={value} sx={{ textTransform: 'none', px: 2 }}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Prediction Cards */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : predictionsList.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No advisory insights yet. Navigate to Assets or Life Events and click "Consult AI Advisor" to get started.
          </Typography>
        ) : filtered.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No insights match the selected risk filter.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p._id}>
                <PredictionCard prediction={p} onDelete={handleDelete} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default PredictionsPage;
