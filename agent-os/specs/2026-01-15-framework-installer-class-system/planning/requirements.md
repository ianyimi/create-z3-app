# Spec Requirements: Framework Installer Class System

## Initial Description

I want to build the FrameworkInstaller class that will be the base class for which various child classes will be created that inherit this class for each framework. The class needs methods that will perform the necessary string replacements in various files based on the framework. The CLI should only have to call the initProject method on the frameworkInstaller class that will take in the options returned from the input form and successfully run all string replacement functions in order to setup the project completely for the user based on their options. Upon installation it will follow this pattern: the base folder will be copied to the target location, then the frameworkInstallers would have updated all necessary files with comment replacement strings based on the input options from the user.

## Requirements Discussion

### First Round Questions

**Q1:** Should the base class have a single orchestration method (like `initProject(options)`) that calls all the framework-specific methods in sequence, or should the CLI be responsible for calling each method individually?
**Answer:** Single `initProject(options)` method that orchestrates everything in sequence (copy files, then run all abstract methods).

**Q2:** For the OAuth provider selection, should each abstract method receive the full options object or just the specific data it needs (e.g., `updateOAuthConfig(selectedProviders: string[])`)?
**Answer:** Abstract methods receive specific data only (e.g., `updateOAuthConfig(selectedProviders: string[])`) for better type safety.

**Q3:** Should the string replacement logic be a shared utility method in the base class, or should each framework implement its own replacement logic?
**Answer:** Base class provides shared `replacePlaceholder(filePath, placeholder, content)` utility method.

**Q4:** Which OAuth providers should be supported? The initial description mentions Google, GitHub, Discord, Twitter - should we support the full Better Auth provider list from day one?
**Answer:** Support full Better Auth provider list from day one (Google, GitHub, Discord, Twitter, Apple, Microsoft, Facebook, LinkedIn, Twitch, Spotify, etc.).

**Q5:** How does Better Auth UI integrate - does it require separate configuration files, or does it use the same auth config?
**Answer:** Uses better-auth-ui library. Only needs provider config update via comment string replacement to display selected OAuth providers on login screens.

**Q6:** For the TweakCN theme question, should the CLI accept a URL to fetch the theme, raw CSS content, or both?
**Answer:** Support both URL (fetch from tweakcn.com) and CSS content paste (truncate display to avoid form weirdness).

**Q7:** Should the TweakCN theme application be a single abstract method or multiple methods for different config files (e.g., tailwind.config, CSS variables)?
**Answer:** Single abstract `applyTweakCNTheme()` method where each framework implementation handles its own Tailwind config files.

**Q8:** Is GitHub repo creation framework-specific, or can it be a concrete shared method in the base class?
**Answer:** Concrete shared method in base class (framework-agnostic).

**Q9:** Should dependency installation detect the runtime automatically, or should we store the runtime used during CLI invocation?
**Answer:** Concrete shared method in base class with runtime detection (pnpm/npm/yarn/bun).

**Q10:** What is the preferred order of survey questions?
**Answer:** Project name -> Framework -> OAuth providers -> TweakCN theme -> GitHub repo -> Install dependencies.

**Q11:** Is there a database provider selection, or is Convex always used?
**Answer:** Always Convex (no provider selection needed).

**Q12:** Which frameworks should be supported initially?
**Answer:** Support Next.js and TanStack Start initially.

**Q13:** Are there any additional features or methods that should be included?
**Answer:** Will generate custom README later showing setup instructions based on selected options (not in initial spec).

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Example classes with inheritance - Path: `/Users/zaye/Documents/Obsidian/Vaults/The Dev Lab/.obsidian/pl` (Note: Directory was not accessible during requirements gathering)
- TanStack template has full Better Auth config with Google OAuth set up (reference but not needed for this spec)

### Follow-up Questions

No follow-up questions were needed. All requirements were clarified in the first round.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements

#### FrameworkInstaller Base Class

**Abstract Methods (to be implemented by each framework):**

1. `updateOAuthConfig(selectedProviders: string[]): Promise<void>`
   - Updates Better Auth configuration files with selected OAuth providers
   - Uses comment placeholder replacement pattern
   - Framework-specific file locations

2. `updateOAuthUIConfig(selectedProviders: string[]): Promise<void>`
   - Updates better-auth-ui configuration to display selected providers on login screens
   - Uses comment placeholder replacement pattern
   - Framework-specific file locations

3. `updateEnvExample(selectedProviders: string[]): Promise<void>`
   - Updates .env.example with required environment variables for selected providers
   - Appends provider-specific variables (CLIENT_ID, CLIENT_SECRET pairs)

4. `applyTweakCNTheme(themeContent: string): Promise<void>`
   - Applies TweakCN theme to framework-specific Tailwind configuration files
   - Handles CSS variables and Tailwind config updates
   - Each framework handles its own config file locations

**Concrete Methods (shared in base class):**

1. `initProject(options: ProjectOptions): Promise<void>`
   - Main orchestration method called by CLI
   - Sequence: copy base files -> run all abstract methods -> run optional concrete methods
   - Coordinates entire installation flow

2. `replacePlaceholder(filePath: string, placeholder: string, content: string): Promise<void>`
   - Shared utility for comment-based string replacement
   - Pattern: `// {{PLACEHOLDER_NAME}}` replaced with actual content
   - Used by all abstract method implementations

3. `copyBaseFiles(targetPath: string): Promise<void>`
   - Copies framework-specific base template to target location
   - First step in initProject sequence

4. `createGitHubRepo(repoName: string, isPrivate: boolean): Promise<void>`
   - Creates GitHub repository using gh CLI
   - Framework-agnostic implementation
   - Sets up remote and initial push

5. `installDependencies(): Promise<void>`
   - Detects package manager from CLI invocation (pnpm/npm/yarn/bun)
   - Runs appropriate install command
   - Shows progress with ora spinners

6. `initGitRepo(): Promise<void>`
   - Initializes git repository
   - Creates initial commit

#### Framework-Specific Implementations

**NextJSInstaller (extends FrameworkInstaller):**
- Implements all abstract methods for Next.js App Router structure
- Handles Next.js-specific file locations for auth config
- Manages Next.js Tailwind configuration

**TanStackInstaller (extends FrameworkInstaller):**
- Implements all abstract methods for TanStack Start structure
- Handles TanStack-specific file locations for auth config
- Uses @daveyplate/better-auth-tanstack client
- Manages TanStack/Vite Tailwind configuration

#### CLI Survey Questions

**Question Order and Options:**

1. **Project Name**
   - Type: Text input
   - Validation: Valid directory name, not already exists
   - Default: "my-z3-app"

2. **Framework Selection**
   - Type: Single select
   - Options: ["Next.js", "TanStack Start"]
   - Default: "TanStack Start"

3. **OAuth Providers**
   - Type: Multi-select (checkbox)
   - Options (full Better Auth list):
     - Google
     - GitHub
     - Discord
     - Twitter
     - Apple
     - Microsoft
     - Facebook
     - LinkedIn
     - Twitch
     - Spotify
     - (additional Better Auth providers)
   - Default: None selected (email/password only)

4. **TweakCN Theme**
   - Type: Optional input
   - Sub-options:
     - URL input (fetch from tweakcn.com)
     - CSS content paste (truncate display for long content)
   - Default: Skip (use default theme)

5. **Create GitHub Repository**
   - Type: Confirm (yes/no)
   - Follow-up if yes: Public or Private
   - Default: No

6. **Install Dependencies**
   - Type: Confirm (yes/no)
   - Default: Yes

#### String Replacement Pattern

**Comment Placeholder Format:**
```typescript
// {{PLACEHOLDER_NAME}}
```

**Example Placeholders:**
- `// {{OAUTH_PROVIDERS}}` - Replaced with provider configuration code
- `// {{OAUTH_IMPORTS}}` - Replaced with provider import statements
- `// {{ENV_OAUTH_VARS}}` - Replaced with environment variable declarations
- `// {{TWEAKCN_THEME}}` - Replaced with theme CSS variables

**Replacement Flow:**
1. Template files contain placeholder comments
2. Framework installer reads file
3. Calls `replacePlaceholder()` with target content
4. Placeholder comment is replaced with actual code
5. File is saved

#### ProjectOptions Interface

```typescript
interface ProjectOptions {
  projectName: string;
  framework: 'nextjs' | 'tanstack';
  oauthProviders: string[];
  tweakcnTheme?: {
    type: 'url' | 'css';
    content: string;
  };
  createGitHubRepo: boolean;
  gitHubRepoPrivate?: boolean;
  installDependencies: boolean;
}
```

### Reusability Opportunities

- `replacePlaceholder()` utility can be reused across all file modification operations
- GitHub repo creation logic is framework-agnostic and fully reusable
- Dependency installation with runtime detection is fully reusable
- OAuth provider registry (list of supported providers with metadata) can be shared

### Scope Boundaries

**In Scope:**
- FrameworkInstaller abstract base class definition
- NextJSInstaller and TanStackInstaller class definitions
- All abstract method signatures with specific parameters
- All concrete method signatures in base class
- ProjectOptions interface definition
- Survey question specifications
- String replacement pattern specification
- OAuth provider list (full Better Auth support)

**Out of Scope:**
- Actual method implementations (empty method bodies only)
- Template file creation
- CLI implementation beyond survey questions
- Custom README generation (future enhancement)
- Additional framework support beyond Next.js and TanStack Start
- Database provider selection (always Convex)

### Technical Considerations

- **TypeScript**: All classes and interfaces in TypeScript with strict mode
- **Async/Await**: All file operations and external commands use async/await
- **Error Handling**: Methods should throw descriptive errors for CLI to handle
- **Package Manager Detection**: Use process.env or execution context to detect runtime
- **Better Auth Integration**: Reference existing Better Auth documentation for provider configuration patterns
- **Template Method Pattern**: Base class defines workflow via `initProject()`, subclasses implement specifics via abstract methods
- **Comment Preservation**: Placeholder replacement keeps templates as valid TypeScript throughout the process
