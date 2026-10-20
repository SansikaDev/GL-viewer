# GL Reconcile

Angular frontend for a general-ledger settlement desk: daily payment mix, the full payment book, and a reconcile screen that matches an uploaded processor report against what is already in the application.

## Run

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Test

This is an Angular 21 app, so unit tests run on **Vitest** (Jest-compatible API). Reports are written as **JUnit XML** for GitHub Actions — Java JUnit is not used here.

```bash
npm test
npm run test:watch
npm run test:ci
```

`test:ci` prints coverage and writes `reports/junit.xml`.

## CI / CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request to `master`:

1. Prettier format check
2. Vitest unit tests with JUnit + coverage artifacts
3. Production build

The Vercel project is [gl-viewer](https://vercel.com/sansikasansikx-3137s-projects/gl-viewer). It still needs the GitHub repo connected so production and PR previews deploy automatically:

1. Open [Git settings](https://vercel.com/sansikasansikx-3137s-projects/gl-viewer/settings/git)
2. Connect `SansikaDev/GL-viewer`
3. Production branch: `master`
4. Confirm build settings:
   - Framework: Angular
   - Build command: `npm run build`
   - Output directory: `dist/gl-reconcile/browser`

Vercel then deploys production from `master` and preview deployments from pull requests. Keep GitHub Actions as the quality gate (repo Settings → Branches → require the **CI** check before merge).

## Demo desk accounts

Use either pair on the sign-in screen:

- Controller - `maya.chen@folio.desk` / `settled-today`
- Operations - `ops@folio.desk` / `ledger-desk`

This is a UI demo with an in-memory ledger. Production auth must live on the server (session cookies, hashed passwords, rate limits).

## Screens

- **Dashboard** - payments by rail for a business day
- **Payments** - searchable book and posting detail
- **Reconcile** - upload a CSV (or run the sample report) to list rows not in the app and payments missing from the file
