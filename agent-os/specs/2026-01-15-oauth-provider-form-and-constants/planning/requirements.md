# Requirements: OAuth Provider Form and Constants

## Overview
Update the CLI form to collect OAuth provider information and create an OAUTH_PROVIDERS constant object that holds all source code for string replacements during installation.

## User Answers

### 1. Provider Scope
**Decision**: Support all 34 Better Auth providers

### 2. CLI Form Display
**Decision**: Popular first with 'Show more' option
- Show top 10-15 most popular providers by default
- Provide option to expand and show all 34 providers

### 3. OAUTH_PROVIDERS Metadata
The constant object should include:
- ✅ **Documentation URLs**: Links to provider setup guides and Better Auth docs
- ✅ **Extra config requirements**: Flag providers needing more than clientId/clientSecret
- ✅ **Explicit imports**: Track import statements needed for each provider
- ❌ OAuth scopes: Not included in this iteration

### 4. Files Requiring Code Generation
The following files need provider-specific code:

1. **Auth config files** (Required)
   - `convex/auth/index.ts` (TanStack)
   - `lib/auth.ts` (Next.js)
   - For socialProviders config

2. **.env.example** (Required)
   - Environment variable templates
   - Server/client distinction for framework-specific prefixes

3. **README/docs sections** (Required)
   - Getting started guides specific to selected OAuth providers
   - Links to documentation for each selected provider
   - User note: "I may need to add some sort of readme text to the auth providers as well in order to be able to update the readme with getting started guides specific to the oauth providers selected during setup that points to documentation links"

## OAUTH_PROVIDERS Constant Structure

Based on user requirements and Better Auth research, the structure should be:

```typescript
export const OAUTH_PROVIDERS = {
  github: {
    // Basic metadata
    id: "github",
    name: "GitHub",
    popular: true, // Show in default list

    // Better Auth configuration code snippets
    betterAuthConfig: {
      // Import statement (if needed - most providers don't need explicit imports)
      import: "",

      // The provider config object as a string for code generation
      socialProvider: `github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }`,

      // Optional: default scopes if provider requires them
      scopes: ["user:email"], // GitHub specifically needs this
    },

    // Environment variables to generate
    env: [
      {
        name: "GITHUB_CLIENT_ID",
        type: "server" as const, // Server-only by default
        description: "GitHub OAuth App Client ID",
      },
      {
        name: "GITHUB_CLIENT_SECRET",
        type: "server" as const,
        description: "GitHub OAuth App Client Secret",
      },
    ],

    // Documentation links
    docs: {
      provider: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app",
      betterAuth: "https://www.better-auth.com/docs/authentication/github",
    },

    // Indicates if provider needs extra setup beyond clientId/clientSecret
    requiresExtraConfig: true, // GitHub needs user:email scope
    extraConfigNotes: "You MUST include the user:email scope in your GitHub app. For GitHub Apps, enable Read-Only access to Email Addresses in Permissions.",

    // README template for setup guide
    readme: {
      title: "GitHub OAuth Setup",
      content: `## GitHub OAuth Setup

1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Set the Authorization callback URL to: \`http://localhost:3000/api/auth/callback/github\` (update for production)
3. Copy the Client ID and Client Secret to your \`.env\` file
4. **Important**: Include the \`user:email\` scope in your GitHub app permissions

For more details, see the [Better Auth GitHub documentation](https://www.better-auth.com/docs/authentication/github).`,
    },
  },

  google: {
    id: "google",
    name: "Google",
    popular: true,

    betterAuthConfig: {
      import: "",
      socialProvider: `google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }`,
      scopes: [], // Uses default scopes
    },

    env: [
      {
        name: "GOOGLE_CLIENT_ID",
        type: "server" as const,
        description: "Google OAuth Client ID",
      },
      {
        name: "GOOGLE_CLIENT_SECRET",
        type: "server" as const,
        description: "Google OAuth Client Secret",
      },
    ],

    docs: {
      provider: "https://console.cloud.google.com/apis/credentials",
      betterAuth: "https://www.better-auth.com/docs/authentication/google",
    },

    requiresExtraConfig: false,
    extraConfigNotes: "",

    readme: {
      title: "Google OAuth Setup",
      content: `## Google OAuth Setup

1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
2. Set the Authorized redirect URI to: \`http://localhost:3000/api/auth/callback/google\` (update for production)
3. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth Google documentation](https://www.better-auth.com/docs/authentication/google).`,
    },
  },

  // ... pattern repeats for all 33 providers
} as const;

// TypeScript helper types
export type OAuthProviderId = keyof typeof OAUTH_PROVIDERS;
export type OAuthProvider = typeof OAUTH_PROVIDERS[OAuthProviderId];
```

### Constant Usage Example

```typescript
// In FrameworkInstaller classes
const selectedProviders = ["github", "google"];

// Generate socialProviders config
const providersConfig = selectedProviders
  .map(id => OAUTH_PROVIDERS[id].betterAuthConfig.socialProvider)
  .join(",\n    ");

const authConfig = `export const auth = betterAuth({
  socialProviders: {
    ${providersConfig}
  },
});`;

// Generate .env.example
const envVars = selectedProviders
  .flatMap(id => OAUTH_PROVIDERS[id].env)
  .map(v => `${v.name}=${v.description}`)
  .join("\n");

// Generate README sections
const readmeSections = selectedProviders
  .map(id => OAUTH_PROVIDERS[id].readme.content)
  .join("\n\n");
```

## Research Sources

1. **Better Auth Provider List**:
   https://github.com/better-auth/better-auth/blob/2b9cd6d696a515fc696155409f7a6959ce136384/packages/core/src/social-providers/index.ts#L86

2. **Better Auth Apple Provider** (Example):
   Better Auth social provider docs for Apple

3. **Existing Implementation**:
   - `packages/cli/src/installers/providers.ts` - Current simple structure
   - `packages/cli/src/installers/string-utils.ts` - Current hardcoded patterns

## User Decisions

### Popular Providers (Top 10 Default)
**Decision**: Show top 10 providers by default
- Google
- GitHub
- Discord
- Apple
- Microsoft
- Facebook
- Twitter/X
- LinkedIn
- Twitch
- Spotify

### README Template Storage
**Decision**: Store templates in OAUTH_PROVIDERS constant as inline strings

### Environment Variable Prefixes
**Decision**: Use framework-specific prefixes
- Next.js: `NEXT_PUBLIC_` for client-exposed variables
- Vite: `VITE_` for client-exposed variables
- Generic for server-only variables

## All 33 Supported Providers

From Better Auth source code:

1. Apple - `apple`
2. Atlassian - `atlassian`
3. AWS Cognito - `cognito`
4. Discord - `discord`
5. Dropbox - `dropbox`
6. Facebook - `facebook`
7. Figma - `figma`
8. GitHub - `github`
9. GitLab - `gitlab`
10. Google - `google`
11. Hugging Face - `huggingface`
12. Kakao - `kakao`
13. Kick - `kick`
14. LINE - `line`
15. Linear - `linear`
16. LinkedIn - `linkedin`
17. Microsoft Entra ID - `microsoft`
18. Naver - `naver`
19. Notion - `notion`
20. Paybin - `paybin`
21. PayPal - `paypal`
22. Polar - `polar`
23. Reddit - `reddit`
24. Roblox - `roblox`
25. Salesforce - `salesforce`
26. Slack - `slack`
27. Spotify - `spotify`
28. TikTok - `tiktok`
29. Twitch - `twitch`
30. Twitter/X - `twitter`
31. Vercel - `vercel`
32. VK - `vk`
33. Zoom - `zoom`

## Provider Configuration Patterns

Based on Better Auth documentation research:

### Standard Configuration
```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
```

### Environment Variables
- **Naming Pattern**: `{PROVIDER}_CLIENT_ID` and `{PROVIDER}_CLIENT_SECRET` (uppercase)
- **Example**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- All credentials are server-side only by default

### Additional Options
- `scope`: Array of OAuth scopes (e.g., `["email", "profile"]`)
- `redirectURI`: Custom callback URL (defaults to `/api/auth/callback/${providerName}`)
- `disableSignUp`: Prevents new user registration
- `mapProfileToUser`: Custom profile transformation
- `prompt`: Controls auth flow (e.g., "select_account")

### Special Requirements
- **GitHub**: MUST include `user:email` scope
- **GitHub Apps**: Need "Read-Only" email permissions enabled

## Open Questions

1. **Callback routes**: Are callback routes framework-specific or can they be standardized?
   - Next.js: `app/api/auth/callback/[provider]/route.ts`
   - TanStack: Convex handles this differently
   - Better Auth default: `/api/auth/callback/${providerName}`

2. **Provider categories**: How should providers be categorized for potential future grouping?
   - Social Networks (Facebook, Twitter, LinkedIn, Discord, etc.)
   - Developer Tools (GitHub, GitLab, Figma, Linear, etc.)
   - Enterprise (Microsoft, Google, Salesforce, Slack, etc.)
   - Creative/Media (Spotify, Twitch, TikTok, etc.)
   - Asian Market (Kakao, LINE, Naver, etc.)

3. **Scope configuration**: Should the constant include default scopes for each provider?
   - GitHub requires `user:email`
   - Other providers may have recommended scopes

## CLI Form Flow Design

### User Experience Flow

```
? Select OAuth providers for authentication:
  (Use arrow keys, space to select, Enter to confirm)

  Popular Providers:
  ◯ Google
  ◉ GitHub (selected)
  ◯ Discord
  ◯ Apple
  ◯ Microsoft
  ◯ Facebook
  ◯ Twitter/X
  ◯ LinkedIn
  ◯ Twitch
  ◯ Spotify

  ─────────────────────────────────
  > Show more providers (23 additional)
```

If user selects "Show more providers":

```
? Select OAuth providers for authentication:
  (Use arrow keys, space to select, Enter to confirm)

  Popular Providers:
  ◯ Google
  ◉ GitHub (selected)
  [... rest of popular list ...]

  Additional Providers:
  ◯ Atlassian
  ◯ AWS Cognito
  ◯ Dropbox
  ◯ Figma
  ◯ GitLab
  ◯ Hugging Face
  [... all 23 remaining providers ...]

  < Back to popular providers
```

### Implementation Details

Using `@inquirer/prompts`:

```typescript
import { checkbox } from '@inquirer/prompts';

const popularProviders = Object.entries(OAUTH_PROVIDERS)
  .filter(([_, provider]) => provider.popular)
  .map(([id, provider]) => ({
    name: provider.name,
    value: id,
  }));

const additionalProviders = Object.entries(OAUTH_PROVIDERS)
  .filter(([_, provider]) => !provider.popular)
  .map(([id, provider]) => ({
    name: provider.name,
    value: id,
  }));

// Initial prompt shows popular providers + "Show more" option
let showAll = false;

const choices = showAll
  ? [
      new Separator('Popular Providers:'),
      ...popularProviders,
      new Separator('Additional Providers:'),
      ...additionalProviders,
    ]
  : [
      new Separator('Popular Providers:'),
      ...popularProviders,
      { name: '> Show more providers (23 additional)', value: '__show_more__' },
    ];

const selectedProviders = await checkbox({
  message: 'Select OAuth providers for authentication:',
  choices,
});

// Handle "Show more" selection
if (selectedProviders.includes('__show_more__')) {
  showAll = true;
  // Re-prompt with full list
}
```

## File Generation Strategy

### 1. Auth Config File

**Location**:
- Next.js: `lib/auth.ts`
- TanStack: `convex/auth/index.ts`

**Generation**:
```typescript
function generateAuthConfig(selectedProviders: OAuthProviderId[]): string {
  const imports = selectedProviders
    .map(id => OAUTH_PROVIDERS[id].betterAuthConfig.import)
    .filter(Boolean)
    .join('\n');

  const providersConfig = selectedProviders
    .map(id => OAUTH_PROVIDERS[id].betterAuthConfig.socialProvider)
    .join(',\n    ');

  return `import { betterAuth } from "better-auth";
${imports}

export const auth = betterAuth({
  socialProviders: {
    ${providersConfig}
  },
});`;
}
```

### 2. Environment Variables File

**Location**: `.env.example`

**Generation**:
```typescript
function generateEnvExample(
  selectedProviders: OAuthProviderId[],
  framework: 'nextjs' | 'tanstack'
): string {
  const envVars = selectedProviders.flatMap(id => {
    const provider = OAUTH_PROVIDERS[id];
    return provider.env.map(v => {
      // Add framework-specific prefix for client vars
      const prefix = v.type === 'client' && framework === 'nextjs'
        ? 'NEXT_PUBLIC_'
        : v.type === 'client' && framework === 'tanstack'
        ? 'VITE_'
        : '';

      return `# ${v.description}\n${prefix}${v.name}=`;
    });
  });

  return `# OAuth Provider Credentials\n\n${envVars.join('\n\n')}`;
}
```

### 3. README Sections

**Location**: Project root `README.md`

**Generation**:
```typescript
function generateReadmeSections(selectedProviders: OAuthProviderId[]): string {
  const sections = selectedProviders.map(id => {
    const provider = OAUTH_PROVIDERS[id];
    return provider.readme.content;
  });

  return `# OAuth Provider Setup

${sections.join('\n\n---\n\n')}`;
}
```

## Next Steps

1. ✅ Fetch all 33 provider implementations from Better Auth
2. ✅ Define complete OAUTH_PROVIDERS constant structure
3. ✅ Determine which 10 providers are "popular" defaults
4. ✅ Create README template format
5. ✅ Design CLI form flow with "Show more" functionality
6. ⏳ Populate OAUTH_PROVIDERS constant with all 33 providers
7. ⏳ Update CLI prompt logic to use new constant
8. ⏳ Update FrameworkInstaller classes to use new generation functions
