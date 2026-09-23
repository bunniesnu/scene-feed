# SCENE-feed

An archiving site for news from multiple sources. Supports tagging and quick imports from supported websites.

## Development

```shell
# Install packages
pnpm install

# Run local supabase CLI
pnpm db:start

# Run Cloudflare Pages functions
pnpm functions

# Run local server
pnpm dev
```

## Tech stacks

* Framework: React + Vite
* Styling: Tailwind CSS
* Database: Supabase (PostgreSQL)
* API: PostgREST
* Auth: Supabase Auth with Google OAuth
* Deployment: Cloudflare Pages