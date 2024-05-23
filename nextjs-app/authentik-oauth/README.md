# Authentik OAuth example in Next.js App router

Uses SQLite (`main.db`) database.

```
pnpm i
pnpm dev
```

## Setup

Create an Authentik OAuth app with the callback set to `http://localhost:3000/login/authentik/callback` and create an `.env` file.

```bash
AUTHENTIK_CLIENT_ID=""
AUTHENTIK_REALM_URL=""
AUTHENTIK_CLIENT_SECRET=""
```

## Polyfill

If you're using Node 16 or 18, uncomment the code in `lib/auth.ts`. This is not required in Node 20, Bun, and Cloudflare Workers.

```ts
// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as Crypto;
```
