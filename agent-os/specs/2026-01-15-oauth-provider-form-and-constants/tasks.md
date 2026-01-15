# Task Breakdown: OAuth Provider Form and Constants

## Overview

**Total Tasks:** 42 (across 6 task groups)
**Assigned Roles:** typescript-engineer, testing-engineer
**Estimated Complexity:** Medium-High
**Primary Files:**
- `packages/cli/src/installers/types.ts`
- `packages/cli/src/installers/providers.ts`
- `packages/cli/src/installers/string-utils.ts`
- `packages/cli/src/installers/base.ts`
- `packages/cli/src/installers/nextjs.ts`
- `packages/cli/src/installers/tanstack.ts`
- `packages/cli/src/index.ts`

## Architecture Summary

```
Current State:
  types.ts        -> OAuthProvider with basic fields (id, name, envPrefix, clientIdVar, clientSecretVar)
  providers.ts    -> 10 providers with minimal metadata
  string-utils.ts -> generateOAuthConfigBlock(), generateEnvVarsBlock(), generateOAuthUIConfigBlock()
  base.ts         -> Abstract methods: updateOAuthConfig, updateOAuthUIConfig, updateEnvExample
  index.ts        -> CLI with framework selection only

Target State:
  types.ts        -> OAuthProvider with full metadata (popular, betterAuthConfig, env[], docs, readme)
  providers.ts    -> All 33 Better Auth providers with complete metadata
  string-utils.ts -> Updated generators + new generateReadmeSection()
  base.ts         -> New abstract updateReadme() method
  nextjs.ts       -> Implement updateReadme() with NEXT_PUBLIC_ prefix
  tanstack.ts     -> Implement updateReadme() with VITE_ prefix
  index.ts        -> Multi-select checkbox with "Show more" option
```

---

## Task List

### Foundation Layer

#### Task Group 1: Extend OAuthProvider Type Definition
**Assigned implementer:** typescript-engineer
**Dependencies:** None
**File:** `packages/cli/src/installers/types.ts`

- [ ] 1.0 Complete extended OAuthProvider type definition
  - [ ] 1.1 Add `popular: boolean` field to OAuthProvider interface
    - Indicates if provider appears in default list
  - [ ] 1.2 Add `betterAuthConfig` nested object field
    - `import: string` - Import statement if needed (empty for most)
    - `socialProvider: string` - Complete provider config code snippet
    - `scopes?: string[]` - Optional required scopes array
  - [ ] 1.3 Add `env: Array<EnvVariable>` field
    - Create `EnvVariable` interface with: name, type ('server' | 'client'), description
    - Supports framework-specific prefix logic
  - [ ] 1.4 Add `docs` nested object field
    - `provider: string` - URL to provider's OAuth setup docs
    - `betterAuth: string` - URL to Better Auth provider docs
  - [ ] 1.5 Add `requiresExtraConfig: boolean` field
    - Flag for providers needing more than clientId/clientSecret
  - [ ] 1.6 Add `extraConfigNotes: string` field
    - Documentation for extra setup requirements
  - [ ] 1.7 Add `readme` nested object field
    - `title: string` - Section heading for README
    - `content: string` - Markdown setup guide content
  - [ ] 1.8 Export `EnvVariable` interface
  - [ ] 1.9 Verify all types compile without TypeScript errors

**Acceptance Criteria:**
- OAuthProvider interface extended with all new fields
- EnvVariable interface created and exported
- Strict TypeScript mode compatibility verified
- Existing code continues to function (backward compatible structure)

---

### Data Layer

#### Task Group 2: Populate OAUTH_PROVIDERS with All 33 Providers
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Group 1 (extended OAuthProvider type)
**File:** `packages/cli/src/installers/providers.ts`

- [ ] 2.0 Complete OAUTH_PROVIDERS constant with all 33 providers
  - [ ] 2.1 Update existing 10 popular providers with full metadata
    - [ ] 2.1.1 Update Google provider
      - popular: true
      - betterAuthConfig.socialProvider with clientId, clientSecret, redirectURI
      - env array with GOOGLE_CLIENT_ID (server), GOOGLE_CLIENT_SECRET (server)
      - docs URLs for Google Cloud Console and Better Auth
      - requiresExtraConfig: false
      - readme with setup instructions
    - [ ] 2.1.2 Update GitHub provider
      - popular: true
      - betterAuthConfig with user:email scope
      - requiresExtraConfig: true (needs user:email scope)
      - extraConfigNotes explaining scope requirement
    - [ ] 2.1.3 Update Discord provider (popular: true)
    - [ ] 2.1.4 Update Apple provider (popular: true)
    - [ ] 2.1.5 Update Microsoft provider (popular: true)
    - [ ] 2.1.6 Update Facebook provider (popular: true)
    - [ ] 2.1.7 Update Twitter/X provider (popular: true)
    - [ ] 2.1.8 Update LinkedIn provider (popular: true)
    - [ ] 2.1.9 Update Twitch provider (popular: true)
    - [ ] 2.1.10 Update Spotify provider (popular: true)
  - [ ] 2.2 Add 23 additional providers with full metadata
    - [ ] 2.2.1 Add Atlassian provider (popular: false)
    - [ ] 2.2.2 Add AWS Cognito provider (popular: false)
      - id: 'cognito', special configuration notes for pool setup
    - [ ] 2.2.3 Add Dropbox provider (popular: false)
    - [ ] 2.2.4 Add Figma provider (popular: false)
    - [ ] 2.2.5 Add GitLab provider (popular: false)
    - [ ] 2.2.6 Add Hugging Face provider (popular: false)
    - [ ] 2.2.7 Add Kakao provider (popular: false)
    - [ ] 2.2.8 Add Kick provider (popular: false)
    - [ ] 2.2.9 Add LINE provider (popular: false)
    - [ ] 2.2.10 Add Linear provider (popular: false)
    - [ ] 2.2.11 Add Naver provider (popular: false)
    - [ ] 2.2.12 Add Notion provider (popular: false)
    - [ ] 2.2.13 Add Paybin provider (popular: false)
    - [ ] 2.2.14 Add PayPal provider (popular: false)
    - [ ] 2.2.15 Add Polar provider (popular: false)
    - [ ] 2.2.16 Add Reddit provider (popular: false)
    - [ ] 2.2.17 Add Roblox provider (popular: false)
    - [ ] 2.2.18 Add Salesforce provider (popular: false)
    - [ ] 2.2.19 Add Slack provider (popular: false)
    - [ ] 2.2.20 Add TikTok provider (popular: false)
    - [ ] 2.2.21 Add Vercel provider (popular: false)
    - [ ] 2.2.22 Add VK provider (popular: false)
    - [ ] 2.2.23 Add Zoom provider (popular: false)
  - [ ] 2.3 Add helper functions for provider filtering
    - [ ] 2.3.1 Export `getPopularProviders(): OAuthProvider[]`
    - [ ] 2.3.2 Export `getAdditionalProviders(): OAuthProvider[]`
  - [ ] 2.4 Verify all provider IDs match Better Auth expected identifiers

**Acceptance Criteria:**
- All 33 Better Auth providers configured with complete metadata
- 10 providers marked as popular: true
- 23 providers marked as popular: false
- Each provider has valid docs URLs
- Each provider has README template content
- Helper functions return correct filtered lists
- Registry compiles without TypeScript errors

---

### Utility Layer

#### Task Group 3: Update String Utils with Enhanced Generation Functions
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Group 2 (OAUTH_PROVIDERS with full metadata)
**File:** `packages/cli/src/installers/string-utils.ts`

- [ ] 3.0 Complete string utils updates for enhanced generation
  - [ ] 3.1 Update `generateOAuthConfigBlock()` to use new betterAuthConfig structure
    - Use `provider.betterAuthConfig.socialProvider` directly
    - Remove hardcoded template, use stored config strings
    - Handle providers with scopes by including them in output
  - [ ] 3.2 Update `generateEnvVarsBlock()` to accept framework parameter
    - Signature: `generateEnvVarsBlock(providers: string[], framework: Framework): string`
    - Apply NEXT_PUBLIC_ prefix for Next.js client vars
    - Apply VITE_ prefix for TanStack/Vite client vars
    - No prefix for server-only vars
    - Use `env[].type` to determine prefix application
    - Include `env[].description` as comment above each variable
  - [ ] 3.3 Implement new `generateReadmeSection()` function
    - Signature: `generateReadmeSection(providers: string[]): string`
    - Compile README markdown from selected providers
    - Use `provider.readme.content` for each selected provider
    - Join sections with horizontal rule separator
    - Include header: "## OAuth Provider Setup"
  - [ ] 3.4 Add helper function for provider requiring extra config
    - `getProvidersRequiringExtraConfig(providers: string[]): OAuthProvider[]`
    - Filter selected providers where requiresExtraConfig: true
    - Used for CLI warning display
  - [ ] 3.5 Verify all generation functions produce valid output

**Acceptance Criteria:**
- generateOAuthConfigBlock() uses stored socialProvider snippets
- generateEnvVarsBlock() applies correct framework prefixes
- generateReadmeSection() produces valid markdown
- All generated code compiles without errors
- Existing functionality preserved

---

### CLI Layer

#### Task Group 4: Implement CLI Multi-Select with "Show More"
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Groups 2, 3 (providers list and filtering)
**File:** `packages/cli/src/index.ts`

- [ ] 4.0 Complete CLI OAuth provider selection form
  - [ ] 4.1 Import required dependencies
    - Import `checkbox` and `Separator` from `@inquirer/prompts`
    - Import `getPopularProviders`, `getAdditionalProviders` from providers
    - Import `getProvidersRequiringExtraConfig` from string-utils
  - [ ] 4.2 Create `promptOAuthProviders()` function
    - Async function returning `Promise<string[]>` (selected provider IDs)
    - Implement re-prompt logic for "show more" selection
  - [ ] 4.3 Build initial choices array with popular providers
    - Use Separator for "Popular Providers:" heading
    - Map popular providers to { name, value: id } objects
    - Add special option: { name: '> Show more providers (23 additional)', value: '__show_more__' }
  - [ ] 4.4 Build expanded choices array with all providers
    - Use Separator for "Popular Providers:" heading
    - List all 10 popular providers
    - Use Separator for "Additional Providers:" heading
    - List all 23 additional providers
    - Remove "__show_more__" option in expanded view
  - [ ] 4.5 Implement selection loop with "show more" handling
    - Check if '__show_more__' in selected values
    - If yes, preserve already-selected providers and re-prompt with expanded list
    - If no, return final selection array
    - Filter out '__show_more__' from final result
  - [ ] 4.6 Display warning for providers requiring extra config
    - After selection, check getProvidersRequiringExtraConfig()
    - If any found, display chalk.yellow warning with extraConfigNotes
  - [ ] 4.7 Integrate promptOAuthProviders() into main CLI flow
    - Call after framework selection
    - Store result in projectOptions.oauthProviders
  - [ ] 4.8 Handle empty selection gracefully
    - Allow user to select no providers
    - Skip OAuth configuration steps when array empty

**Acceptance Criteria:**
- CLI shows 10 popular providers by default
- "Show more" option expands to show all 33 providers
- Already-selected providers persist through re-prompt
- Final selection excludes '__show_more__' value
- Warning displayed for providers needing extra config
- Empty selection is valid and handled correctly

---

### Framework Installer Layer

#### Task Group 5: Update FrameworkInstaller Classes
**Assigned implementer:** typescript-engineer
**Dependencies:** Task Groups 3, 4 (updated string utils and CLI form)
**Files:**
- `packages/cli/src/installers/base.ts`
- `packages/cli/src/installers/nextjs.ts`
- `packages/cli/src/installers/tanstack.ts`

- [ ] 5.0 Complete FrameworkInstaller updates
  - [ ] 5.1 Add abstract `updateReadme()` method to base class
    - Signature: `abstract updateReadme(selectedProviders: string[]): Promise<void>`
    - Updates project README with OAuth setup guide sections
  - [ ] 5.2 Update `updateEnvExample()` signature in base class
    - Add framework parameter or use instance property
    - Enable framework-specific prefix handling
  - [ ] 5.3 Update `initProject()` orchestration to call `updateReadme()`
    - Add README update step after OAuth config
    - Only call if selectedProviders.length > 0
  - [ ] 5.4 Implement `updateReadme()` in NextJSInstaller
    - Target file: `README.md` in project root
    - Use placeholder: `<!-- {{OAUTH_SETUP_GUIDE}} -->`
    - Call generateReadmeSection() with selected providers
    - Use replacePlaceholder() to insert content
  - [ ] 5.5 Update `updateEnvExample()` in NextJSInstaller for prefixes
    - Pass 'nextjs' as framework to generateEnvVarsBlock()
    - Client vars get NEXT_PUBLIC_ prefix
  - [ ] 5.6 Implement `updateReadme()` in TanStackInstaller
    - Target file: `README.md` in project root
    - Use placeholder: `<!-- {{OAUTH_SETUP_GUIDE}} -->`
    - Call generateReadmeSection() with selected providers
    - Use replacePlaceholder() to insert content
  - [ ] 5.7 Update `updateEnvExample()` in TanStackInstaller for prefixes
    - Pass 'tanstack' as framework to generateEnvVarsBlock()
    - Client vars get VITE_ prefix
  - [ ] 5.8 Verify both installers handle README placeholder gracefully
    - If placeholder not found, log warning but don't fail
    - Template files may need placeholder added separately

**Acceptance Criteria:**
- Base class has updateReadme() abstract method
- Both installers implement updateReadme()
- initProject() calls updateReadme() in correct sequence
- Next.js env vars use NEXT_PUBLIC_ prefix for client vars
- TanStack env vars use VITE_ prefix for client vars
- README generation works with markdown placeholder
- Missing placeholder handled gracefully without crashing

---

### Validation Layer

#### Task Group 6: Testing and Validation
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1-5 (all implementation complete)
**Location:** `packages/cli/src/__tests__/installers/`

Per project standards, focus on critical paths only:

- [ ] 6.0 Complete validation and strategic testing
  - [ ] 6.1 Manual validation of generated code
    - Run CLI and select various provider combinations
    - Verify generated auth config compiles without errors
    - Verify generated env vars have correct prefixes
    - Verify README sections render correctly
  - [ ] 6.2 Test OAUTH_PROVIDERS constant integrity
    - All 33 providers have required fields populated
    - No empty strings for required fields
    - Provider IDs match Better Auth expected values
  - [ ] 6.3 Test generateOAuthConfigBlock() with multiple providers
    - Verify output is valid TypeScript
    - Verify socialProviders block has correct structure
  - [ ] 6.4 Test generateEnvVarsBlock() with framework parameter
    - Next.js: verify NEXT_PUBLIC_ prefix on client vars
    - TanStack: verify VITE_ prefix on client vars
    - Verify server vars have no prefix
  - [ ] 6.5 Test generateReadmeSection() produces valid markdown
    - Verify section headers present
    - Verify provider content included
    - Verify separators between sections
  - [ ] 6.6 Test CLI "show more" flow
    - Verify popular providers shown initially
    - Verify expansion shows all 33 providers
    - Verify selections persist through re-prompt
  - [ ] 6.7 Integration test: Full project creation
    - Select Next.js + multiple OAuth providers
    - Verify all files generated correctly
    - Verify project compiles with TypeScript
    - Repeat for TanStack framework

**Acceptance Criteria:**
- All 33 providers generate valid configuration
- Generated code compiles without TypeScript errors
- Both frameworks produce correct env var prefixes
- README sections are valid markdown
- CLI flow works smoothly with "show more" option
- No hardcoded provider strings remain in codebase

---

## Execution Order

Recommended implementation sequence:

```
Phase 1: Foundation (No dependencies)
  |-- Task Group 1: Extend OAuthProvider Type Definition

Phase 2: Data (Depends on TG1)
  |-- Task Group 2: Populate OAUTH_PROVIDERS (33 providers)
  Note: This is the largest task group, contains bulk of provider data

Phase 3: Utilities (Depends on TG2)
  |-- Task Group 3: Update String Utils

Phase 4: CLI (Depends on TG2, TG3)
  |-- Task Group 4: CLI Multi-Select with "Show More"

Phase 5: Installers (Depends on TG3, can parallel with TG4)
  |-- Task Group 5: Update FrameworkInstaller Classes

Phase 6: Validation (Depends on all)
  |-- Task Group 6: Testing and Validation
```

---

## File Dependencies Map

```
types.ts          <-- No dependencies (extend first)
providers.ts      <-- types.ts (needs extended OAuthProvider)
string-utils.ts   <-- types.ts, providers.ts (uses new structure)
base.ts           <-- types.ts (new abstract method)
nextjs.ts         <-- base.ts, string-utils.ts (implement updateReadme)
tanstack.ts       <-- base.ts, string-utils.ts (implement updateReadme)
index.ts          <-- providers.ts, string-utils.ts (CLI form)
```

---

## Provider Reference List

### Popular Providers (10) - Default Display
| ID | Name | Requires Extra Config |
|----|------|----------------------|
| google | Google | No |
| github | GitHub | Yes (user:email scope) |
| discord | Discord | No |
| apple | Apple | No |
| microsoft | Microsoft | No |
| facebook | Facebook | No |
| twitter | Twitter/X | No |
| linkedin | LinkedIn | No |
| twitch | Twitch | No |
| spotify | Spotify | No |

### Additional Providers (23) - "Show More" Display
| ID | Name | Requires Extra Config |
|----|------|----------------------|
| atlassian | Atlassian | No |
| cognito | AWS Cognito | Yes (pool config) |
| dropbox | Dropbox | No |
| figma | Figma | No |
| gitlab | GitLab | No |
| huggingface | Hugging Face | No |
| kakao | Kakao | No |
| kick | Kick | No |
| line | LINE | No |
| linear | Linear | No |
| naver | Naver | No |
| notion | Notion | No |
| paybin | Paybin | No |
| paypal | PayPal | No |
| polar | Polar | No |
| reddit | Reddit | No |
| roblox | Roblox | No |
| salesforce | Salesforce | No |
| slack | Slack | No |
| tiktok | TikTok | No |
| vercel | Vercel | No |
| vk | VK | No |
| zoom | Zoom | No |

---

## Template File Prerequisites

The following placeholder comments must exist in template files before installers can function:

**Next.js Template:**
- `lib/auth.ts` - `// {{OAUTH_PROVIDERS}}`
- `lib/auth-client.ts` - `// {{OAUTH_UI_PROVIDERS}}`
- `.env.example` - `# {{ENV_OAUTH_VARS}}`
- `README.md` - `<!-- {{OAUTH_SETUP_GUIDE}} -->`

**TanStack Template:**
- `convex/auth/index.ts` - `// {{OAUTH_PROVIDERS}}`
- `src/lib/auth/client.ts` - `// {{OAUTH_UI_PROVIDERS}}`
- `.env.example` - `# {{ENV_OAUTH_VARS}}`
- `README.md` - `<!-- {{OAUTH_SETUP_GUIDE}} -->`

---

## Notes

1. **Provider Data Entry:** Task Group 2 is the most time-intensive task. Each of the 33 providers needs complete metadata including documentation URLs and README templates. Consider breaking into sub-sessions if needed.

2. **Better Auth Compatibility:** Provider IDs must exactly match Better Auth's expected identifiers. Reference: https://github.com/better-auth/better-auth/blob/main/packages/core/src/social-providers/index.ts

3. **Template Files:** Template files must have placeholders added before installer methods can function. This may be a separate prerequisite task.

4. **Testing Strategy:** Per project standards, write minimal tests focusing on core user flows. Defer edge case testing to dedicated testing phases.

5. **Framework Prefixes:**
   - Next.js uses `NEXT_PUBLIC_` for client-exposed env vars
   - Vite/TanStack uses `VITE_` for client-exposed env vars
   - All OAuth credentials are server-only (no prefix needed)

6. **Backward Compatibility:** The extended OAuthProvider type should be backward compatible with existing code. New fields are additive.
