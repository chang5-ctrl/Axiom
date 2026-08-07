# Axiom — Intelligent modular ERP platform

[![Build Status](https://img.shields.io/github/actions/workflow/status/vxssroott/Axiom/ci.yml?branch=main&label=ci&style=for-the-badge)](https://github.com/vxssroott/Axiom/actions) [![Repository](https://img.shields.io/github/repo-size/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom) [![Issues](https://img.shields.io/github/issues-raw/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom/issues) [![Stars](https://img.shields.io/github/stars/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom/stargazers) [![License](https://img.shields.io/github/license/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom)

One-line description
--------------------
Axiom is an intelligent, modular multi-tenant ERP platform that empowers organizations to manage operations from a single secure workspace — modular business features, role-based access, real-time analytics, and scalable multi-tenant architecture.

Why this README
---------------
This README is written from the current codebase and repository layout. It is intended to be production-grade, actionable for developers and infra engineers, and maintainable for product documentation.

Table of contents
-----------------
- Quick links / badges
- What this is (short)
- Stack & notable libs
- Repository layout (annotated)
- Getting started — local dev
- Database & supabase
- How to build & run (production)
- Architecture & where to look
- Testing & linting
- Contributing & modules
- Troubleshooting
- Changelog / credits / license

## What this is

Axiom is a modular, multi-tenant ERP built with a TypeScript-first codebase (frontend + lightweight server pieces) designed to host and attach independent business modules while sharing platform services like authentication, tenancy, billing, and analytics.

### Stack
- **Language(s):** TypeScript (primary), PL/pgSQL (database), CSS
- **Framework / runtime:** Vite + React (client), Node/TypeScript entry points (server.ts, start.ts)
- **Notable libraries / integrations:**
  - Supabase (Postgres + auth + storage) — supabase/ directory + config
  - TanStack/react-query (data fetching patterns visible in package.json)
  - Vite (development & build)
  - A modular services layer in src/services for platform features (auth, tenant, billing, modules)

## How it's organized

```text
.env                       # environment example / container secrets (sensitive - not checked in in good practice)
README.md                  # this file
package.json               # scripts and dependencies (vite, build, dev scripts)
vite.config.ts             # Vite config for the frontend
tsconfig.json              # TypeScript config
bun.lock, bunfig.toml      # bun artifacts (optional/legacy)
public/                    # static assets (favicon, robots.txt)
supabase/
  config.toml              # supabase project config
  migrations/              # SQL migrations (PLpgSQL)
src/
  assets/                  # images & static assets used by UI
  components/              # shared UI components (landing, platform, ui, layout, brand, automotive)
  config/                  # app configuration: navigation, modules, landing info
  hooks/                   # custom React hooks
  integrations/            # external integrations (third-party connectors)
  lib/                     # low-level utilities & wrappers
  providers/               # data/auth/feature providers
  routeTree.gen.ts         # generated route tree (routing map)
  router.tsx               # router entry
  routes/                  # route components (App Router or route-based pages)
  server.ts                # lightweight server entry (API / SSR boundary)
  services/                # platform service layer (auth.service.ts, tenant.service.ts, module.service.ts, etc.)
  start.ts                 # application bootstrap
  styles.css               # global styles
  types/                   # shared TypeScript types
MODULES.md                 # module architecture & registry
MODULE_DEVELOPMENT.md      # how to build modules
QUICK_START_MODULE.md      # module quick start guide
AGENTS.md                  # agent/automation docs (if used)
```

**How it fits together:**
Axiom is primarily a Vite-built React frontend that relies on platform services implemented in src/services for authentication, tenancy, billing, and module orchestration. Supabase provides the primary persistence layer (Postgres) and auth; the frontend consumes platform APIs and Supabase client operations. Modules are designed to plug into the platform (see MODULES.md / MODULE_DEVELOPMENT.md).

## How to run it

### Quick start — local development

Prerequisites
- Node.js (>= 18 recommended) or Bun (repo contains bun artifacts)
- Supabase CLI (if running database locally) — optional but recommended for local Postgres + auth

Install dependencies
```bash
# npm
npm ci

# or yarn
yarn install

# or pnpm
pnpm install
```

Run development server (frontend)
```bash
npm run dev
# which runs: "vite dev" (see package.json scripts)
```

Build and preview production bundle
```bash
npm run build
npm run preview
```

Run platform server (if you have a Node runtime for server.ts)
- If server.ts/start.ts must be compiled/started, either:
  - use ts-node to run directly (development)
  - compile with tsc then run with node (production)
(Check for project-specific server scripts or a dedicated infra container.)

## Database & supabase

- There is a supabase/ folder with config.toml and a migrations/ directory.
- Local development with Supabase CLI:
  1. Install supabase CLI
  2. Run supabase start (in repository root)
  3. Apply migrations: supabase db reset or supabase db push depending on your workflow

### Required environment variables (typical)
- DATABASE_URL (Postgres connection string)
- SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY (for Supabase client/server)
- NODE_ENV
- PORT
(See .env.example or .env — do not commit secrets.)

## How to run end-to-end locally (recommended minimal path)
1. Start local supabase (supabase start)
2. Export DATABASE_URL + SUPABASE keys from local supabase
3. npm ci
4. npm run dev
5. Open http://localhost:5173 (default Vite port) or the console output port

## Architecture & where to look

- Auth flows and session management: src/services/auth.service.ts
- Tenant orchestration and multi-tenant boundaries: src/services/tenant.service.ts
- Module registration and lifecycle: src/services/module.service.ts and MODULES.md
- Routing & pages: src/router.tsx, src/routeTree.gen.ts, src/routes/
- Supabase-related database definitions and migrations: supabase/migrations/
- Landing & platform configuration: src/config/landing.ts, src/config/modules.ts, src/config/navigation.ts
- Global styling: src/styles.css and components/* UI

## Testing, linting & quality
- Lint: package.json contains lint scripts (eslint)
- Format: Prettier config exists (.prettierrc)
- Type checking: TypeScript configuration in tsconfig.json
- Add CI workflows (GitHub Actions) to run lint, type-check, tests, and build on PRs
- Recommend adding tests (unit and integration) for services in src/services and contracts for modules

## Continuous integration & deployment
- Add GitHub Actions workflows to:
  - run TypeScript type checks
  - run linter and formatter checks
  - build production bundle with Vite
  - run database migrations in deployment pipeline (if using managed Postgres)
- Deploy static frontend from the build output to your static host (Vercel / Netlify / CloudFront) or serve with a Node server if SSR or server-side APIs are required.

## Contributing & module development
This repository includes developer-facing docs to onboard module authors:
- MODULES.md — conceptual overview of modules and registry
- MODULE_DEVELOPMENT.md — step-by-step guide to create and register a new module
- QUICK_START_MODULE.md — quick scaffold to get a module running

Contributing checklist (recommended)
1. Read MODULE_DEVELOPMENT.md
2. Create issues for major changes; link PR to issue
3. Run tests and linters locally
4. Ensure new modules include integration tests (if applicable)
5. Provide a migration file for DB changes and test it locally against supabase

## Troubleshooting & common pitfalls
- If the frontend can’t authenticate, ensure SUPABASE keys and URL are set and the supabase instance is reachable.
- Database migrations should be applied before running module features that create schema objects.
- If you see type errors from generated artifacts (routeTree.gen.ts), re-run the generator script or investigate the code that produces the route tree.

## Security & multi-tenancy notes
- Multi-tenancy is enforced at the tenant/service layer — verify every service method checks tenant context (see tenant.service.ts).
- Keep Supabase service role keys out of client-side code; use server endpoints when performing privileged DB actions.
- Use role-based permissions for sensitive operations (billing, account management).

## Recommended next improvements (priority)
- Add a top-level LICENSE file (if not present)
- Add a CI workflow that runs typecheck + lint + build on every PR
- Add a CONTRIBUTING.md that outlines PR process and review expectations
- Add automated DB migration checks and preview environments

## Files & docs to read next
- README.md (this file)
- MODULES.md
- MODULE_DEVELOPMENT.md
- src/services/*.ts (auth.service.ts, tenant.service.ts, module.service.ts)
- supabase/migrations/

## Credits
Axiom — architecture and code: vxssroott/Axiom contributors

## License
Please add or consult the LICENSE file in the repository root. If none exists, choose (and commit) a license appropriate for your project (MIT, Apache-2.0, etc.) before public distribution.

---

_I updated this README based on the repository contents (src/, supabase/, package.json) and developer docs. If you'd like I can instead open a pull request with these changes on a feature branch, or add/modify a CONTRIBUTING.md and CI workflow next._
