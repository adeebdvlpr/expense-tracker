import { createTheme } from '@mui/material/styles';

const palette = {
  primary: { main: '#7e92c8' },   // Wisteria Blue
  secondary: { main: '#2e4521' }, // Dark Spruce
  success: { main: '#74aa7a' },   // Sage Green (accent)
  info: { main: '#439a86' },      // Seagrass (neutral-ish)
  background: {
    default: '#f6f8fb',           // soft cool background (keeps primary feeling premium)
    paper: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
  },
  divider: 'rgba(17, 24, 39, 0.12)',
};

const theme = createTheme({
  palette,
  spacing: 8, // 8px system
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: [
      'Sansation',
      'Inter',
      'Roboto',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },    // ~32px
    h2: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25 }, // ~24px
    h3: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 }, // ~20px
    body1: { fontSize: '1rem', lineHeight: 1.6 },                  // 16px
    body2: { fontSize: '0.95rem', lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        margin: 'normal',
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
  },
});

export default theme;
