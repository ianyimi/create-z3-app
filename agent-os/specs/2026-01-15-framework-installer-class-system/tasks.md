# Task Breakdown: FrameworkInstaller Class System

## Overview

**Total Tasks:** 38 (across 7 task groups)
**Assigned Roles:** typescript-engineer, testing-engineer
**Estimated Complexity:** Medium-High
**File Organization:** `packages/cli/src/installers/`

## Architecture Summary

```
src/installers/
  |-- types.ts              # Interfaces and type definitions
  |-- providers.ts          # OAuth provider registry
  |-- string-utils.ts       # Placeholder replacement utilities
  |-- base.ts               # FrameworkInstaller abstract class
  |-- nextjs.ts             # NextJSInstaller implementation
  |-- tanstack.ts           # TanStackInstaller implementation
  |-- index.ts              # Exports and factory function
```

---

## Task List

### Foundation Layer

#### Task Group 1: Type Definitions and Interfaces
**Assigned implementer:** typescript-engineer
**Dependencies:** None
**File:** `packages/cli/src/installers/types.ts`

- [ ] 1.0 Complete type definitions module
  - [ ] 1.1 Define `PackageManager` type union
    - Values: 'pnpm' | 'npm' | 'yarn' | 'bun'
  - [ ] 1.2 Define `OAuthProvider` interface
    - Fields: id, name, envPrefix, clientIdVar, clientSecretVar
  - [ ] 1.3 Define `TweakCNTheme` interface
    - Fields: type ('url' | 'css'), content (string)
  - [ ] 1.4 Define `ProjectOptions` interface
    - Fields: projectName, framework, oauthProviders[], tweakcnTheme?, createGitHubRepo, gitHubRepoPrivate?, installDependencies
  - [ ] 1.5 Define `Framework` type union
    - Values: 'nextjs' | 'tanstack'
  - [ ] 1.6 Export all types from module

**Acceptance Criteria:**
- All interfaces compile without TypeScript errors
- Types are exported and importable from index
- Strict mode compatibility verified

---

#### Task Group 2: OAuth Provider Registry
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Group 1 (OAuthProvider interface)
**File:** `packages/cli/src/installers/providers.ts`

- [ ] 2.0 Complete OAuth provider registry module
  - [ ] 2.1 Create provider configuration for Google
    - id: 'google', name: 'Google', envPrefix: 'GOOGLE'
    - clientIdVar: 'GOOGLE_CLIENT_ID', clientSecretVar: 'GOOGLE_CLIENT_SECRET'
  - [ ] 2.2 Create provider configuration for GitHub
    - id: 'github', name: 'GitHub', envPrefix: 'GITHUB'
  - [ ] 2.3 Create provider configuration for Discord
    - id: 'discord', name: 'Discord', envPrefix: 'DISCORD'
  - [ ] 2.4 Create provider configuration for Twitter
    - id: 'twitter', name: 'Twitter', envPrefix: 'TWITTER'
  - [ ] 2.5 Create provider configuration for Apple
    - id: 'apple', name: 'Apple', envPrefix: 'APPLE'
  - [ ] 2.6 Create provider configuration for Microsoft
    - id: 'microsoft', name: 'Microsoft', envPrefix: 'MICROSOFT'
  - [ ] 2.7 Create provider configuration for Facebook
    - id: 'facebook', name: 'Facebook', envPrefix: 'FACEBOOK'
  - [ ] 2.8 Create provider configuration for LinkedIn
    - id: 'linkedin', name: 'LinkedIn', envPrefix: 'LINKEDIN'
  - [ ] 2.9 Create provider configuration for Twitch
    - id: 'twitch', name: 'Twitch', envPrefix: 'TWITCH'
  - [ ] 2.10 Create provider configuration for Spotify
    - id: 'spotify', name: 'Spotify', envPrefix: 'SPOTIFY'
  - [ ] 2.11 Export `OAUTH_PROVIDERS` as Record<string, OAuthProvider>
  - [ ] 2.12 Export helper function `getProvider(id: string): OAuthProvider | undefined`
  - [ ] 2.13 Export helper function `getProviderIds(): string[]`

**Acceptance Criteria:**
- All 10 Better Auth providers configured
- Registry is type-safe with proper typing
- Helper functions work correctly for lookups

---

#### Task Group 3: String Replacement Utilities
**Assigned implementer:** typescript-engineer
**Dependencies:** None
**File:** `packages/cli/src/installers/string-utils.ts`

- [ ] 3.0 Complete string replacement utilities module
  - [ ] 3.1 Implement `replacePlaceholder(filePath, placeholder, content): Promise<void>`
    - Read file content using fs-extra
    - Search for `// {{PLACEHOLDER}}` pattern
    - Replace placeholder with provided content
    - Preserve indentation of placeholder line
    - Write updated content back to file
    - Throw descriptive error if placeholder not found
  - [ ] 3.2 Implement `generateOAuthConfigBlock(providers: string[]): string`
    - Generate Better Auth socialProviders configuration object
    - Include clientId, clientSecret, redirectURI for each provider
    - Use proper indentation (2 spaces)
  - [ ] 3.3 Implement `generateOAuthUIConfigBlock(providers: string[]): string`
    - Generate better-auth-ui provider array
    - Format: `['google', 'github', ...]`
  - [ ] 3.4 Implement `generateEnvVarsBlock(providers: string[]): string`
    - Generate environment variable declarations
    - Format: `{PROVIDER}_CLIENT_ID=\n{PROVIDER}_CLIENT_SECRET=`
  - [ ] 3.5 Implement `detectIndentation(line: string): string`
    - Extract leading whitespace from placeholder line
    - Used to preserve formatting when replacing

**Acceptance Criteria:**
- Placeholder replacement preserves file formatting
- Generated config blocks are valid TypeScript
- Descriptive errors thrown for missing placeholders

---

### Core Implementation Layer

#### Task Group 4: FrameworkInstaller Base Class
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Groups 1, 2, 3
**File:** `packages/cli/src/installers/base.ts`

- [ ] 4.0 Complete FrameworkInstaller abstract base class
  - [ ] 4.1 Define class constructor
    - Parameters: targetPath (string), projectName (string)
    - Store as protected class properties
  - [ ] 4.2 Declare abstract method `updateOAuthConfig(selectedProviders: string[]): Promise<void>`
    - Updates Better Auth configuration file
    - Framework-specific file path
  - [ ] 4.3 Declare abstract method `updateOAuthUIConfig(selectedProviders: string[]): Promise<void>`
    - Updates better-auth-ui configuration
    - Framework-specific file path
  - [ ] 4.4 Declare abstract method `updateEnvExample(selectedProviders: string[]): Promise<void>`
    - Updates .env.example with OAuth variables
    - Framework-specific handling
  - [ ] 4.5 Declare abstract method `applyTweakCNTheme(themeContent: string): Promise<void>`
    - Applies TweakCN CSS to Tailwind config
    - Framework-specific config file location
  - [ ] 4.6 Declare abstract property `frameworkName: string`
    - Returns framework identifier for template selection
  - [ ] 4.7 Implement concrete method `copyBaseFiles(): Promise<void>`
    - Use existing `copyTemplate()` from fileOperations.ts
    - Copy framework-specific template to targetPath
  - [ ] 4.8 Implement concrete method `detectPackageManager(): PackageManager`
    - Check `npm_config_user_agent` environment variable
    - Parse for pnpm, yarn, bun, or default to npm
  - [ ] 4.9 Implement concrete method `installDependencies(): Promise<void>`
    - Detect package manager using detectPackageManager()
    - Use execa to run install command in targetPath
    - Show progress with ora spinner
  - [ ] 4.10 Implement concrete method `initGitRepo(): Promise<void>`
    - Check if git is installed using `which git`
    - Run `git init` in targetPath
    - Run `git add .`
    - Run `git commit -m "Initial commit from create-z3"`
  - [ ] 4.11 Implement concrete method `createGitHubRepo(repoName, isPrivate): Promise<void>`
    - Check if gh CLI is installed
    - Run `gh repo create {repoName} --{public|private} --source=. --push`
    - Handle errors gracefully with helpful messages
  - [ ] 4.12 Implement concrete method `generateAuthSecret(): string`
    - Generate 32-byte hex string using crypto.randomBytes
    - Return for BETTER_AUTH_SECRET environment variable
  - [ ] 4.13 Implement concrete method `fetchThemeFromUrl(url: string): Promise<string>`
    - Fetch CSS content from tweakcn.com URL
    - Parse and return CSS content
    - Handle network errors with retry suggestions
  - [ ] 4.14 Implement orchestration method `initProject(options: ProjectOptions): Promise<void>`
    - Sequence: copyBaseFiles -> OAuth config (if providers) -> Theme (if provided) -> Git init (if selected) -> GitHub repo (if selected) -> Install deps (if selected)
    - Call abstract methods for framework-specific operations
    - Handle errors at each step with descriptive messages

**Acceptance Criteria:**
- All abstract methods declared with correct signatures
- All concrete methods implemented and functional
- initProject() orchestrates correct sequence
- Package manager detection works for pnpm, npm, yarn, bun
- Git and GitHub operations work correctly
- Error messages are descriptive and actionable

---

### Framework Implementation Layer

#### Task Group 5: TanStackInstaller Implementation
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Group 4
**File:** `packages/cli/src/installers/tanstack.ts`

- [ ] 5.0 Complete TanStackInstaller class
  - [ ] 5.1 Define class extending FrameworkInstaller
    - Call super() with targetPath and projectName
  - [ ] 5.2 Define `frameworkName` property
    - Return: 'tanstack'
  - [ ] 5.3 Implement `updateOAuthConfig(selectedProviders: string[]): Promise<void>`
    - Target file: `convex/auth/index.ts`
    - Use `// {{OAUTH_PROVIDERS}}` placeholder
    - Generate socialProviders configuration block
    - Use replacePlaceholder utility
  - [ ] 5.4 Implement `updateOAuthUIConfig(selectedProviders: string[]): Promise<void>`
    - Target file: `src/lib/auth/client.ts`
    - Use `// {{OAUTH_UI_PROVIDERS}}` placeholder
    - Generate provider array for better-auth-ui
  - [ ] 5.5 Implement `updateEnvExample(selectedProviders: string[]): Promise<void>`
    - Target file: `.env.example`
    - Use `# {{ENV_OAUTH_VARS}}` placeholder (comment-based for env files)
    - Generate CLIENT_ID and CLIENT_SECRET for each provider
  - [ ] 5.6 Implement `applyTweakCNTheme(themeContent: string): Promise<void>`
    - Target file: `src/styles/globals.css` or Tailwind config location
    - Use `/* {{TWEAKCN_THEME}} */` placeholder for CSS files
    - Parse and apply CSS variables from theme content

**Acceptance Criteria:**
- TanStackInstaller extends FrameworkInstaller correctly
- All abstract methods implemented with TanStack-specific paths
- OAuth configuration generates valid Better Auth code
- Theme application works with TanStack/Vite structure

---

#### Task Group 6: NextJSInstaller Implementation
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Group 4
**File:** `packages/cli/src/installers/nextjs.ts`

- [ ] 6.0 Complete NextJSInstaller class
  - [ ] 6.1 Define class extending FrameworkInstaller
    - Call super() with targetPath and projectName
  - [ ] 6.2 Define `frameworkName` property
    - Return: 'nextjs'
  - [ ] 6.3 Implement `updateOAuthConfig(selectedProviders: string[]): Promise<void>`
    - Target file: `lib/auth.ts` or `lib/auth/index.ts`
    - Use `// {{OAUTH_PROVIDERS}}` placeholder
    - Generate socialProviders configuration block
    - Use replacePlaceholder utility
  - [ ] 6.4 Implement `updateOAuthUIConfig(selectedProviders: string[]): Promise<void>`
    - Target file: `lib/auth-client.ts` or `lib/auth/client.ts`
    - Use `// {{OAUTH_UI_PROVIDERS}}` placeholder
    - Generate provider array for better-auth-ui
  - [ ] 6.5 Implement `updateEnvExample(selectedProviders: string[]): Promise<void>`
    - Target file: `.env.example`
    - Use `# {{ENV_OAUTH_VARS}}` placeholder
    - Generate CLIENT_ID and CLIENT_SECRET for each provider
  - [ ] 6.6 Implement `applyTweakCNTheme(themeContent: string): Promise<void>`
    - Target file: `app/globals.css` or `tailwind.config.ts`
    - Use appropriate placeholder for CSS or config file
    - Parse and apply CSS variables from theme content

**Acceptance Criteria:**
- NextJSInstaller extends FrameworkInstaller correctly
- All abstract methods implemented with Next.js-specific paths
- OAuth configuration generates valid Better Auth code
- Theme application works with Next.js App Router structure

---

### Integration Layer

#### Task Group 7: Module Exports and Factory
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Groups 5, 6
**File:** `packages/cli/src/installers/index.ts`

- [ ] 7.0 Complete module exports and factory function
  - [ ] 7.1 Export all types from types.ts
    - ProjectOptions, OAuthProvider, PackageManager, Framework, TweakCNTheme
  - [ ] 7.2 Export OAuth provider registry from providers.ts
    - OAUTH_PROVIDERS, getProvider, getProviderIds
  - [ ] 7.3 Export base class (for potential extension)
    - FrameworkInstaller
  - [ ] 7.4 Export concrete installer classes
    - NextJSInstaller, TanStackInstaller
  - [ ] 7.5 Implement factory function `createInstaller(framework, targetPath, projectName): FrameworkInstaller`
    - Return appropriate installer based on framework parameter
    - Throw error for unsupported framework
  - [ ] 7.6 Export factory function as default or named export

**Acceptance Criteria:**
- All types and classes properly exported
- Factory function returns correct installer type
- Module is importable from `src/installers`
- CLI can use single import for all installer functionality

---

## Testing Requirements

### Unit Tests (Strategic - Core Flows Only)
**Assigned implementer:** testing-engineer
**Dependencies:** All Task Groups (1-7)
**Location:** `packages/cli/src/__tests__/installers/`

Per project standards, focus on critical paths only:

- [ ] T1. Test `replacePlaceholder()` with valid placeholder replacement
- [ ] T2. Test `generateOAuthConfigBlock()` produces valid config
- [ ] T3. Test `detectPackageManager()` for each package manager
- [ ] T4. Test `createInstaller()` factory returns correct installer type
- [ ] T5. Test `initProject()` orchestration calls methods in correct order (mock abstract methods)

**Note:** Per standards, defer edge case testing (missing files, invalid inputs, network errors) unless business-critical.

---

## Execution Order

Recommended implementation sequence:

```
Phase 1: Foundation (No dependencies)
  |-- Task Group 1: Type Definitions [Start here]
  |-- Task Group 3: String Utilities [Can parallel with TG1]

Phase 2: Registry (Depends on TG1)
  |-- Task Group 2: OAuth Provider Registry

Phase 3: Base Class (Depends on TG1, TG2, TG3)
  |-- Task Group 4: FrameworkInstaller Base Class

Phase 4: Implementations (Depends on TG4, can parallel)
  |-- Task Group 5: TanStackInstaller
  |-- Task Group 6: NextJSInstaller

Phase 5: Integration (Depends on TG5, TG6)
  |-- Task Group 7: Module Exports and Factory

Phase 6: Validation (Depends on all)
  |-- Unit Tests
```

---

## File Dependencies Map

```
types.ts          <-- No dependencies
providers.ts      <-- types.ts (OAuthProvider)
string-utils.ts   <-- types.ts (OAuthProvider), providers.ts
base.ts           <-- types.ts, string-utils.ts, providers.ts
tanstack.ts       <-- base.ts, string-utils.ts
nextjs.ts         <-- base.ts, string-utils.ts
index.ts          <-- All modules
```

---

## External Dependencies

### Existing Code to Leverage
- `src/helpers/fileOperations.ts` - copyTemplate(), createProjectDirectory()
- `src/utils/validation.ts` - validateProjectName(), checkDirectoryExists()
- `src/utils/messages.ts` - Error message formatting with chalk

### NPM Packages (Already in project)
- `fs-extra` - File system operations
- `execa` - Process execution for git/npm commands
- `ora` - Terminal spinners for progress indication
- `chalk` - Terminal string styling

---

## Notes

1. **Template Placeholders**: Templates must be updated to include `// {{PLACEHOLDER}}` comments before installers will function. This is a prerequisite but out of scope for this spec.

2. **Next.js Template**: The Next.js template does not exist yet. NextJSInstaller implementation assumes template will be created with matching file structure.

3. **Error Handling**: All methods should throw descriptive errors. The CLI layer is responsible for catching and displaying user-friendly messages.

4. **Testing Strategy**: Per project standards, write minimal tests focusing on core user flows. Defer edge case testing to dedicated testing phases.
