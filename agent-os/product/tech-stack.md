# Tech Stack

## CLI Development

### Core CLI Tools
- **commander** (^12.0.0) - CLI framework for command parsing, options, and help text generation
- **@inquirer/prompts** (^7.2.0) - Interactive terminal prompts with validation and beautiful UX
- **fs-extra** (^11.2.0) - Enhanced file system operations with promises and additional utilities
- **chalk** (^5.3.0) - Terminal string styling with colors and text formatting
- **ora** (^8.1.0) - Elegant terminal spinners for async operations and progress indication
- **execa** (^9.5.2) - Process execution with better API than child_process for running npm/git commands
- **sort-package-json** (^2.10.0) - Normalize and sort package.json files for consistency

### CLI Build & Development
- **TypeScript** (^5.x) - Type-safe development with strict mode enabled
- **tsup** - Fast TypeScript bundler for CLI distribution
- **@types/node** - Node.js type definitions
- **@types/fs-extra** - Type definitions for fs-extra

## Generated Application Stack

### Frontend Frameworks (User Choice)

#### Option 1: TanStack Start
- **@tanstack/start** - Full-stack React framework with file-based routing
- **Vite** - Lightning-fast build tool and dev server
- **vinxi** - Vite-based full-stack framework infrastructure

#### Option 2: Next.js
- **next** - Production-proven React framework with App Router
- **React** (^18.x) - UI library
- **React DOM** (^18.x) - React renderer for web

### Authentication
- **better-auth** - Modern, lightweight authentication library with OAuth and session management
- **@daveyplate/better-auth-tanstack** - Better Auth client for TanStack Start (conditional)
- **better-auth/react** - Better Auth React hooks (for Next.js, conditional)

### Database & Backend
- **convex** - Real-time serverless database with TypeScript schema and built-in backend functions
- **Convex Auth Adapter** - Better Auth adapter for Convex database integration

### UI & Styling
- **shadcn/ui** - Beautiful, accessible component system built on Radix UI (installed via CLI)
- **Radix UI (Base UI)** - Unstyled, accessible component primitives (via shadcn)
- **Tailwind CSS** (^3.x) - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities for Tailwind
- **tailwind-merge** - Utility for merging Tailwind classes
- **clsx** - Conditional className utility
- **lucide-react** - Beautiful icon library

### TypeScript & Type Safety
- **TypeScript** (^5.x) - Full type safety from database to UI
- **@types/react** - React type definitions
- **@types/react-dom** - React DOM type definitions

### OAuth Providers (Conditional based on user selection)

#### Google OAuth
- Environment: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- Better Auth socialProviders.google configuration

#### GitHub OAuth
- Environment: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- Better Auth socialProviders.github configuration

#### Discord OAuth
- Environment: DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
- Better Auth socialProviders.discord configuration

#### Twitter OAuth
- Environment: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET
- Better Auth socialProviders.twitter configuration

## Development Tools & Infrastructure

### Package Management
- **pnpm** - Fast, disk space efficient package manager with workspace support
- **pnpm workspaces** - Monorepo structure for CLI package organization

### Version Control
- **Git** - Version control system (optional, user choice during setup)
- **GitHub CLI (gh)** - GitHub repository creation (optional, user choice during setup)

### Release & Publishing
- **Changesets** - Version management and changelog generation
- **GitHub Actions** - CI/CD for automated testing, building, and npm publishing

### Build Tools
- **tsup** - Fast TypeScript bundler for CLI distribution
- **Turborepo** - (Optional) Monorepo build system for faster CI

## Environment Variables

### Required for All Projects
- `BETTER_AUTH_SECRET` - 32-byte hex secret for session encryption (auto-generated)
- `CONVEX_DEPLOYMENT` - Convex deployment URL (from `npx convex dev`)
- `CONVEX_URL` - Convex API endpoint (from `npx convex dev`)
- `SITE_URL` - Application base URL (e.g., http://localhost:3000 for dev)

### OAuth Provider Variables (Conditional)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - If Google OAuth selected
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - If GitHub OAuth selected
- `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET` - If Discord OAuth selected
- `TWITTER_CLIENT_ID` & `TWITTER_CLIENT_SECRET` - If Twitter OAuth selected

## Architecture Patterns

### Template System
- **String replacement with placeholders** - Uses `// {{PLACEHOLDER_NAME}}` format for dynamic code injection
- **No AST manipulation** - Keeps templates as valid TypeScript for better DX and type checking
- **Framework-specific templates** - Separate template directories for TanStack Start and Next.js

### Installer Pattern
- **Abstract base class** - FrameworkInstaller with shared utility methods
- **Inheritance** - TanstackInstaller and NextjsInstaller extend base class
- **Template Method Pattern** - Base class defines workflow, subclasses implement specifics

### File Structure
- **Monorepo** - pnpm workspaces with packages/cli as main package
- **Template directories** - base/ for shared files, extras/ for framework-specific files
- **Centralized versions** - Single source of truth for all dependency versions

## Testing Strategy (Future)

### CLI Testing
- **Vitest** - Unit tests for installer classes and utilities
- **End-to-end tests** - Generate projects and verify structure
- **Snapshot tests** - Validate generated file contents

### Generated Project Testing
- **Vitest** - Unit and integration tests for application code
- **Playwright** - End-to-end browser testing
- **Testing Library** - React component testing

## Documentation

### User-Facing
- **README.md** - Generated in each project with setup instructions
- **Inline comments** - Template files include helpful comments
- **Success messages** - CLI displays next steps and documentation links

### Developer-Facing
- **PLAN.md** - Complete implementation plan and architecture decisions
- **Code comments** - Installer classes and utilities are well-documented
- **Type definitions** - Full TypeScript coverage for self-documenting code
