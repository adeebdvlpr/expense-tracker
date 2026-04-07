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
- **Scheduler:** node-cron (for recurring payments)
- **AI:** @anthropic-ai/sdk (installed Change 5d), all calls routed through `server/services/aiService.js` — never scattered across controllers

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
│   │   ├── Income.js
│   │   ├── Expense.js
│   │   ├── Budgets.js
│   │   ├── Goal.js
│   │   ├── RecurringPayment.js
│   │   ├── Asset.js
│   │   ├── LifeEvent.js
│   │   ├── AIPrediction.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── expenseController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   ├── recurringController.js
│   │   ├── incomeController.js
│   │   ├── assetController.js
│   │   ├── lifeEventController.js
│   │   ├── predictionController.js
│   │   └── notificationController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── users.js
│   │   ├── budgets.js
│   │   ├── goals.js
│   │   ├── income.js
│   │   ├── recurring.js
│   │   ├── assets.js
│   │   ├── lifeEvents.js
│   │   ├── predictions.js
│   │   └── notifications.js
│   ├── services/
│   │   ├── recurringScheduler.js
│   │   ├── aiService.js              ← SINGLE AI gateway
│   │   ├── predictionEngine.js
│   │   └── notificationService.js    ← [Change 5f]
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validate.js
│   └── tests/
│       ├── jest.setup.js
│       ├── auth.test.js
│       ├── budgets.test.js
│       ├── expenses.test.js
│       ├── assets.test.js
│       ├── lifeEvents.test.js
│       └── predictionEngine.test.js
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
        │   ├── RecurringPage.js
        │   ├── AssetsPage.js
        │   ├── PredictionsPage.js
        │   └── LifeEventsPage.js
        ├── components/
        │   ├── AppLayout.js
        │   ├── AppHeader.js
        │   ├── AppFooter.js
        │   ├── ExpenseForm.js
        │   ├── ExpenseList.js
        │   ├── ExpenseChart.js
        │   ├── IncomeForm.js
        │   ├── BudgetDotGrid.js
        │   ├── BudgetForm.js
        │   ├── BudgetChart.js
        │   ├── BudgetWidget.js
        │   ├── GoalForm.js
        │   ├── GoalsWidget.js
        │   ├── SummaryMetricCard.js  ← MISSING (marker removed in 2c; file not found on disk)
        │   ├── ExpandableWidget.js
        │   ├── GoalProgressChart.js
        │   ├── AssetForm.js
        │   ├── AssetCard.js
        │   ├── PredictionCard.js
        │   ├── LifeEventForm.js
        │   ├── LifeEventCard.js
        │   ├── NotificationBell.js   ← [Change 5f]
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
| `/recurring` | RecurringPage | Protected |
| `/assets` | AssetsPage | Protected |
| `/predictions` | PredictionsPage | Protected [Change 5e] |
| `/life-events` | LifeEventsPage | Protected |

---

## Data Models

### Current Models

**User**
- `username`, `email`, `passwordHash`
- `dateOfBirth`, `reason` (enum: Budgeting/Saving/Debt/Tracking/Other), `monthlyIncome`, `currency`
- `dashboardPrefs`: `{ showExpenseChart, showBudgetWidget, showGoalsWidget, chartType (enum: pie/bar/line) }`
- `selectedTheme`: String (default `'misty-highlands'`) — 6 theme options
- `customCategories`: [String] — user-defined expense categories appended to defaults
- `incomeType`: enum `['monthly','annual','weekly','rolling']` (default `'monthly'`)
- `overallMonthlyBudget`: Number (optional, min: 0) — user-level monthly cap, not period-specific
- `location`: `{ city, state, country, postalCode }` — all String, optional (added Change 5a)
- `onboardingCompleted`: Boolean (default: false) — (added Change 5a)

**Income** *(new — 2b session)*
- `userId` (ref User), `amount`, `description`, `category` (enum: Salary/Freelance/Investment Return/Gift/Inheritance/Bonus/Other), `date`

**Expense**
- `user`, `description`, `amount`, `category`, `date`
- `isRecurring: Boolean` (default false), `recurringPaymentId: ObjectId ref RecurringPayment` (optional)

**Goal**
- `user`, `name`, `targetAmount`, `currentAmount`, `targetDate`, `notes`, `currency`
- `status`: enum `['active','completed','archived']` (default: `'active'`)
- `source`: enum `['user','ai']` (default: `'user'`) — (added Change 5a)
- `predictionId`: ObjectId ref AIPrediction (default: null) — (added Change 5a)

**Budgets**
- `user`, `period` (YYYY-MM), `category`, `amount`, `currency`

### New Models (Change 4)

**RecurringPayment** — defines a repeating expense pattern
- `user`, `description`, `amount`, `category`, `interval` (daily/weekly/monthly/annual)
- `startDate`, `endDate` (optional), `nextDueDate` (indexed), `isActive`, `lastLoggedDate`

**Asset** — home systems, vehicles, appliances, real estate, investments
- `user`, `name`, `type` (enum: home_system/appliance/vehicle/electronics/real_estate/investment/business/other)
- `brand`, `purchaseYear`, `purchasePrice`
- `warrantyLengthYears`, `warrantyExpiryDate`, `condition` (enum: excellent/good/fair/poor)
- `subtype` (e.g. 'roof', 'hvac'), `materialType` — home_system-specific
- `mileage`, `make`, `vehicleModel` — vehicle-specific
- `estimatedCurrentValue`: Number (optional, default: null)
- `annualOwnershipCost`: Number (optional, default: null)
- `depreciationModel`: enum `['none','straight_line','accelerated','appreciating']` (default: `'none'`)
- `annualDepreciationRate`: Number 0–100 (optional, default: null)
- `generatesIncome`: Boolean (default: false)
- `monthlyIncomeAmount`: Number (optional, default: null)
- `expectedReplacementYear`: Number (optional, default: null)
- `notes`: String (default: `''`)
*(Financial fields added in 5b revision; types real_estate/investment/business added in 5b revision)*

**LifeEvent** — ongoing circumstances that generate future costs
- `user`, `type` (enum: pet/college/vehicle_ownership/medical/eldercare/wedding/home_purchase/home_renovation/new_baby/retirement/relocation/other)
- `name`, `isActive` (Boolean, default: true)
- `details`: structured sub-document (not Mixed — expanded in 5c revision):
  - Universal: `description`, `estimatedCost`, `costFrequency` (enum: one_time/monthly/annual), `targetDate`
  - Pet-specific: `petName`, `species`, `age`
  - College-specific: `studentName`, `institution`, `startYear`, `endYear`
  - Vehicle-specific: `vehicleDescription`, `condition`
  - Eldercare-specific: `personName`, `careLevel` (enum: in_home/assisted_living/memory_care)
*(6 additional types and structured details schema added in 5c revision)*

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
- `GET /api/recurring`, `POST /api/recurring`, `PATCH /api/recurring/:id`, `DELETE /api/recurring/:id`, `POST /api/recurring/:id/trigger` *(Change 4)*
- `GET /api/assets`, `POST /api/assets`, `PATCH /api/assets/:id`, `DELETE /api/assets/:id` *(Change 5b)*
- `GET /api/life-events`, `POST /api/life-events`, `PATCH /api/life-events/:id`, `DELETE /api/life-events/:id` *(Change 5c)*
- `GET /api/predictions`, `POST /api/predictions/asset/:assetId`, `POST /api/predictions/life-event/:eventId` *(Change 5e)*

### Stub Endpoints (registered, return 501 — full implementation pending)

**Notifications (`/api/notifications`)** — full implementation in Change 5f
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

**2026-04-01 — Change 2c (ExpandableWidget):** Change 2 fully complete.

- `client/src/components/ExpandableWidget.js` — NEW. Reusable wrapper component. Props: `children`, `expandedContent`, `title`, optional `expandIcon`. Renders children in a `position: relative` Box with a small `OpenInFullIcon` IconButton (opacity 0.45, hover → 1) absolutely positioned top-right. On click, opens a MUI Dialog (`maxWidth="sm"`, `fullWidth`, Paper `borderRadius: 14px`) with DialogTitle + CloseIcon dismiss button and DialogContent showing `expandedContent`. Self-contained open/closed state via `useState` — no modal state needed in parent.
- `client/src/pages/ExpenseTracker.js` — Added imports: `getBudgets`, `getGoals` (api), `formatMoney` (money.js), `ExpandableWidget`, `LinearProgress`, `Stack`. Added module-level helpers: `getCurrentPeriod()`, `goalProgressPercent()`. Added `BudgetExpandedContent` module-level component: fetches `getBudgets({ period, includeSpent: true })` on mount, renders per-category table (Category / Budget / Spent / Remaining) with remaining in `success.main` or `error.main` based on sign; shows "No budgets set for this month." empty state. Added `GoalsExpandedContent` module-level component: fetches `getGoals({ status: 'active' })` on mount (all active goals, no slice), renders each goal with name, amounts, % complete, target date ("Dec 2026" format), and 4px `LinearProgress` with `success.main` ≥75% / `warning.main` ≥40% / `info.main` <40%; shows "No active goals yet." empty state. Wrapped `<BudgetWidget>` and `<GoalsWidget>` in `<ExpandableWidget>` in the sidebar — no other sidebar/layout/chart/data-fetch changes.
- `Architecture.md` — "Known Issues to Address" section removed (all issues resolved in prior 2b sessions). `← [Change 2]` markers removed from `SummaryMetricCard.js` and `ExpandableWidget.js`. Change 2 is now fully complete.

Files modified: `client/src/components/ExpandableWidget.js` (new), `client/src/pages/ExpenseTracker.js`, `Architecture.md`.
Files NOT modified: `BudgetWidget.js`, `GoalsWidget.js`, `SummaryMetricCard.js`, `AppHeader.js`, `theme.js`, `api.js`, all server files, all test files.
Deviations from plan: none.

**2026-04-01 — Change 3 (Goals Per-Goal Completion Charts):**

- `client/src/components/GoalProgressChart.js` — NEW. Self-contained donut chart component. Props: `currentAmount`, `targetAmount`, `currency`, `size` (default 120). PieChart from `@mui/x-charts` with two segments (filled/remaining), 68% cutout (`innerRadius = outerRadius * 0.68`), `startAngle: -90` / `endAngle: 270` for top-start orientation, `paddingAngle: 0` for continuous ring, `pointerEvents: none` (display-only). Color thresholds: ≥75% → `success.main`, ≥40% → `info.main`, <40% → `primary.main` (all from theme). Remaining segment: `action.disabledBackground`. Minimum arc of 0.5 prevents invisible filled segment at 0%. Capped at 100% when currentAmount ≥ targetAmount. Center overlay (absolutely-positioned Box): percentage in bold + "of goal" muted label — never empty.
- `client/src/pages/GoalsPage.js` — Modified. Imported `GoalProgressChart`. Inserted `<GoalProgressChart size={110} />` between the info column and edit/delete buttons in each goal card. Updated saved-amount Typography color to `success.main`. Updated target date format from `toLocaleDateString()` to `toLocaleDateString('en-US', { month: 'short', year: 'numeric' })` (renders "Dec 2026"). All existing functionality (add, edit, delete, status tabs, progress overview chart) preserved.

Files NOT modified: `GoalsWidget.js`, `ExpandableWidget.js`, `ExpenseTracker.js`, `ExpenseChart.js`, `BudgetWidget.js`, `theme.js`, `api.js`, all server files, all test files.
Deviations from plan: none.

---

**2026-04-02 — Change 3.0.2 (UNPLANNED — Revision of Change 3 output + Budget Page Overhaul):**

> **Deviation from build order:** This session was not in the original Change sequence. It was approved by the user after reviewing Change 3 output and requesting revisions to the Goals visualizations and a comprehensive Budget page overhaul. It is documented here as an addendum to Change 3, not as a new numbered change. Change 4 has not yet begun.

### Sub-step 5a — GoalsPage.js: Progress Overview replaced with horizontal bars
- Removed the `PieChart` import and `chartData` useMemo entirely from `GoalsPage.js`.
- Replaced the PieChart "Progress Overview" Paper with a scannable horizontal-bar summary. Each row: goal name (noWrap, flex:1) | LinearProgress (flex:3, height 10, borderRadius 5, colored via `'& .MuiLinearProgress-bar'` sx slot) | percentage label (caption, 36px fixed) | current/target amounts (caption, muted, 130px fixed). Color thresholds: `success.main` ≥75%, `warning.main` ≥40%, `info.main` <40%. Paper uses `background: "rgba(247, 249, 252, 0.9)"`, elevation 0, no border — matching GoalsWidget style. Only shown when `activeStatus === 'active' && goals.length > 0`.

### Sub-step 5b — GoalsPage.js: LinearProgress block under goal cards (document-only)
- The user manually commented out the LinearProgress + "X% complete" caption block beneath each goal card in `GoalsPage.js` prior to this session. No code change was applied in this session. This is documented here for completeness.

### Sub-step 5c — GoalProgressChart.js: PieChart → Gauge radial arc
- Complete rewrite of `GoalProgressChart.js` in-place. Same props interface: `currentAmount`, `targetAmount`, `currency`, `size` (default 120).
- Replaced `PieChart` implementation with `Gauge` from `@mui/x-charts/Gauge`. Arc: `startAngle: -110`, `endAngle: 110` (220° open-bottom arc). Center text via `text={({ value }) => \`${value}%\`}` prop — no manual overlay Box needed.
- Colors via `gaugeClasses.valueArc` sx: `success.main` ≥75%, `info.main` ≥40%, `primary.main` <40%. Track via `gaugeClasses.referenceArc`: `action.disabledBackground`. Text via `gaugeClasses.valueText`: fontWeight 700, fontSize `1rem` (size ≥ 100) or `0.75rem`, fill `text.primary`. All colors from `useTheme()`.
- Removed PieChart import and center overlay Box. Wrapped Gauge in `Box` with `width: size, height: size, flexShrink: 0`.

### Sub-step 5d — GoalsWidget.js: LinearProgress list → double donut PieChart
- Removed `.slice(0, 3)` cap — widget now fetches ALL active goals.
- Replaced the `goals.map(LinearProgress)` Stack with a concentric double-ring `PieChart` (height 200):
  - Outer ring: `targetAmount` per goal — `innerRadius: 46, outerRadius: 78`.
  - Inner ring: `currentAmount` per goal — `innerRadius: 16, outerRadius: 40`.
  - Both: `paddingAngle: 2, cornerRadius: 3`. Colors from `theme.palette.donutPalette[i % len]`; inner ring uses same colors with `'aa'` opacity suffix appended.
  - Both series: `slots={{ legend: () => null }}` — no legend, no tooltip.
- Center overlay (absolutely-positioned Box over PieChart): default state shows total progress % + "of total goals" caption; hovered state (via `onHighlightChange`) shows that goal's % + name + saved amount.
- Added `useState` for `highlighted` and `useTheme` for `donutPalette`. Paper, header, and footer link unchanged.

### Sub-step 5e — BudgetForm.js: inline form → MUI Dialog
- Complete rewrite as MUI Dialog, modeled after GoalForm.js.
- Props: `open`, `onClose`, `onSave`, `budget` (null = Add), `defaultPeriod`.
- Add mode: all fields editable (period, category, amount). Edit mode: period and category displayed as read-only Typography (changing either would create a new entry via upsert key); only amount is editable.
- `useEffect` on `[open, budget]` resets form state. Validation: period + category required in Add only; amount > 0 always.
- Dialog: `maxWidth="sm"`, `fullWidth`, `PaperProps: { borderRadius: '14px' }`. DialogActions: Cancel (text) + Submit (contained), disabled while saving. Parent is responsible for closing — form calls `onSave` and parent calls `onClose` on success.

### Sub-step 5f — BudgetChart.js: pie/bar chart → horizontal bar overview
- Complete redesign. New props: `budgets, currency, totalBudget, totalSpent, overallBudget`. Old props `chartType` and `monthlyIncome` removed.
- Per-category rows: category name (flex:1) | progress track (flex:3, height 22, borderRadius 6) | spent/budget label (fixed right). Fill color: `success.main` ≤80%, `warning.main` 80–100%, `error.main` over. Dollar amount inside bar when pct > 15, outside when ≤ 15. Over-budget rows: `bgcolor: alpha(error.main, 0.04)`.
- Summary section (below Divider): overall bar + "Budget • Spent • Remaining" caption. If `overallBudget` is provided, shows cap note below. Empty state if `budgets.length === 0`. Paper: `elevation={0}`, `background: "rgba(247, 249, 252, 0.9)"`.
- `alpha` imported from `@mui/material/styles` for over-budget row tint.

### Sub-step 5g — BudgetsPage.js: comprehensive overhaul (G1–G12)
- **G1** (server): `server/models/User.js` — added `overallMonthlyBudget: { type: Number, required: false, min: 0 }`. Stored on User (not period-specific) — deliberate simplification: a monthly cap is a user-level preference, not tied to any individual period.
- **G2** (server): `server/controllers/userController.js` — added `overallMonthlyBudget` to destructure + $set/$unset logic (same pattern as `monthlyIncome` — clears if null/empty, sets if provided).
- **G3**: Header row: Stack with title/subtitle Box + "Add Budget" contained Button (`onClick` → `setFormOpen(true)`).
- **G4**: Monthly cap Paper row (below header): `TextField type="number"` for `overallBudgetInput` + SaveIcon `IconButton`. On save: calls `updateMe({ overallMonthlyBudget })`, updates local state, shows Snackbar. Loaded from `getMe()` on mount.
- **G5**: Removed "OVERVIEW NUMBERS" Paper (total budget / spent / remaining). This information is now in `BudgetChart`.
- **G6**: Added MUI Tabs: "Active" (tab 0 = current month) / "Archived" (tab 1 = `archivedPeriod` with month `TextField` picker). `activePeriod` derived from tab. `useEffect` reacts to both `activeTab` and `archivedPeriod`.
- **G7**: `BudgetChart` updated to new props signature: `budgets, currency, totalBudget, totalSpent, overallBudget`. Removed `chartType` and `monthlyIncome`.
- **G8**: Removed inline `BudgetForm` Paper entirely.
- **G9**: Budget list title changed from `"Budgets for {YYYY-MM}"` to `"Budgets for {Month Year}"` via `new Date(\`${period}-01\`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })`.
- **G10**: Each budget card: replaced LinearProgress + "X% used" caption with inline `Gauge` (width 80, height 80, same `startAngle/endAngle` as GoalProgressChart, `gaugeClasses` sx). Added Edit `IconButton` (left of Delete) → opens BudgetForm in edit mode.
- **G11**: `<BudgetForm>` Dialog rendered at page root. `handleSaveBudget` closes the dialog (`setFormOpen(false)`) on success.
- **G12**: Replaced `setError`/`setSuccess` + inline Alert boxes with Snackbar + Alert pattern (same as GoalsPage). Loading `LinearProgress` moved to header area.

### Files modified this session
- `client/src/pages/GoalsPage.js`
- `client/src/components/GoalProgressChart.js`
- `client/src/components/GoalsWidget.js`
- `client/src/components/BudgetForm.js`
- `client/src/components/BudgetChart.js`
- `client/src/pages/BudgetsPage.js`
- `server/models/User.js`
- `server/controllers/userController.js`

### Files NOT modified this session
`GoalForm.js` (reference only), `AppHeader.js`, `theme.js`, `ExpenseTracker.js`, `ExpenseChart.js`, `api.js`, `Budgets.js`, `budgetController.js`, all test files.

### Deviations from plan
- `overallMonthlyBudget` is stored on the `User` model (not per-period) — deliberate simplification. A monthly budget cap is a user preference, not a period-specific data point.
- Change 3 is now considered fully complete including 3.0.2 revisions. The original Change 3 GoalProgressChart (PieChart donut) has been superseded by the Gauge implementation.

---

### Post-implementation tweaks — GoalsWidget.js (applied after initial 3.0.2 review)

All changes are to `client/src/components/GoalsWidget.js` only.

**Sizing (user-requested, applied by Claude):**
- PieChart `height` increased 200 → 260 (+30%) then manually adjusted to 240 by user.
- Outer ring: `innerRadius 46→60`, `outerRadius 78→91` (radii scaled ×1.3, ring width thinned 25%).
- Inner ring: initially scaled to `innerRadius 21, outerRadius 44`, then shifted outward to `innerRadius 33, outerRadius 56` to reduce gap to outer ring from 16px to 4px. Outer ring was not modified during gap reduction.
- Tooltip popup suppressed: `slots={{ legend: () => null, tooltip: () => null }}`.

**Whitespace (user-requested, applied by Claude then refined by user):**
- Header `mb` reduced from `1.5` → `0.75` → user further adjusted to `0.3`.
- Footer `mt` reduced from `1.5` → `0.75`. Footer `pt` reduced from `1.5` → `0.3` (user adjusted).

**Hover center-overlay differentiation (user-requested, partially complete):**
- Intent: hovering outer ring segment shows that goal's **target amount**; hovering inner ring segment shows that goal's **progress (saved) amount**.
- Claude's implementation used `highlighted.seriesIndex` — incorrect (field does not exist on the `onHighlightChange` payload).
- User manually assigned `id: 1` to the outer series and `id: 0` to the inner series in the PieChart JSX.
- Current logic `(highlighted.seriesId ? true : false)` is still broken: `seriesId === 0` (inner ring) is falsy, so `isOuterRing` is always `false`, and both rings show `currentAmount`. A TODO comment is left in the file.
- **Known outstanding issue:** The correct fix is `const isOuterRing = highlighted.seriesId === 1` — this was not finalised before the session closed.

**Default center label:** changed from `'of total goals'` to `'Total goals'` (user edit).

---

**2026-04-03 — Change 4 (Recurring Payments):**

### What was built

Full recurring payments feature: backend data model, CRUD API, daily auto-log scheduler, and a complete frontend page with add/edit/delete/manual-trigger UI.

### Backend files

- `server/models/RecurringPayment.js` — NEW. Fields: `user`, `description`, `amount`, `category`, `interval` (enum), `startDate`, `endDate`, `nextDueDate` (indexed), `isActive`, `lastLoggedDate`.
- `server/models/Expense.js` — Added `isRecurring: Boolean` (default false) and `recurringPaymentId: ObjectId ref RecurringPayment` (optional). Backward-compatible with all existing tests.
- `server/controllers/recurringController.js` — NEW. Five exports: `listRecurring`, `createRecurring`, `updateRecurring`, `deleteRecurring`, `triggerRecurring`. Includes `computeNextDueDate` helper (walks startDate forward by interval until result is in the future) and `advanceNextDueDate` helper (single interval step). All operations enforce user ownership.
- `server/routes/recurring.js` — NEW. Express router with express-validator rules. POST validates description/amount/category/interval/startDate. PATCH uses `.optional()` on all fields. DELETE + trigger validate `:id` as MongoId. Route layout: `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`, `POST /:id/trigger`.
- `server/services/recurringScheduler.js` — NEW. node-cron job at `'5 0 * * *'` (00:05 daily). Queries `isActive=true AND nextDueDate <= now`. Skips any payment whose `lastLoggedDate` falls on the same UTC calendar day (duplicate guard). Creates an Expense with `isRecurring:true` + `recurringPaymentId` set. Advances `nextDueDate` and sets `lastLoggedDate`. Logs processed/skipped count with ISO timestamp. Exports `startScheduler()`.
- `server/server.js` — Imports `recurringRoutes` (registered at `/api/recurring`) and `startScheduler`. Calls `startScheduler()` inside the MongoDB `.then()` callback, guarded by `NODE_ENV !== 'test'`.

### Frontend files

- `client/src/utils/api.js` — Added `getRecurring`, `createRecurring`, `updateRecurring`, `deleteRecurring`, `triggerRecurring`.
- `client/src/components/AppHeader.js` — Added `{ label: 'Recurring', path: '/recurring' }` to `NAV_TABS` between Goals and Account (index 3).
- `client/src/App.js` — Imported `RecurringPage`, added `/recurring` protected route.
- `client/src/pages/RecurringPage.js` — NEW. Wrapped in AppLayout. Header with title + "Add Payment" button. MUI Tabs for Active / Inactive sections. Payment cards show description, amount (formatMoney), category, interval Chip, next due date, last logged date. Per-card actions: Edit IconButton, Delete IconButton, "Log Now" IconButton with Tooltip ("Manually log this payment now"). Inline `RecurringForm` Dialog (add/edit) with full validation, same pattern as GoalForm/BudgetForm. Snackbar for success/error feedback. All colors via `useTheme()` — no hardcoded hex values.

### Files NOT modified
`GoalsWidget.js`, `GoalsPage.js`, `BudgetsPage.js`, `BudgetChart.js`, `BudgetForm.js`, `theme.js`, `ExpenseTracker.js`, all test files.

### Deviations from plan
None.

### Prerequisite
`node-cron` is NOT yet in `package.json`. Run `npm install node-cron` in the project root before starting the server. The scheduler import will throw a `Cannot find module 'node-cron'` error at boot until this is installed.

### Known issues carried forward

**GoalsWidget.js — isOuterRing hover logic (carry-forward from Change 3.0.2):**
`highlighted.seriesId === 1` is the correct fix (series id:1 = outer ring, id:0 = inner ring). Currently `(highlighted.seriesId ? true : false)` always returns false for the inner ring because `seriesId 0` is falsy, so both rings show `currentAmount` on hover instead of target vs. saved. Not fixed in Change 4 or 5a — carry forward to next available session.

---

**2026-04-05 — Change 5a (AI: Data Model Foundations):**

### What was built

All new data models, field additions, stub routes/controllers, skeleton pages, and nav wiring needed before the AI feature can be built. No AI SDK installed. No business logic written.

### New model files
- `server/models/Asset.js` — NEW. Fields: user, name, type (enum), brand, purchaseYear, purchasePrice, warrantyLengthYears, warrantyExpiryDate, condition, subtype, materialType, mileage, make, vehicleModel.
- `server/models/LifeEvent.js` — NEW. Fields: user, type (enum), name, isActive, details (Mixed).
- `server/models/AIPrediction.js` — NEW. Fields: user, sourceType (enum), sourceId, title, summary, projectedCost, projectedDate, monthlySavingsTarget, timelineLabel, confidence, linkedGoalId, dismissed, aiProvider, rawPrompt, rawResponse.
- `server/models/Notification.js` — NEW. Fields: user, type (enum), title, message, sourceType, sourceId, read, dismissed, scheduledFor.

### Modified models
- `server/models/User.js` — Added `location: { city, state, country, postalCode }` sub-document and `onboardingCompleted: Boolean` (default false).
- `server/models/Goal.js` — Added `source: enum ['user','ai']` (default 'user') and `predictionId: ObjectId ref AIPrediction` (default null).

### Stub backend (3 new route+controller pairs)
- `server/controllers/assetController.js`, `server/routes/assets.js` — GET/POST/PATCH/:id/DELETE/:id → all return 501.
- `server/controllers/lifeEventController.js`, `server/routes/lifeEvents.js` — same pattern.
- `server/controllers/notificationController.js`, `server/routes/notifications.js` — GET / PATCH /:id / PATCH /mark-all-read → all return 501.
- All three registered in `server/server.js` at `/api/assets`, `/api/life-events`, `/api/notifications`.
- `server/controllers/userController.js` — Extended `updateMe` to accept and persist `location` (merge via dot-notation, same pattern as dashboardPrefs) and `onboardingCompleted` (Boolean).

### Frontend
- `client/src/pages/AssetsPage.js` — NEW skeleton (AppLayout + "Coming soon.").
- `client/src/pages/LifeEventsPage.js` — NEW skeleton (AppLayout + "Coming soon.").
- `client/src/App.js` — Added `/assets` and `/life-events` protected routes.
- `client/src/components/AppHeader.js` — Added Assets + Life Events to NAV_TABS (after Recurring, before Account).
- `client/src/utils/api.js` — Added 11 stub functions: getAssets, createAsset, updateAsset, deleteAsset, getLifeEvents, createLifeEvent, updateLifeEvent, deleteLifeEvent, getNotifications, markNotificationRead, markAllNotificationsRead.

### Files NOT modified
`GoalsWidget.js`, `ExpenseTracker.js`, `theme.js`, `ExpenseChart.js`, `BudgetWidget.js`, all existing test files.

### Test results
expenses.test.js — PASS. budgets.test.js — PASS. auth.test.js — 1 pre-existing failure (username `user_${Date.now()}` exceeds 20-char regex limit; unrelated to this session; other auth tests pass).

### Architecture.md corrections this session
- Tech Stack: removed "planned" label from node-cron (live since Change 4).
- API Endpoints: moved /api/recurring to Existing; added "Stub Endpoints" section for assets/life-events/notifications; kept /api/predictions under Planned.
- Directory structure: removed `← [Change 5]` markers from all 5a-complete files; updated remaining markers to specific sub-change (5b/5c/5d/5e/5f).

### Known issues carried forward
**GoalsWidget.js — isOuterRing hover logic:** `const isOuterRing = highlighted.seriesId === 1` is the correct fix. Not addressed in 5a. Carry forward.

### Deviations from plan
None.

---

**2026-04-05 — Change 5b (AI: Asset Inventory — CRUD + Frontend):**

### What was built

Full Asset Inventory feature: real backend CRUD replacing 4 x 501 stubs, two new frontend components, and a complete AssetsPage replacing the skeleton.

### Backend files modified

- `server/routes/assets.js` — Replaced bare stub routes with express-validator rules (POST: name + type required; all other fields optional with type/enum/range checks; PATCH: all optional + `param('id').isMongoId()`; DELETE: `param('id').isMongoId()`).
- `server/controllers/assetController.js` — Replaced all four 501 stubs with real implementations: `listAssets` (find by user, sort createdAt desc), `createAsset` (whitelist fields, set user, return 201), `updateAsset` (ownership in query, `$set` only present fields, return updated or 404), `deleteAsset` (ownership in query, return message or 404). Follows goalController.js patterns exactly.

### New backend test file

- `server/tests/assets.test.js` — 5 smoke tests: POST 201 with valid payload, GET 200 returns array, PATCH 200 for owner, DELETE 200 for owner, GET 401 without token. All pass.

### New frontend component files

- `client/src/components/AssetForm.js` — MUI Dialog (`maxWidth="sm"`, `borderRadius: '14px'`, `slotProps`). Props: `open`, `onClose`, `onSave`, `asset`. Always-visible fields: name, type, brand, condition, purchaseYear, purchasePrice, warrantyLengthYears, warrantyExpiryDate. Conditionally visible on `type === 'vehicle'`: make, vehicleModel, mileage. Conditionally visible on `type === 'home_system'`: subtype, materialType. CloseIcon top-right. Cancel + Save (disabled while saving). Client-side validation: name + type required.
- `client/src/components/AssetCard.js` — Paper `elevation={0}`, `borderRadius: '14px'`, `border: divider`. Shows name (h3), type Chip (outlined primary), condition colored Chip (excellent→success, good→info, fair→warning, poor→error). Brand, purchase year/price (formatMoney). Warranty section with expiry-date color logic (≤90 days → warning.main, expired → error.main). Vehicle-specific: make/model + mileage. Home-system-specific: subtype, materialType. Edit + Delete IconButtons. All colors via useTheme().

### Frontend page modified

- `client/src/pages/AssetsPage.js` — Full replacement of "Coming soon." skeleton. AppLayout wrapper retained. Header row (title + subtitle + "Add Asset" button). LinearProgress under header while loading. MUI Tabs: "All" always present; per-type tabs shown only when ≥2 types are represented. Stack of AssetCard components. Empty state Paper. Snackbar success/error feedback. Full CRUD flow via api.js functions: add, edit (dialog), delete (window.confirm guard).

### Files NOT modified
`GoalsWidget.js`, `ExpenseTracker.js`, `theme.js`, `LifeEventsPage.js`, `lifeEventController.js`, `notificationController.js`, `api.js` (stub functions were already correct from 5a).

### Test results
`assets.test.js` — 5 PASS. `expenses.test.js` — 2 PASS. `budgets.test.js` — 1 PASS. Total: 8/8 passed.

### Known issues carried forward
**GoalsWidget.js — isOuterRing hover logic:** `const isOuterRing = highlighted.seriesId === 1` is the correct fix (seriesId 0 = inner ring is falsy, so current `(highlighted.seriesId ? true : false)` always evaluates false, causing both rings to display `currentAmount` on hover). Not fixed in Change 5b. Carry forward.

### Deviations from plan
None.

---
### 2026-04-06 — Change 5b revision (Asset model: financial fields + depreciation + type expansion)

- Deviation from original plan: Asset model expanded with 8 universal financial
  fields and 3 new asset types before AI service layer (Change 5d) is built.
- Reason: Original model captured ownership metadata but not the financial
  dimensions the AI needs for projections. Specifically missing:
  (1) current estimated value vs. purchase price — needed for depreciation baseline;
  (2) annual ownership cost — needed for total cost of ownership projections;
  (3) depreciation model + rate — needed for future value projections and
  inflation-adjusted replacement cost planning;
  (4) income generation — needed for net cost vs. net gain projections on
  rental/investment/business assets.
  Without these fields, the prediction engine would receive insufficient data
  to project depreciation, plan for replacement, or account for inflation.
- New fields added (all optional, all types): estimatedCurrentValue,
  annualOwnershipCost, depreciationModel (enum), annualDepreciationRate,
  generatesIncome, monthlyIncomeAmount, expectedReplacementYear, notes.
- depreciationModel enum: none / straight_line / accelerated / appreciating.
  AI will use depreciationModel + annualDepreciationRate to project future
  asset value at any date, and apply CPI inflation multipliers to annualOwnershipCost.
- New type enum entries (8 total): real_estate, investment, business added
  to existing home_system, appliance, vehicle, electronics, other.
- AssetForm: new "Financial details" section on all types. annualDepreciationRate
  field only enabled when depreciationModel !== 'none'. generatesIncome Switch
  toggles monthlyIncomeAmount field visibility.
- AssetCard: financial summary block shows set fields only — est. value with
  depreciation hint, annual cost, income chip, replacement year, notes (2-line clamp).
- Anticipated improvement: AI prediction engine (Change 5d) will have the data
  needed to: (a) project asset value at a future date using chosen depreciation
  model; (b) project inflation-adjusted ownership cost over 5-10 year horizon;
  (c) calculate net cost vs. income on income-generating assets; (d) generate
  replacement cost savings goals anchored to expectedReplacementYear.
- Files modified: Asset.js, assets.js (routes), assetController.js, AssetForm.js,
  AssetCard.js, AssetsPage.js, assets.test.js.

---

**2026-04-06 — Change 5c (AI: Life Events Module — CRUD + Frontend):**

### What was built

Full Life Events feature: real backend CRUD replacing 4 × 501 stubs, two new frontend components, and a complete LifeEventsPage replacing the skeleton.

### Backend files modified

- `server/routes/lifeEvents.js` — Replaced bare stub routes with express-validator rules (POST: name + type required; isActive optional boolean; details optional object; PATCH: all optional + `param('id').isMongoId()`; DELETE: `param('id').isMongoId()`). Follows assets.js pattern exactly.
- `server/controllers/lifeEventController.js` — Replaced all four 501 stubs with real implementations: `listLifeEvents` (find by user, sort createdAt desc), `createLifeEvent` (whitelist name/type/isActive/details, set user, return 201), `updateLifeEvent` (ownership in query, `'field' in req.body` guard, `$set` update, 404 if not found), `deleteLifeEvent` (ownership in query, 404 if not found). `details` field replaced wholesale on PATCH — client always sends the full details object for the selected type; no dot-notation sub-field merge needed.

### New backend test file

- `server/tests/lifeEvents.test.js` — 5 smoke tests: POST 201 with valid payload (includes details sub-fields), GET 200 returns array, PATCH 200 for owner (isActive + details update), DELETE 200 for owner + confirms gone, GET 401 without token. All pass.

### New frontend component files

- `client/src/components/LifeEventForm.js` — MUI Dialog (`maxWidth="sm"`, `borderRadius: '14px'`, `slotProps`). Props: `open`, `onClose`, `onSave`, `lifeEvent`. Always-visible fields: name (required), type select (6 options, required), isActive Switch (default true). Type-specific detail fields conditionally rendered: pet (petName, species, age, estimatedMonthlyVetCost), college (studentName, institution, startYear, endYear, estimatedAnnualCost), vehicle_ownership (vehicleDescription, estimatedAnnualCost), medical (condition, estimatedMonthlyCost), eldercare (personName, careLevel select, estimatedMonthlyCost), other (no extra fields). Details assembled into `details` object before onSave — only non-empty values included.
- `client/src/components/LifeEventCard.js` — Paper `elevation={0}`, `borderRadius: '14px'`, `border: divider`. Shows name (h3), type Chip (outlined primary), isActive Chip (success/default). Type-specific detail rows rendered only when values are present, cost fields formatted with formatMoney. Actions: Edit (EditIcon), Toggle Active (PauseIcon/PlayArrowIcon), Delete (DeleteIcon error color). All colors via useTheme().

### Frontend page modified

- `client/src/pages/LifeEventsPage.js` — Full replacement of "Coming soon." skeleton. AppLayout wrapper retained. Header row (title + subtitle + "Add Life Event" button). LinearProgress while loading. MUI Tabs: "Active (N)" / "Inactive (N)". Stack of LifeEventCard per tab. Empty state Paper with contextual message. Full CRUD flow: add, edit (dialog), toggle active (inline update), delete (window.confirm guard). Snackbar success/error feedback.

### Files NOT modified
`GoalsWidget.js`, `ExpenseTracker.js`, `theme.js`, `AssetsPage.js`, `assetController.js`, `notificationController.js`, `predictionController.js`, `api.js` (stub functions already correct from 5a).

### Test results
`lifeEvents.test.js` — 5 PASS. `assets.test.js` — 5 PASS. `expenses.test.js` — 2 PASS. `budgets.test.js` — 1 PASS. Total: 13/13 passed.

### Known issues carried forward
**GoalsWidget.js — isOuterRing hover logic:** `const isOuterRing = highlighted.seriesId === 1` is the correct fix (seriesId 0 = inner ring is falsy, so current `(highlighted.seriesId ? true : false)` always evaluates false, causing both rings to display `currentAmount` on hover instead of target vs. saved). Not fixed in Change 5c. Carry forward to next available session.

### Deviations from plan
None.

---

**2026-04-06 — Technical Audit Session:**

- **Trigger:** Previous session failed to locate ARCHITECTURE.md and overwrote it with a self-generated version. File was reverted. This session audits the restored file for accuracy against the actual codebase.
- **Audit method:** Every file listed in the directory tree was checked for existence on disk (Glob). Every model schema was read and compared field-by-field. Every route file was read and endpoints extracted. App.js routes verified against the route table. AppHeader.js NAV_TABS verified. api.js exports enumerated. GoalsWidget.js hover bug confirmed still present.

### Findings

**Tech Stack — VERIFIED ACCURATE.** node-cron ^4.2.1 is installed in root package.json. @anthropic-ai/sdk is correctly listed as planned (absent from package.json). All MUI/React/axios versions match.

**Directory Structure — CORRECTIONS MADE:**
- `server/models/Income.js` — existed on disk, not listed → added
- `server/controllers/incomeController.js` — existed on disk, not listed → added
- `server/routes/income.js` — existed on disk, not listed → added
- `server/tests/assets.test.js` — existed on disk (added in 5b), not listed → added
- `server/tests/lifeEvents.test.js` — existed on disk (added in 5c), not listed → added
- `client/src/components/IncomeForm.js` — existed on disk (added in 2b), not listed → added
- `client/src/components/BudgetDotGrid.js` — existed on disk (added in 2b), not listed → added
- `client/src/components/SummaryMetricCard.js` — listed without a change marker but does not exist on disk → marked ← MISSING
- All [Change 5d/5e/5f/6] planned files verified absent from disk as expected — markers retained.

**Current Routes — VERIFIED ACCURATE.** App.js contains exactly: /, /auth, /app, /account, /budgets, /goals, /recurring, /assets, /life-events, plus catch-all. The `/predictions` row is correctly annotated [Change 5e] and not yet in App.js.

**Data Models — CORRECTIONS MADE:**
- **User:** Removed "Pending additions" line — `location` and `onboardingCompleted` are fully implemented in the schema. Added `overallMonthlyBudget` field (added in Change 3.0.2; was absent from this section).
- **Goal:** Removed "Pending additions" line — `source` and `predictionId` are fully implemented in the schema.
- **Asset:** Updated `type` enum from 5 to 8 values (real_estate/investment/business added in 5b revision). Added 8 financial fields (estimatedCurrentValue, annualOwnershipCost, depreciationModel, annualDepreciationRate, generatesIncome, monthlyIncomeAmount, expectedReplacementYear, notes) — all added in 5b revision, previously undocumented in this section.
- **LifeEvent:** Updated `type` enum from 6 to 12 values (wedding/home_purchase/home_renovation/new_baby/retirement/relocation added in 5c revision). Updated `details` from "Mixed (type-specific JSON payload)" to document the actual structured sub-document schema — reflects 5c revision.
- AIPrediction, Notification, Expense, Income, Budgets, RecurringPayment — VERIFIED ACCURATE.

**API Endpoints — VERIFIED ACCURATE.** All routes confirmed against route files on disk. Assets and life-events correctly in "Existing"; notifications correctly in "Stub Endpoints" (controller confirmed 501 stubs). No predictions.js on disk; "Planned" section correct.

**AppHeader NAV_TABS — VERIFIED ACCURATE.** 7 tabs in order: Dashboard/Budgets/Goals/Recurring/Assets/Life Events/Account.

**api.js exports — VERIFIED ACCURATE.** All 31 exported functions present. Comment in api.js calling assets/life-events "stubs" is stale but is a code comment issue, not an Architecture.md issue.

**Test files — CORRECTIONS MADE (directory listing only):** 6 test files exist: jest.setup.js, auth.test.js, budgets.test.js, expenses.test.js, assets.test.js, lifeEvents.test.js. The latter two were added in 5b/5c but not reflected in the directory tree. Note: assets.test.js now contains 6 tests (a second POST test for real_estate was added in the 5b revision); the 5c session note count of "5 PASS" for assets.test.js reflects the pre-revision state and is not corrected (session notes preserved verbatim).

**GoalsWidget.js isOuterRing hover bug — CONFIRMED STILL PRESENT.** Line 76: `const isOuterRing = (highlighted.seriesId ? true : false)`. The correct fix `highlighted.seriesId === 1` has not been applied. Architecture.md description accurate.

**Session notes — VERIFIED.** All files mentioned in session notes confirmed to exist on disk. No session note references a nonexistent file (files annotated with future change markers are expected to be absent).

### Architecture.md status after audit: CORRECTED — see findings above. No application files were modified in this session.

---

**2026-04-06 — Change 5d (AI: Service Layer):**

### What was built

The AI service infrastructure layer. No HTTP endpoints added this session.
No frontend changes.

### New files

- `server/services/aiService.js` — Single Anthropic SDK gateway. Exports
  `callAI({ systemPrompt, userPrompt, model, maxTokens })`. Instantiates
  the Anthropic client per-call (no module-level singleton) so tests can stub
  the API key without caching side effects. Throws `'ANTHROPIC_API_KEY is not
  set'` if the env var is absent; re-throws SDK errors prefixed with
  `'AI call failed: '`. Returns `{ text, rawResponse }`.

- `server/services/predictionEngine.js` — Domain logic layer. Exports
  `generateForAsset(userId, assetId)` and
  `generateForLifeEvent(userId, lifeEventId)`. Each function: fetches the
  source document (ownership-verified), fetches the user (currency + location),
  fetches recent expenses (last 90 days, max 20, for context), builds system
  and user prompts, calls aiService, parses the JSON response (graceful fallback
  on parse failure: projectedCost=0, confidence='low'), saves and returns an
  AIPrediction document. No req/res/next — pure domain logic.

- `server/tests/predictionEngine.test.js` — 5 tests. callAI mocked via
  jest.mock — no real API calls. Covers: successful asset prediction, asset not
  found, successful life event prediction, life event not found, unparseable
  AI response fallback.

### Package change

- `@anthropic-ai/sdk` added to root `package.json` dependencies (version ^0.82.0).

### Files NOT modified

All client-side files. All existing server models, controllers, routes.
GoalsWidget.js hover bug not addressed (carry-forward).

### Test results

`predictionEngine.test.js` — 5 PASS. `assets.test.js` — 6 PASS.
`lifeEvents.test.js` — 5 PASS. `expenses.test.js` — 2 PASS.
`budgets.test.js` — 1 PASS. Total: 19 passed.
`auth.test.js` — 1 pre-existing failure (username length, unrelated to 5d; documented in 5a notes).

### Known issues carried forward

**GoalsWidget.js — isOuterRing hover logic:** `const isOuterRing = highlighted.seriesId === 1`
is the correct fix. Not addressed in 5d. Carry forward.

### Deviations from plan

None.

---

**2026-04-06 — Change 5e (Predictions API & Frontend):**

### What was built
Connected the prediction engine to the frontend. Built Express controllers with graceful error handling and React UI to display generated financial projections.

### New files
- `server/routes/predictions.js` & `server/controllers/predictionController.js` — HTTP wrapper for predictionEngine. Includes robust 500 error catching to prevent server crashes on API failure.
- `server/tests/predictions.test.js` — 3 passing tests mapping HTTP routes to mocked engine calls.
- `client/src/pages/PredictionsPage.js` — Grid dashboard for projections. Wrapped in AppLayout.
- `client/src/components/PredictionCard.js` — MUI component displaying AI output. Uses formatMoney and useTheme.

### Package change
None.

### Files NOT modified
`aiService.js` and `predictionEngine.js` remained untouched. GoalsWidget.js hover bug not addressed (carry-forward).

### Test results
`predictions.test.js` — 3 PASS. Total existing tests: 27 PASS. No regressions.

### Known issues carried forward
**GoalsWidget.js — isOuterRing hover logic:** `const isOuterRing = highlighted.seriesId === 1` is the correct fix. Not addressed. Carry forward.

--

**2026-04-06 — UNPLANNED CHANGE - Claude model change:**

## In the aiService.js file: set the model from 'sonnet 4.6' TO 'claude-haiku-4-5-20251001' 

## I made this change to save on credits and get more usuage at a lower price. DO NOT CHANGE IT BACK to 'sonnet'.

---

**2026-04-06 — Change 5f (UI Integration & Navigation):**

### What was built
Connected the AI features to the user interface. Users can now trigger projections directly from Assets and Life Events and navigate to results via the sidebar.

### Files modified
- `client/src/components/AssetCard.js` — Added "Generate AI Prediction" IconButton (AutoAwesome icon) with local `predicting` loading state. On click: calls `predictions.generateForAsset(asset._id)` from `api.js`, shows `CircularProgress` (size 18) while in-flight, reports result via `onPredictSuccess` / `onPredictError` callbacks. Button wrapped in `<span>` to allow Tooltip on disabled state.
- `client/src/components/LifeEventCard.js` — Same pattern using `predictions.generateForLifeEvent(lifeEvent._id)`.
- `client/src/pages/AssetsPage.js` — Added `useNavigate` import. Extended `snack` state with optional `action` field. Added `handlePredictSuccess` (opens snack with "View" Button that navigates to `/predictions`) and `handlePredictError` handlers. Passes callbacks to `AssetCard`. Snackbar `autoHideDuration` extended to 6000ms when an action button is present.
- `client/src/pages/LifeEventsPage.js` — Same pattern as AssetsPage.

### New files
None.

### Files NOT modified
- `client/src/components/layout/Sidebar.js` / `AppHeader.js` — "Predictions" nav link was already present in `NAV_TABS` (added in a prior session). No change required.
- `server/services/aiService.js` — Verified: model remains `claude-haiku-4-5-20251001`. Not touched.
- `client/src/pages/PredictionsPage.js` — Not touched.
- `client/src/components/GoalsWidget.js` — Not touched (carry-forward bug).

### Test results
All 27 backend tests pass. 1 pre-existing failure in `auth.test.js` (username length — documented in 5a notes, unrelated to 5f).

### Known issues carried forward
**GoalsWidget.js — isOuterRing hover logic:** `const isOuterRing = highlighted.seriesId === 1` is the correct fix. Not addressed in 5f. Carry forward.
## i have  tested the API connection...we are connected to Claude. 

---

**2026-04-07 — Change 5g (AI: Financial Advisory & Auto-Goals):**

### What was built
Pivoted the AI feature set from "Predictions" to "Financial Advisory." Fixed truncation and JSON formatting issues. Added auto-goal generation.

### Key Logic
- `predictionEngine.js` now performs a "Spending Analysis" (averaging recent expenses by category) to provide contextual advice injected into every user prompt.
- `sanitizeAIJson()` strips markdown code fences (` ```json ``` `) before `JSON.parse()` — fixes the raw-JSON display bug.
- `maxTokens` raised from 512 → 1024 in both `generateForAsset` and `generateForLifeEvent` calls — fixes truncation.
- System prompt rewritten as "Senior Financial Advisor" with conservative, actionable guidance tone.
- UI terminology updated: "Generate AI Prediction" → "Consult AI Advisor" (AssetCard, LifeEventCard), "AI Predictions" → "Financial Advisory" (PredictionsPage, AppHeader nav).
- `PredictionCard.js` (now AdvisoryCard in function): "Commit to this Goal" button calls `createGoal` with `projectedCost` as `targetAmount`, `source: 'ai'`, and `predictionId` reference. Includes a 0% `LinearProgress` bar to show savings haven't started.
- `goalController.js`: `createGoal` now accepts and persists `source` and `predictionId` fields.

### Files Modified
- `server/services/predictionEngine.js` (sanitizer, spending averages, system prompt rewrite, maxTokens 512→1024)
- `server/controllers/goalController.js` (`source` + `predictionId` fields in createGoal)
- `client/src/pages/PredictionsPage.js` (title + subtitle + empty state text)
- `client/src/components/PredictionCard.js` ("Commit to Goal" button, LinearProgress, label updates)
- `client/src/components/AssetCard.js` (tooltip label)
- `client/src/components/LifeEventCard.js` (tooltip label)
- `client/src/components/AppHeader.js` (nav tab label)

### Test results
All 27 backend tests pass. 1 pre-existing failure in `auth.test.js` (username length — documented since 5a, unrelated). Manual verification of the "Commit to Goal" workflow successful.

### Known issues carried forward
**GoalsWidget.js — isOuterRing hover logic:** `const isOuterRing = highlighted.seriesId === 1` is the correct fix. Not addressed in 5g. Carry forward.
