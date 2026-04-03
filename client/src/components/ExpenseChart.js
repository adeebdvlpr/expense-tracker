import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';


/**
 * Sort categories descending, keep top 4, merge remainder into "Other".
 * Assigns palette colors in order.
 */
function capCategories(rawData, palette) {
  const sorted = [...rawData].sort((a, b) => b.value - a.value);
  if (sorted.length <= 5) {
    return sorted.map((d, i) => ({ ...d, color: palette[i] }));
  }
  const top4 = sorted.slice(0, 4);
  const rest = sorted.slice(4);
  const otherValue = rest.reduce((s, d) => s + d.value, 0);
  const result = top4.map((d, i) => ({ ...d, color: palette[i] }));
  if (otherValue > 0) {
    result.push({ id: 'Other', label: 'Other', value: otherValue, color: palette[4] });
  }
  return result;
}

function parseExpenseDate(expense) {
  const raw = expense?.date || expense?.createdAt || expense?.updatedAt;
  if (!raw) return null;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Custom bar — module-level (stable reference, no remounting).
 * - Top-only rounded corners via SVG path
 * - 55% of band width, centered — visible breathing room between bars
 * - Gradient opacity: more spending → more opaque
 */
const CustomBar = React.forwardRef(function CustomBar(props, ref) {
  const {
    x, y, width, height, color, dataIndex,
    barTotals = [],
    // Current-highlight mode (combo): last bar = accent color, past bars = dim
    currentBarIdx = -1,
    currentBarColor = null,
    pastBarColor = null,
    ownerState, isHighlighted, isFaded, // eslint-disable-line no-unused-vars
    ...rest
  } = props;

  if (!height || height <= 0) return null;

  let fillColor, opacity;
  if (currentBarIdx >= 0) {
    const isCurrent = dataIndex === currentBarIdx;
    fillColor = isCurrent ? (currentBarColor || color) : (pastBarColor || color);
    opacity = isCurrent ? 1.0 : 0.36;
  } else {
    // Gradient opacity mode: more spending → more opaque
    const maxVal = Math.max(...barTotals, 1);
    const val = barTotals[dataIndex] ?? 0;
    fillColor = color;
    opacity = 0.18 + (val / maxVal) * 0.82;
  }

  // Narrow the bar to 55% of the available band slot, centered
  const bw = width * 0.55;
  const bx = x + (width - bw) / 2;
  const r = Math.min(5, bw / 2);

  const d =
    `M ${bx + r},${y}` +
    ` h ${bw - 2 * r}` +
    ` a ${r},${r} 0 0 1 ${r},${r}` +
    ` v ${height - r}` +
    ` H ${bx}` +
    ` V ${y + r}` +
    ` a ${r},${r} 0 0 1 ${r},${-r}` +
    ` Z`;

  return (
    <path
      ref={ref}
      d={d}
      fill={fillColor}
      opacity={opacity}
      onClick={rest.onClick}
      onMouseEnter={rest.onMouseEnter}
      onMouseLeave={rest.onMouseLeave}
      onMouseMove={rest.onMouseMove}
      style={rest.style}
      className={rest.className}
    />
  );
});

const ComboBarTooltip = ({ dataIndex, axisValue, totals, labels }) => {
  const theme = useTheme();
  if (dataIndex == null || !totals?.length) return null;
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const val = totals[dataIndex] ?? 0;
  const prev = dataIndex > 0 ? totals[dataIndex - 1] : null;
  const next = dataIndex < totals.length - 1 ? totals[dataIndex + 1] : null;
  const isCurrent = dataIndex === totals.length - 1;
  const monthLabel = (labels && labels[dataIndex]) || axisValue || '';
  const prevLabel = (labels && labels[dataIndex - 1]) || '';
  const nextLabel = (labels && labels[dataIndex + 1]) || '';

  return (
    <Paper sx={{ p: 1.5, bgcolor: theme.palette.chartBg, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 1 }}>
      <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', mb: 0.5 }}>
        {monthLabel} — {fmt.format(val)}
      </Typography>
      {prev !== null && (() => {
        const diff = val - prev;
        const isMore = diff >= 0;
        return (
          <Typography sx={{ fontSize: '0.75rem', color: isMore ? '#f87171' : '#86efac' }}>
            {isMore ? '↑' : '↓'} {fmt.format(Math.abs(diff))} {isMore ? 'more' : 'less'} than {prevLabel}
          </Typography>
        );
      })()}
      {!isCurrent && next !== null && (() => {
        const diff = val - next;
        const isMore = diff >= 0;
        return (
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', mt: 0.25 }}>
            {isMore ? '↑' : '↓'} {fmt.format(Math.abs(diff))} {isMore ? 'more' : 'less'} than {nextLabel}
          </Typography>
        );
      })()}
    </Paper>
  );
};

const ExpenseChart = ({ expenses, chartType = 'pie', height = 320 }) => {
  const theme = useTheme();
  const donutPalette = theme.palette.donutPalette;
  const donutPaletteOnPrimary = theme.palette.donutPaletteOnPrimary;
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Drives donut center content on hover
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // All-time category totals (standalone pie / bar)
  const categoryData = useMemo(() => {
    const map = new Map();
    for (const exp of safeExpenses) {
      const label = exp.category || 'Uncategorized';
      const value = typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0;
      map.set(label, (map.get(label) || 0) + value);
    }
    const raw = Array.from(map.entries()).map(([label, value]) => ({ id: label, label, value }));
    return capCategories(raw, donutPalette);
  }, [safeExpenses, donutPalette]);

  // Daily totals (line mode)
  const dailyData = useMemo(() => {
    const map = new Map();
    for (const exp of safeExpenses) {
      const dt = parseExpenseDate(exp);
      if (!dt) continue;
      const key = toDateKey(dt);
      const value = typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0;
      map.set(key, (map.get(key) || 0) + value);
    }
    const keys = Array.from(map.keys()).sort();
    return { dates: keys, amounts: keys.map((k) => map.get(k)) };
  }, [safeExpenses]);

  // This month's spending by category — colors overridden in combo block
  const currentMonthCategoryData = useMemo(() => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = now.getMonth();
    const thisMonth = safeExpenses.filter((exp) => {
      const dt = parseExpenseDate(exp);
      return dt && dt.getFullYear() === yr && dt.getMonth() === mo;
    });
    const map = new Map();
    for (const exp of thisMonth) {
      const label = exp.category || 'Uncategorized';
      const value = typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0;
      map.set(label, (map.get(label) || 0) + value);
    }
    const raw = Array.from(map.entries()).map(([label, value]) => ({ id: label, label, value }));
    return capCategories(raw, donutPalette);
  }, [safeExpenses, donutPalette]);

  const totalThisMonth = useMemo(
    () => currentMonthCategoryData.reduce((s, d) => s + d.value, 0),
    [currentMonthCategoryData],
  );

  // Last 6 months totals (combo bar)
  const last6MonthsData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        total: 0,
      };
    });
    for (const exp of safeExpenses) {
      const dt = parseExpenseDate(exp);
      if (!dt) continue;
      const m = months.find((mo) => mo.year === dt.getFullYear() && mo.month === dt.getMonth());
      if (m) m.total += typeof exp.amount === 'number' ? exp.amount : Number(exp.amount) || 0;
    }
    return {
      labels: months.map((m) => m.label),
      totals: months.map((m) => m.total),
    };
  }, [safeExpenses]);

  // --- Empty state ---
  if (safeExpenses.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>No chart data yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Add expenses to see your spending breakdown.
        </Typography>
      </Paper>
    );
  }

  // --- COMBO: primary-blue background, donut left + bar right ---
  if (chartType === 'combo') {
    const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const barMax = Math.max(...last6MonthsData.totals, 1);

    // Remap to bright-on-primary palette
    const comboDonutData = currentMonthCategoryData.map((d, i) => ({
      ...d,
      color: donutPaletteOnPrimary[i % donutPaletteOnPrimary.length],
    }));

    const centerValue =
      hoveredIdx !== null && comboDonutData[hoveredIdx]
        ? `$${comboDonutData[hoveredIdx].value.toFixed(0)}`
        : `$${totalThisMonth.toFixed(0)}`;
    const centerLabel =
      hoveredIdx !== null && comboDonutData[hoveredIdx]
        ? comboDonutData[hoveredIdx].label
        : 'This Month';

    // Donut rendered taller than bar so the ring has room to breathe
    const DONUT_H = 220;
    // outerRadius 90, highlighted expands to 98; with margin 8 → 98+8=106 < 110 (DONUT_H/2) ✓
    const MUTED_WHITE = 'rgba(255,255,255,0.7)';

    return (
      <Paper sx={{ py: 1.5, pl: 2, pr: 0, bgcolor: theme.palette.chartBg }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

          {/* ── Donut ── */}
          <Box sx={{ flex: '0 0 34%', minWidth: 0 }}>
            <Typography sx={{ display: 'block', textAlign: 'center', mb: 0.5, ml: 13, fontSize: '0.73rem', color: MUTED_WHITE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {monthLabel}
            </Typography>

            {comboDonutData.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: DONUT_H }}>
                <Typography sx={{ fontSize: '0.75rem', color: MUTED_WHITE }}>No data this month</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* Category legend — vertical, left of donut */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, flexShrink: 0, pl: 0.5 }}>
                  {comboDonutData.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.7 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0, mt: '3px' }} />
                      <Typography sx={{ fontSize: '0.92rem', color: MUTED_WHITE, lineHeight: 1.25, maxWidth: 78 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* PieChart + center overlay */}
                <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <PieChart
                    height={DONUT_H}
                    series={[{
                      id: 'month-donut',
                      data: comboDonutData,
                      innerRadius: 60,
                      outerRadius: 90,
                      paddingAngle: 2,
                      cornerRadius: 4,
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { additionalRadius: -5, color: 'yellow' },
                      highlighted: { outerRadius: 98},
                      valueFormatter: (item) => `$${item.value.toFixed(0)}`,
                    }]}
                    onHighlightChange={(item) => setHoveredIdx(item?.dataIndex ?? null)}
                    margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    slots={{ legend: () => null, tooltip: () => null }}
                    slotProps={{ legend: { hidden: true } }}
                  />

                  {/* Center text — sits inside the donut hole */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                      width: 100,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.1, color: '#ffffff' }}>
                      {centerValue}
                    </Typography>
                    <Typography sx={{ fontSize: '0.58rem', lineHeight: 1.3, color: MUTED_WHITE, display: 'block' }}>
                      {centerLabel}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* ── Bar ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title centered over the plot area — offset matches left axis margin */}
            <Box sx={{ ml: '55px', mr: '10px', textAlign: 'center', mb: 0.25 }}>
              <Typography sx={{ fontSize: '0.73rem', color: MUTED_WHITE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                6-Month Spending Overview
              </Typography>
            </Box>
            <BarChart
              height={height}
              xAxis={[{
                scaleType: 'band',
                data: last6MonthsData.labels,
                disableLine: true,
                disableTicks: true,
                tickLabelStyle: { fontSize: 11, fill: 'rgba(255,255,255,0.6)' },
              }]}
              yAxis={[{
                disableLine: true,
                disableTicks: true,
                tickLabelStyle: { fontSize: 11, fill: 'rgba(255,255,255,0.6)' },
                max: barMax * 1.22,
              }]}
              series={[{
                data: last6MonthsData.totals,
                color: theme.palette.info.main,
                valueFormatter: (v) => `$${(v ?? 0).toFixed(0)}`,
              }]}
              grid={{ horizontal: true }}
              barLabel={(item) => (item.value > 0 ? `$${Math.round(item.value)}` : null)}
              slots={{ bar: CustomBar, axisContent: ComboBarTooltip }}
              slotProps={{
                legend: { hidden: true },
                bar: {
                  barTotals: last6MonthsData.totals,
                  currentBarIdx: last6MonthsData.totals.length - 1,
                  currentBarColor: theme.palette.success.main,
                  pastBarColor: theme.palette.info.main,
                },
                axisContent: {
                  totals: last6MonthsData.totals,
                  labels: last6MonthsData.labels,
                },
              }}
              margin={{ top: 24, bottom: 35, left: 55, right: 10 }}
              sx={{
                '& .MuiChartsGrid-horizontalLine': {
                  stroke: 'rgba(255,255,255,0.14)',
                  strokeWidth: '1px',
                },
                '& .MuiChartsGrid-verticalLine': { display: 'none' },
                '& .MuiChartsBarLabel-root, & .MuiBarLabel-root': {
                  fontSize: '11px',
                  fill: 'rgba(255,255,255,0.85)',
                },
                '@media (max-width: 600px)': {
                  '& .MuiChartsBarLabel-root, & .MuiBarLabel-root': { display: 'none' },
                },
              }}
            />
          </Box>

        </Box>
      </Paper>
    );
  }

  // --- PIE (donut, all-time, white background) ---
  if (chartType === 'pie') {
    const totalAll = categoryData.reduce((s, d) => s + d.value, 0);
    const centerV =
      hoveredIdx !== null && categoryData[hoveredIdx]
        ? `$${categoryData[hoveredIdx].value.toFixed(0)}`
        : `$${totalAll.toFixed(0)}`;
    const centerL =
      hoveredIdx !== null && categoryData[hoveredIdx]
        ? categoryData[hoveredIdx].label
        : 'Total Spent';

    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Spending Breakdown</Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <PieChart
              height={height}
              series={[{
                id: 'all-pie',
                data: categoryData,
                innerRadius: 60,
                outerRadius: 120,
                paddingAngle: 2,
                cornerRadius: 6,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 60, additionalRadius: -6, color: 'gray' },
                highlighted: { outerRadius: 128 },
                valueFormatter: (item) => `$${item.value.toFixed(2)}`,
              }]}
              onHighlightChange={(item) => setHoveredIdx(item?.dataIndex ?? null)}
              slots={{ legend: () => null, tooltip: () => null }}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: theme.palette.common.white,
                  fontSize: 13,
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                width: 100,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.1 }}>
                {centerV}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {centerL}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  }

  // --- BAR (category totals, all-time, white background) ---
  if (chartType === 'bar') {
    const barValues = categoryData.map((d) => d.value);
    const barMaxStandalone = Math.max(...barValues, 1);

    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Spending by Category</Typography>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <BarChart
            height={height}
            xAxis={[{
              scaleType: 'band',
              data: categoryData.map((d) => d.label),
              disableLine: true,
              disableTicks: true,
              tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
            }]}
            yAxis={[{
              disableLine: true,
              disableTicks: true,
              tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
              max: barMaxStandalone * 1.22,
            }]}
            series={[{
              data: barValues,
              label: 'Amount ($)',
              color: theme.palette.primary.main,
              valueFormatter: (v) => `$${v.toFixed(2)}`,
            }]}
            grid={{ horizontal: true }}
            barLabel={(item) => (item.value > 0 ? `$${Math.round(item.value)}` : null)}
            slots={{ bar: CustomBar }}
            slotProps={{ bar: { barTotals: barValues } }}
            margin={{ left: 60, right: 20, top: 24, bottom: 60 }}
            sx={{
              '& .MuiChartsGrid-horizontalLine': {
                stroke: 'rgba(0,0,0,0.09)',
                strokeWidth: '0.5px',
              },
              '& .MuiChartsGrid-verticalLine': { display: 'none' },
              '& .MuiChartsBarLabel-root, & .MuiBarLabel-root': {
                fontSize: '11px',
                fill: theme.palette.text.secondary,
              },
              '@media (max-width: 600px)': {
                '& .MuiChartsBarLabel-root, & .MuiBarLabel-root': { display: 'none' },
              },
            }}
          />
        </Box>
      </Paper>
    );
  }

  // --- LINE (daily spending trend) ---
  if (chartType === 'line') {
    if (dailyData.dates.length < 2) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>Spending Over Time</Typography>
          <Typography variant="body2" color="text.secondary">
            Need expenses on at least 2 different dates to show a trend.
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Spending Over Time</Typography>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <LineChart
            height={height}
            xAxis={[{
              scaleType: 'point',
              data: dailyData.dates,
              disableLine: true,
              disableTicks: true,
              tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
            }]}
            yAxis={[{
              disableLine: true,
              disableTicks: true,
              tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
            }]}
            series={[{
              data: dailyData.amounts,
              label: 'Daily spending ($)',
              color: theme.palette.primary.main,
              area: true,
              showMark: dailyData.dates.length <= 30,
              valueFormatter: (v) => `$${(v ?? 0).toFixed(2)}`,
            }]}
            margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
          />
        </Box>
      </Paper>
    );
  }

  return null;
};

export default ExpenseChart;
