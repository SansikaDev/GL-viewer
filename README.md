# GL Reconcile

Angular frontend for a general-ledger settlement desk: daily payment mix, the full payment book, and a reconcile screen that matches an uploaded processor report against what is already in the application.

## Run

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Demo desk accounts

Use either pair on the sign-in screen:

- Controller - `maya.chen@folio.desk` / `settled-today`
- Operations - `ops@folio.desk` / `ledger-desk`

This is a UI demo with an in-memory ledger. Production auth must live on the server (session cookies, hashed passwords, rate limits).

## Screens

- **Dashboard** - payments by rail for a business day
- **Payments** - searchable book and posting detail
- **Reconcile** - upload a CSV (or run the sample report) to list rows not in the app and payments missing from the file
