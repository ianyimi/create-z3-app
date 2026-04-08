# Tasks: Better Auth 1.5 Migration

## Task Group 1: Update `tmp/my-app` Dependencies
- [x] Bump `better-auth` to `^1.5.0` in `tmp/my-app/package.json`
- [x] Bump `@convex-dev/better-auth` to latest `^0.11.x` in `tmp/my-app/package.json`
- [x] Add `@better-auth/api-key` dependency in `tmp/my-app/package.json`
- [x] Run `pnpm install` in `tmp/my-app/` and verify no peer dep conflicts

## Task Group 2: Update Custom Convex Adapter Config (`tmp/`)
- [x] Add `supportsArrays: true` to adapter config in `tmp/my-app/convex/auth/adapter/index.ts`
- [x] Remove manual array-coercion block from `customTransformInput` (keep only date handling)

## Task Group 3: Migrate `apiKey` Plugin Import + Add `convex()` Plugin (`tmp/`)
- [x] Change `apiKey` import from `better-auth/plugins` to `@better-auth/api-key` in `tmp/my-app/convex/auth/plugins/index.ts`
- [x] Add `convex` import from `@convex-dev/better-auth/plugins`
- [x] Add `authConfig` import from `@convex/auth.config`
- [x] Add `convex({ authConfig })` to plugins array

## Task Group 4: Add `apiKey` Table to Schema (`tmp/`)
- [x] Add `TABLE_SLUG_API_KEYS = "apikey"` constant to `tmp/my-app/src/db/constants/index.ts`
- [x] Add `apiKey` table definition to `tmp/my-app/convex/schema.ts` with all 1.5 fields (`referenceId`, `configId`, etc.)
- [x] Run `pnpm typecheck` in `tmp/my-app/` and fix any errors

## Task Group 5: Port All Changes to Template Files
- [x] Apply same dependency bumps to `packages/cli/templates/tanstack-start/package.json`
- [x] Apply same adapter config changes to `packages/cli/templates/tanstack-start/convex/auth/adapter/index.ts`
- [x] Update `packages/cli/templates/tanstack-start/convex/auth/plugins/index.ts` (apiKey import only — convex() plugin already present)
- [x] Add `TABLE_SLUG_API_KEYS` to `packages/cli/templates/tanstack-start/src/db/constants/index.ts`
- [x] Add `apiKey` table to `packages/cli/templates/tanstack-start/convex/schema.ts`
