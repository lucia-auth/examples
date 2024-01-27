# GitHub OAuth example in Next.js Pages router

Uses SQLite (`main.db`) database.

```
pnpm i
pnpm dev
```

## Setup

Create a GitHub OAuth app with the callback set to `http://localhost:3000/login/github/callback` and create an `.env` file.

```bash
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

## Polyfill

If you're using Node 16 or 18, uncomment the code in `lib/auth.ts`. This is not required in Node 20, Bun, and Cloudflare Workers.

```ts
// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as Crypto;
```
