# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router entry points (e.g., `_layout.tsx`, `login.tsx`); keep related screens in route segments.
- `components/`: Reusable UI pieces with typed props; keep side effects out.
- `contexts/`: React providers and hooks for shared state; initialize providers near the root layout.
- `utils/`: Pure helpers; prefer no React or platform dependencies for easy reuse.
- `classes/`: Models or service wrappers that encapsulate platform-specific logic.
- `assets/`: Fonts/images; register fonts through Expo before use.
- Platform/config files: `app.json`, `eas.json`, `metro.config.js`, `google-services.json`, `GoogleService-Info.plist`.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run start` (or `npx expo start`): Launch Expo dev server and bundler.
- `npm run android` / `npm run ios`: Build and run native dev clients.
- `npm run web`: Start the web target via Expo Router.
- `npm run lint`: Expo/ESLint checks; run before pushing.
- `npm run reset-project`: Reset starter code; only use intentionally.

## Coding Style & Naming Conventions
- TypeScript-first; explicit types for props, context values, and exports from `utils/`.
- 2-space indentation; functional components with hooks over classes.
- Components/classes: `PascalCase`; hooks/helpers: `camelCase`, hooks prefixed with `use`.
- Expo Router routes: lowercase filenames; group by folder segments to mirror navigation.
- Order imports: external libs, then absolute app modules, then relative paths; avoid default exports for shared pieces.

## Testing Guidelines
- No automated suite yet; add Jest + React Native Testing Library when introducing non-trivial logic.
- Place tests alongside sources (`*.test.ts(x)` or `__tests__/`).
- Prioritize pure utilities and context behavior; document manual device/OS checks in PRs until tests exist.

## Commit & Pull Request Guidelines
- Follow existing history conventions (e.g., `refactor: update expo-build-properties configuration`); use concise, present-tense, conventional prefixes (`feat`, `fix`, `chore`, `refactor`, `docs`).
- Keep commits focused; avoid committing generated artifacts, secrets, or platform build outputs.
- PRs: include summary, linked issue, platform(s) tested (Android/iOS/Web), UI screenshots if relevant, and verification steps. Call out breaking changes or config updates.

## Security & Configuration Tips
- Never commit credentials; keep secrets in platform config or secure env tooling.
- When changing bundle identifiers or app IDs, update both platform key files and `app.json` to keep OTA/store builds aligned.
