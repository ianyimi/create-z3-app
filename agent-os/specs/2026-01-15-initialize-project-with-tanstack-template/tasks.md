# Task Breakdown: Initialize Project with TanStack Template

## Overview
Total Tasks: 18
Estimated Task Groups: 4

**Note:** No `implementers.yml` file was found in this project. Task assignments below use generic role descriptions. When implementers are configured, update the "Assigned implementer" fields accordingly.

## Task List

### Infrastructure Layer

#### Task Group 1: Monorepo Foundation
**Assigned implementer:** infrastructure-engineer (or general-purpose agent)
**Dependencies:** None

- [x] 1.0 Complete monorepo foundation setup
  - [x] 1.1 Create root directory structure
    - Create `packages/` directory
    - Create `packages/cli/` directory
    - Create `packages/cli/src/` directory (empty, placeholder for future CLI code)
    - Create `packages/cli/templates/` directory
  - [x] 1.2 Create root `pnpm-workspace.yaml`
    - Content:
      ```yaml
      packages:
        - packages/*
      ```
  - [x] 1.3 Create root `package.json`
    - Set `name` to `"create-z3-app-monorepo"` (workspace root)
    - Set `private` to `true`
    - Set `packageManager` to `"pnpm@9.x"`
    - Add workspace scripts:
      - `"dev": "pnpm --filter create-z3-app dev"`
      - `"build": "pnpm --filter create-z3-app build"`
      - `"test": "pnpm --filter create-z3-app test"`
  - [x] 1.4 Verify monorepo structure
    - Confirm all directories exist
    - Confirm workspace files are valid YAML/JSON

**Acceptance Criteria:**
- Root `pnpm-workspace.yaml` exists and is valid
- Root `package.json` exists with private: true and workspace configuration
- Directory structure matches spec: `packages/cli/`, `packages/cli/src/`, `packages/cli/templates/`

---

#### Task Group 2: CLI Package Configuration
**Assigned implementer:** infrastructure-engineer (or general-purpose agent)
**Dependencies:** Task Group 1

- [x] 2.0 Complete CLI package configuration
  - [x] 2.1 Create `packages/cli/package.json`
    - Set `name` to `"create-z3-app"` (publishable package name)
    - Set `version` to `"0.0.1"`
    - Set `type` to `"module"` (ESM)
    - Set `bin` entry: `"create-z3-app": "./dist/index.js"`
    - Add production dependencies (from tech-stack.md):
      - `"commander": "^12.0.0"`
      - `"@inquirer/prompts": "^7.2.0"`
      - `"fs-extra": "^11.2.0"`
      - `"chalk": "^5.3.0"`
      - `"ora": "^8.1.0"`
      - `"execa": "^9.5.2"`
      - `"sort-package-json": "^2.10.0"`
      - `"validate-npm-package-name": "^5.0.0"`
    - Add dev dependencies:
      - `"typescript": "^5.7.0"`
      - `"tsup": "^8.0.0"`
      - `"@types/node": "^22.0.0"`
      - `"@types/fs-extra": "^11.0.0"`
      - `"@types/validate-npm-package-name": "^4.0.0"`
    - Add scripts:
      - `"build": "tsup src/index.ts --format esm --dts"`
      - `"dev": "tsup src/index.ts --format esm --watch"`
      - `"typecheck": "tsc --noEmit"`
  - [x] 2.2 Create `packages/cli/tsconfig.json`
    - Enable `strict` mode
    - Set `target` to `"ES2022"`
    - Set `module` to `"NodeNext"`
    - Set `moduleResolution` to `"NodeNext"`
    - Set `outDir` to `"./dist"`
    - Set `rootDir` to `"./src"`
    - Include `["src/**/*"]`
    - Exclude `["node_modules", "dist", "templates"]`
    - Enable `declaration` and `declarationMap`
    - Set `esModuleInterop` to `true`
    - Set `skipLibCheck` to `true`
  - [x] 2.3 Create minimal `packages/cli/src/index.ts` placeholder
    - Add placeholder entry point:
      ```typescript
      #!/usr/bin/env node
      // CLI implementation will be added in future specs
      console.log('create-z3-app CLI - Coming soon!');
      ```
  - [x] 2.4 Validate package.json structure
    - Ensure JSON is valid
    - Verify all dependencies have valid semver versions
    - Confirm bin entry points to correct path

**Acceptance Criteria:**
- `packages/cli/package.json` contains all dependencies from tech-stack.md
- `packages/cli/tsconfig.json` has strict mode enabled with NodeNext module resolution
- Placeholder `src/index.ts` exists with shebang line
- Package is configured for ESM (`"type": "module"`)

---

### Template Layer

#### Task Group 3: TanStack Template Copy
**Assigned implementer:** infrastructure-engineer (or general-purpose agent)
**Dependencies:** Task Group 2

- [x] 3.0 Complete TanStack template copy operation
  - [x] 3.1 Create template destination directory
    - Create `packages/cli/templates/tanstack-start/`
  - [x] 3.2 Copy source directories from `/Users/zaye/Documents/Projects/uifoundry-v2.git/tmp/`
    - Copy `src/` directory (full contents)
    - Copy `convex/` directory (full contents)
    - Copy `public/` directory (full contents)
  - [x] 3.3 Copy configuration files from source
    - Copy `.env.example`
    - Copy `.gitignore`
    - Copy `.prettierignore`
    - Copy `components.json`
    - Copy `eslint.config.js`
    - Copy `prettier.config.js`
    - Copy `tsconfig.json`
    - Copy `vite.config.ts`
  - [x] 3.4 Copy documentation and manifest files
    - Copy `README.md`
    - Copy `package.json`
  - [x] 3.5 Verify exclusions are honored
    - Confirm `node_modules/` was NOT copied
    - Confirm `.env.local` was NOT copied
    - Confirm `.eslintcache` was NOT copied
    - Confirm `pnpm-lock.yaml` was NOT copied
    - Confirm `.git` was NOT copied
    - Confirm `.cta.json` was NOT copied
  - [x] 3.6 Validate template completeness
    - Verify all expected files exist in destination
    - Verify directory structure is intact
    - Verify file contents are not corrupted (non-empty where expected)

**Acceptance Criteria:**
- Template directory exists at `packages/cli/templates/tanstack-start/`
- All source code directories copied: `src/`, `convex/`, `public/`
- All configuration files present: `.env.example`, `.gitignore`, `.prettierignore`, `components.json`, `eslint.config.js`, `prettier.config.js`, `tsconfig.json`, `vite.config.ts`
- Documentation files present: `README.md`, `package.json`
- Excluded files/directories NOT present: `node_modules/`, `.env.local`, `.eslintcache`, `pnpm-lock.yaml`, `.git`, `.cta.json`

---

### Validation Layer

#### Task Group 4: Installation and Final Validation
**Assigned implementer:** infrastructure-engineer (or general-purpose agent)
**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete installation and validation
  - [x] 4.1 Run `pnpm install` at workspace root
    - Execute from project root directory
    - Verify successful completion without errors
    - Verify `node_modules/` created at root and CLI package
  - [x] 4.2 Verify TypeScript compilation
    - Run `pnpm typecheck` in CLI package
    - Ensure no TypeScript errors
  - [x] 4.3 Verify build process works
    - Run `pnpm build` in CLI package
    - Verify `dist/` directory created
    - Verify `dist/index.js` exists
  - [x] 4.4 Validate final directory structure
    - Confirm structure matches PLAN.md architecture:
      ```
      create-z3-app/
      ├── packages/
      │   └── cli/
      │       ├── dist/           (after build)
      │       ├── node_modules/   (after install)
      │       ├── src/
      │       │   └── index.ts
      │       ├── templates/
      │       │   └── tanstack-start/
      │       │       ├── src/
      │       │       ├── convex/
      │       │       ├── public/
      │       │       └── [config files]
      │       ├── package.json
      │       └── tsconfig.json
      ├── node_modules/           (after install)
      ├── package.json
      └── pnpm-workspace.yaml
      ```
  - [x] 4.5 Document any issues or deviations
    - Note any files that could not be copied
    - Note any dependency conflicts
    - Confirm project is ready for CLI implementation phase

**Acceptance Criteria:**
- `pnpm install` completes successfully at workspace root
- TypeScript compilation passes without errors
- Build process produces `dist/index.js`
- All success criteria from spec are met:
  1. Monorepo structure exists with packages/cli/ directory
  2. Root workspace has pnpm-workspace.yaml and package.json configured
  3. CLI package has package.json with all required dependencies
  4. CLI package has tsconfig.json with proper TypeScript configuration
  5. TanStack Start template is copied to packages/cli/templates/tanstack-start/
  6. Template includes all required files
  7. Template excludes all build artifacts
  8. Directory structure matches PLAN.md architecture
  9. Running `pnpm install` successfully installs CLI dependencies
  10. Project is ready for next phase: CLI command implementation

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Monorepo Foundation** - Create workspace structure first
2. **Task Group 2: CLI Package Configuration** - Set up CLI package with dependencies
3. **Task Group 3: TanStack Template Copy** - Copy template files to destination
4. **Task Group 4: Installation and Final Validation** - Install dependencies and verify everything works

**Critical Path:** All task groups must be completed in order. Each group depends on the previous group being complete.

---

## Files to Create Summary

| File Path | Purpose |
|-----------|---------|
| `pnpm-workspace.yaml` | Workspace configuration |
| `package.json` (root) | Workspace root package manifest |
| `packages/cli/package.json` | CLI package manifest with dependencies |
| `packages/cli/tsconfig.json` | TypeScript configuration |
| `packages/cli/src/index.ts` | Placeholder CLI entry point |
| `packages/cli/templates/tanstack-start/*` | Template files (copied from source) |

## Files to Copy Summary

**Source:** `/Users/zaye/Documents/Projects/uifoundry-v2.git/tmp/`
**Destination:** `packages/cli/templates/tanstack-start/`

| Include | Exclude |
|---------|---------|
| `src/` | `node_modules/` |
| `convex/` | `.env.local` |
| `public/` | `.eslintcache` |
| `.env.example` | `pnpm-lock.yaml` |
| `.gitignore` | `.git` |
| `.prettierignore` | `.cta.json` |
| `components.json` | |
| `eslint.config.js` | |
| `prettier.config.js` | |
| `tsconfig.json` | |
| `vite.config.ts` | |
| `README.md` | |
| `package.json` | |

---

## Notes

- This is a project initialization spec - no existing codebase to reference
- Template placeholder conversion ({{PROJECT_NAME}}, etc.) is out of scope for this spec
- CLI command implementation is out of scope for this spec
- The CLI `src/` directory will contain only a minimal placeholder in this spec

---

## Implementation Complete

All task groups have been successfully completed. No issues or deviations encountered. The project is ready for the CLI implementation phase.

### Summary of Completed Work:
- Created complete monorepo structure with pnpm workspaces
- Configured CLI package with all required dependencies from tech-stack.md
- Copied TanStack Start template with all source files and configurations
- Successfully excluded all build artifacts and local files
- Verified TypeScript compilation and build process
- All acceptance criteria met
