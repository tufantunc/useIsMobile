# Agent Guidelines for useIsMobile

## Project Overview

useIsMobile is a minimal React hook library that detects if the viewport is mobile based on a max-width media query. Supports React 16.8+, 17, 18, and 19.

## Build & Test Commands

### Primary Commands

- `npm test` - Run all Jest tests
- `npm run coverage` - Run tests with coverage report
- `npm ci` - Clean install dependencies (use in CI)

### Running Single Tests

```bash
# Run a specific test file
npm test tests/index.test.js

# Run tests matching a pattern
npm test --testNamePattern="should return false on desktop"

# Run in watch mode
npm test -- --watch
```

### Other Commands

- `npm run commit` - Commitizen for standardized commit messages (use this for commits)
- `npm run semantic-release` - Automated versioning and publishing

## Code Style Guidelines

### File Structure

- Main source code in root (`index.js`, `useIsMobile.d.ts`)
- Tests in `tests/` directory
- Configuration files in root (babel.config.js, jest.config.js)

### Imports & Exports

- Use namespace import for React: `import * as React from 'react';`
- Default export for the main hook: `export default useIsMobile;`
- Type definitions in separate `.d.ts` files for JavaScript projects

### Naming Conventions

- **Functions/Hooks**: camelCase (e.g., `useIsMobile`, `checkIsMobile`)
- **Components**: PascalCase (e.g., `DummyComp`)
- **Variables**: camelCase (e.g., `mobileScreenSize`, `mediaQueryRef`)
- **Constants**: UPPER_SNAKE_CASE or camelCase (both acceptable)
- **Test files**: `*.test.js` in tests/ directory

### React Patterns

- Always use hooks properly (no conditional hooks, hooks at top level)
- Use `React.useRef` for persistent references (e.g., mediaQueryRef)
- Use `React.useState` for state management
- Use `React.useCallback` for memoizing callback functions
- Use `React.useEffect` for side effects with proper cleanup
- Set refs to `null` in cleanup functions

### Error Handling

- Validate browser support before using APIs (check for `typeof window !== 'undefined'`)
- Throw descriptive errors when APIs are not supported: `throw new Error('matchMedia not supported by browser!');`
- Use try-catch for browser compatibility fallbacks
- Handle both modern (`addEventListener/removeEventListener`) and legacy (`addListener/removeListener`) APIs

### Testing Guidelines

- Use `@testing-library/react` for component testing
- Import `@testing-library/jest-dom` for matchers
- Mock `window.matchMedia` for media query tests
- Use `jest.spyOn` to spy on React methods (e.g., `React.useEffect`)
- Restore mocks in `afterAll` or `afterEach` hooks
- Write descriptive test names: `should return false on desktop at first render`
- Group tests with `describe` blocks by functionality
- Use `beforeAll/afterAll` for setup/teardown across test suites
- Use `afterEach` to reset state between tests

### Browser Compatibility

- Support both modern and older browsers
- Implement fallback patterns for deprecated APIs
- Test with `useLayoutEffect` mocking for synchronous behavior
- Handle both `addEventListener` and `addListener` patterns

### Code Formatting

- No enforced linter (ESLint/Prettier not configured)
- Follow existing patterns in the codebase
- Keep code simple and minimal
- Use clear, descriptive variable names
- Add comments only when necessary (prefer self-documenting code)

### Type Definitions

- Provide `.d.ts` files for JavaScript projects
- Use optional parameters with `?`: `(mobileScreenSize?: number)`
- Use JSDoc comments for functions: `/** Detects if current viewport is mobile */`

## Git Workflow

- Use `npm run commit` (Commitizen) for standardized commit messages
- Follow conventional commits format
- Feature branches: `feature/AmazingFeature`
- Pull requests to main branch trigger CI/CD and semantic-release

## CI/CD Pipeline

- GitHub Actions runs on Node.js 18.x
- Tests run automatically on push/PR to main
- Coverage badge is generated and updated automatically
- Semantic-release handles versioning and npm publishing

## Important Notes

- This is a minimal library - keep changes simple
- Focus on browser compatibility
- Maintain test coverage (currently 100%)
- No build step - source is distributed directly
- React 16.8+ is the minimum requirement (hooks support)
