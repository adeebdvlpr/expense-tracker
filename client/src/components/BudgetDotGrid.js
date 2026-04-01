import { useMemo } from 'react';
import { Box, Typography, GlobalStyles, Tooltip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

const COLS = 20;
const ROWS = 5;
const TOTAL = COLS * ROWS; // 100 hexagons
const HEX_R = 10;          // grid-unit radius (center to vertex), pointy-top
const RENDER_R = HEX_R * 0.86; // rendered radius — ~14% gap between hexes
const SQRT3 = Math.sqrt(3);

// --- Geometry (pointy-top hexagons) ---
// Col spacing: SQRT3 * HEX_R  |  Row spacing: 1.5 * HEX_R
// Odd rows shift right by SQRT3 * HEX_R / 2
function hexCenter(col, row) {
  const x = col * SQRT3 * HEX_R + (row % 2 === 1 ? SQRT3 * HEX_R / 2 : 0) + SQRT3 * HEX_R / 2;
  const y = row * 1.5 * HEX_R + HEX_R;
  return { x, y };
}

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // pointy-top: first vertex at top
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

// SVG canvas dimensions
const SVG_W = COLS * SQRT3 * HEX_R + SQRT3 * HEX_R / 2;
const SVG_H = (ROWS - 1) * 1.5 * HEX_R + 2 * HEX_R;

// Seeded LCG for stable inactive-cell alpha variation
function mkRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = ((Math.imul(s, 1664525) + 1013904223) >>> 0);
    return s / 0x100000000;
  };
}

// Build fill order: bottom-left corner first, slight diagonal angle upward
// score = col + (ROWS-1 - row) * TILT  →  lower score = closer to bottom-left
const TILT = 1.6;
const CELLS = (() => {
  const rng = mkRng(0xbeefcafe);
  return Array.from({ length: TOTAL }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const { x, y } = hexCenter(col, row);
    return {
      col, row, x, y,
      inactiveAlpha: 0.13 + rng() * 0.18,
      score: col + (ROWS - 1 - row) * TILT,
    };
  }).sort((a, b) => a.score - b.score);
})();

const BudgetDotGrid = ({ spent, income, monthLabel }) => {
  const theme = useTheme();

  const fmt = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    [],
  );

  const pct = income > 0 ? Math.min(100, (spent / income) * 100) : 0;
  const remaining = income - spent;
  const over = remaining < 0;
  const cellsFilled = Math.round(pct);

  const spentColor = theme.palette.info.main;       // Seagrass teal #439a86
  const inactiveColor = theme.palette.primary.main; // Wisteria Blue #5a6e9a

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes hexIn': {
            '0%': { opacity: 0, transform: 'scale(0.15)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>

        {/* Left: text labels */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {monthLabel} Budget
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 400, lineHeight: 1.1, mb: 0.5 }}>
            {fmt.format(spent)}
          </Typography>
          <Typography variant="caption" color={over ? 'error.main' : 'text.secondary'}>
            {over
              ? `${fmt.format(Math.abs(remaining))} over budget`
              : `${fmt.format(remaining)} remaining`}
          </Typography>
        </Box>

        {/* Right: 20×5 hexagonal grid */}
        <Tooltip
          title={`${Math.round(pct)}% of ${monthLabel} budget spent`}
          placement="top"
          arrow
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: '#2b2b2b',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 500,
                px: 1.5,
                py: 0.875,
                boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
              },
            },
            arrow: { sx: { color: '#2b2b2b' } },
          }}
        >
        <Box sx={{ flex: 1, minWidth: 0, cursor: 'default' }}>
          <svg
            viewBox={`0 0 ${SVG_W.toFixed(2)} ${SVG_H.toFixed(2)}`}
            width="100%"
            style={{ display: 'block', overflow: 'visible' }}
            preserveAspectRatio="xMidYMid meet"
          >
            {CELLS.map(({ col, row, x, y, inactiveAlpha }, fillIdx) => {
              const isFilled = fillIdx < cellsFilled;
              // Filled: lighter at bottom-left start, richer teal toward the leading edge
              const gradT = TOTAL > 1 ? fillIdx / (TOTAL - 1) : 0;
              const fillColor = isFilled
                ? alpha(spentColor, 0.65 + gradT * 0.35)
                : alpha(inactiveColor, inactiveAlpha);

              return (
                <polygon
                  key={`${col}-${row}`}
                  points={hexPoints(x, y, RENDER_R)}
                  fill={fillColor}
                  style={{
                    animation: `hexIn 200ms ease-out ${fillIdx * 5}ms both`,
                    transformOrigin: `${x.toFixed(2)}px ${y.toFixed(2)}px`,
                  }}
                />
              );
            })}
          </svg>
        </Box>
        </Tooltip>

      </Box>
    </>
  );
};

export default BudgetDotGrid;
