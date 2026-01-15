# Specification: OAuth Provider Form and Constants

## Goal

Expand OAuth provider support from 10 to all 33 Better Auth providers by creating a comprehensive OAUTH_PROVIDERS constant with complete metadata, implementing a "show more" CLI form flow, and generating auth config, environment variables, and README documentation for selected providers.

## User Stories

- As a developer creating a new project, I want to choose from all 33 Better Auth OAuth providers so that I can integrate the authentication providers my application needs
- As a developer, I want to see the most popular providers first with an option to view all providers so that I can quickly select common providers without being overwhelmed
- As a developer, I want the CLI to automatically generate auth configuration, environment variables, and setup documentation for my selected providers so that I don't have to manually look up and configure each provider
- As a developer, I want to know which providers require extra configuration beyond clientId/clientSecret so that I can properly set them up

## Core Requirements

- Support all 33 Better Auth OAuth providers with complete metadata
- Display top 10 popular providers by default in CLI form
- Provide "Show more" option to reveal remaining 23 providers
- Generate framework-specific auth configuration code (Next.js: `lib/auth.ts`, TanStack: `convex/auth/index.ts`)
- Generate `.env.example` with descriptive comments and framework-specific prefixes
- Generate README sections with OAuth setup guides and documentation links
- Flag providers requiring extra configuration (scopes, special settings)
- Store all provider metadata in single OAUTH_PROVIDERS constant

## Visual Design

None required (CLI feature)

## Reusable Components

### Existing Code to Leverage

**Components:**
- `packages/cli/src/installers/providers.ts` - Current OAUTH_PROVIDERS registry structure with 10 providers (extend to 33)
- `packages/cli/src/installers/types.ts` - OAuthProvider interface (extend with new fields)
- `packages/cli/src/installers/string-utils.ts` - Placeholder replacement utilities, generateOAuthConfigBlock, generateEnvVarsBlock (extend with README generation)
- `packages/cli/src/installers/base.ts` - FrameworkInstaller base class with abstract updateOAuthConfig, updateOAuthUIConfig, updateEnvExample methods
- `packages/cli/src/installers/nextjs.ts` - Next.js implementation of OAuth config updates
- `packages/cli/src/installers/tanstack.ts` - TanStack implementation of OAuth config updates

**Patterns:**
- Placeholder replacement pattern from `replacePlaceholder()` function
- Code generation pattern from `generateOAuthConfigBlock()` and similar functions
- Framework-specific installer pattern from base class implementations
- CLI prompts using `@inquirer/prompts` library (from `packages/cli/src/index.ts`)

**Services:**
- Package manager detection in FrameworkInstaller base class
- File operations utilities in `packages/cli/src/helpers/fileOperations.ts`

### New Components Required

**OAUTH_PROVIDERS Enhanced Structure:**
- Extend existing constant with 23 additional providers (currently has 10)
- Add `popular: boolean` field to OAuthProvider type
- Add `betterAuthConfig: { import: string, socialProvider: string, scopes?: string[] }` field
- Add `env: Array<{ name: string, type: 'server' | 'client', description: string }>` field
- Add `docs: { provider: string, betterAuth: string }` field
- Add `requiresExtraConfig: boolean` and `extraConfigNotes: string` fields
- Add `readme: { title: string, content: string }` field

**CLI Form with "Show More":**
- Multi-select checkbox prompt with conditional expansion
- Cannot reuse existing simple select - needs custom logic to handle "show more" option
- Will use `@inquirer/prompts` checkbox with dynamic choices array
- Handle special `__show_more__` value to re-prompt with full list

**README Generator Function:**
- New `generateReadmeSection()` function in string-utils.ts
- Cannot reuse existing generators - this is provider setup documentation
- Takes selected providers and generates markdown sections
- Will need new abstract method in FrameworkInstaller base class

## Technical Approach

### 1. Extend OAuthProvider Type

Update `packages/cli/src/installers/types.ts` to add new fields to OAuthProvider interface for metadata storage.

### 2. Populate OAUTH_PROVIDERS Constant

Extend `packages/cli/src/installers/providers.ts` with all 33 providers including:
- 10 popular providers: Google, GitHub, Discord, Apple, Microsoft, Facebook, Twitter/X, LinkedIn, Twitch, Spotify
- 23 additional providers: Atlassian, AWS Cognito, Dropbox, Figma, GitLab, Hugging Face, Kakao, Kick, LINE, Linear, Naver, Notion, Paybin, PayPal, Polar, Reddit, Roblox, Salesforce, Slack, TikTok, Vercel, VK, Zoom

Each provider entry includes:
- Basic metadata (id, name, popular flag)
- Better Auth config snippets (import, socialProvider code, required scopes)
- Environment variable definitions with server/client type
- Documentation URLs (provider setup, Better Auth docs)
- Extra configuration flags and notes
- README template for setup guide

### 3. Add CLI Form with "Show More"

Update `packages/cli/src/index.ts` to implement multi-select OAuth provider prompt:
- Use `checkbox` from `@inquirer/prompts`
- Show popular providers first with separator
- Add `__show_more__` option that expands to show all providers
- Re-prompt with full list if user selects show more
- Return array of selected provider IDs

### 4. Extend String Utils

Add to `packages/cli/src/installers/string-utils.ts`:
- Update `generateOAuthConfigBlock()` to use new betterAuthConfig.socialProvider field
- Add `generateReadmeSection()` function to compile README markdown from selected providers
- Keep existing placeholder replacement logic

### 5. Update FrameworkInstaller Classes

Extend both Next.js and TanStack installers:
- Add new abstract `updateReadme()` method to base class
- Implement `updateReadme()` in both framework classes to insert provider setup sections
- Use README placeholder: `<!-- {{OAUTH_SETUP_GUIDE}} -->`
- Framework-specific environment variable prefix handling (NEXT_PUBLIC_ vs VITE_)

### 6. Environment Variable Prefixes

Update `generateEnvVarsBlock()` to accept framework parameter:
- Next.js client vars: `NEXT_PUBLIC_` prefix
- Vite/TanStack client vars: `VITE_` prefix
- Server vars: No prefix
- Use `type: 'server' | 'client'` from provider env array

## All 33 Supported Providers

### Popular (10)
1. Google
2. GitHub
3. Discord
4. Apple
5. Microsoft
6. Facebook
7. Twitter/X
8. LinkedIn
9. Twitch
10. Spotify

### Additional (23)
11. Atlassian
12. AWS Cognito
13. Dropbox
14. Figma
15. GitLab
16. Hugging Face
17. Kakao
18. Kick
19. LINE
20. Linear
21. Naver
22. Notion
23. Paybin
24. PayPal
25. Polar
26. Reddit
27. Roblox
28. Salesforce
29. Slack
30. TikTok
31. Vercel
32. VK
33. Zoom

## Out of Scope

- OAuth scope customization in CLI (uses provider defaults)
- Provider categorization UI (all shown in single list)
- Custom callback URL configuration (uses Better Auth defaults)
- Framework-specific callback route file generation
- Better Auth import optimization (assume betterAuth import is sufficient)
- Provider icon/logo display in CLI
- Validation of OAuth credentials during setup
- Testing OAuth flow during project creation

## Success Criteria

- CLI form displays 10 popular providers by default
- "Show more" option reveals all 33 providers in expanded view
- Selected providers generate correct Better Auth config syntax in framework-specific auth files
- `.env.example` includes all required environment variables with clear descriptions
- `.env.example` uses correct framework-specific prefixes (NEXT_PUBLIC_ for Next.js, VITE_ for TanStack)
- README includes setup guide for each selected provider with documentation links
- Providers requiring extra config (like GitHub's user:email scope) are clearly documented
- Generated code compiles without errors for both frameworks
- No hardcoded provider strings remain in codebase (all from OAUTH_PROVIDERS constant)
- All 33 providers have complete metadata including docs URLs and setup instructions
