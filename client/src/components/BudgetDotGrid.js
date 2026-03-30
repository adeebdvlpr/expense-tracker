import React, { useMemo } from 'react';
import { Box, Typography, GlobalStyles } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

const COLS = 20;
const ROWS = 5;
const TOTAL = COLS * ROWS; // 100 dots

// Seeded LCG — always produces the same sequence for a given seed
function mkRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = ((Math.imul(s, 1664525) + 1013904223) >>> 0);
    return s / 0x100000000;
  };
}

const BudgetDotGrid = ({ spent, income, monthLabel }) => {
  const theme = useTheme();

  const fmt = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    []
  );

  const pct = income > 0 ? Math.min(100, (spent / income) * 100) : 0;
  const remaining = income - spent;
  const over = remaining < 0;
  const dotsFilled = Math.round(pct);

  // Fixed layout properties — seeded so the grid never shifts on re-render
  const layout = useMemo(() => {
    const rng = mkRng(0xdeadbeef);
    return Array.from({ length: TOTAL }, () => {
      const r1 = rng(); // size tier
      const r2 = rng(); // jitter x
      const r3 = rng(); // jitter y
      const r4 = rng(); // gray opacity
      return {
        baseSize: r1 > 0.66 ? 10 : r1 > 0.33 ? 8 : 6,
        jx: (r2 - 0.5) * 3, // ±1.5px
        jy: (r3 - 0.5) * 3,
        inactiveAlpha: 0.18 + r4 * 0.22, // 0.18 – 0.40
      };
    });
  }, []); // empty deps — layout is fully deterministic from the seed

  const spentColor = theme.palette.info.main;    // Seagrass #439a86 — bright teal
  const inactiveColor = theme.palette.primary.main; // Wisteria Blue #5a6e9a — soft periwinkle

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes dotIn': {
            '0%': { opacity: 0, transform: 'scale(0.1)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>

        {/* Left: text */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
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

        {/* Right: 20×5 dot grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            flex: 1,
            minWidth: 0,
            height: 72,
          }}
        >
          {layout.map(({ baseSize, jx, jy, inactiveAlpha }, i) => {
            const isSpent = i < dotsFilled;
            const col = i % COLS;

            // Spent dots: +1px larger, Seagrass teal gradient lighter→darker left-to-right
            const sz = isSpent ? baseSize + 1 : baseSize;
            const gradT = COLS > 1 ? col / (COLS - 1) : 0;
            const bg = isSpent
              ? alpha(spentColor, 0.72 + gradT * 0.28)
              : alpha(inactiveColor, inactiveAlpha);

            // Center dot in its grid cell using top/left
            const topVal = `calc(50% + ${jy}px - ${sz * 0.5}px)`;
            const leftVal = `calc(50% + ${jx}px - ${sz * 0.5}px)`;

            return (
              <Box key={i} sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    width: sz,
                    height: sz,
                    top: topVal,
                    left: leftVal,
                    borderRadius: '50%',
                    bgcolor: bg,
                    animation: `dotIn 200ms ease-out ${i * 5}ms both`,
                  }}
                />
              </Box>
            );
          })}
        </Box>

      </Box>
    </>
  );
};

export default BudgetDotGrid;