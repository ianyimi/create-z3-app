# Task Breakdown: TanStack Template Placeholders and CLI Form Update

## Overview
Total Tasks: 31 sub-tasks across 6 task groups
Estimated Complexity: Medium-High

This feature enables the create-z3 CLI to generate clean, customized TanStack Start projects based on user selections by implementing placeholder-based code generation and expanding the CLI form to collect all necessary project configuration inputs.

## Critical Requirements Summary
- **Clean Code Generation**: Remove placeholders entirely when content is empty - no empty objects, no leftover comments
- **Line Removal**: When replacement content is empty, remove the entire placeholder line
- **Professional Output**: Generated code must look hand-written, not template-generated

## Task List

---

### Foundation Layer

#### Task Group 1: Types and Constants
**Assigned implementer:** cli-engineer
**Dependencies:** None
**Files to modify:**
- `packages/cli/src/installers/types.ts`
- `packages/cli/src/installers/string-utils.ts`

- [x] 1.0 Complete types and constants foundation
  - [x] 1.1 Update ProjectOptions interface in types.ts
    - Add `emailPasswordAuth: boolean` field
    - Add `initGit: boolean` field
    - Remove `createGitHubRepo: boolean` field
    - Remove `gitHubRepoPrivate?: boolean` field
  - [x] 1.2 Add DEFAULT_THEME constant to string-utils.ts
    - Add constant with shadcn/ui default CSS variables
    - Include all required theme variables (background, foreground, card, primary, etc.)
    - Include --radius variable

**Acceptance Criteria:**
- ProjectOptions interface has correct shape for new CLI flow
- DEFAULT_THEME constant is exported and contains valid CSS variables
- TypeScript compilation passes with no errors

---

### String Utilities Layer

#### Task Group 2: String Utils Enhancements
**Assigned implementer:** cli-engineer
**Dependencies:** Task Group 1
**Files to modify:**
- `packages/cli/src/installers/string-utils.ts`

- [x] 2.0 Complete string utilities for clean code generation
  - [x] 2.1 Enhance replacePlaceholder() function for line removal
    - Add special handling when content is empty string: remove entire placeholder line
    - Add special handling for removal markers (e.g., `__REMOVE_SOCIAL_PROP__`)
    - Preserve existing indentation-aware replacement logic
    - Ensure no placeholder comments remain after replacement
  - [x] 2.2 Add generateEmailPasswordConfig() function
    - Accept `enabled: boolean` parameter
    - Return `emailAndPassword({ enabled: true }),` when enabled
    - Return empty string when disabled (triggers line removal)
  - [x] 2.3 Add generateAuthProvidersBlock() function
    - Accept `oauthProviders: string[]` and `emailPasswordEnabled: boolean` parameters
    - Combine email/password config and OAuth provider configs
    - Return properly formatted providers array content
    - Return empty string when both are disabled/empty
  - [x] 2.4 Enhance generateOAuthUIProvidersBlock() function
    - Return `__REMOVE_SOCIAL_PROP__` marker when providers array is empty
    - When providers exist, return `social={{ providers: ["google", "github"] }}` format
    - This marker triggers complete removal of the social prop line
  - [x] 2.5 Write unit tests for new string utility functions
    - Test replacePlaceholder() line removal behavior
    - Test generateEmailPasswordConfig() enabled/disabled cases
    - Test generateAuthProvidersBlock() with various combinations
    - Test generateOAuthUIProvidersBlock() empty array returns removal marker

**Acceptance Criteria:**
- Empty content triggers complete line removal (not empty string insertion)
- Removal markers are handled correctly
- All new functions are exported
- Unit tests pass for all new functionality

---

### Template Files Layer

#### Task Group 3: TanStack Template File Updates
**Assigned implementer:** cli-engineer
**Dependencies:** None (can run in parallel with Task Groups 1-2)
**Files to modify:**
- `packages/cli/templates/tanstack-start/convex/auth/index.ts`
- `packages/cli/templates/tanstack-start/src/providers.tsx`
- `packages/cli/templates/tanstack-start/src/styles/globals.css` (NEW FILE)
- `packages/cli/templates/tanstack-start/.env.example`
- `packages/cli/templates/tanstack-start/README.md`

- [x] 3.0 Complete template file placeholder additions
  - [x] 3.1 Update convex/auth/index.ts with placeholders
    - Replace hardcoded `emailAndPassword` and `socialProviders` with placeholders
    - Add `// {{EMAIL_PASSWORD_AUTH}}` placeholder for email/password config
    - Add `// {{OAUTH_PROVIDERS}}` placeholder for social providers
    - Structure providers array to support clean removal
  - [x] 3.2 Update src/providers.tsx with placeholder
    - Replace hardcoded `social={{ providers: ["google"] }}` with placeholder
    - Add `// {{OAUTH_UI_PROVIDERS}}` placeholder on its own line
    - Position placeholder where social prop would be inserted
  - [x] 3.3 Create src/styles/globals.css with theme placeholder
    - Create new file in templates/tanstack-start/src/styles/ directory
    - Add @tailwind base, components, utilities directives
    - Add @layer base with :root selector
    - Add `/* {{TWEAKCN_THEME}} */` placeholder inside :root
  - [x] 3.4 Update .env.example with OAuth placeholder
    - Add OAuth section header comment
    - Add `# {{ENV_OAUTH_VARS}}` placeholder after Better Auth section
    - Ensure proper line spacing for clean removal
  - [x] 3.5 Update README.md with OAuth setup guide placeholder
    - Add Authentication Setup section near bottom
    - Add `<!-- {{OAUTH_SETUP_GUIDE}} -->` placeholder
    - Position after existing documentation sections

**Acceptance Criteria:**
- All 5 template files contain correct placeholders in correct locations
- Placeholder syntax matches what string-utils expects
- New globals.css file has proper Tailwind structure
- Template files are valid TypeScript/CSS/Markdown when placeholders are present

---

### Installer Implementation Layer

#### Task Group 4: TanStackInstaller Updates
**Assigned implementer:** cli-engineer
**Dependencies:** Task Groups 2, 3
**Files to modify:**
- `packages/cli/src/installers/tanstack.ts`
- `packages/cli/src/installers/base.ts`

- [x] 4.0 Complete TanStackInstaller method updates
  - [x] 4.1 Update updateOAuthConfig() method signature and implementation
    - Change signature to accept `(selectedProviders: string[], emailPasswordEnabled: boolean)`
    - Update abstract method in base.ts to match new signature
    - Use generateAuthProvidersBlock() for combined generation
    - Handle both `{{EMAIL_PASSWORD_AUTH}}` and `{{OAUTH_PROVIDERS}}` placeholders
    - Ensure clean removal when both are empty
  - [x] 4.2 Update updateOAuthUIConfig() method
    - Change target file from `src/lib/auth/client.ts` to `src/providers.tsx`
    - Update placeholder from `// {{OAUTH_UI_PROVIDERS}}` to match new location
    - Use enhanced generateOAuthUIProvidersBlock() with removal marker support
    - Handle empty OAuth case by removing the entire social prop line
  - [x] 4.3 Verify applyTweakCNTheme() targets correct file
    - Confirm it targets `src/styles/globals.css`
    - Confirm placeholder is `/* {{TWEAKCN_THEME}} */`
    - No code changes needed if already correct
  - [x] 4.4 Update base.ts abstract method signature
    - Update `updateOAuthConfig()` abstract signature to include emailPasswordEnabled parameter
    - Ensure NextJSInstaller also updated if exists (or mark as TODO)

**Acceptance Criteria:**
- updateOAuthConfig() handles both email/password and OAuth
- updateOAuthUIConfig() targets src/providers.tsx correctly
- Empty configurations result in complete line removal
- Abstract method signature is consistent across base and implementations

---

### CLI Form Layer

#### Task Group 5: CLI Form Enhancements
**Assigned implementer:** cli-engineer
**Dependencies:** Task Group 1 (for updated ProjectOptions interface)
**Files to modify:**
- `packages/cli/src/index.ts`

- [x] 5.0 Complete CLI form updates
  - [x] 5.1 Update promptOAuthProviders() function signature and implementation
    - Change return type to `Promise<{ emailPassword: boolean; oauthProviders: string[] }>`
    - Add "Email & Password" as first checkbox item with value `__email_password__`
    - Set `checked: true` for email/password default
    - Add Separator after email/password option
    - Filter `__email_password__` from OAuth providers array in return
  - [x] 5.2 Add no-authentication warning
    - Check if `!emailPassword && oauthProviders.length === 0`
    - Display yellow warning using chalk: "Warning: No authentication methods selected."
    - Display additional message: "Your app will have no user authentication."
    - Allow user to proceed (no confirmation prompt)
  - [x] 5.3 Add TweakCN theme URL prompt
    - Add input prompt after authentication selection
    - Message: "Enter TweakCN theme URL (optional, press Enter to skip):"
    - Default to empty string
    - Trim input and handle skip case
    - Set options.tweakcnTheme when URL provided
  - [x] 5.4 Add Git initialization prompt
    - Add confirm prompt: "Initialize Git repository?"
    - Default to true
    - Store result in options.initGit
  - [x] 5.5 Add install dependencies prompt
    - Add confirm prompt: "Install dependencies?"
    - Default to true
    - Store result in options.installDependencies
  - [x] 5.6 Update CLI flow to use new prompts and ProjectOptions
    - Update destructuring of promptOAuthProviders() result
    - Wire emailPasswordAuth to options
    - Wire initGit to options
    - Remove createGitHubRepo handling (deferred to future spec)

**Acceptance Criteria:**
- Email/password appears as first item in auth selection, checked by default
- Warning displays when no auth selected but allows proceeding
- TweakCN theme prompt is optional with skip capability
- Git init and dependency install prompts work with correct defaults
- All new options are passed to ProjectOptions correctly

---

### Orchestration Layer

#### Task Group 6: Installer Orchestration and Integration
**Assigned implementer:** cli-engineer
**Dependencies:** Task Groups 4, 5
**Files to modify:**
- `packages/cli/src/installers/base.ts`
- `packages/cli/src/index.ts`

- [x] 6.0 Complete installer orchestration and wiring
  - [x] 6.1 Update initProject() method execution sequence
    - Step 1: Copy base template files
    - Step 2: Update OAuth config (if emailPassword OR OAuth selected)
    - Step 3: Update OAuth UI config (if OAuth selected only)
    - Step 4: Update .env.example (if OAuth selected only)
    - Step 5: Update README (if OAuth selected only)
    - Step 6: Apply TweakCN theme (apply DEFAULT_THEME if skipped)
    - Step 7: Initialize Git (if initGit is true)
    - Step 8: Install dependencies (if installDependencies is true)
  - [x] 6.2 Wire updateOAuthConfig() with emailPasswordAuth parameter
    - Pass `options.emailPasswordAuth` as second parameter
    - Call when `options.emailPasswordAuth || options.oauthProviders.length > 0`
  - [x] 6.3 Implement default theme fallback logic
    - Import DEFAULT_THEME from string-utils
    - When `options.tweakcnTheme` is undefined, call `applyTweakCNTheme(DEFAULT_THEME)`
    - When URL provided, fetch theme then apply
  - [x] 6.4 Update Git initialization logic
    - Change from always running to conditional on `options.initGit`
    - Remove GitHub repo creation logic (deferred)
  - [x] 6.5 Wire CLI to use FrameworkInstaller
    - Import TanStackInstaller (and NextJSInstaller if exists)
    - Instantiate correct installer based on framework selection
    - Build ProjectOptions from CLI prompts
    - Call `installer.initProject(options)`
    - Remove direct copyTemplate call (now handled by installer)
  - [x] 6.6 Write integration test for complete CLI flow
    - Test project generation with email/password only
    - Test project generation with OAuth only
    - Test project generation with both
    - Test project generation with neither (warning case)
    - Verify no placeholder comments in generated files
    - Verify no empty objects in generated code

**Acceptance Criteria:**
- All installer methods execute in correct sequence
- emailPasswordAuth parameter is properly passed
- Default theme applies when user skips theme prompt
- Git init only runs when user selects yes
- CLI successfully creates projects through FrameworkInstaller
- Generated code is clean without placeholders or empty configs

---

## Execution Order

Recommended implementation sequence:

```
Phase 1 (Foundation - can run in parallel):
  - Task Group 1: Types and Constants
  - Task Group 3: Template File Updates (no code dependencies)

Phase 2 (Core Utilities):
  - Task Group 2: String Utils Enhancements

Phase 3 (Implementation - can run in parallel after Phase 2):
  - Task Group 4: TanStackInstaller Updates
  - Task Group 5: CLI Form Enhancements

Phase 4 (Integration):
  - Task Group 6: Orchestration and Integration
```

## File Change Summary

| File | Action | Task Group |
|------|--------|------------|
| `packages/cli/src/installers/types.ts` | Modify | 1 |
| `packages/cli/src/installers/string-utils.ts` | Modify | 1, 2 |
| `packages/cli/templates/tanstack-start/convex/auth/index.ts` | Modify | 3 |
| `packages/cli/templates/tanstack-start/src/providers.tsx` | Modify | 3 |
| `packages/cli/templates/tanstack-start/src/styles/globals.css` | Create | 3 |
| `packages/cli/templates/tanstack-start/.env.example` | Modify | 3 |
| `packages/cli/templates/tanstack-start/README.md` | Modify | 3 |
| `packages/cli/src/installers/tanstack.ts` | Modify | 4 |
| `packages/cli/src/installers/base.ts` | Modify | 4, 6 |
| `packages/cli/src/index.ts` | Modify | 5, 6 |

## Testing Checklist

After implementation, verify:

- [x] Generate project with email/password only - no OAuth code/props/comments
- [x] Generate project with OAuth only - no email/password config
- [x] Generate project with both email/password and OAuth - both present
- [x] Generate project with neither - warning shown, clean empty auth config
- [x] No placeholder comments like `// {{...}}` remain in any file
- [x] No empty objects like `social={{}}` or `socialProviders: {}`
- [x] Default theme applies when TweakCN URL skipped
- [x] Custom theme applies when TweakCN URL provided
- [x] Git repo initializes only when user selects yes
- [x] Dependencies install only when user selects yes
- [x] Generated code compiles without TypeScript errors
- [x] Generated code lints without warnings about unused props

## Notes

- **Out of Scope**: GitHub repository creation (deferred to future spec)
- **Out of Scope**: Next.js template updates (only TanStack Start in this spec)
- **Critical**: The golden rule - if the user didn't select it, it shouldn't appear in the generated code at all
