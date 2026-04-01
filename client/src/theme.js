import { createTheme } from '@mui/material/styles';

export const THEMES = [
  { name: 'misty-highlands', label: 'Misty Highlands', primary: '#5a6e9a' },
  { name: 'ember-slate',     label: 'Ember Slate',     primary: '#7c5c4a' },
  { name: 'midnight-plum',   label: 'Midnight Plum',   primary: '#6b4f8a' },
  { name: 'nordic-frost',    label: 'Nordic Frost',    primary: '#3d7a8a' },
  { name: 'golden-hour',     label: 'Golden Hour',     primary: '#b07d2e' },
  { name: 'obsidian-rose',   label: 'Obsidian Rose',   primary: '#8a3a4e' },
];

export const DEFAULT_THEME = 'misty-highlands';

const PALETTES = {
  'misty-highlands': {
    primary:   { main: '#5a6e9a' },
    secondary: { main: '#2e4521' },
    success:   { main: '#74aa7a' },
    info:      { main: '#439a86' },
    background: { default: '#f6f8fb', paper: '#ffffff' },
    dashboardBg: '#93A3C4',
    chartBg: '#1e2d45',
    donutPalette: ['#5a6e9a', '#74aa7a', '#439a86', '#8fa3c7', '#a8c5a0'],
    donutPaletteOnPrimary: ['#74aa7a', '#439a86', '#8fa3c7', '#b8c8e0', '#6685b5'],
  },
  'ember-slate': {
    primary:   { main: '#7c5c4a' },
    secondary: { main: '#3b3b3b' },
    success:   { main: '#c4845a' },
    info:      { main: '#9e7a6a' },
    background: { default: '#faf7f4', paper: '#ffffff' },
    dashboardBg: '#b09080',
    chartBg: '#2e1e14',
    donutPalette: ['#7c5c4a', '#c4845a', '#9e7a6a', '#d4a880', '#b89078'],
    donutPaletteOnPrimary: ['#c4845a', '#d4a880', '#e8c4a0', '#9e7a6a', '#f0d8c0'],
  },
  'midnight-plum': {
    primary:   { main: '#6b4f8a' },
    secondary: { main: '#2a1f3d' },
    success:   { main: '#9b72cf' },
    info:      { main: '#c47ec0' },
    background: { default: '#f8f6fc', paper: '#ffffff' },
    dashboardBg: '#9b80b8',
    chartBg: '#1e1030',
    donutPalette: ['#6b4f8a', '#9b72cf', '#c47ec0', '#8a70a8', '#c8a8e0'],
    donutPaletteOnPrimary: ['#9b72cf', '#c47ec0', '#d8b8f0', '#b8a8d8', '#7858a8'],
  },
  'nordic-frost': {
    primary:   { main: '#3d7a8a' },
    secondary: { main: '#1c3a4a' },
    success:   { main: '#5ab8c4' },
    info:      { main: '#a3cdd4' },
    background: { default: '#f2f8fa', paper: '#ffffff' },
    dashboardBg: '#6aacb8',
    chartBg: '#0e2a38',
    donutPalette: ['#3d7a8a', '#5ab8c4', '#a3cdd4', '#2d6a7a', '#78b8c8'],
    donutPaletteOnPrimary: ['#5ab8c4', '#a3cdd4', '#78b8c8', '#c0e0e8', '#38a8b8'],
  },
  'golden-hour': {
    primary:   { main: '#b07d2e' },
    secondary: { main: '#3d2c10' },
    success:   { main: '#d4a94a' },
    info:      { main: '#8fa86e' },
    background: { default: '#faf8f2', paper: '#ffffff' },
    dashboardBg: '#c8a060',
    chartBg: '#261a08',
    donutPalette: ['#b07d2e', '#d4a94a', '#8fa86e', '#c89050', '#a8c870'],
    donutPaletteOnPrimary: ['#d4a94a', '#8fa86e', '#f0c870', '#c0d888', '#e8b050'],
  },
  'obsidian-rose': {
    primary:   { main: '#8a3a4e' },
    secondary: { main: '#2b1a1e' },
    success:   { main: '#c46a7a' },
    info:      { main: '#7a6a8a' },
    background: { default: '#fbf6f7', paper: '#ffffff' },
    dashboardBg: '#b87080',
    chartBg: '#200d14',
    donutPalette: ['#8a3a4e', '#c46a7a', '#7a6a8a', '#d890a0', '#9a8aaa'],
    donutPaletteOnPrimary: ['#c46a7a', '#d890a0', '#9a8aaa', '#e8b0c0', '#b870a0'],
  },
};

const SHARED_PALETTE = {
  text: {
    primary: '#111827',
    secondary: '#4b5563',
  },
  divider: 'rgba(17, 24, 39, 0.12)',
};

export const createAppTheme = (name = DEFAULT_THEME) => {
  const themePalette = PALETTES[name] || PALETTES[DEFAULT_THEME];
  const palette = { ...themePalette, ...SHARED_PALETTE };

  return createTheme({
    palette,
    spacing: 8,
    shape: { borderRadius: 14 },
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
      h0: { fontSize: '3.125rem', fontWeight: 400, lineHeight: 1.5 },
      h1: { fontSize: '2.125rem', fontWeight: 400, lineHeight: 1.2 },
      h2: { fontSize: '1.625rem', fontWeight: 400, lineHeight: 1.25 },
      h3: { fontSize: '1.375rem', fontWeight: 400, lineHeight: 1.3 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
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
            borderRadius: 14,
            paddingLeft: 16,
            paddingRight: 16,
            transition: ' transform 120ms ease, box-shadow 120ms ease',
          },
          contained: {
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
          }
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
};

// Default export for backward compat
export default createAppTheme(DEFAULT_THEME);
