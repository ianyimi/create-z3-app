# Specification: FrameworkInstaller Class System

## Goal

Create an extensible class-based architecture for framework-specific project scaffolding that orchestrates file copying, string replacement, OAuth provider configuration, theme application, and optional Git/GitHub setup through a single entry point method.

## User Stories

- As a CLI developer, I want to call a single `initProject()` method that handles the entire project setup workflow so that I don't need to manage the orchestration logic
- As a framework maintainer, I want to extend the base `FrameworkInstaller` class to add support for new frameworks without modifying existing code
- As a user, I want my selected OAuth providers, TweakCN themes, and project options to be automatically configured in all necessary files
- As a developer, I want the installer to handle both Next.js and TanStack Start frameworks with framework-specific file paths and configurations

## Core Requirements

- Base abstract class `FrameworkInstaller` with shared utilities and orchestration logic
- Framework-specific implementations: `NextJSInstaller` and `TanStackInstaller`
- Single orchestration method `initProject(options)` that coordinates all setup steps
- String replacement utilities using comment placeholder pattern (`// {{PLACEHOLDER}}`)
- OAuth provider configuration with environment variable management
- TweakCN theme application supporting both URL fetch and CSS paste
- Optional GitHub repository creation with public/private selection
- Optional dependency installation with runtime detection (pnpm/npm/yarn/bun)
- Type-safe interfaces for project options and OAuth providers

## Visual Design

No visual mockups provided. This is a backend class system with no UI components.

## Reusable Components

### Existing Code to Leverage

**File Operations** (`src/helpers/fileOperations.ts`):
- `createProjectDirectory(projectName, cwd)` - Creates target directory
- `getTargetDirectory(projectName, cwd)` - Resolves project path
- `copyTemplate(framework, targetPath)` - Copies template files
- These utilities handle directory creation, scoped packages, and template copying

**Validation Utilities** (`src/utils/validation.ts`):
- `validateProjectName(name)` - Validates npm package names
- `checkDirectoryExists(targetPath)` - Checks if directory exists
- `isDirectoryEmpty(dirPath)` - Verifies directory is empty
- `resolveProjectName(input, cwd)` - Resolves "." notation

**Messaging Utilities** (`src/utils/messages.ts`):
- Error message formatting with chalk
- Success message display
- Consistent error handling patterns

**Template Structure**:
- Existing TanStack template at `templates/tanstack-start/`
- Auth configuration files with Better Auth setup
- Reference: `convex/auth/index.ts` has Google OAuth already configured
- Reference: `src/lib/auth/client.ts` shows auth client structure

### New Components Required

**FrameworkInstaller Base Class** - Doesn't exist yet:
- Provides abstract interface for framework-specific operations
- Implements shared utility methods for all frameworks
- Can't reuse existing code because this is a new architecture pattern

**Framework-Specific Installers** - Don't exist yet:
- Each framework needs its own implementation for file paths and configurations
- Can't reuse because Next.js and TanStack have different file structures

**OAuth Provider Registry** - Doesn't exist yet:
- Centralized configuration for all supported OAuth providers
- Can't reuse because this needs to support Better Auth's full provider list

**String Replacement Utilities** - Don't exist yet:
- Specialized for comment placeholder replacement pattern
- Can't reuse generic file operations because placeholders require specific handling

## Technical Approach

### Class Architecture

**Base Class Pattern**: Use TypeScript abstract class to enforce consistent interface while allowing framework-specific implementations. The Template Method pattern ensures all frameworks follow the same workflow sequence.

**Inheritance Structure**:
```
FrameworkInstaller (abstract)
  ├── NextJSInstaller (concrete)
  └── TanStackInstaller (concrete)
```

**File Organization**:
```
src/installers/
  ├── base.ts              # FrameworkInstaller abstract class
  ├── nextjs.ts            # NextJSInstaller implementation
  ├── tanstack.ts          # TanStackInstaller implementation
  └── index.ts             # Exports and types
```

### Method Signatures

**Abstract Base Class** (`FrameworkInstaller`):

```typescript
abstract class FrameworkInstaller {
  constructor(
    protected targetPath: string,
    protected projectName: string
  )

  // Main orchestration method (concrete)
  async initProject(options: ProjectOptions): Promise<void>

  // Abstract methods (must be implemented by subclasses)
  abstract updateOAuthConfig(selectedProviders: string[]): Promise<void>
  abstract updateOAuthUIConfig(selectedProviders: string[]): Promise<void>
  abstract updateEnvExample(selectedProviders: string[]): Promise<void>
  abstract applyTweakCNTheme(themeContent: string): Promise<void>

  // Shared utility methods (concrete)
  protected async replacePlaceholder(
    filePath: string,
    placeholder: string,
    content: string
  ): Promise<void>

  protected async copyBaseFiles(framework: string): Promise<void>

  protected async createGitHubRepo(
    repoName: string,
    isPrivate: boolean
  ): Promise<void>

  protected async installDependencies(): Promise<void>

  protected async initGitRepo(): Promise<void>

  protected detectPackageManager(): PackageManager

  protected generateAuthSecret(): string
}
```

**ProjectOptions Interface**:

```typescript
interface ProjectOptions {
  projectName: string
  framework: 'nextjs' | 'tanstack'
  oauthProviders: string[]  // Array of provider IDs: ['google', 'github', ...]
  tweakcnTheme?: {
    type: 'url' | 'css'
    content: string
  }
  createGitHubRepo: boolean
  gitHubRepoPrivate?: boolean
  installDependencies: boolean
}

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'
```

**OAuth Provider Interface**:

```typescript
interface OAuthProvider {
  id: string           // 'google', 'github', 'discord', etc.
  name: string         // 'Google', 'GitHub', 'Discord', etc.
  envPrefix: string    // 'GOOGLE', 'GITHUB', 'DISCORD', etc.
  clientIdVar: string  // 'GOOGLE_CLIENT_ID'
  clientSecretVar: string  // 'GOOGLE_CLIENT_SECRET'
}

// Registry with all supported providers
const OAUTH_PROVIDERS: Record<string, OAuthProvider>
```

### Orchestration Flow

The `initProject()` method coordinates the following sequence:

1. **Copy Base Files**: Copy framework-specific template to target directory
2. **OAuth Configuration** (if providers selected):
   - Call `updateOAuthConfig(selectedProviders)` to update Better Auth config
   - Call `updateOAuthUIConfig(selectedProviders)` to update UI config
   - Call `updateEnvExample(selectedProviders)` to add environment variables
3. **Theme Application** (if theme provided):
   - Fetch theme content from URL if type is 'url'
   - Call `applyTweakCNTheme(themeContent)` to update Tailwind config
4. **Git Initialization** (if selected):
   - Call `initGitRepo()` to initialize Git repository
   - Create initial commit with all files
5. **GitHub Repository** (if selected):
   - Call `createGitHubRepo(repoName, isPrivate)` to create remote repo
   - Push initial commit to remote
6. **Dependency Installation** (if selected):
   - Call `installDependencies()` to run package manager install

### String Replacement Pattern

**Placeholder Format**: `// {{PLACEHOLDER_NAME}}`

**Common Placeholders**:
- `// {{OAUTH_PROVIDERS}}` - Replaced with socialProviders configuration object
- `// {{OAUTH_IMPORTS}}` - Replaced with provider import statements (if needed)
- `// {{ENV_OAUTH_VARS}}` - Replaced with environment variable declarations
- `// {{TWEAKCN_THEME}}` - Replaced with theme CSS variables

**Replacement Algorithm**:
1. Read file content as string
2. Search for placeholder comment using string matching
3. Replace placeholder with generated content
4. Preserve code formatting and indentation
5. Write updated content back to file

**Example Replacement**:

Before:
```typescript
export const createAuth = (ctx) => {
  return betterAuth({
    // {{OAUTH_PROVIDERS}}
    emailAndPassword: { enabled: true },
    // ...
  })
}
```

After (with Google and GitHub selected):
```typescript
export const createAuth = (ctx) => {
  return betterAuth({
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectURI: `${process.env.SITE_URL}/api/auth/callback/google`
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        redirectURI: `${process.env.SITE_URL}/api/auth/callback/github`
      }
    },
    emailAndPassword: { enabled: true },
    // ...
  })
}
```

### Framework-Specific Implementations

**NextJSInstaller**:
- Auth config file: `lib/auth.ts` or `lib/auth/index.ts`
- Auth client file: `lib/auth-client.ts` or `lib/auth/client.ts`
- Env example file: `.env.example` (root)
- Tailwind config: `tailwind.config.ts` (root)
- Uses Next.js-specific Better Auth setup patterns

**TanStackInstaller**:
- Auth config file: `convex/auth/index.ts`
- Auth client file: `src/lib/auth/client.ts`
- Env example file: `.env.example` (root)
- Tailwind config: `vite.config.ts` or separate `tailwind.config.ts`
- Uses `@daveyplate/better-auth-tanstack` client
- References existing template structure at `templates/tanstack-start/`

### OAuth Provider Configuration

**Supported Providers** (Better Auth full list):
- Google
- GitHub
- Discord
- Twitter (X)
- Apple
- Microsoft
- Facebook
- LinkedIn
- Twitch
- Spotify
- And any additional providers supported by Better Auth

**Environment Variables Pattern**:
Each provider requires two environment variables:
- `{PROVIDER}_CLIENT_ID` - OAuth application client ID
- `{PROVIDER}_CLIENT_SECRET` - OAuth application client secret

**Configuration Generation**:
```typescript
// For each selected provider, generate:
{
  [providerId]: {
    clientId: process.env.{PROVIDER}_CLIENT_ID!,
    clientSecret: process.env.{PROVIDER}_CLIENT_SECRET!,
    redirectURI: `${process.env.SITE_URL}/api/auth/callback/{providerId}`
  }
}
```

### TweakCN Theme Integration

**Theme Input Options**:
1. **URL**: Fetch theme from tweakcn.com
   - Use fetch/axios to retrieve theme CSS
   - Parse CSS content from response
2. **CSS Paste**: Accept raw CSS content
   - Truncate display in CLI to avoid overwhelming output
   - Store full content for application

**Theme Application**:
- Parse CSS variables from theme content
- Update Tailwind config with theme colors
- Framework-specific implementation handles config file locations
- TanStack uses Vite config, Next.js uses tailwind.config.ts

### Git and GitHub Integration

**Git Initialization**:
- Check if Git is installed using `which git`
- Run `git init` in target directory
- Run `git add .` to stage all files
- Run `git commit -m "Initial commit from create-z3"`
- Respect user's Git config for default branch name

**GitHub Repository Creation**:
- Check if GitHub CLI (`gh`) is installed
- Run `gh repo create {repoName} --{public|private} --source=. --push`
- Handle authentication errors gracefully
- Provide fallback instructions if `gh` not available

**Package Manager Detection**:
- Check `npm_config_user_agent` environment variable
- Fallback patterns:
  - If running via `pnpm create` → detect pnpm
  - If running via `npm create` → detect npm
  - If running via `yarn create` → detect yarn
  - If running via `bun create` → detect bun
- Default to npm if unable to detect

### Error Handling

**All methods should throw descriptive errors**:
- File not found errors with file path
- Invalid placeholder errors with placeholder name
- Git/GitHub CLI not installed errors with installation instructions
- Network errors for theme fetching with retry suggestions
- Permission errors with directory path

**CLI is responsible for**:
- Catching errors from installer methods
- Displaying user-friendly error messages
- Providing actionable next steps
- Graceful cleanup on failure

## Out of Scope

- Template file creation (templates must already exist)
- CLI implementation and survey questions (handled separately)
- Custom README generation (future enhancement)
- Additional framework support beyond Next.js and TanStack Start
- Database provider selection (always Convex)
- Deployment configuration (may be added later)
- Authentication provider testing/validation
- Theme preview or validation
- Git hook setup
- CI/CD configuration

## Success Criteria

- `FrameworkInstaller` base class has all abstract and concrete methods defined
- `NextJSInstaller` and `TanStackInstaller` implement all abstract methods
- `initProject(options)` successfully orchestrates entire setup workflow in correct sequence
- `replacePlaceholder()` utility correctly replaces comment placeholders while preserving formatting
- OAuth providers are configured in all necessary files with correct environment variables
- TweakCN themes can be applied from both URL and CSS paste sources
- GitHub repository creation works with both public and private options
- Dependency installation detects correct package manager and runs install
- All methods have TypeScript type safety with proper interfaces
- Error messages are descriptive enough for developers to debug issues
- Framework-specific implementations handle their unique file paths and configurations
- System is extensible - new frameworks can be added by creating new installer classes
