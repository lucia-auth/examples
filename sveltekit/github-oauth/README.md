# GitHub OAuth example in SvelteKit

Uses SQLite (in-memory) database.

```
pnpm i
pnpm dev
```

## Setup

Create a GitHub OAuth app with the callback set to `http://localhost:5173/login/github/callback` and create an `.env` file.

```bash
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```
