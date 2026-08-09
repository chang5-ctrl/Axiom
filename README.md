# Axiom — Intelligent modular ERP platform

[![CI](https://img.shields.io/github/actions/workflow/status/vxssroott/Axiom/ci.yml?branch=main&label=ci&style=for-the-badge)](https://github.com/vxssroott/Axiom/actions) [![Stars](https://img.shields.io/github/stars/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom/stargazers) [![Forks](https://img.shields.io/github/forks/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom/network/members) [![Issues](https://img.shields.io/github/issues/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom/issues) [![Languages](https://img.shields.io/github/languages/top/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom)

Axiom is an intelligent, modular multi-tenant ERP platform that empowers organizations to manage their operations from a single secure workspace. It combines modular business features, role-based access control, real-time analytics, and a scalable architecture designed for multi-tenant SaaS deployments.

---

## Quick links

- Repository: https://github.com/vxssroott/Axiom
- Homepage: https://erp.rocdwels.ng/
- Modules docs: MODULES.md
- Module developer guide: MODULE_DEVELOPMENT.md

## Why this README

This README is generated from the current codebase and is intended to be production-grade and developer-friendly: clear badges, quickstart, environment requirements, architecture notes, and guidelines for CI/CD and contributing.

## Table of contents

- Quick start
- Requirements
- Local development
- Environment variables
- Database & Supabase
- Build & production
- Testing & CI
- Repository layout
- Contributing
- Security & license

## Quick start

Prerequisites:
- Node.js 18+ (recommended)
- pnpm, npm, or yarn
- Supabase CLI for local Postgres (recommended when developing DB-backed features)

Install dependencies:

```bash
# npm
npm ci
# or yarn
yarn install
# or pnpm
pnpm install
```

Run development server (frontend):

```bash
npm run dev
```

Build and preview production bundle:

```bash
npm run build
npm run preview
```

If the repository includes a server entry (server.ts / start.ts), run that separately in a Node runtime after building TypeScript or with ts-node for development.

## Environment variables (typical)

Store secrets in .env (do NOT commit):

- DATABASE_URL — Postgres connection string
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NODE_ENV
- PORT

There may be other module-specific variables defined in src/config or module manifests. Check MODULES.md for module runtime config.

## Database & Supabase

This project uses Supabase (Postgres) for persistence and auth. The repository contains a `supabase/` folder with migration files.

Local development with Supabase CLI:

1. Install supabase CLI
2. Run `supabase start` from the repository root
3. Export local `DATABASE_URL` and Supabase keys into your environment
4. Apply migrations: `supabase db reset` or `supabase db push` depending on your workflow

## Build & production

- Use `npm run build` to produce the static frontend output
- Deploy static build to Vercel, Netlify, CloudFront, or serve via Node if SSR/Server APIs are required
- Run database migrations as part of your deployment pipeline when schema changes are introduced

CI/CD recommendations:
- Add a GitHub Actions workflow that runs: install, TypeScript type-check, lint, build, and (optionally) tests
- Run database migration preview checks in CI and gate deployments on successful migrations

## Testing, linting & quality

- Lint: `npm run lint` (eslint)
- Format: `npm run format` (prettier)
- Type check: `tsc --noEmit` or add a script to run type checking in CI

Recommended CI steps:
1. Install dependencies
2. Run `tsc --noEmit`
3. Run `npm run lint` and `npm run format --check` if configured
4. Build (`npm run build`)

## Repository layout (high level)

```
.env                       # environment example / container secrets (sensitive - not checked in)
README.md                  # this file
package.json               # scripts and dependencies
vite.config.ts             # Vite config for the frontend
tsconfig.json              # TypeScript config
supabase/                  # Supabase config and SQL migrations
src/                       # application source
  assets/                  # images & static assets
  components/              # shared UI components
  config/                  # app configuration: navigation, modules, landing
  hooks/                   # custom React hooks
  integrations/            # external connectors
  lib/                     # low-level utilities
  providers/               # data/auth providers
  routeTree.gen.ts         # generated route tree
  router.tsx               # routing entry
  routes/                  # route components
  server.ts                # lightweight server entry (if used)
  services/                # platform services (auth, tenant, module)
MODULES.md                 # module architecture & registry
MODULE_DEVELOPMENT.md      # how to build modules
QUICK_START_MODULE.md      # scaffolding for module authors
```

## Architecture & where to look

- Auth & session flows: `src/services/auth.service.ts`
- Tenant orchestration: `src/services/tenant.service.ts`
- Module registration & lifecycle: `src/services/module.service.ts` and `MODULES.md`
- Routing: `src/router.tsx`, `src/routeTree.gen.ts`, `src/routes/`
- Supabase migrations: `supabase/migrations/`

## Contributing

Please follow a conservative process for changes (this project is connected to Lovable — do not rewrite published git history):

1. Open an issue describing the change or feature
2. Create a feature branch for your work
3. Run tests, linters, and type checks locally
4. Create a Pull Request and link to the issue
5. Ensure CI passes and reviewers sign off before merging

Add a `CONTRIBUTING.md` that documents PR guidelines, commit message conventions, and code ownership if you'd like to formalize the process.

## Security & multi-tenancy notes

- Multi-tenancy boundaries must be enforced at service-level; validate tenant context in `tenant.service.ts`
- Never expose Supabase service_role keys in client-side code. Use server endpoints for privileged actions.
- Add automated dependency scanning (Dependabot or Snyk) and secret scanning in GitHub to protect credentials.

## License

No LICENSE file was found in the repository. Add a license (MIT / Apache-2.0 / etc.) in the root before public distribution.

---

If you'd like, I can:

- Open a branch and submit a PR with this README update
- Add a simple GitHub Actions workflow template (ci.yml) that runs lint, type-check, and build
- Create CONTRIBUTING.md and LICENSE files

