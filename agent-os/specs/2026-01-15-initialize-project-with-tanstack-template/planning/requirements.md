# Requirements - Initialize Project with TanStack Template

## Overview
Initialize the Z3 Stack CLI project with a monorepo structure and copy the existing TanStack template to serve as the base template for CLI scaffolding.

## Key Decisions

### Project Structure
- **Approach:** Monorepo with `packages/cli` directory
- **Rationale:** Follows PLAN.md architecture, allows for future packages (docs, examples, etc.)
- **Structure:**
  ```
  create-z3-app/
  ├── packages/
  │   └── cli/
  │       ├── templates/
  │       │   └── tanstack-start/
  │       ├── src/
  │       └── package.json
  └── package.json (workspace root)
  ```

### Template Location
- **Destination:** `packages/cli/templates/tanstack-start/`
- **Source:** `/Users/zaye/Documents/Projects/uifoundry-v2.git/tmp/`
- **Rationale:** Standard CLI template location, makes it clear these are templates to be scaffolded

### File Handling
- **Include:**
  - Source code (`src/`, `convex/`, `public/`)
  - Configuration files (`.env.example`, `tsconfig.json`, `vite.config.ts`, etc.)
  - Documentation files (`README.md`)

- **Exclude:**
  - `node_modules/`
  - `.env.local`
  - `.eslintcache`
  - `pnpm-lock.yaml`
  - Other build artifacts and local files

### Templating Strategy
- **Current Scope:** Keep template files as-is
- **Future Work:** Placeholder conversion ({{PROJECT_NAME}}, {{OAUTH_PROVIDERS}}, etc.) will be handled in a separate spec
- **Rationale:** Separate concerns - this spec focuses on project initialization and file organization

### CLI Package Dependencies
- **Approach:** Include all dependencies from tech-stack.md
- **Core Dependencies:**
  - `commander` - CLI framework
  - `@inquirer/prompts` - Interactive prompts
  - `chalk` - Terminal styling
  - `ora` - Loading spinners
  - `execa` - Process execution
  - `fs-extra` - File operations
  - `validate-npm-package-name` - Package name validation

### Code Reuse
- No existing patterns to reference
- Start fresh with best practices
- Follow monorepo conventions

### Visual Assets
- No visual assets provided
- No terminal mockups or diagrams

## Out of Scope
- Template placeholder conversion (separate spec)
- Next.js template setup (separate spec)
- GitHub Actions workflows (separate spec)
- CLI command implementation (separate spec)
- Interactive prompt design (separate spec)

## Success Criteria
1. Monorepo structure created with `packages/cli/` directory
2. TanStack template files copied to `packages/cli/templates/tanstack-start/`
3. Build artifacts and local files excluded from template
4. CLI package.json initialized with all dependencies from tech-stack.md
5. Workspace root package.json configured for pnpm workspaces
6. Project ready for CLI command implementation phase
