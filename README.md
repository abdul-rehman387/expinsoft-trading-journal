# ExpinSoft Trading Journal

A responsive crypto trading journal with manual trade entry, React Router navigation, account management forms, and nested settings pages. The application starts with a true zero state and contains no seeded trade records.

## Run

```sh
npm install
npm run dev
```

Run `npm run build` for a production build. All exchange connections and imports are frontend mock states. Added trades stay in memory; preferences, sync mode, and theme are stored locally. Currency preferences are informational and do not perform live conversion. No broker or backend integration is included.

Settings routes include `/settings/connections`, `/settings/preferences`, `/settings/data`, and `/settings/appearance`. User routes include `/profile`, `/add-user`, and `/reset-password`.
