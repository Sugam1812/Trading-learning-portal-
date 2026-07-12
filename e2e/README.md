# E2E smoke drive

Drives the exported web build of PipQuest through all critical user flows
(onboarding → lesson → challenge → calculators → strategy builder → backtest →
journal → settings → persistence) and fails on any console/page error.

```bash
npx expo export --platform web
npx http-server dist -p 8092 -s --proxy "http://127.0.0.1:8092?"   # SPA fallback required
BASE_URL=http://127.0.0.1:8092 node e2e/drive.mjs                   # needs playwright + chromium
```

Optional env:
- `CHROMIUM_PATH` — explicit Chromium executable (omit to use Playwright's default browser)
- `SHOT_DIR` — directory for step screenshots

The same route and store code paths run on native; this web drive verifies
navigation, the lesson block engine, hidden-future chart behaviour, all
calculators, persistence and empty/error states without a device farm.
