# Maestro E2E Guide

## 1) Prerequisites
- Install Maestro CLI.
  - `brew install maestro` (macOS)
  - Verify: `maestro --version`
- Install dependencies.
  - `npm install`
- Log in to EAS if needed.
  - `eas login`

## 2) E2E Build (iOS Simulator)
Build an E2E-dedicated simulator app:

```bash
npm run e2e:ios:build
```

This uses `eas.json` profile `e2e-ios-simulator` and enables:
- `EXPO_PUBLIC_E2E_ENABLED=1`
- `EXPO_PUBLIC_E2E_TIMER_SECONDS=8`
- `EXPO_PUBLIC_MODE=development`

## 3) Install App on Simulator
After EAS build finishes:
1. Download the iOS simulator `.app` artifact.
2. Install it to the booted simulator.
3. Confirm the app launches.

## 4) Run Maestro Flows
Smoke suite:

```bash
npm run e2e:smoke
```

Slow suite:

```bash
npm run e2e:slow
```

## 5) Covered Scenarios
- `smoke.yaml`
  - `flow_free_smoke.yaml`
  - `flow_nonfree_smoke.yaml` (download alert optional)
- `slow.yaml`
  - `flow_free_complete.yaml`
  - `flow_nonfree_complete.yaml`

All flows:
- Use login subflow `subflows/login_start_only.yaml`
- Click only `시작하기` when login is required
- Enter `테스트라고 기록` on `prayerRecord`

## 6) Troubleshooting
- `plan-card-topic-0` not found:
  - Ensure topic plans exist in backend test data.
- Download step takes long:
  - This is expected in non-free flows when not pre-downloaded.
- App version update alert blocks flow:
  - The login subflow tries to dismiss `나중에`.
- Slow flow timeout:
  - Check `EXPO_PUBLIC_E2E_ENABLED=1` and `EXPO_PUBLIC_E2E_TIMER_SECONDS=8` in build profile.
