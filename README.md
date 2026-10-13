# ExpinSoft Trading Journal

A responsive crypto trading journal with manual trade entry, React Router navigation, account management forms, and nested settings pages. The application starts with a true zero state and contains no seeded trade records.

## Run

```sh
npm install
npm run dev
```

Run `npm run build` for a production build. Exchange connections remain frontend mock states. Currency preferences are informational and do not perform live conversion. No broker or backend integration is included.

Visit `/signup` to create the device's local account, or `/login` to sign in. Dashboard, journal, settings, and account routes require a session. The active user is stored in `expinsoft_user`; logout removes this session but preserves the account in `expinsoft_account` and journal in `expinsoft_trades`. Passwords are stored as salted PBKDF2 hashes rather than plaintext. This is browser-local authentication, not server-enforced access control; clearing browser storage removes the account and journal.

Manual trade creation, editing, deletion, and clearing save immediately to local storage. Data Management exports the current journal as CSV and imports the same schema, appending rows with new IDs. CSV supports quoted commas, quotes, and multiline notes. Required columns are `asset,date,exitDate,entry,exit,size,pnl`; use an exported file as a template. Invalid files are rejected before any trades are appended. Export backups to keep data outside this browser. Preferences, sync mode, and theme are also stored locally.

Settings routes include `/settings/connections`, `/settings/preferences`, `/settings/data`, and `/settings/appearance`. User routes include `/profile`, `/add-user`, and `/reset-password`.
