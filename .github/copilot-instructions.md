# RiyMo — GitHub Copilot project instructions

## Project source of truth
- Treat the existing repository code, schemas, tests, and configuration as the primary source of truth. Inspect the narrowest relevant files before changing code; do not assume a requested module is missing or rebuild an existing capability.
- Product context: RiyMo (also branded in parts of the codebase as LibertadGO) is a tourism platform initially focused on La Libertad, Peru. Existing modules include the tourist-place catalog, interactive MapLibre map, exploration, itineraries, creators, video gallery and ranking, moderation, favorites, admin dashboard, and audit history.
- Follow established architecture and patterns in nearby code. Reuse existing components, API routes, validation schemas, repository interfaces/adapters, auth and audit services, notifications, and confirmation dialogs. Keep changes scoped to the authorized task.
- The checked-in package manifest is authoritative for versions and commands: React 19, TypeScript, Vite, Tailwind CSS v4, Node.js, Express, PostgreSQL (`pg`, Neon-compatible), MapLibre, and AWS S3-compatible storage integration (used for Cloudflare R2). Cloud Run is a production target. Do not assume a service is connected or configured merely because it appears in product context; verify its actual code and configuration.

## Engineering workflow
- Start with a focused inspection and explain/resolve the root cause before implementing. When a concrete diagnosis is already available, validate only the relevant code instead of performing a broad repository audit.
- Implement the complete authorized behavior, including appropriate validation, loading/empty/error states, accessibility, security, persistence, auditability, and UI feedback. Avoid duplicate functionality and unrelated refactors.
- Preserve the current RiyMo visual language, responsive behavior, Spanish product copy, and existing conventions. Prefer existing dependencies and components; do not add dependencies without a clear need.
- Keep TypeScript types accurate. Validate untrusted request data at the server boundary using the project's existing Zod schemas and preserve repository interface parity across PostgreSQL and in-memory adapters where both implement the capability.
- Add or update focused tests for behavior and regression cases. Do not claim tests, type checks, builds, or manual verification passed unless actually run; report commands and outcomes honestly. Available package scripts include `npm run lint` (TypeScript no-emit check) and `npm run build` (Vite frontend plus bundled Express server). Tests use Node's test runner; there is no dedicated test script in `package.json`, so run relevant test files with the repository's existing `tsx`/Node setup.
- Update relevant documentation when behavior, configuration, or operational steps change. Do not create speculative documentation unrelated to the change.

## Data, publication, and truthfulness
- Neon is an existing, configured production database. Never run or apply a migration, seed, destructive query, or data rewrite without explicit user authorization. Reviewing migration files or writing a proposed migration is not permission to execute it.
- Never delete or alter real user/catalog data, change production, deploy, perform destructive Git operations, or change secrets unless explicitly authorized. Do not expose credentials, tokens, private creator data, or internal moderation notes through public APIs or logs.
- Never fabricate records, usage, ratings, views, engagement, connectivity, or successful operation. Use real persisted/query results, and represent unavailable information as unavailable rather than synthetic data. Keep externally reported metrics distinct from RiyMo's actual internal metrics.
- Public video surfaces must use the existing publication rules and expose only approved, visible content. Pending, observed, rejected, or hidden submissions must not leak into public rankings, galleries, creator pages, place pages, or map information. Preserve moderation decisions and audit history when editing metadata or associations.
- Do not fetch or embed arbitrary remote URLs unsafely. Reuse established URL parsing, oEmbed safeguards, provider allowlists, and safe iframe patterns.

## Security and operations
- Keep administrative routes protected by the existing authentication/authorization middleware. Validate and authorize every mutation server-side; never rely on client-side controls for access enforcement.
- Use parameterized database queries and existing repository abstractions. Avoid introducing direct SQL into UI code or bypassing the repository layer.
- Do not weaken CSRF, authentication, rate limiting, URL/SSRF protections, or production health/startup checks to make a feature work.
- Never run deployment commands or modify Cloud Run/Neon/R2 production configuration as part of ordinary implementation. Ask for explicit approval before any restricted operation.

## Completion report
At completion, summarize what was implemented, the files changed, tests/type-check/build commands and actual results, and any remaining blockers. State clearly if something was not run or could not be verified. For tasks that only configure instructions, confirm the instruction files created and their scope; do not modify application functionality unless requested.
