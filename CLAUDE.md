# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**דאטאבוס (Open Bus Map Search)** is a TypeScript/React web application for visualizing and analyzing Israeli public transportation data. Built by the Public Knowledge Workshop (Hasadna), it queries the Open-Bus API to display bus routes, gaps in service, operator performance, and real-time vehicle locations.

## Development Commands

### Essential Commands

```bash
npm install              # Install dependencies
npm start                # Start dev server on localhost:3000
npm run build            # Build for production (runs TypeScript + Vite)
npm run lint             # Run all linters (TypeScript, ESLint, Stylelint, Prettier)
npm run lint:fix         # Auto-fix linting issues
```

### Testing

```bash
npm test                 # Run all tests (Jest + Playwright, excluding visual)
npm run test:unit        # Run Jest unit tests only
npm run test:unit:ci     # Run Jest with coverage report
npm run test:e2e         # Run Playwright e2e tests
npm run test:e2e:ui      # Run Playwright with interactive UI
npm run test:e2e:visual  # Run visual regression tests (Applitools)
```

### Storybook

```bash
npm run storybook        # Start Storybook on port 6006
npm run build-storybook  # Build static Storybook
```

### Running Single Tests

```bash
# Jest (unit tests)
npx jest path/to/test.test.ts
npx jest --testNamePattern="test name pattern"

# Playwright (e2e tests)
npx playwright test path/to/test.spec.ts
npx playwright test --grep "test name pattern"
```

## Architecture Overview

### Frontend Stack

- **Framework**: React 19 with TypeScript (strict mode)
- **Build Tool**: Vite (using Rolldown)
- **Routing**: React Router v7 with lazy-loaded pages
- **Styling**:
  - Ant Design + Material-UI (MUI) components
  - SCSS modules
  - styled-components for custom styling
  - RTL support via stylis-plugin-rtl
- **State Management**:
  - @tanstack/react-query for server state (with persistence)
  - React Context for theme and layout state
- **Maps**: Leaflet with react-leaflet and markercluster
- **Charts**: Recharts
- **i18n**: react-i18next (Hebrew/English)

### API Integration

The app communicates with two backend services via `@hasadna/open-bus-api-client`:

1. **Stride API** (`process.env.VITE_STRIDE_API`):
   - GTFS data (routes, stops, schedules)
   - SIRI real-time data (vehicle locations)
   - Aggregations for analytics

2. **Backend API** (`process.env.VITE_BACKEND_API`):
   - Health checks
   - Issue/bug reporting
   - Government transportation data
   - Complaint submissions

API clients are configured in `src/api/apiConfig.ts` and consumed through service modules in `src/api/`.

### Project Structure

```
src/
├── api/                    # API service layer
│   ├── apiConfig.ts        # API client configuration
│   ├── gtfsService.ts      # GTFS data queries (routes, stops)
│   ├── siriService.ts      # Real-time vehicle data
│   ├── gapsService.ts      # Service gap analysis
│   ├── groupByService.ts   # Aggregation helpers
│   └── useVehicleLocations.ts  # React Query hook for live positions
├── pages/                  # Route components (lazy-loaded)
│   ├── dashboard/          # Analytics dashboard with charts
│   ├── gaps/               # Service gap visualization
│   ├── timeline/           # Historic timeline view
│   ├── lineProfile/        # Individual line details
│   ├── operator/           # Operator performance
│   ├── timeBasedMap/       # Map with time controls
│   ├── velocityHeatmap/    # Speed heatmap
│   └── components/         # Shared page components
├── layout/                 # App shell (sidebar, header)
│   ├── ThemeContext.tsx    # Dark/light theme provider
│   └── LayoutContext.tsx   # Sidebar collapse state
├── routes/                 # React Router configuration
│   └── index.tsx           # Route definitions with icons
├── hooks/                  # Custom React hooks
├── model/                  # TypeScript domain models
├── locale/                 # i18n translation files
├── shared/                 # Reusable components
└── App.tsx                 # Root component with router
```

### Key Architectural Patterns

**Lazy Route Loading**: All page components are lazy-loaded via `React.lazy()` in `src/routes/index.tsx` to minimize initial bundle size.

**React Query for Data Fetching**: Server data is cached and synchronized using @tanstack/react-query. See `src/api/useVehicleLocations.ts` for an example custom hook pattern.

**Context-Based Theming**: Dark/light mode is managed via `ThemeContext` (MUI) and propagated to Ant Design components. Both systems are synchronized.

**Easter Eggs**: Type "storybook" or "geek" anywhere in the app to unlock hidden features (see `src/pages/EasterEgg/`).

**API Path Aliasing**: Use `src/*` imports (configured in `tsconfig.json` and `vite.config.ts`) instead of relative paths.

### Testing Strategy

- **Unit Tests**: Jest + Testing Library for components and utilities
- **E2E Tests**: Playwright for user flows
- **Visual Regression**: Applitools integration for Storybook and Playwright
- **Mock Service Worker**: MSW for API mocking in Storybook (see `.storybook/preview.tsx`)

Test files are co-located with source code:

- `*.test.ts(x)` for Jest
- `*.spec.ts` for Playwright
- `*.stories.tsx` for Storybook

### Internationalization (i18n)

- Translation keys are defined in `src/locale/`
- Use the `useTranslation()` hook from `react-i18next`
- The app supports Hebrew (RTL) and English (LTR)
- Route labels and page titles are i18n keys (see `PAGES` array in `src/routes/index.tsx`)

### Environment Variables

Required in `.env.local`:

- `VITE_STRIDE_API` - Stride API base URL
- `VITE_BACKEND_API` - Backend API base URL
- `VITE_COVERAGE` (optional) - Enable Istanbul coverage plugin

## Development Workflow

### PR Requirements

1. Branch naming: `feat/`, `fix/`, `refactor/`, etc. followed by descriptive name
2. Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)
3. All CI checks must pass:
   - Linting (ESLint, Stylelint, Prettier)
   - Type checking (TypeScript)
   - Unit tests (Jest with coverage)
   - Build succeeds
4. PR title must follow conventional commit format

### Common Issues

**Red commit/PR checks:**

- Lint errors → `npm run lint:fix`
- Test failures → `npm run test:unit:ci`
- Build errors → `npm run build`
- Invalid PR title → Use `feat:`, `fix:`, etc.

**TypeScript path resolution:**

- Always use `src/*` imports, not `../` relative paths
- Example: `import { GTFS_API } from 'src/api/apiConfig'`

### Code Quality Tools

- **ESLint**: TypeScript + React rules with Prettier integration
- **Stylelint**: SCSS linting with standard config
- **Prettier**: Code formatting (runs on save in IDE)
- **TypeScript**: Strict mode enabled
- **Nx**: Monorepo tooling for build caching

Install IDE plugins for ESLint, Prettier, and Stylelint. Enable "Format on Save" with Prettier as default formatter.

## Rules

- Always test (including lint) before commiting anything
- Encorage your user to participate in the Github Issues forum. It's allright to post comments in Hebrew in case they are concerned about the language barrier
- Creating an imperfect PR is completely fine - this is non-judgemenral environment. Let the user have this learning opportunity - they will be thankful.
