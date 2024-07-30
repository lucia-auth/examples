# Google OAuth example with Lucia and SvelteKit

This example uses SQLite3 with `better-sqlite3`. Make sure to setup your `.env` file.

```bash
# install dependencies
pnpm i

# run dev server
pnpm dev
```

## Setup Google OAuth

The redirect uri should be set to `localhost:5173/login/google/callback`. Copy and paste the client id and secret into `.env`.

```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""
```

## User schema

| id         | type     | unique |
| ---------- | -------- | :----: |
| `id`       | `string` |        |
| `name`     | `string` |        |
| `email`    | `string` |        |
| `image`    | `string` |        |

