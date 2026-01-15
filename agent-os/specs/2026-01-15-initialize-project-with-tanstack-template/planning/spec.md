# Specification: Initialize Project with TanStack Template

## Goal
Initialize the create-z3-app CLI project with a monorepo structure and copy the existing TanStack Start template from uifoundry-v2 to serve as the base scaffolding template for the CLI.

## User Stories
- As a developer, I want the project initialized with a proper monorepo structure so that I can build the CLI tool in an organized, scalable way
- As a developer, I want the existing TanStack template copied into the CLI package so that it can be used as the base for project scaffolding
- As a developer, I want all CLI dependencies installed so that I can start building the interactive prompts and installer logic
- As a developer, I want build artifacts and local files excluded from the template so that generated projects start clean

## Core Requirements
- Create monorepo structure with pnpm workspaces
- Initialize `packages/cli/` directory with proper package.json and TypeScript configuration
- Copy TanStack Start template from `/Users/zaye/Documents/Projects/uifoundry-v2.git/tmp/` to `packages/cli/templates/tanstack-start/`
- Exclude build artifacts, local files, and dependencies from template (node_modules, .env.local, .eslintcache, pnpm-lock.yaml, .git)
- Install all CLI dependencies from tech-stack.md
- Create workspace root package.json with pnpm workspace configuration

## Visual Design
No visual assets provided for this specification.

## Reusable Components
### Existing Code to Leverage
This is the initial project setup - no existing codebase to reuse. Starting fresh with monorepo structure based on PLAN.md architecture.

### New Components Required
- Root workspace configuration (pnpm-workspace.yaml, root package.json)
- CLI package structure (packages/cli/package.json, tsconfig.json)
- Template directory structure (packages/cli/templates/tanstack-start/)
- All files must be created as this is project initialization

## Technical Approach

### Directory Structure
Create the following monorepo structure:
```
create-z3-app/
├── packages/
│   └── cli/
│       ├── templates/
│       │   └── tanstack-start/
│       │       ├── src/
│       │       ├── convex/
│       │       ├── public/
│       │       ├── .env.example
│       │       ├── components.json
│       │       ├── eslint.config.js
│       │       ├── package.json
│       │       ├── prettier.config.js
│       │       ├── README.md
│       │       ├── tsconfig.json
│       │       └── vite.config.ts
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── pnpm-workspace.yaml
└── package.json
```

### Workspace Configuration
Root `pnpm-workspace.yaml`:
```yaml
packages:
  - packages/*
```

Root `package.json`:
- Set name to "create-z3-app"
- Configure as private workspace root
- Set up pnpm workspace configuration
- No dependencies at root level initially

### CLI Package Configuration
`packages/cli/package.json`:
- Set name to "create-z3-app" (this will be the published package)
- Add CLI dependencies from tech-stack.md:
  - commander (^12.0.0)
  - @inquirer/prompts (^7.2.0)
  - fs-extra (^11.2.0)
  - chalk (^5.3.0)
  - ora (^8.1.0)
  - execa (^9.5.2)
  - sort-package-json (^2.10.0)
  - validate-npm-package-name
- Add dev dependencies:
  - typescript (^5.x)
  - tsup
  - @types/node
  - @types/fs-extra
- Configure bin entry point for CLI execution

### Template Copy Strategy
Copy files from source template at `/Users/zaye/Documents/Projects/uifoundry-v2.git/tmp/` to `packages/cli/templates/tanstack-start/`:

**Include:**
- All source code directories: src/, convex/, public/
- Configuration files: .env.example, .gitignore, .prettierignore, components.json, eslint.config.js, prettier.config.js, tsconfig.json, vite.config.ts
- Documentation: README.md
- Package manifest: package.json

**Exclude (must not be copied):**
- node_modules/ directory
- .env.local (contains secrets)
- .eslintcache (build artifact)
- pnpm-lock.yaml (lock file not needed in template)
- .git (version control)
- .cta.json (metadata file)

### TypeScript Configuration
`packages/cli/tsconfig.json`:
- Enable strict mode
- Target ES2022 or later
- Module resolution: NodeNext
- Include src/ directory
- Generate declaration files for future library usage

### File Operation Details
Use fs-extra or native fs methods to:
1. Create directory structure recursively
2. Copy files and directories from source to destination
3. Verify exclusions are honored
4. Preserve file permissions and structure

## Out of Scope
- Template placeholder conversion ({{PROJECT_NAME}}, {{OAUTH_PROVIDERS}}, etc.) - separate spec
- Next.js template setup - separate spec
- CLI command implementation - separate spec
- Interactive prompt design - separate spec
- GitHub Actions CI/CD workflows - separate spec
- CLI source code (src/ directory implementation) - will be empty/minimal in this spec
- Changesets configuration - can be added later

## Success Criteria
1. Monorepo structure exists with packages/cli/ directory
2. Root workspace has pnpm-workspace.yaml and package.json configured
3. CLI package has package.json with all required dependencies from tech-stack.md
4. CLI package has tsconfig.json with proper TypeScript configuration
5. TanStack Start template is copied to packages/cli/templates/tanstack-start/
6. Template includes all required files: src/, convex/, public/, config files, README.md, package.json
7. Template excludes all build artifacts: node_modules/, .env.local, .eslintcache, pnpm-lock.yaml, .git, .cta.json
8. Directory structure matches PLAN.md architecture
9. Running `pnpm install` at root successfully installs CLI dependencies
10. Project is ready for next phase: CLI command implementation
