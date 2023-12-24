# Username and password example in Next.js App router

Uses SQLite (`main.db`) database.

```
pnpm i
pnpm dev
```

## Polyfill

If you're using Node 16 or 18, uncomment the code in `lib/auth.ts`. This is not required in Node 20, Bun, and Cloudflare Workers.

```ts
// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as Crypto;
```
