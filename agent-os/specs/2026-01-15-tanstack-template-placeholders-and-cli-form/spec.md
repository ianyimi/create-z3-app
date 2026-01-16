# Specification: TanStack Template Placeholders and CLI Form Update

## Goal
Enable the create-z3 CLI to generate clean, customized TanStack Start projects based on user selections by implementing placeholder-based code generation in template files and expanding the CLI form to collect all necessary project configuration inputs including email/password authentication, Git initialization, dependency installation, and TweakCN theme customization.

## User Stories
- As a developer, I want to choose whether to include email/password authentication so that I have full control over my authentication strategy
- As a developer, I want to select only the OAuth providers I need so that my generated project doesn't include unnecessary configurations
- As a developer, I want my generated code to be clean without empty objects or placeholder comments so that it looks professionally written
- As a developer, I want to customize my project setup with Git initialization and dependency installation options so that I can control the scaffolding process
- As a developer, I want to apply a TweakCN theme to my project so that I can quickly customize the visual design

## Core Requirements

### Template Placeholder System
- Add comment placeholders to 5 template files for dynamic content replacement
- Implement clean code generation: remove placeholders entirely when content is empty
- Support two placeholder types: inline replacement and complete line removal
- Ensure generated code compiles without errors and contains no leftover comments

### CLI Form Enhancements
- Add email/password authentication toggle (checked by default) at top of OAuth provider list
- Add optional TweakCN theme URL prompt with skip capability
- Add Git initialization prompt (default: yes)
- Add install dependencies prompt (default: yes)
- Display warning when no authentication methods are selected (but allow proceeding)

### Clean Code Generation (Critical)
- When user doesn't select OAuth providers: completely remove `social` prop and OAuth configuration sections
- When user doesn't select email/password: remove email/password configuration
- Remove placeholder comment lines after replacement (no `// {{...}}` comments in output)
- Never generate empty objects like `socialProviders: {}` or `social={{ providers: [] }}`
- Generate code that looks hand-written, not template-generated

### Installer Method Orchestration
- Wire up all TanStackInstaller methods to execute during project initialization
- Update `updateOAuthConfig()` to accept email/password boolean parameter
- Execute methods in correct sequence: copy files → configure auth → apply theme → Git init → install deps
- Apply default theme when user skips TweakCN theme prompt

## Visual Design
No visual mockups (CLI/template feature). All interactions occur in terminal.

## Reusable Components

### Existing Code to Leverage
- **String Utils** (`packages/cli/src/installers/string-utils.ts`):
  - `replacePlaceholder()` - needs enhancement for line removal
  - `generateOAuthConfigBlock()` - needs update for email/password
  - `generateOAuthUIConfigBlock()` - working as-is
  - `generateEnvVarsBlock()` - working as-is
  - `generateReadmeSection()` - working as-is

- **TanStackInstaller** (`packages/cli/src/installers/tanstack.ts`):
  - All abstract methods already implemented
  - `updateOAuthConfig()` - needs email/password parameter
  - `updateOAuthUIConfig()` - working as-is
  - `applyTweakCNTheme()` - working as-is

- **CLI Prompts** (`packages/cli/src/index.ts`):
  - `promptOAuthProviders()` - needs email/password checkbox addition
  - Inquirer prompts already imported (`input`, `checkbox`, `confirm`)

- **Base Installer** (`packages/cli/src/installers/base.ts`):
  - `initProject()` orchestration method - needs wiring updates
  - `initGitRepo()` - working as-is
  - `installDependencies()` - working as-is

### New Components Required
- **String generation functions**:
  - `generateEmailPasswordConfig()` - create email/password config string
  - `generateAuthProvidersBlock()` - unified function combining email/password + OAuth
  - Enhanced `generateOAuthUIProvidersBlock()` - return removal marker for empty case

- **Default theme constant**:
  - `DEFAULT_THEME` - CSS variables for fallback theme

## Technical Approach

### 1. Template File Updates
Update 5 files in `/packages/cli/templates/tanstack-start/`:

**convex/auth/index.ts**:
- Replace hardcoded Google config with two placeholders
- `// {{EMAIL_PASSWORD_AUTH}}` - for email/password config line
- `// {{OAUTH_PROVIDERS}}` - for OAuth provider configurations
- Keep `emailAndPassword` and `socialProviders` structure

**src/providers.tsx**:
- Replace hardcoded `providers: ["google"]` with placeholder
- `// {{OAUTH_UI_PROVIDERS}}` - for social prop or removal
- Maintain AuthUIProviderTanstack component structure

**src/styles/globals.css** (NEW FILE):
- Create new file with Tailwind directives and theme placeholder
- `/* {{TWEAKCN_THEME}} */` - for theme CSS variables
- Include @tailwind base/components/utilities directives

**.env.example**:
- Add OAuth section with placeholder after SITE_URL variables
- `# {{ENV_OAUTH_VARS}}` - for OAuth provider credentials
- Include descriptive comments for each provider

**README.md**:
- Add authentication setup section with placeholder
- `<!-- {{OAUTH_SETUP_GUIDE}} -->` - for provider setup guides
- Position near bottom of existing README content

### 2. ProjectOptions Interface Updates
Update `/packages/cli/src/installers/types.ts`:
- Add `emailPasswordAuth: boolean` field
- Add `initGit: boolean` field (replace `createGitHubRepo` for this spec)
- Remove `createGitHubRepo` and `gitHubRepoPrivate` (defer to future spec)

### 3. String Utils Enhancements
Update `/packages/cli/src/installers/string-utils.ts`:

**Enhanced replacePlaceholder()**:
- Add special handling for empty string: remove entire placeholder line
- Add special handling for removal markers like `__REMOVE_SOCIAL_PROP__`
- Preserve existing indentation-aware replacement logic

**New generateEmailPasswordConfig()**:
- Return `emailAndPassword: { enabled: true },` if enabled
- Return empty string if disabled (triggers line removal)

**New generateAuthProvidersBlock()**:
- Combine email/password and OAuth provider generation
- Accept `oauthProviders: string[]` and `emailPasswordEnabled: boolean`
- Return combined configuration or empty string

**Enhanced generateOAuthUIProvidersBlock()**:
- Return `__REMOVE_SOCIAL_PROP__` marker when providers array is empty
- Triggers complete removal of social prop in src/providers.tsx

### 4. TanStackInstaller Updates
Update `/packages/cli/src/installers/tanstack.ts`:

**Update updateOAuthConfig() signature**:
- Change to accept `selectedProviders: string[], emailPasswordEnabled: boolean`
- Use new `generateAuthProvidersBlock()` function
- Handle both placeholders: `{{EMAIL_PASSWORD_AUTH}}` and `{{OAUTH_PROVIDERS}}`

**Update updateOAuthUIConfig()**:
- Target `src/providers.tsx` instead of `src/lib/auth/client.ts`
- Handle removal marker for empty OAuth providers
- Use enhanced `generateOAuthUIProvidersBlock()`

**Verify applyTweakCNTheme()**:
- Ensure it targets new `src/styles/globals.css` file
- Apply default theme when user skips theme URL

### 5. CLI Form Updates
Update `/packages/cli/src/index.ts`:

**Update promptOAuthProviders()**:
- Return object: `{ emailPassword: boolean, oauthProviders: string[] }`
- Add email/password as first checkbox item with `value: '__email_password__'`
- Set `checked: true` for email/password default
- Filter `__email_password__` from OAuth providers array

**Add new prompts** (after framework selection):
- TweakCN theme URL input (optional, can be skipped)
- Git initialization confirm (default: true)
- Install dependencies confirm (default: true)

**Add warning for no auth**:
- Check if `!emailPassword && oauthProviders.length === 0`
- Display yellow warning: "⚠️ Warning: No authentication methods selected. Your app will have no user authentication."
- Allow user to proceed

### 6. Installer Orchestration
Update `/packages/cli/src/installers/base.ts` `initProject()` method:

**Sequence**:
1. Copy base template files
2. Update OAuth config (if email/password OR OAuth selected)
3. Update OAuth UI config (if OAuth selected only)
4. Update .env.example (if OAuth selected only)
5. Update README (if OAuth selected only)
6. Apply TweakCN theme (apply default if user skipped)
7. Initialize Git (if user selected yes)
8. Install dependencies (if user selected yes)

**Wire method calls**:
- Pass `options.emailPasswordAuth` to `updateOAuthConfig()`
- Conditionally call methods based on selections
- Apply default theme constant when `options.tweakcnTheme` is undefined

### 7. Default Theme Constant
Add to `/packages/cli/src/installers/string-utils.ts`:
```typescript
export const DEFAULT_THEME = `--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--card: 0 0% 100%;
--card-foreground: 240 10% 3.9%;
--popover: 0 0% 100%;
--popover-foreground: 240 10% 3.9%;
--primary: 240 5.9% 10%;
--primary-foreground: 0 0% 98%;
--secondary: 240 4.8% 95.9%;
--secondary-foreground: 240 5.9% 10%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
--accent: 240 4.8% 95.9%;
--accent-foreground: 240 5.9% 10%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
--border: 240 5.9% 90%;
--input: 240 5.9% 90%;
--ring: 240 5.9% 10%;
--radius: 0.5rem;`;
```

## Out of Scope
- GitHub repository creation (deferred to future spec)
- Next.js template updates (only TanStack Start in this spec)
- OAuth scope customization beyond provider defaults
- Advanced TweakCN theme features (only URL fetch or default theme)
- Email/password configuration options beyond enable/disable
- Database migration or seeding
- Package.json customization beyond existing logic

## Success Criteria
- All 5 template files contain correct placeholders in correct locations
- CLI form collects email/password, OAuth providers, TweakCN theme URL, Git init, and install deps preferences
- Email/password appears as first checkbox in OAuth provider multi-select, checked by default
- Warning displays when no authentication methods selected but allows proceeding
- Generated projects compile without TypeScript errors
- Generated projects contain no placeholder comments (`// {{...}}` or `<!-- {{...}} -->`)
- Empty OAuth selection results in no `social` prop in src/providers.tsx
- Empty OAuth selection results in no OAuth sections in .env.example and README.md
- Default theme applies when user skips TweakCN theme prompt
- Git repository initializes when user selects yes
- Dependencies install when user selects yes
- All installer methods execute in correct sequence
- Providers requiring extra config still display warnings (existing functionality maintained)
