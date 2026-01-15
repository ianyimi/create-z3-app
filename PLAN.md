# Zaye Stack - Implementation Plan & Documentation

## Project Overview

**Zaye Stack** is a modern, opinionated full-stack template CLI that supports both **TanStack Start** and **Next.js** frameworks. It provides a batteries-included development experience with Better Auth, Convex database, shadcn/ui, and Base UI.

### Core Features

- **Dual Framework Support**: Choose between TanStack Start or Next.js
- **Better Auth Integration**: Email/password + flexible OAuth provider selection
- **Convex Backend**: Real-time database and serverless backend
- **UI Components**: shadcn/ui + Base UI for accessible, customizable components
- **Type-Safe**: Full TypeScript support throughout
- **Monorepo Structure**: Organized with pnpm workspaces

---

## Project Structure

```
/
├── packages/
│   ├── cli/                                    # Published to npm as "create-zaye-stack"
│   │   ├── template/
│   │   │   ├── base/                          # Shared base scaffold
│   │   │   │   ├── package.json              # Base dependencies
│   │   │   │   ├── tsconfig.json
│   │   │   │   ├── .gitignore
│   │   │   │   └── public/
│   │   │   │
│   │   │   └── extras/                        # Framework-specific templates
│   │   │       ├── tanstack/
│   │   │       │   ├── convex/
│   │   │       │   │   └── auth/
│   │   │       │   │       └── index.base.ts  # Template with {{PLACEHOLDERS}}
│   │   │       │   ├── src/
│   │   │       │   │   ├── lib/
│   │   │       │   │   │   └── auth-client.base.ts
│   │   │       │   │   └── routes/
│   │   │       │   ├── vite.config.ts
│   │   │       │   └── components.json
│   │   │       │
│   │   │       └── nextjs/
│   │   │           ├── lib/
│   │   │           │   ├── auth.base.ts
│   │   │           │   └── auth-client.base.ts
│   │   │           ├── app/
│   │   │           ├── next.config.js
│   │   │           └── components.json
│   │   │
│   │   ├── src/
│   │   │   ├── index.ts                       # Main entry point with Commander
│   │   │   │
│   │   │   ├── cli/
│   │   │   │   └── index.ts                   # Interactive prompts with @inquirer/prompts
│   │   │   │
│   │   │   ├── installers/
│   │   │   │   ├── index.ts                   # Installer types & exports
│   │   │   │   ├── base.ts                    # FrameworkInstaller abstract class
│   │   │   │   ├── tanstack.ts                # TanstackInstaller implementation
│   │   │   │   ├── nextjs.ts                  # NextjsInstaller implementation
│   │   │   │   └── versions.ts                # Centralized dependency versions
│   │   │   │
│   │   │   ├── helpers/
│   │   │   │   ├── createProject.ts           # Main orchestrator
│   │   │   │   ├── fileOperations.ts          # File utilities
│   │   │   │   ├── git.ts                     # Git operations
│   │   │   │   └── github.ts                  # GitHub repo creation
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── providers.ts               # OAuth provider configurations
│   │   │       ├── logger.ts                  # Chalk + Ora logging utilities
│   │   │       └── validation.ts              # Input validation
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── www/                                    # (Future) Documentation website
│
├── .changeset/                                 # Changesets for versioning
│   └── config.json
│
├── .github/
│   └── workflows/
│       ├── release.yml                         # Automated releases
│       └── ci.yml                              # Tests & builds
│
├── pnpm-workspace.yaml                         # pnpm workspace config
├── turbo.json                                  # Turborepo config (optional)
├── package.json                                # Root package
└── README.md
```

---

## Tech Stack

### CLI Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `commander` | ^12.0.0 | CLI framework for commands and options |
| `@inquirer/prompts` | ^7.2.0 | Interactive CLI prompts |
| `fs-extra` | ^11.2.0 | Enhanced file system operations |
| `chalk` | ^5.3.0 | Terminal colors and styling |
| `ora` | ^8.1.0 | Loading spinners |
| `execa` | ^9.5.2 | Process execution (npm/git commands) |
| `sort-package-json` | ^2.10.0 | Normalize package.json |

### Template Stack

| Package | Purpose |
|---------|---------|
| **TanStack Start** | Full-stack React framework with type-safe routing |
| **Next.js** | React framework for production |
| **Better Auth** | Modern authentication library |
| **Convex** | Real-time database and serverless backend |
| **shadcn/ui** | Beautiful component system built on Radix UI |
| **Base UI** | Unstyled, accessible component primitives |
| **Tailwind CSS** | Utility-first CSS framework |
| **TypeScript** | Type safety throughout |

---

## Implementation Plan

### Phase 1: Project Setup (15-20 mins)

**Goal**: Initialize monorepo with basic CLI structure

#### Tasks:
1. Initialize monorepo with `pnpm-workspace.yaml`
2. Create `packages/cli` directory structure
3. Setup CLI `package.json` with dependencies:
   - commander, @inquirer/prompts, fs-extra, chalk, ora, execa
4. Create TypeScript configuration
5. Setup Changesets for versioning
6. Copy existing TanStack template to `packages/cli/template/extras/tanstack/`
7. Create basic entry point (`src/index.ts`) with Commander setup

**Deliverables**:
- Working monorepo structure
- CLI package skeleton
- Basic `create-zaye-stack` command that runs

---

### Phase 2: Framework Installer Architecture (30 mins)

**Goal**: Build the core installer system with abstract base class

#### Tasks:
1. **Create `FrameworkInstaller` base class** (`src/installers/base.ts`):
   - Abstract methods: `installProvider()`, `getAuthConfigPath()`, `getAuthClientPath()`, `setupAuthClient()`
   - Shared methods: `addEnvVar()`, `addEnvVars()`, `addEnvSection()`, `replacePlaceholder()`, `replacePlaceholders()`, `addDependency()`, `addDependencies()`, `copyTemplateFile()`, `getTemplateContent()`, `generateAuthSecret()`
   - Core setup: `setupBetterAuth()`, `setupConvex()`, `setupShadcn()`

2. **Create `TanstackInstaller`** (`src/installers/tanstack.ts`):
   - Implement abstract methods for TanStack-specific file paths
   - Override `installProvider()` to update TanStack auth files

3. **Create `NextjsInstaller`** (`src/installers/nextjs.ts`):
   - Implement abstract methods for Next.js-specific file paths
   - Override `installProvider()` to update Next.js auth files

4. **Create OAuth provider definitions** (`src/utils/providers.ts`):
   - Define `OAuthProvider` interface
   - Create `OAUTH_PROVIDERS` registry with Google, GitHub, Discord, Twitter

**Deliverables**:
- Working `FrameworkInstaller` base class
- TanStack and Next.js installers
- OAuth provider registry

---

### Phase 3: CLI Prompts & User Flow (30 mins)

**Goal**: Interactive prompts for project configuration

#### Tasks:
1. **Create CLI prompt flow** (`src/cli/index.ts`):
   - Project name (with validation)
   - Framework selection (TanStack Start / Next.js)
   - OAuth providers (multi-select: Google, GitHub, Discord, Twitter, None)
   - Initialize Git? (yes/no)
   - Create GitHub repo? (yes/no - only if git initialized)
   - Install dependencies? (yes/no)

2. **Add input validation** (`src/utils/validation.ts`):
   - Project name format (no spaces, valid npm package name)
   - Directory doesn't already exist
   - Git installed (if selected)
   - GitHub CLI installed (if repo creation selected)

3. **Create CLI interface** (`src/index.ts`):
   - Setup Commander with version, description, help
   - Parse command-line arguments
   - Run interactive prompts
   - Handle fallback to flags for CI environments

**Deliverables**:
- Complete interactive prompt flow
- Input validation
- CLI help text and documentation

---

### Phase 4: Template Files with Placeholders (20 mins)

**Goal**: Create template files with `{{PLACEHOLDER}}` comments for dynamic injection

#### Tasks:
1. **Create TanStack templates**:
   - `template/extras/tanstack/convex/auth/index.base.ts` with `// {{OAUTH_PROVIDERS}}` placeholder
   - `template/extras/tanstack/src/lib/auth-client.base.ts` with placeholders
   - `.env.example` base file

2. **Create Next.js templates**:
   - `template/extras/nextjs/lib/auth.base.ts` with `// {{OAUTH_PROVIDERS}}` placeholder
   - `template/extras/nextjs/lib/auth-client.base.ts` with placeholders
   - `.env.example` base file

3. **Document placeholder format**:
   - Convention: `// {{PLACEHOLDER_NAME}}` for single replacements
   - Placeholders: `OAUTH_PROVIDERS`, `AUTH_CLIENT_IMPORT`, `SOCIAL_PROVIDERS`

**Deliverables**:
- Template files with placeholders
- Both TanStack and Next.js variants

---

### Phase 5: Project Creation Orchestration (30 mins)

**Goal**: Wire everything together to create a working project

#### Tasks:
1. **Create project scaffolding** (`src/helpers/createProject.ts`):
   - Copy base template files
   - Initialize framework-specific installer (TanStack or Next.js)
   - Call `installer.setupBetterAuth()`
   - Call `installer.setupConvex()`
   - Call `installer.installProviders(selectedProviders)` in loop
   - Call `installer.setupShadcn()`
   - Update `package.json` with project name

2. **Add progress indicators**:
   - Use `ora` spinners for each major step
   - Use `chalk` for success/error messages
   - Show what's happening at each stage

3. **Handle file operations** (`src/helpers/fileOperations.ts`):
   - Directory creation
   - File copying
   - Template processing
   - Error handling

4. **Add dependency installation** (`src/helpers/createProject.ts`):
   - Run `pnpm install` (or user's preferred package manager)
   - Handle installation errors gracefully

**Deliverables**:
- Complete project creation flow
- Beautiful terminal output with spinners
- Error handling

---

### Phase 6: Git & GitHub Integration (20 mins)

**Goal**: Initialize Git repo and optionally create GitHub repo

#### Tasks:
1. **Git initialization** (`src/helpers/git.ts`):
   - Check if Git is installed
   - Run `git init`
   - Create initial commit with all files
   - Respect user's Git config for default branch

2. **GitHub repo creation** (`src/helpers/github.ts`):
   - Check if GitHub CLI (`gh`) is installed
   - Create private repo using `gh repo create`
   - Push initial commit to remote
   - Handle authentication errors gracefully
   - Provide fallback instructions if `gh` not available

3. **Add to main flow**:
   - Initialize git if user selected
   - Create GitHub repo if user selected (only if git initialized)

**Deliverables**:
- Git initialization
- GitHub repo creation (optional)
- Clear error messages for missing tools

---

### Phase 7: Success Message & Next Steps (10 mins)

**Goal**: Display helpful next steps after project creation

#### Tasks:
1. **Create success output** (`src/helpers/createProject.ts`):
   - Display success message with project name
   - Show commands to run next:
     ```bash
     cd my-app
     npx convex dev    # Setup Convex (in one terminal)
     pnpm dev          # Start dev server (in another terminal)
     ```
   - Show Convex setup instructions:
     - Add `BETTER_AUTH_SECRET` to Convex Dashboard
     - Add `SITE_URL` to Convex Dashboard
   - Show OAuth setup instructions if providers selected:
     - Create OAuth apps for each provider
     - Add client IDs and secrets to `.env.local`
   - Display GitHub repo URL if created

2. **Add documentation links**:
   - Better Auth docs
   - Convex docs
   - Framework-specific docs (TanStack Start or Next.js)
   - OAuth provider setup guides

**Deliverables**:
- Comprehensive success message
- Clear next steps
- Documentation links

---

### Phase 8: Testing & Polish (15 mins)

**Goal**: Test both frameworks and fix any issues

#### Tasks:
1. **Test TanStack template creation**:
   - Create project with all OAuth providers
   - Create project with no OAuth providers
   - Verify all files are created correctly
   - Verify placeholders are replaced
   - Run `pnpm dev` and verify it works

2. **Test Next.js template creation**:
   - Same tests as TanStack
   - Verify Next.js-specific files are correct

3. **Test edge cases**:
   - Project name with scopes (`@org/my-app`)
   - Existing directory error handling
   - Git not installed
   - GitHub CLI not installed
   - Network errors during dependency installation

4. **Polish UX**:
   - Improve spinner messages
   - Add colors to important messages
   - Ensure error messages are helpful
   - Test in both interactive and CI mode

**Deliverables**:
- Tested CLI with both frameworks
- Bug fixes
- Polished UX

---

## Framework Installer Architecture

### Base Class: `FrameworkInstaller`

**Abstract Methods** (must be implemented by subclasses):
- `installProvider(provider: OAuthProvider): Promise<void>` - Install OAuth provider
- `getAuthConfigPath(): string` - Get auth config file path
- `getAuthClientPath(): string` - Get auth client file path
- `setupAuthClient(): Promise<void>` - Framework-specific auth client setup

**Shared Methods** (available to all subclasses):
- `addEnvVar(key, exampleValue, localValue)` - Add env var to both .env files
- `addEnvVars(vars[])` - Add multiple env vars at once
- `addEnvSection(sectionName, vars[])` - Add commented section with vars
- `replacePlaceholder(filePath, placeholder, content)` - Replace single placeholder
- `replacePlaceholders(filePath, replacements{})` - Replace multiple placeholders
- `addDependency(packageName, version, devDependency)` - Add npm package
- `addDependencies(deps[])` - Add multiple dependencies
- `copyTemplateFile(relativePath, destPath)` - Copy template file
- `getTemplateContent(relativePath)` - Get template file content
- `generateAuthSecret()` - Generate 32-byte hex secret
- `setupBetterAuth()` - Initialize Better Auth configuration
- `installProviders(providers[])` - Install all selected OAuth providers
- `setupConvex()` - Setup Convex environment variables
- `setupShadcn()` - Setup shadcn/ui configuration

### Usage Pattern

```typescript
// 1. Create installer instance based on selected framework
const installer = framework === 'tanstack'
  ? new TanstackInstaller(projectDir, projectName)
  : new NextjsInstaller(projectDir, projectName)

// 2. Setup Better Auth
await installer.setupBetterAuth()

// 3. Setup Convex
await installer.setupConvex()

// 4. Install OAuth providers in a loop
for (const providerKey of selectedProviders) {
  const provider = OAUTH_PROVIDERS[providerKey]
  await installer.installProvider(provider)
}

// 5. Setup shadcn/ui
await installer.setupShadcn()
```

---

## Template Placeholder System

### Placeholder Format

All placeholders use the format: `// {{PLACEHOLDER_NAME}}`

### Common Placeholders

| Placeholder | Purpose | Example Replacement |
|-------------|---------|---------------------|
| `{{OAUTH_PROVIDERS}}` | OAuth provider configurations | `socialProviders: { google: {...}, github: {...} }` |
| `{{AUTH_CLIENT_IMPORT}}` | Framework-specific auth client import | `import { betterAuthClient } from "@daveyplate/better-auth-tanstack"` |
| `{{SOCIAL_PROVIDERS}}` | Social provider UI configs | `[{ provider: 'google', label: 'Continue with Google' }]` |

### Example Template File

```typescript
// template/extras/tanstack/convex/auth/index.base.ts

import type { GenericActionCtx } from "convex/server"
import { betterAuth } from "better-auth"
import { convexAdapter } from "./adapter"
import schema from "../schema"

export const createAuth = (ctx: GenericActionCtx<DataModel>) => {
  return betterAuth({
    // {{OAUTH_PROVIDERS}}
    baseURL: process.env.SITE_URL,
    database: convexAdapter(ctx, schema),
    emailAndPassword: {
      enabled: true
    },
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.SITE_URL!]
  })
}
```

### How Replacement Works

```typescript
// First provider installation
"// {{OAUTH_PROVIDERS}}"
  →
"socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!
  }
},"

// Additional providers append to existing socialProviders object
```

---

## OAuth Provider Configuration

### Provider Interface

```typescript
interface OAuthProvider {
  id: string           // 'google', 'github', 'discord', 'twitter'
  name: string         // 'Google', 'GitHub', 'Discord', 'Twitter'
  envPrefix: string    // 'GOOGLE', 'GITHUB', 'DISCORD', 'TWITTER'
}
```

### Supported Providers

| Provider | ID | Env Prefix | Env Variables |
|----------|----|-----------:|---------------|
| Google | `google` | `GOOGLE` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| GitHub | `github` | `GITHUB` | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| Discord | `discord` | `DISCORD` | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` |
| Twitter | `twitter` | `TWITTER` | `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` |

### Adding New Providers

To add a new OAuth provider:

1. Add to `OAUTH_PROVIDERS` registry in `src/utils/providers.ts`
2. Update CLI prompts in `src/cli/index.ts`
3. Template placeholders automatically handle new providers
4. No changes needed to installer classes

---

## Release & Versioning Strategy

### Changesets Workflow

1. **Development**:
   - Make changes to CLI or templates
   - Run `pnpm changeset` to create a changeset file
   - Commit changeset with your changes

2. **Release**:
   - Changesets GitHub Action creates a "Version Packages" PR
   - PR updates `CHANGELOG.md` and version in `package.json`
   - Merge PR to trigger automatic npm publish

3. **Publishing**:
   - Automatic publish to npm via GitHub Actions
   - Creates GitHub release with changelog
   - Supports `beta` and `latest` tags

### Version Format

Follow Semantic Versioning (semver):
- **Major** (1.0.0): Breaking changes (new framework support, architecture changes)
- **Minor** (0.1.0): New features (new OAuth providers, new CLI options)
- **Patch** (0.0.1): Bug fixes (template fixes, dependency updates)

---

## Future Features (Post-MVP)

### Planned Enhancements

1. **Color System Integration**:
   - Add CLI prompt for color selection
   - Integrate tweakcn.com color palettes
   - Auto-generate Tailwind color config

2. **Database Provider Options**:
   - Support other databases alongside Convex
   - Drizzle ORM integration
   - Prisma as alternative

3. **Deployment Presets**:
   - Vercel configuration
   - Netlify configuration
   - Cloudflare Pages setup

4. **Component Library Options**:
   - Additional UI library choices
   - Custom component starter packs

5. **Testing Setup**:
   - Vitest configuration
   - Playwright e2e tests
   - Testing utilities

6. **CI/CD Templates**:
   - GitHub Actions workflows
   - GitLab CI templates
   - Pre-commit hooks

7. **Documentation Generation**:
   - Auto-generate project README
   - Setup guides based on selected features
   - Architecture documentation

---

## CLI Usage Examples

### Basic Usage

```bash
# Interactive mode (recommended)
npm create zaye-stack

# With project name
npm create zaye-stack my-app

# Using pnpm
pnpm create zaye-stack

# Using yarn
yarn create zaye-stack
```

### CLI Flags (for CI/non-interactive)

```bash
# All options via flags
npm create zaye-stack my-app \
  --framework tanstack \
  --oauth google,github \
  --git \
  --no-github-repo \
  --install

# Minimal setup
npm create zaye-stack my-app \
  --framework nextjs \
  --no-git \
  --no-install
```

### Help Command

```bash
npm create zaye-stack --help

# Output:
# create-zaye-stack - Create a new full-stack app
#
# Options:
#   -f, --framework <framework>     Framework to use (tanstack|nextjs)
#   -o, --oauth <providers>         OAuth providers (google,github,discord,twitter)
#   -g, --git                       Initialize git repository
#   -r, --github-repo               Create GitHub repository
#   --no-install                    Skip dependency installation
#   -h, --help                      Display help
#   -v, --version                   Display version
```

---

## Development Commands

### Root Workspace

```bash
# Install all dependencies
pnpm install

# Build CLI
pnpm --filter cli build

# Run CLI locally (without publishing)
pnpm --filter cli dev

# Create changeset
pnpm changeset

# Version packages (updates changelog)
pnpm changeset version

# Publish (done automatically via GitHub Actions)
pnpm publish -r
```

### CLI Package

```bash
cd packages/cli

# Build
pnpm build

# Watch mode for development
pnpm dev

# Test locally
pnpm test:local

# Link globally for local testing
npm link
create-zaye-stack test-project
```

---

## Key Technical Decisions

### Why String Replacement Over AST Manipulation?

**Decision**: Use string replacement with placeholders instead of AST tools (ts-morph, babel)

**Reasoning**:
- Simpler implementation and maintenance
- Faster execution (no parsing overhead)
- Easier to understand and debug
- Template files remain valid TypeScript (can be type-checked)
- Proven approach used by create-t3-app successfully
- AST manipulation adds complexity without significant benefit for this use case

### Why Monorepo Structure?

**Decision**: Use pnpm workspaces monorepo instead of single package

**Reasoning**:
- Easier to manage multiple templates (TanStack, Next.js)
- Can add documentation site later (`packages/www`)
- Shared code between packages (`packages/shared`)
- Better separation of concerns
- Follows create-t3-app proven pattern
- Easier to test templates in isolation

### Why Abstract Class Over Composition?

**Decision**: Use abstract base class (`FrameworkInstaller`) with inheritance

**Reasoning**:
- Enforces consistent interface across frameworks (abstract methods must be implemented)
- Shared functionality is inherited automatically
- Type-safe at compile time
- Clear "is-a" relationship (TanstackInstaller IS-A FrameworkInstaller)
- Easier to add new frameworks (just extend base class)
- Single source of truth for shared methods

### Why Commander + Inquirer?

**Decision**: Use Commander for CLI parsing and @inquirer/prompts for interactive prompts

**Reasoning**:
- Industry standard tools (used by create-t3-app, Vite, Next.js)
- Commander handles flags, help text, version display
- Inquirer provides beautiful interactive prompts
- Both support fallback to non-interactive mode for CI
- Great TypeScript support
- Active maintenance and large community

---

## Success Metrics

### MVP Success Criteria

- [ ] Can create TanStack Start project with all OAuth providers
- [ ] Can create Next.js project with all OAuth providers
- [ ] Can create project with no OAuth providers
- [ ] Better Auth is fully configured and working
- [ ] Convex is set up with correct env vars
- [ ] shadcn/ui is installed and configured
- [ ] Generated .env files are correct
- [ ] Git initialization works
- [ ] GitHub repo creation works (with gh CLI)
- [ ] Dependency installation works
- [ ] All placeholders are replaced correctly
- [ ] Projects can run `pnpm dev` successfully
- [ ] CLI has helpful error messages
- [ ] CLI has beautiful terminal output
- [ ] Published to npm as `create-zaye-stack`

---

## Documentation Resources

### For Users

- README.md in generated projects
- Next steps displayed after creation
- Links to Better Auth docs
- Links to Convex docs
- OAuth provider setup guides

### For Contributors

- This implementation plan (PLAN.md)
- Code comments in installer classes
- Template placeholder documentation
- Architecture decision records

---

## Timeline Estimate

### Realistic Timeline: 2-3 Hours

| Phase | Time | Cumulative |
|-------|------|------------|
| 1. Project Setup | 20 mins | 20 mins |
| 2. Framework Installer Architecture | 30 mins | 50 mins |
| 3. CLI Prompts & User Flow | 30 mins | 1h 20m |
| 4. Template Files with Placeholders | 20 mins | 1h 40m |
| 5. Project Creation Orchestration | 30 mins | 2h 10m |
| 6. Git & GitHub Integration | 20 mins | 2h 30m |
| 7. Success Message & Next Steps | 10 mins | 2h 40m |
| 8. Testing & Polish | 20 mins | 3h |

**Buffer for unexpected issues**: 30 mins
**Total**: ~3.5 hours for complete MVP

---

## Getting Started

Ready to build? Start with Phase 1:

```bash
# Initialize monorepo
cd /Users/zaye/Documents/Projects/zaye-stack.git/dev
pnpm init

# Create workspace config
echo "packages:\n  - packages/*" > pnpm-workspace.yaml

# Create CLI package
mkdir -p packages/cli/src
cd packages/cli
pnpm init

# Install CLI dependencies
pnpm add commander @inquirer/prompts fs-extra chalk ora execa sort-package-json
pnpm add -D typescript @types/node @types/fs-extra tsup

# Setup TypeScript
npx tsc --init

# Create entry point
touch src/index.ts

# Ready to code!
```

Follow the phases in order, and you'll have a working CLI in no time!
