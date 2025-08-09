# Gemini Project Guide: Our Prayer App

## 1. Core Principles & Technology Stack

This document provides a set of strict guidelines for developing and maintaining the "Our Prayer" application. The architecture prioritizes **separation of concerns**, **reusability**, and a **centralized design system**. Adherence to these principles is mandatory.

- **Framework**: React Native (with Expo)
- **Language**: TypeScript (`"strict": true`)
- **Routing**: Expo Router (File-based)
- **Server State**: TanStack Query (React Query)
- **Global State**: React Context API
- **API Client**: Axios (with global interceptors)
- **Styling**: Centralized Design System via `StyleSheet`

---

## 2. State Management: The Two-Tier System

**Guiding Principle:** State is strictly divided into two categories: Server State and Global UI State. You must use the correct tool for each.

### Tier 1: Server State (React Query)

This governs all data fetched from or sent to the backend API.

#### **RULES: MUST DO**
-   ✅ **ALWAYS** manage server-side data (fetching, caching, updating) through the custom hooks in `utils/queries.ts` and `utils/mutation.ts`.
-   ✅ **ALWAYS** wrap new API endpoint interactions in a new `useQuery` or `useMutation` hook within these files.
-   ✅ **ALWAYS** use the `isLoading`, `isError`, and `data` properties returned by these hooks to render UI states.

#### **RULES: MUST NOT DO**
-   ❌ **NEVER** use `fetch` or `axios` directly inside a UI component (i.e., any file in `app/**/*.tsx`). This is a critical violation of the architecture. All API calls must be abstracted into a query/mutation hook.
-   ❌ **NEVER** manage server data with `useState` or `useEffect` for fetching. This duplicates the work already done by React Query.

### Tier 2: Global UI & Auth State (React Context)

This is for non-server state that needs to be shared across multiple components. The project uses a multi-context approach to ensure a clear separation of concerns.

#### **RULES: MUST DO**
-   ✅ **ALWAYS** use the appropriate hook for the required global state:
    -   `useSession()` from `contexts/AuthContext.tsx` for user authentication status and methods (`signUp`, `signOut`).
    -   `useModal()` from `contexts/ModalContext.tsx` to control the globally shared modal component.
    -   `useAppContext()` from `contexts/AppContext.tsx` for other global UI states like triggering an in-app review request.
-   ✅ **ALWAYS** add new global state to the most relevant context. If a new, distinct domain of global state is needed, create a new context file inside the `contexts/` directory.

#### **RULES: MUST NOT DO**
-   ❌ **NEVER** add unrelated state to an existing context (e.g., do not add UI state to `AuthContext`).
-   ❌ **NEVER** combine all contexts back into a single file. The separation is intentional.
-   ❌ **NEVER** introduce another global state management library (e.g., Redux, Zustand, Jotai). The project standard is the multi-context pattern using React's Context API.

---

## 3. Styling & Design System

**Guiding Principle:** The single source of truth for all visual styles is `utils/style.ts`. UI consistency is paramount.

#### **RULES: MUST DO**
-   ✅ **ALWAYS** import all styling values (colors, fonts, spacing, radii) from the objects exported by `utils/style.ts`.
-   ✅ **ALWAYS** use the design system tokens. For example: `colors.primary`, `fontSizes.md`, `spacing[4]`.
-   ✅ **ALWAYS** use the responsive utility functions like `normalizeFontSize` for text.

#### **RULES: MUST NOT DO**
-   ❌ **NEVER** use hardcoded, literal style values in `StyleSheet.create` calls (e.g., `color: '#4F5FFF'`, `fontSize: 16`, `margin: 8`). This is a strict rule to enforce the design system.
-   ❌ **NEVER** define new, one-off colors or font sizes within a component. If a new style is needed for reuse, it **MUST** be added to `utils/style.ts`.

---

## 4. Component & API Conventions

### Components

-   ✅ **MUST** build new UI by composing smaller, existing components from `components/`.
-   ✅ **MUST** follow the `PascalCase` naming convention for component files and functions.
-   ❌ **DO NOT** create large, monolithic components. Decompose them into smaller, reusable parts.

### API Communication

-   ✅ **MUST** make all API requests through the pre-configured Axios instance from `utils/axios.ts`.
-   ❌ **DO NOT** implement custom token refresh or global error handling logic. This is already handled globally by the Axios interceptors in `utils/axios.ts`.

### Navigation

-   ✅ **MUST** create new screens by adding files to the `app/` directory, following Expo Router's file-based conventions.
-   ✅ **MUST** use the `<Link>` component from `expo-router` for all internal navigation.
-   ❌ **DO NOT** install or use other navigation libraries.

### Modules & Imports

-   ✅ **MUST** use absolute path aliases (`@/components/...`) for imports as defined in `tsconfig.json`.
-   ❌ **DO NOT** use deep relative paths (`../../...`).

---

## 5. Communication & Justification

**Guiding Principle:** All technical assertions must be backed by evidence.

#### **RULES: MUST DO**
-   ✅ **ALWAYS** provide supporting documentation links (e.g., official API documentation, trusted technical articles) when making a technical claim or proposing a specific implementation strategy.
