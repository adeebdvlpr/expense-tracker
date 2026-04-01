# Ledgic — Architecture.md
> Loaded at the start of every implementation session. Read this fully before writing any code.

---

## Project Overview

**Ledgic** is a full-stack personal finance application. It lets users track expenses, manage monthly budgets, and set savings goals. The roadmap extends this into proactive AI-powered financial planning — projecting future costs based on assets, life events, and spending patterns.

The app is a portfolio-grade production project. Code quality, visual consistency, and architectural cleanliness matter.

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (1-hour expiry), stored in `sessionStorage` client-side, passed as `x-auth-token` header
- **Security:** Helmet, express-rate-limit (auth routes: 20 req/15 min), CORS (configurable origins)
- **Validation:** express-validator + custom `validate.js` middleware
- **Logging:** Morgan (dev/prod format) + correlation IDs (x-request-id)
- **Password hashing:** bcryptjs
- **Testing:** Jest + Supertest + mongodb-memory-server (in-band, NODE_ENV=test)
- **Scheduler (planned):** node-cron (for recurring payments)
- **AI (planned):** @anthropic-ai/sdk, all calls routed through `server/services/aiService.js` — never scattered across controllers

### Frontend
- **Framework:** React 18
- **UI Library:** MUI v7 (@mui/material, @mui/icons-material)
- **Charts:** @mui/x-charts v8 (primary), chart.js + react-chartjs-2 (secondary)
- **Routing:** react-router-dom v6
- **HTTP:** axios (instance with request/response interceptors in `client/src/utils/api.js`)
- **Money formatting:** `client/src/utils/money.js` → `formatMoney(amount, currency)`

---

## Directory Structure

```
expense-tracker/
├── CLAUDE.md                         ← This file
├── package.json                      ← Root (Express + test deps)
├── Procfile                          ← Heroku deploy
├── .env                              ← MONGO_URI, JWT_SECRET, CORS_ORIGINS, ANTHROPIC_API_KEY (future)
│
├── server/
│   ├── server.js                     ← Express app + middleware + route registration
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Budgets.js
│   │   ├── Goal.js
│   │   ├── RecurringPayment.js       ← [Change 4]
│   │   ├── Asset.js                  ← [Change 5]
│   │   ├── LifeEvent.js              ← [Change 5]
│   │   ├── AIPrediction.js           ← [Change 5]
│   │   └── Notification.js           ← [Change 5]
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── expenseController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   ├── recurringController.js    ← [Change 4]
│   │   ├── assetController.js        ← [Change 5]
│   │   ├── lifeEventController.js    ← [Change 5]
│   │   ├── predictionController.js   ← [Change 5]
│   │   └── notificationController.js ← [Change 5]
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── users.js
│   │   ├── budgets.js
│   │   ├── goals.js
│   │   ├── recurring.js              ← [Change 4]
│   │   ├── assets.js                 ← [Change 5]
│   │   ├── lifeEvents.js             ← [Change 5]
│   │   ├── predictions.js            ← [Change 5]
│   │   └── notifications.js          ← [Change 5]
│   ├── services/
│   │   ├── recurringScheduler.js     ← [Change 4] node-cron job
│   │   ├── aiService.js              ← [Change 5] SINGLE AI gateway
│   │   ├── predictionEngine.js       ← [Change 5] business logic
│   │   └── notificationService.js    ← [Change 5]
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validate.js
│   └── tests/
│       ├── jest.setup.js
│       ├── auth.test.js
│       ├── budgets.test.js
│       └── expenses.test.js
│
└── client/
    ├── package.json
    └── src/
        ├── App.js                    ← Route definitions
        ├── index.js
        ├── theme.js                  ← MUI theme (DO NOT change colors without design approval)
        ├── pages/
        │   ├── MarketingLandingPage.js
        │   ├── AuthPage.js
        │   ├── ExpenseTracker.js     ← Dashboard
        │   ├── AccountPage.js
        │   ├── BudgetsPage.js
        │   ├── GoalsPage.js
        │   ├── RecurringPage.js      ← [Change 4]
        │   ├── AssetsPage.js         ← [Change 5]
        │   ├── PredictionsPage.js    ← [Change 5]
        │   └── LifeEventsPage.js     ← [Change 5]
        ├── components/
        │   ├── AppLayout.js
        │   ├── AppHeader.js
        │   ├── AppFooter.js
        │   ├── ExpenseForm.js
        │   ├── ExpenseList.js
        │   ├── ExpenseChart.js
        │   ├── BudgetForm.js
        │   ├── BudgetChart.js
        │   ├── BudgetWidget.js
        │   ├── GoalForm.js
        │   ├── GoalsWidget.js
        │   ├── SummaryMetricCard.js  ← [Change 2]
        │   ├── ExpandableWidget.js   ← [Change 2]
        │   ├── GoalProgressChart.js  ← [Change 3]
        │   ├── AssetForm.js          ← [Change 5]
        │   ├── AssetCard.js          ← [Change 5]
        │   ├── PredictionCard.js     ← [Change 5]
        │   ├── LifeEventForm.js      ← [Change 5]
        │   ├── NotificationBell.js   ← [Change 5]
        │   ├── OnboardingWalkthrough.js ← [Change 6]
        │   └── auth/
        │       ├── Login.js
        │       └── Register.js
        ├── utils/
        │   ├── api.js                ← All API calls — add new functions here, never make axios calls elsewhere
        │   └── money.js
        ├── constants/
        │   └── categories.js
        └── styles/
            └── ExpenseTracker.css
```

---

## Current Routes

| Path | Component | Auth |
|---|---|---|
| `/` | MarketingLandingPage | Public |
| `/auth` | AuthPage | Public |
| `/app` | ExpenseTracker (Dashboard) | Protected |
| `/account` | AccountPage | Protected |
| `/budgets` | BudgetsPage | Protected |
| `/goals` | GoalsPage | Protected |
| `/recurring` | RecurringPage | Protected [Change 4] |
| `/assets` | AssetsPage | Protected [Change 5] |
| `/predictions` | PredictionsPage | Protected [Change 5] |
| `/life-events` | LifeEventsPage | Protected [Change 5] |

---

## Data Models

### Current Models

**User**
- `username`, `email`, `passwordHash`
- `dateOfBirth`, `reason` (enum), `monthlyIncome`, `currency`
- `dashboardPrefs`: `{ showExpenseChart, showBudgetWidget, showGoalsWidget, chartType }`
- `selectedTheme`: String (default `'misty-highlands'`) — 6 theme options
- `customCategories`: [String] — user-defined expense categories appended to defaults
- `incomeType`: enum `['monthly','annual','weekly','rolling']` (default `'monthly'`)
- **Pending additions:** `location: { city, state, country, postalCode }`, `onboardingCompleted: Boolean`

**Income** *(new — 2b session)*
- `userId` (ref User), `amount`, `description`, `category` (enum: Salary/Freelance/Investment Return/Gift/Inheritance/Bonus/Other), `date`

**Expense**
- `user`, `description`, `amount`, `category`, `date`
- **Pending additions:** `isRecurring: Boolean`, `recurringPaymentId: ObjectId ref RecurringPayment`

**Goal**
- `user`, `name`, `targetAmount`, `currentAmount`, `targetDate`, `notes`, `currency`, `status`
- **Pending additions:** `source: enum ['user', 'ai']`, `predictionId: ObjectId ref AIPrediction`

**Budgets**
- `user`, `period` (YYYY-MM), `category`, `amount`, `currency`

### Planned New Models

**RecurringPayment** — defines a repeating expense pattern
- `user`, `description`, `amount`, `category`, `interval` (daily/weekly/monthly/annual)
- `startDate`, `endDate` (optional), `nextDueDate` (indexed), `isActive`, `lastLoggedDate`

**Asset** — home systems, vehicles, appliances
- `user`, `name`, `type` (home_system/appliance/vehicle/electronics/other)
- `brand`, `purchaseYear`, `purchasePrice`
- `warrantyLengthYears`, `warrantyExpiryDate`, `condition`
- `subtype` (e.g. 'roof', 'hvac'), `materialType`
- `mileage`, `make`, `vehicleModel` (vehicle-specific)

**LifeEvent** — ongoing circumstances that generate future costs
- `user`, `type` (pet/college/vehicle_ownership/medical/eldercare/other)
- `name`, `isActive`, `details: Mixed` (type-specific JSON payload)

**AIPrediction** — stored AI projection result
- `user`, `sourceType` (asset/lifeEvent/expense/manual), `sourceId`
- `title`, `summary`, `projectedCost`, `projectedDate`
- `monthlySavingsTarget`, `timelineLabel`, `confidence`
- `linkedGoalId`, `dismissed`
- `aiProvider`, `rawPrompt`, `rawResponse` (for debugging/audit)

**Notification** — in-app alerts
- `user`, `type` (warranty_expiry/inspection_reminder/ai_prediction/budget_alert/goal_milestone)
- `title`, `message`, `sourceType`, `sourceId`
- `read`, `dismissed`, `scheduledFor`

---

## API Endpoints

### Existing
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/expenses`, `POST /api/expenses`, `DELETE /api/expenses/:id`
- `GET /api/users/me`, `PATCH /api/users/me`
- `GET /api/budgets?period=YYYY-MM`, `POST /api/budgets`, `DELETE /api/budgets/:id`
- `GET /api/goals?status=`, `POST /api/goals`, `PATCH /api/goals/:id`, `DELETE /api/goals/:id`
- `GET /api/income`, `POST /api/income`, `DELETE /api/income/:id` *(new — 2b session)*

### Planned New Endpoints

**Recurring (`/api/recurring`)**
- `GET`, `POST`, `PATCH /:id`, `DELETE /:id`, `POST /:id/trigger`

**Assets (`/api/assets`)**
- `GET`, `POST`, `PATCH /:id`, `DELETE /:id`

**Life Events (`/api/life-events`)**
- `GET`, `POST`, `PATCH /:id`, `DELETE /:id`

**AI Predictions (`/api/predictions`)**
- `GET`, `POST /generate`, `PATCH /:id`, `DELETE /:id`

**Notifications (`/api/notifications`)**
- `GET`, `PATCH /:id`, `PATCH /mark-all-read`

---

## Design Conventions

### Theme (DO NOT change without explicit design approval)
- **Primary (Wisteria Blue):** `#5a6e9a`
- **Secondary (Dark Spruce):** `#2e4521`
- **Success (Sage Green):** `#74aa7a`
- **Info (Seagrass):** `#439a86`
- **Background:** `#f6f8fb`
- **Border radius:** 14px
- **Spacing unit:** 8px

### Typography (custom h0–h3)
- `h0`: 3rem / 700 weight (hero text)
- `h1`: 2rem / 700
- `h2`: 1.5rem / 700
- `h3`: 1.25rem / 700
- `body1`: 1rem, `body2`: 0.95rem

### Component Conventions
- All protected pages are wrapped in `AppLayout` — never add a Header or Footer inside a page component
- All API calls go through `client/src/utils/api.js` — never use axios directly in components
- Currency formatting always uses `formatMoney(amount, currency)` from `client/src/utils/money.js`
- Expense categories come from `client/src/constants/categories.js` — add new categories there, not inline
- Charts use `@mui/x-charts` as primary — use `chart.js` only if x-charts cannot support the required visualization

### Auth Conventions
- Token stored in `sessionStorage` key: `'token'`
- All protected API calls use `x-auth-token` header (set automatically by axios interceptor)
- 401 response auto-redirects to `/auth` and clears token (handled in `api.js` interceptor)

---

## Known Issues to Address (Change 2b — in progress)

1. **Income feed not visible in dashboard** — Adding income works server-side but the "Expense Feed" does not display income transactions. The feed needs to be renamed (something like "Transactions" or "Money Feed") and rewired to show both expenses (red/outgoing) and income entries (green/incoming), plus any fixed salary attribution.

2. **Theme change does not update dashboard background color** — `ExpenseTracker.js` hardcodes `bgcolor: '#93A3C4'` and `ExpenseChart.js` hardcodes `#1e2d45` for the combo chart background. These must derive from the active theme. Each theme should define its own `dashboardBg` and `chartBg` color.

3. **Chart colors (donut + bar) do not adapt to theme** — `DONUT_PALETTE` and `DONUT_PALETTE_ON_PRIMARY` are hardcoded Misty Highlands colors. Each theme needs its own palette set; the combo chart background and bar chart "current month" accent color must derive from the active theme's primary/success/info values.

---

## Known Fixes Applied (do not revert)
- `User.js`: `monthlyIncome` (was `monethlyIncome`)
- `User.js`: removed erroneous `@sinclair/typebox` import
- `Budgets.js`: fixed period regex + `equired` → `required`
- `validate.js`: removed "HERE" debug text from error message
- `userController.js`: `chartType` included in dashboardPrefs merge loop

---

## Full Build Order

| # | Change | Complexity | Key Dependencies |
|---|---|---|---|
| 1 | Auth & Navigation Fixes | Low | None |
| 2 | Dashboard Overhaul | High | None |
| 3 | Goals Per-Goal Completion Charts | Low | Change 2 complete |
| 4 | Recurring Payments | Medium | Change 2 complete (ExpenseForm) |
| 5a | AI: All new data models + User/Expense/Goal field additions | Low | Change 4 complete |
| 5b | AI: Asset Inventory (CRUD + frontend) | Medium | 5a |
| 5c | AI: Life Events Module (CRUD + frontend) | Medium | 5a |
| 5d | AI: Service Layer (aiService.js + predictionEngine.js) | High | 5b + 5c |
| 5e | AI: Predictions API + PredictionsPage | High | 5d |
| 5f | AI: Notification system | Medium | 5e |
| 5g | AI: Auto-goal generation from predictions | Medium | 5e + Change 3 |
| 6 | Onboarding Walkthrough | Medium | All of the above |

---

## Third-Party Services

| Service | Package | Purpose | Stage |
|---|---|---|---|
| Anthropic Claude | `@anthropic-ai/sdk` | AI predictions | Change 5d |
| node-cron | `node-cron` | Auto-log recurring payments | Change 4 |
| Regional cost data | Static JSON (Phase 1) | Location-aware projections | Change 5d |

**Environment variables to add:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## AI Architecture Rules

These rules must be followed in every session that touches the AI feature:

1. **Single gateway:** ALL Anthropic API calls go through `server/services/aiService.js`. No controller, route, or scheduler calls the Anthropic SDK directly.
2. **Prompt storage:** Every AI call stores `rawPrompt` and `rawResponse` on the `AIPrediction` document for auditability and debugging.
3. **Model selection:** Default to `claude-sonnet-4-6` for predictions. Use `claude-haiku-4-5-20251001` for high-volume, low-complexity calls (e.g. expense categorization) to control cost.
4. **Graceful degradation:** If the AI service is unavailable or returns an error, the app must still function. AI predictions are enhancements, not blockers.
5. **Regional data:** Projections must reference the user's `location` field. If location is not set, AI responses should explicitly flag that projections are not location-specific.
6. **No AI calls on the frontend:** The React client never calls Anthropic directly. All AI interactions go through the Express API.

---

## Session Rules (for all future implementation sessions)

1. **One change at a time.** Each session implements exactly one numbered change from the build order above (or one sub-step within Change 5). Do not combine changes.

2. **Plan before code.** At the start of each session, read this file and the relevant files for the planned change. State which files will be touched before writing any code.

3. **Read before edit.** Never modify a file you haven't read in the current session. Use the Read tool first.

4. **No speculative improvements.** Do not refactor, add comments, or "clean up" code that is not part of the current change. Keep diffs minimal and reviewable.

5. **Update this file after each session.** When a change is complete, update the "Directory Structure" section to remove `← [Change N]` markers for completed items, update "Known Fixes Applied" if any bugs were fixed, and note any deviation from the plan in a new "Session Notes" section at the bottom.

6. **Test before marking complete.** Every backend change must pass existing tests. New routes should have at least a smoke-test written before the session ends.

7. **Conflicts first.** If a file touched by the current change has been modified since the last session, flag the conflict before writing any code.

8. **Never scatter axios calls.** All API calls go through `client/src/utils/api.js`. Never import axios directly in a component or page.

9. **Never scatter AI calls.** All Anthropic SDK calls go through `server/services/aiService.js`. Never import `@anthropic-ai/sdk` in a controller or route directly.

10. **Preserve auth conventions.** Token stays in `sessionStorage['token']`. Header stays `x-auth-token`. Do not introduce cookies or localStorage for auth.

---

## Session Notes

*(Append notes here after each implementation session — date, what was built, any deviations from plan)*

**2026-03-29 — Architect session:** Full codebase reviewed. Architecture.md created. No code written. Awaiting approval to begin Change 1.

**2026-03-29 — Change 1 (Auth & Navigation Fixes):** Implemented all three sub-changes.
- 4a: `MarketingLandingPage.js` — "Get started" (nav) and "Create account" (hero) CTAs now route to `/auth?tab=register`. "Sign in" buttons unchanged.
- 4b: `AuthPage.js` — Logo block is now clickable (navigates to `/`). Back arrow `IconButton` added. Tab state initialised from `?tab=register` query param via `useSearchParams`.
- 4c: `AuthPage.js` — Witty escape link "I'd rather not be financially stable" added below the form card, styled as muted white text.
- Files modified: `client/src/pages/MarketingLandingPage.js`, `client/src/pages/AuthPage.js` only.
- Deviations from plan: none.

**2026-03-31 — Change 2b continued (Dashboard Visual Polish + Feature Additions):** Extended 2b beyond pure visual work. New data model (Income), new API route, new UI features added. This session is NOT yet complete — 3 known issues remain (see "Known Issues to Address" section).

Changes made this session:
- `client/src/theme.js` — refactored to `createAppTheme(name)` factory. Added 6 named themes: Misty Highlands, Ember Slate, Midnight Plum, Nordic Frost, Golden Hour, Obsidian Rose. Exports `THEMES` array, `DEFAULT_THEME`, `createAppTheme` (named), and default export for backward compat.
- `client/src/App.js` — added `ThemeContext` (exported). Theme state initialized from `localStorage('appTheme')`. `setSelectedTheme` persists to localStorage, triggers live re-render via `useMemo`.
- `client/src/pages/AccountPage.js` — added 3 new sections: Theme Picker (6 swatch cards, live preview), Expense Categories (default chips + deletable custom chips + add-new field), Income (type toggle: Monthly/Annual/Weekly/Rolling Income 🌊 + amount field with monthly-equivalent preview).
- `client/src/constants/categories.js` — added `DEFAULT_CATEGORIES` export; `CATEGORIES` kept as alias.
- `client/src/components/ExpenseForm.js` — now accepts `categories` prop (falls back to `DEFAULT_CATEGORIES`).
- `client/src/components/IncomeForm.js` — NEW. MUI Dialog for adding income entries (same pattern as ExpenseForm; income-specific categories).
- `client/src/components/BudgetDotGrid.js` — full rewrite: replaced CSS circle-dot grid with SVG pointy-top hexagon grid (20×5, 100 hexes). Fill order: bottom-left corner upward at a ~55° diagonal (TILT=1.6). Filled hexes use teal gradient; inactive hexes use muted blue-gray. MUI Tooltip on hover shows `"X% of [Month] budget spent"` styled like x-charts dark card.
- `client/src/components/ExpenseChart.js` — donut tooltip disabled via `slots={{ tooltip: () => null }}` (combo + standalone). Combo legend moved to LEFT of donut (vertical column). Legend dots 10px, text 0.92rem. "Savings & Investments" wraps naturally via `maxWidth: 78`. Donut section flex `44%`. Added `ComboBarTooltip` module-level component for bar hover: dark card showing month + amount, ↑/↓ vs previous month, ↑/↓ vs next month (non-current bars only).
- `client/src/pages/ExpenseTracker.js` — loads `customCategories`, `incomeType`, income transactions on mount. Computes `effectiveMonthlyIncome` (rolling = sum this month's income entries). Passes `allCategories` to ExpenseForm. "+ Add Income" button + IncomeForm dialog added to sidebar. Expense feed sorted most-recent-first. Dashboard background `Box bgcolor: '#93A3C4'`.
- `client/src/components/AppLayout.js` — `<Box component="main">` gains `display: flex, flexDirection: column` so dashboard background fills full height.
- `server/models/User.js` — added `selectedTheme`, `customCategories`, `incomeType` fields.
- `server/models/Income.js` — NEW model (userId, amount, description, category enum, date).
- `server/controllers/userController.js` — handles `selectedTheme`, `customCategories`, `incomeType` in `updateMe`.
- `server/controllers/incomeController.js` — NEW (getIncome, addIncome, deleteIncome with ownership check).
- `server/routes/income.js` — NEW (GET / POST / DELETE /:id, all behind auth + express-validator).
- `server/server.js` — income route registered at `/api/income`.
- `client/src/utils/api.js` — added `getIncome`, `addIncome`, `deleteIncome`.

Files NOT changed this session: `AppHeader.js`, `AppFooter.js`, `GoalsWidget.js`, `BudgetWidget.js`, `ExpenseList.js`, `GoalsPage.js`, `BudgetsPage.js`, `AuthPage.js`, `MarketingLandingPage.js`, all server models except User/Income, all other server routes/controllers.

**2026-03-30 — Change 2b (Dashboard Visual Polish):** Visual-only changes. No layout, no data model changes.
- 5b: `ExpenseChart.js` — combo BarChart: custom `CustomBar` slot (top-only rounded corners via SVG path, gradient opacity where higher spending = more opaque, min 0.18 / max 1.0). Horizontal-only grid lines at 0.5px / 9% opacity. Axis lines and ticks removed (`disableLine`, `disableTicks`). Y-axis max padded 22% above tallest bar. Value labels via `barLabel` prop, hidden on mobile. All bar modes (combo, standalone) updated.
- 5c: `ExpenseChart.js` — combo PieChart (donut): replaced `generateHslPalette` + `basePalette` with fixed 5-color cohesive `DONUT_PALETTE` (`#5a6e9a`, `#74aa7a`, `#439a86`, `#8fa3c7`, `#a8c5a0`). Categories capped at 5 segments (smallest merged into "Other") via `capCategories()`. Center content overlay (absolute Box over PieChart) shows total / "This Month" by default, updates to hovered segment value + label via `onHighlightChange`. Applied to standalone pie mode too.
- 5d: `ExpenseForm.js` — redesigned as MUI Dialog (`maxWidth="sm"`, `borderRadius: 14px`). Layout: Row 1 — Amount + Category side by side; Row 2 — Description full width. Header: `DialogTitle` + `CloseIcon` button. Footer: Cancel (text) + Add Expense (contained). Data shape, validation logic, and submission handler unchanged. `ExpenseTracker.js` updated: inline Paper/form replaced with a contained "Add Expense" button; `expenseDialogOpen` state drives the Dialog; `ExpenseForm` rendered as portal at component root.
- Files modified: `client/src/components/ExpenseChart.js`, `client/src/components/ExpenseForm.js`, `client/src/pages/ExpenseTracker.js`.
- Deviations from plan: none.

**2026-03-29 — Change 2a (Dashboard Layout Restructure):** Layout-only changes to ExpenseTracker.js.
- `ExpenseList` (Recent Expenses) is now the dominant visual element: `Grid item xs={12} md={8}` (was `md={7}`), with `maxHeight: 560` and `overflow: 'auto'` on the scroll container (replaces the fixed `height: { md: 420 }` on the Paper).
- Add Expense form, GoalsWidget, and BudgetWidget moved into a right sidebar: `Grid item xs={12} md={4}`, stacked in a `Box flexDirection: 'column' gap: 2`. Widgets no longer have their own `Grid item` wrappers.
- ExpenseChart remains `Grid item xs={12}` full-width at the bottom, unchanged.
- Summary row (3 metric cards) unchanged.
- On mobile: list stacks first (`xs={12}`), then sidebar — natural stacking order preserved.
- Files modified: `client/src/pages/ExpenseTracker.js` only.
- Deviations from plan: none.

**2026-04-01 — Change 2b complete (4 known issues resolved):**

1. **Income feed merged into Money Feed** — `ExpenseList.js` rewritten to accept `transactions` prop (unified array with `_type: 'expense' | 'income'`). Each row has a colored indicator dot (red = expense, green = income). Income amounts display with `+` prefix in green. Delete routes to `onDeleteIncome` or `onDeleteExpense` based on type. `ExpenseTracker.js`: added `filteredIncome` + `allTransactions` memos, `handleDeleteIncome` callback, `deleteIncome` import. Feed renamed "Money Feed". Shown count reflects merged total.

2. **Dashboard background theme-aware** — `theme.js`: each theme in `PALETTES` now has `dashboardBg` and `chartBg` color values. `ExpenseTracker.js`: reads `theme.palette.dashboardBg` via `useTheme()`. Hardcoded `'#93A3C4 '` (plus trailing space bug) removed.

3. **Chart palettes theme-aware** — `theme.js`: each theme defines `donutPalette` and `donutPaletteOnPrimary` arrays. `ExpenseChart.js`: module-level `DONUT_PALETTE` / `DONUT_PALETTE_ON_PRIMARY` constants removed. `categoryData` and `currentMonthCategoryData` memos use `theme.palette.donutPalette`. Combo donut remap uses `theme.palette.donutPaletteOnPrimary`. Combo bar `currentBarColor` → `theme.palette.success.main`, `pastBarColor` → `theme.palette.info.main`. Combo bar series default `color` → `theme.palette.info.main`. `ComboBarTooltip` Paper uses `theme.palette.chartBg` via `useTheme()` inside the module-level component.

4. **Theme synced from server on login** — `ExpenseTracker.js` imports `ThemeContext` from `App.js`, destructures `setSelectedTheme`, and calls it after `getMe()` resolves with `me.selectedTheme`. This writes to `localStorage` and triggers a live theme re-render without any new API call.

Files modified: `client/src/theme.js`, `client/src/components/ExpenseList.js`, `client/src/components/ExpenseChart.js`, `client/src/pages/ExpenseTracker.js`.
Files NOT modified: `App.js`, `AppLayout.js`, `AppHeader.js`, `AppFooter.js`, `IncomeForm.js`, `BudgetWidget.js`, `GoalsWidget.js`, all server files, all test files.
Deviations from plan: none.
