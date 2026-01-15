# Spec Summary: OAuth Provider Form and Constants

## Feature Overview

Enhance the create-z3-app CLI to support all 33 Better Auth OAuth providers through:
1. An improved multi-select form with "popular" and "show more" options
2. A comprehensive OAUTH_PROVIDERS constant containing all provider configuration data
3. Automated generation of auth config, environment variables, and README documentation

## Key Decisions

### Scope
- ✅ Support all 33 Better Auth OAuth providers
- ✅ Show top 10 popular providers by default
- ✅ "Show more" option to reveal remaining 23 providers

### Data Structure
- ✅ Create OAUTH_PROVIDERS constant object
- ✅ Store provider metadata inline (not separate files)
- ✅ Include: config snippets, env vars, docs URLs, README templates

### CLI Experience
- ✅ Multi-select checkbox form using @inquirer/prompts
- ✅ Popular providers listed first
- ✅ Expandable to show all providers
- ✅ Group separators for visual organization

### Code Generation
- ✅ Framework-specific environment variable prefixes (NEXT_PUBLIC_, VITE_)
- ✅ Generate auth config files (lib/auth.ts or convex/auth/index.ts)
- ✅ Generate .env.example with descriptive comments
- ✅ Generate README sections with setup guides per selected provider

## Popular Providers (Top 10)

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

## OAUTH_PROVIDERS Structure

Each provider entry contains:

```typescript
{
  id: string;                    // Lowercase identifier
  name: string;                  // Display name
  popular: boolean;              // Show in default list
  betterAuthConfig: {
    import: string;              // Import if needed
    socialProvider: string;      // Config code snippet
    scopes?: string[];           // Required scopes
  };
  env: Array<{
    name: string;                // Env var name
    type: "server" | "client";   // Determines prefixing
    description: string;         // Comment for .env
  }>;
  docs: {
    provider: string;            // Provider's OAuth docs
    betterAuth: string;          // Better Auth docs
  };
  requiresExtraConfig: boolean;  // Needs extra setup?
  extraConfigNotes: string;      // Setup instructions
  readme: {
    title: string;               // Section heading
    content: string;             // Markdown setup guide
  };
}
```

## Files to Modify/Create

### New Files
1. **`packages/cli/src/constants/oauth-providers.ts`**
   - Complete OAUTH_PROVIDERS constant
   - All 33 provider definitions
   - Type exports

### Files to Update
1. **CLI Prompts** (location TBD)
   - Update OAuth provider selection prompt
   - Add "show more" functionality
   - Use OAUTH_PROVIDERS constant

2. **FrameworkInstaller Classes**
   - Next.js installer: Update auth config generation
   - TanStack installer: Update auth config generation
   - Both: Update .env.example generation
   - Both: Add README section generation

3. **String Utilities** (`packages/cli/src/installers/string-utils.ts`)
   - Remove hardcoded provider patterns
   - Use OAUTH_PROVIDERS constant for generation
   - Add README section generator

4. **Existing Providers File** (`packages/cli/src/installers/providers.ts`)
   - May be replaced by new oauth-providers.ts
   - Or refactored to use new constant structure

## Implementation Phases

### Phase 1: Data Collection
- Gather documentation URLs for all 33 providers
- Document special requirements (scopes, extra config)
- Write README templates for each provider

### Phase 2: Constant Creation
- Create `oauth-providers.ts` file
- Populate all 33 provider entries
- Add TypeScript types and helpers

### Phase 3: CLI Form Update
- Implement "show more" functionality
- Update prompt to use new constant
- Test user experience flow

### Phase 4: Code Generation
- Update auth config generation functions
- Update .env.example generation
- Add README section generation
- Update both FrameworkInstaller classes

### Phase 5: Testing & Documentation
- Test with all providers
- Verify generated code compiles
- Update project documentation

## Open Items

### Need to Determine
1. **Callback routes**: Whether to generate framework-specific callback route files
2. **Provider categories**: Official categorization for potential future features
3. **Scope defaults**: Which providers need default scopes beyond clientId/clientSecret

### Need to Research
For each of the 31 remaining providers (besides GitHub and Google):
- Provider OAuth documentation URL
- Better Auth documentation URL (if available)
- Special setup requirements
- Required scopes
- Whether it needs extra configuration

## Success Criteria

1. ✅ CLI form shows 10 popular providers by default
2. ✅ "Show more" option reveals all 33 providers
3. ✅ Generated auth config includes selected providers with correct syntax
4. ✅ .env.example includes all required variables with descriptions
5. ✅ README includes setup guides for selected providers with documentation links
6. ✅ Framework-specific prefixes applied correctly (NEXT_PUBLIC_, VITE_)
7. ✅ No hardcoded provider strings in codebase (all from constant)

## References

### Better Auth Documentation
- [OAuth Concepts](https://www.better-auth.com/docs/concepts/oauth)
- [GitHub Provider](https://www.better-auth.com/docs/authentication/github)
- [Other Social Providers](https://www.better-auth.com/docs/authentication/other-social-providers)

### Provider Source Code
- [Better Auth Providers Index](https://github.com/better-auth/better-auth/blob/2b9cd6d696a515fc696155409f7a6959ce136384/packages/core/src/social-providers/index.ts#L86)

### Existing Implementation
- `packages/cli/src/installers/providers.ts` - Current simple provider list
- `packages/cli/src/installers/string-utils.ts` - Current hardcoded generation patterns
