# Agent Guidelines for Open Bus Map Search

## Build/Lint/Test Commands

### Build Commands

- `npm run build` - Build production bundle with sitemap generation
- `npm start` - Start development server with Vite

### Lint Commands

- `npm run lint` - Run ESLint, Stylelint, and Prettier checks (max warnings: 0)
- `npm run lint:fix` - Auto-fix ESLint, Stylelint, and Prettier issues

### Test Commands

- `npm test` - Run all unit tests (Jest) and E2E tests (Playwright, excluding visual)
- `npm run test:unit` - Run unit tests only
- `npm run test:unit:ci` - Run unit tests with coverage
- `npm run test:e2e` - Run E2E tests with Applitools batch ID
- `npm run test:e2e:visual` - Run visual regression tests
- `jest tests/filename.spec.ts` - Run single unit test
- `playwright test tests/filename.spec.ts` - Run single E2E test

## Code Style Guidelines

### TypeScript Configuration

- Strict mode enabled
- Target: ESNext with React JSX transform
- Path mapping: `src/*` imports supported

### Formatting (Prettier)

- No semicolons
- Single quotes for strings
- 2-space indentation
- 100 character line width
- Trailing commas everywhere
- Bracket same line for JSX
- Import ordering: Node built-ins → third-party → src/ → relative → CSS/SCSS

### Linting (ESLint + TypeScript)

- TypeScript recommended rules with type checking
- React recommended rules and hooks rules
- `@typescript-eslint/no-explicit-any`: warn (avoid any types)
- JSX only in `.tsx` files
- Prettier integration as errors

### Naming Conventions

- **Components**: PascalCase (e.g., `DashboardPage`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAgencyList`)
- **Constants**: ALL_CAPS with underscores (e.g., `MAX_HITS_COUNT`)
- **Variables/Functions**: camelCase (e.g., `agencyList`)
- **Files**: kebab-case for components, camelCase for utilities

### CSS/SCSS (Stylelint)

- Extends standard SCSS config with Prettier
- Selectors: camelCase or kebab-case only
- SCSS variables: camelCase or kebab-case only

### Error Handling

- Use try/catch blocks for async operations
- Log errors appropriately (avoid console.error in production code)
- Return meaningful error states from hooks/components

### Import Organization

- Group imports by type following Prettier's importOrder rules
- Prefer absolute imports for src/ directory using `src/` prefix
- Avoid relative imports beyond parent directory
