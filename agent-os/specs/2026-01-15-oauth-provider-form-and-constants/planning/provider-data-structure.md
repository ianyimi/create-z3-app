# OAuth Provider Data Structure Reference

This document outlines the complete data structure for each provider in the OAUTH_PROVIDERS constant.

## Per-Provider Structure

```typescript
{
  // Identity
  id: string;                    // Lowercase identifier (e.g., "github")
  name: string;                  // Display name (e.g., "GitHub")
  popular: boolean;              // Show in default "popular" list

  // Better Auth configuration snippets
  betterAuthConfig: {
    import: string;              // Import statement if needed (usually empty)
    socialProvider: string;      // The provider config code block
    scopes?: string[];           // Required OAuth scopes (if any)
  };

  // Environment variables
  env: Array<{
    name: string;                // Variable name (e.g., "GITHUB_CLIENT_ID")
    type: "server" | "client";   // Determines framework-specific prefixing
    description: string;         // Human-readable description for .env comments
  }>;

  // Documentation
  docs: {
    provider: string;            // Provider's OAuth setup docs URL
    betterAuth: string;          // Better Auth provider docs URL
  };

  // Configuration complexity
  requiresExtraConfig: boolean;  // Needs more than clientId/clientSecret
  extraConfigNotes: string;      // Setup instructions if requiresExtraConfig=true

  // README generation
  readme: {
    title: string;               // Section heading
    content: string;             // Complete markdown setup guide
  };
}
```

## Example: Complete GitHub Provider Entry

```typescript
github: {
  id: "github",
  name: "GitHub",
  popular: true,

  betterAuthConfig: {
    import: "",
    socialProvider: `github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }`,
    scopes: ["user:email"],
  },

  env: [
    {
      name: "GITHUB_CLIENT_ID",
      type: "server",
      description: "GitHub OAuth App Client ID",
    },
    {
      name: "GITHUB_CLIENT_SECRET",
      type: "server",
      description: "GitHub OAuth App Client Secret",
    },
  ],

  docs: {
    provider: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app",
    betterAuth: "https://www.better-auth.com/docs/authentication/github",
  },

  requiresExtraConfig: true,
  extraConfigNotes: "You MUST include the user:email scope in your GitHub app. For GitHub Apps, enable Read-Only access to Email Addresses in Permissions.",

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
```

## Data Collection Process

For each of the 33 providers, we need to gather:

### From Better Auth Source Code
- Provider ID (lowercase identifier)
- Configuration pattern (standard clientId/clientSecret or variations)

### From Better Auth Documentation
- Display name
- Setup instructions
- Special requirements
- Required scopes
- Documentation URL

### From Provider's OAuth Documentation
- OAuth app creation URL
- Callback URL patterns
- Special setup notes

## Providers to Document (33 Total)

### Popular (10)
1. ✅ GitHub - Documented
2. ✅ Google - Documented
3. ⏳ Discord
4. ⏳ Apple
5. ⏳ Microsoft
6. ⏳ Facebook
7. ⏳ Twitter/X
8. ⏳ LinkedIn
9. ⏳ Twitch
10. ⏳ Spotify

### Additional (23)
11. ⏳ Atlassian
12. ⏳ AWS Cognito
13. ⏳ Dropbox
14. ⏳ Figma
15. ⏳ GitLab
16. ⏳ Hugging Face
17. ⏳ Kakao
18. ⏳ Kick
19. ⏳ LINE
20. ⏳ Linear
21. ⏳ Naver
22. ⏳ Notion
23. ⏳ Paybin
24. ⏳ PayPal
25. ⏳ Polar
26. ⏳ Reddit
27. ⏳ Roblox
28. ⏳ Salesforce
29. ⏳ Slack
30. ⏳ TikTok
31. ⏳ Vercel
32. ⏳ VK
33. ⏳ Zoom

## Template for Adding New Providers

```typescript
[providerId]: {
  id: "[providerId]",
  name: "[Provider Display Name]",
  popular: false, // true only for top 10

  betterAuthConfig: {
    import: "", // Usually empty unless provider needs explicit import
    socialProvider: `[providerId]: {
      clientId: process.env.[PROVIDER]_CLIENT_ID as string,
      clientSecret: process.env.[PROVIDER]_CLIENT_SECRET as string,
    }`,
    scopes: [], // Add required scopes if any
  },

  env: [
    {
      name: "[PROVIDER]_CLIENT_ID",
      type: "server",
      description: "[Provider] OAuth Client ID",
    },
    {
      name: "[PROVIDER]_CLIENT_SECRET",
      type: "server",
      description: "[Provider] OAuth Client Secret",
    },
  ],

  docs: {
    provider: "[URL to provider's OAuth docs]",
    betterAuth: "https://www.better-auth.com/docs/authentication/[providerId]",
  },

  requiresExtraConfig: false, // Set true if needs extra setup
  extraConfigNotes: "", // Add notes if requiresExtraConfig is true

  readme: {
    title: "[Provider] OAuth Setup",
    content: `## [Provider] OAuth Setup

1. Create OAuth credentials at [URL]
2. Set the redirect URI to: \`http://localhost:3000/api/auth/callback/[providerId]\`
3. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/[providerId]).`,
  },
},
```
