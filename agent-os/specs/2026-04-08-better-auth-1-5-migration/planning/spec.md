# Better Auth 1.5 Migration

## Overview

Upgrade the TanStack Start template (and its `tmp/my-app` test project) from Better Auth `^1.4.9` to `^1.5.0` and `@convex-dev/better-auth` from `^0.10.9` to `^0.11.x`. This involves updating the custom Convex adapter config, migrating the `apiKey` plugin to its new standalone package, adding the `apiKey` table to the Convex schema, and simplifying the array transform logic. The `tmp/my-app` project is used as the live integration target — only after it works cleanly does the spec port changes to the template files.

## Design Decisions

- **`supportsArrays: true` replaces manual array transform**: Better Auth 1.5 handles array types natively when this flag is set. The custom array-wrangling block in `customTransformInput` is removed.
- **`apiKey` plugin extracted to `@better-auth/api-key`**: No longer importable from `better-auth/plugins`. Requires a new dependency.
- **`apiKey` schema is explicitly defined in `convex/schema.ts`**: The table was previously missing from the schema despite the plugin being active. The 1.5 schema uses `referenceId` (not `userId`) and a new `configId` field.
- **`convex()` plugin added to `tmp/`**: The template already includes the Convex JWT plugin from `@convex-dev/better-auth/plugins`; `tmp/` gets it too to maintain parity.
- **Template changes only after `tmp/` is confirmed working**: Spec is sequenced so the live project is the integration test before template files are touched.

## Out of Scope

- Adding new auth plugins (passkey, organization, OIDC)
- UI component changes
- Changes to `src/lib/auth/client.ts` or `server.ts` (no API surface changes in 1.5 affect these)
- Session secondary storage changes (no secondary storage used here)
- `getMigrations` import changes (not used in this project)

## Target Files Changed

```
tmp/my-app/
  package.json                              ← version bumps + new dep
  convex/auth/adapter/index.ts              ← supportsArrays: true, remove array transform
  convex/auth/plugins/index.ts              ← apiKey import + convex() plugin
  convex/schema.ts                          ← add apiKey table
  src/db/constants/index.ts                 ← add TABLE_SLUG_API_KEYS

packages/cli/templates/tanstack-start/
  package.json                              ← same version bumps
  convex/auth/adapter/index.ts              ← same adapter changes
  convex/auth/plugins/index.ts              ← same plugin changes
  convex/schema.ts                          ← same schema changes
  src/db/constants/index.ts                 ← same constant
```

## Implementation Order

1. **Step 1** — Update `tmp/my-app/package.json` dependencies and run `pnpm install`
2. **Step 2** — Update the custom Convex adapter config (`supportsArrays`, simplified transform)
3. **Step 3** — Migrate the `apiKey` plugin import + add `convex()` plugin to `tmp/`
4. **Step 4** — Add `apiKey` table and constant to `tmp/` schema
5. **Step 5** — Typecheck and deploy `tmp/` — verify auth flows work end to end
6. **Step 6** — Port all changes to `packages/cli/templates/tanstack-start/`

---

## Step 1: Update `tmp/my-app` Dependencies

- [ ] Open `tmp/my-app/package.json`
- [ ] Update `better-auth` to `^1.5.0`
- [ ] Update `@convex-dev/better-auth` to `^0.11.0` (check npm for latest `0.11.x`)
- [ ] Add `@better-auth/api-key` at the version that ships with Better Auth 1.5 (check peer dep on npm — at time of writing `^1.0.0` or similar)
- [ ] Run `pnpm install` in `tmp/my-app/`
- [ ] Verify no peer dependency warnings about `better-auth` version conflicts

**File: `tmp/my-app/package.json`** — `dependencies` section, relevant lines only:

```json
"@better-auth/api-key": "^1.0.0",
"@convex-dev/better-auth": "^0.11.0",
"better-auth": "^1.5.0",
```

> **Note**: Check `https://www.npmjs.com/package/@better-auth/api-key` and `https://www.npmjs.com/package/@convex-dev/better-auth` for the exact latest patch versions before pinning. The `@convex-dev/better-auth` 0.11.x peer dep requires `better-auth >=1.5.0 <1.6.0`.

---

## Step 2: Update the Custom Convex Adapter Config

Two changes: add `supportsArrays: true` and remove the manual array-coercion block from `customTransformInput`. The date handling stays untouched.

- [ ] Open `tmp/my-app/convex/auth/adapter/index.ts`
- [ ] Add `supportsArrays: true` to the `config` object (alongside the existing `supportsJSON`, `supportsDates`, etc.)
- [ ] Remove the `if ((fieldAttributes.type as string)?.endsWith("[]"))` block from `customTransformInput` — leave only the date handling

**File: `tmp/my-app/convex/auth/adapter/index.ts`** — `config` object (full replacement):

```ts
config: {
  adapterId: "convex",
  adapterName: "Convex Adapter (Action-based - Full Featured)",
  customTransformInput: ({ data, fieldAttributes }) => {
    if (data && fieldAttributes.type === "date") {
      return new Date(data).getTime();
    }
    return data;
  },
  customTransformOutput: ({ data, fieldAttributes }) => {
    if (data && fieldAttributes.type === "date") {
      return new Date(data).getTime();
    }
    return data;
  },
  debugLogs: config.debugLogs ?? false,
  disableIdGeneration: true,
  mapKeysTransformInput: {
    id: "_id",
  },
  mapKeysTransformOutput: {
    _id: "id",
  },
  supportsDates: false,
  supportsJSON: true,
  supportsNumericIds: false,
  supportsArrays: true,
  transaction: false,
  usePlural: false,
},
```

> **Edge case — `supportsJSON: true` + `supportsArrays: true`**: Convex natively stores both JSON objects and arrays, so both flags are correct. The old manual array transform was necessary when `supportsArrays` didn't exist; now it's redundant and would double-wrap arrays.

> **Edge case — date output**: `customTransformOutput` returns a number (via `.getTime()`), not a `Date` object. This is intentional — Convex doesn't serialize `Date` instances, and Better Auth's date comparisons work fine against numbers. This matches how `@convex-dev/better-auth` 0.11 handles dates.

---

## Step 3: Migrate `apiKey` Import and Add `convex()` Plugin

- [ ] Open `tmp/my-app/convex/auth/plugins/index.ts`
- [ ] Remove `apiKey` from the `better-auth/plugins` import
- [ ] Add `import { apiKey } from "@better-auth/api-key"`
- [ ] Add `import { convex } from "@convex-dev/better-auth/plugins"`
- [ ] Add `import authConfig from "@convex/auth.config"` (already present in template, needed by `convex()`)
- [ ] Add `convex({ authConfig })` to the plugins array

**File: `tmp/my-app/convex/auth/plugins/index.ts`** — full file:

```ts
import { admin } from "better-auth/plugins"
import { apiKey } from "@better-auth/api-key"
import { convex } from "@convex-dev/better-auth/plugins"
import authConfig from "@convex/auth.config"
import { USER_ROLES } from "~/db/constants"

const plugins = [
  admin({
    adminRoles: [USER_ROLES.admin],
    defaultRole: USER_ROLES.user
  }),
  apiKey(),
  convex({ authConfig }),
]

export default plugins
```

> **Note on `apiKey()` config**: In Better Auth 1.5, `apiKey()` optionally accepts an array of configs for multi-tenant key types. For now we're passing no config (single default key type with `configId: "default"`). If you need organization-scoped keys later, this is where that config goes.

> **`convex({ authConfig })` purpose**: This plugin adds the `/.well-known/openid-configuration` and token endpoint routes that Convex's `useAuthFromServer` / `ctx.auth` helpers rely on. Without it, Convex function-level auth won't work even if session cookies are set correctly.

---

## Step 4: Add `apiKey` Table to Schema

The `apiKey` plugin was active in 1.4 without an explicit schema entry. In 1.5 the table definition is required. The key schema change from 1.4→1.5 is `userId` → `referenceId` and the addition of `configId`.

- [ ] Open `tmp/my-app/src/db/constants/index.ts` — add `TABLE_SLUG_API_KEYS`
- [ ] Open `tmp/my-app/convex/schema.ts` — add the `apiKey` table
- [ ] Run `pnpm typecheck` in `tmp/my-app/` and resolve any errors

**File: `tmp/my-app/src/db/constants/index.ts`** — add one line:

```ts
export * from "./auth"

// Better Auth
export const TABLE_SLUG_USERS = "user" as const;
export const TABLE_SLUG_ACCOUNTS = "account" as const;
export const TABLE_SLUG_SESSIONS = "session" as const;
export const TABLE_SLUG_VERIFICATIONS = "verification" as const;
export const TABLE_SLUG_JWKS = "jwks" as const;
export const TABLE_SLUG_API_KEYS = "apikey" as const;
```

> **Table name is `"apikey"`** (all lowercase, no separator). This is the default model name Better Auth uses internally for the API key table. Verify this matches `getAuthTables(options)` output after install — run `console.log(Object.keys(getAuthTables(auth.$options)))` in a test action if uncertain.

**File: `tmp/my-app/convex/schema.ts`** — add `apiKey` table (full schema with new table):

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values"

import {
  TABLE_SLUG_ACCOUNTS,
  TABLE_SLUG_API_KEYS,
  TABLE_SLUG_JWKS,
  TABLE_SLUG_SESSIONS,
  TABLE_SLUG_USERS,
  TABLE_SLUG_VERIFICATIONS,
} from "~/db/constants";

export default defineSchema({
  [TABLE_SLUG_USERS]: defineTable({
    displayUsername: v.optional(v.union(v.null(), v.string())),
    name: v.string(),
    username: v.optional(v.union(v.null(), v.string())),
    createdAt: v.number(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.union(v.null(), v.boolean())),
    phoneNumber: v.optional(v.union(v.null(), v.string())),
    phoneNumberVerified: v.optional(v.union(v.null(), v.boolean())),
    twoFactorEnabled: v.optional(v.union(v.null(), v.boolean())),
    updatedAt: v.number(),
    userId: v.optional(v.union(v.null(), v.string())),
    banExpires: v.optional(v.number()),
    banned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    role: v.array(v.string()),
  })
    .index("by_email", ["email"]),

  [TABLE_SLUG_ACCOUNTS]: defineTable({
    idToken: v.optional(v.string()),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    accountId: v.string(),
    createdAt: v.number(),
    password: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    updatedAt: v.number(),
    userId: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_accountId", ["accountId"]),

  [TABLE_SLUG_SESSIONS]: defineTable({
    createdAt: v.number(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    token: v.string(),
    updatedAt: v.number(),
    userAgent: v.optional(v.string()),
    userId: v.id(TABLE_SLUG_USERS),
    impersonatedBy: v.optional(v.id(TABLE_SLUG_USERS)),
  })
    .index("by_token", ["token"]),

  [TABLE_SLUG_VERIFICATIONS]: defineTable({
    identifier: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    updatedAt: v.number(),
    value: v.string(),
  })
    .index("by_identifier", ["identifier"])
    .index("by_expiresAt", ["expiresAt"]),

  [TABLE_SLUG_JWKS]: defineTable({
    createdAt: v.number(),
    privateKey: v.optional(v.string()),
    publicKey: v.string(),
  }),

  // Better Auth 1.5 — apiKey plugin (@better-auth/api-key)
  // NOTE: Verify field names against your installed @better-auth/api-key version.
  // Run: getAuthTables(auth.$options) and inspect the "apikey" entry for exact fields.
  [TABLE_SLUG_API_KEYS]: defineTable({
    name: v.optional(v.string()),
    start: v.optional(v.string()),
    prefix: v.optional(v.string()),
    key: v.string(),
    referenceId: v.string(),       // replaces userId from 1.4
    configId: v.string(),          // new in 1.5, default "default"
    refModel: v.optional(v.string()),
    enabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
    lastRefillAt: v.optional(v.number()),
    lastRequest: v.optional(v.number()),
    rateLimitTimeWindow: v.optional(v.number()),
    rateLimitMax: v.optional(v.number()),
    requestCount: v.optional(v.number()),
    remaining: v.optional(v.number()),
    metadata: v.optional(v.string()),
    permissions: v.optional(v.string()),
  })
    .index("by_referenceId", ["referenceId"])
    .index("by_key", ["key"]),
})
```

> **Schema verification step**: After installing and before deploying, run this one-time check to confirm the field names match what `@better-auth/api-key` actually expects:
>
> ```ts
> // Temporary: add to any convex action or run in a test
> import { getAuthTables } from "better-auth/db"
> import { createAuth } from "./auth"
> // const auth = createAuth(ctx)
> // console.log(JSON.stringify(getAuthTables(auth.$options)["apikey"], null, 2))
> ```
>
> If field names differ (e.g., `userId` still exists rather than `referenceId`), update the schema to match. The spec reflects the 1.5 spec from the release notes, but the installed package version is authoritative.

> **Index note**: `by_referenceId` is needed for `findMany` queries when listing a user's API keys. `by_key` is needed for `findOne` queries when validating a key. Both must be declared for the adapter to find the correct index at runtime (the adapter's `findIndex` function matches where-clause fields against declared indexes).

---

## Step 5: Typecheck and Verify `tmp/` Works

- [ ] Run `pnpm typecheck` from `tmp/my-app/` — fix any type errors before proceeding
- [ ] Run `npx convex dev` from `tmp/my-app/` — watch for schema push errors or function errors
- [ ] In the browser, navigate to the app and attempt: sign up, sign in, sign out
- [ ] Verify the Convex dashboard shows `user`, `account`, `session`, `apikey` tables populated correctly after sign-up
- [ ] Verify no `TABLE_SLUG_API_KEYS not found` errors in Convex logs
- [ ] Confirm `role` field on user documents is stored as an array (e.g., `["user"]`) — validates `supportsArrays: true` is working

**Common issues to watch for:**

| Symptom | Likely cause |
|---|---|
| `apikey table not found` error | Table name mismatch — check `getAuthTables` output |
| `referenceId is not a valid field` | Your `@better-auth/api-key` version still uses `userId` — revert that field |
| `role` stored as `'["user"]'` string | `supportsArrays: true` not applied, check adapter config |
| `convex() plugin not found` import error | `@convex-dev/better-auth` version doesn't export `plugins` — check 0.11 release notes |
| Type errors on `apiKey` import | Package not installed or import path wrong |

---

## Step 6: Port Changes to Template

Only proceed here after Step 5 passes completely.

- [ ] Open `packages/cli/templates/tanstack-start/package.json` — apply same version bumps as Step 1
- [ ] Open `packages/cli/templates/tanstack-start/convex/auth/adapter/index.ts` — apply same adapter config changes as Step 2
- [ ] Open `packages/cli/templates/tanstack-start/convex/auth/plugins/index.ts` — this file already has `convex()` and `authConfig` — only change is the `apiKey` import (remove from `better-auth/plugins`, add from `@better-auth/api-key`)
- [ ] Open `packages/cli/templates/tanstack-start/src/db/constants/index.ts` — add `TABLE_SLUG_API_KEYS`
- [ ] Open `packages/cli/templates/tanstack-start/convex/schema.ts` — add `apiKey` table (same as Step 4)
- [ ] Run `pnpm typecheck` from the template directory (if supported) or verify via a fresh `create-z3-app` install
- [ ] Create a fresh project from the CLI in a new temp directory and verify it boots, deploys, and auth works

**File: `packages/cli/templates/tanstack-start/convex/auth/plugins/index.ts`** — only the apiKey import changes; `convex()` is already present:

```ts
import { admin } from "better-auth/plugins"
import { apiKey } from "@better-auth/api-key"
import { convex } from "@convex-dev/better-auth/plugins"
import authConfig from "@convex/auth.config"
import { USER_ROLES } from "~/db/constants"

const plugins = [
  admin({
    adminRoles: [USER_ROLES.admin],
    defaultRole: USER_ROLES.user
  }),
  apiKey(),
  convex({ authConfig }),
]

export default plugins
```

> For all other template files, the changes are identical to their `tmp/my-app` counterparts. Use the Step 2–4 code blocks directly.

---

## Success Criteria

- [ ] `pnpm install` in `tmp/my-app/` succeeds with no peer dependency conflicts on `better-auth`
- [ ] `pnpm typecheck` in `tmp/my-app/` passes with zero errors
- [ ] `npx convex dev` pushes schema successfully — all 6 tables visible in Convex dashboard (`user`, `account`, `session`, `verification`, `jwks`, `apikey`)
- [ ] Sign up creates a user document with `role: ["user"]` (array, not string)
- [ ] Sign in + sign out work without errors
- [ ] Template files mirror all changes made to `tmp/my-app/`
- [ ] A fresh project generated from the CLI boots, deploys to Convex, and auth flows work
