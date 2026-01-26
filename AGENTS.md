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

## Color Palette (observed in code)
- Primary/Highlight: `#4F5FFF` (most common), lighter accent `#959FFF`, occasional `#4D5BDC`.
- Text/Secondary grays: frequent `#B3B3B3`; also `#7781A0`, `#8892B8`, `#858585`, `#5E6577`, mid grays `#51545D`/`#51525C`/`#555`/`#888`.
- Dark backgrounds: `#0F141A`, `#161B29`, `#262624`, `#242527`, `#2D2D2D`, `#3A3A3B`, `#000000`.
- Light/Surface: `#FFFFFF`/`#FFF`, `#FEFEFE`, `#E4E6FC`, `#CFCFCF`, `#B9B9B9`.
- Special single-use tones spotted: `#F7EE91`, `#FEE500`, `#FF231F7C`, `#5EA3FE`, `#FF0000`.

## Notifications & Scheduling Overview
- `utils/notification.ts`: Expo notification permission, channel setup, and push token registration helper.
- `app/_layout.tsx`: Foreground notification handling and badge reset; registers push token on app start.
- `contexts/AuthContext.tsx`: Updates user alarm flag/push token in session and backend.
- `app/(app)/(tabs)/mypage.tsx`: Alarm toggle and daily schedule registration; stores notification IDs in AsyncStorage.
- `app/(app)/(stacks)/prayerTime.tsx`: Per-hour schedule creation/removal; reads/writes AsyncStorage notification IDs.
- `utils/mutation.ts`, `utils/queries.ts`, `utils/dataType.ts`: Backend alarm/token fields wiring.
- `app/login.tsx`: Login payload includes `alarm` and `expo_push_token`.

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
- AsyncStorage keys must be defined in `storage/asyncStorageKeys.ts` (including new key prefixes such as `appNotice:dismissed:`).
