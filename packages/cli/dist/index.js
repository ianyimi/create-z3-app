#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import { select, input, checkbox, confirm, Separator } from "@inquirer/prompts";
import chalk2 from "chalk";
import { readFileSync } from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2, join as join3 } from "path";

// src/utils/validation.ts
import validateNpmPackageName from "validate-npm-package-name";
import fs from "fs-extra";
import { basename } from "path";
function validateProjectName(name) {
  const result = validateNpmPackageName(name);
  if (result.validForNewPackages) {
    return { valid: true, errors: [] };
  }
  const errors = [];
  if (result.errors) {
    errors.push(...result.errors);
  }
  if (result.warnings) {
    errors.push(...result.warnings);
  }
  return { valid: false, errors };
}
async function checkDirectoryExists(targetPath) {
  return await fs.pathExists(targetPath);
}
async function isDirectoryEmpty(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const visibleFiles = files.filter((file) => !file.startsWith("."));
    return visibleFiles.length === 0;
  } catch (error) {
    return true;
  }
}
function resolveProjectName(input2, cwd) {
  if (input2 === ".") {
    const dirName = basename(cwd);
    const validation = validateProjectName(dirName);
    if (!validation.valid) {
      return dirName;
    }
    return dirName;
  }
  return input2;
}

// src/helpers/fileOperations.ts
import fs2 from "fs-extra";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
async function createProjectDirectory(projectName, cwd) {
  if (projectName === ".") {
    return cwd;
  }
  const targetPath = getTargetDirectory(projectName, cwd);
  await fs2.ensureDir(targetPath);
  return targetPath;
}
function getTargetDirectory(projectName, cwd) {
  if (projectName === ".") {
    return cwd;
  }
  return join(cwd, projectName);
}
async function copyTemplate(framework, targetPath) {
  const __filename2 = fileURLToPath(import.meta.url);
  const __dirname2 = dirname(__filename2);
  const templateDir = framework === "tanstack" ? "tanstack-start" : "nextjs";
  const templatePath = join(__dirname2, "../templates", templateDir);
  await fs2.copy(templatePath, targetPath, {
    overwrite: false,
    errorOnExist: false
  });
}

// src/utils/messages.ts
import chalk from "chalk";
function displayDirectoryExistsError(dirName) {
  console.error();
  console.error(chalk.red(`Error: Directory '${dirName}' already exists.`));
  console.error(chalk.yellow("Please choose a different name or remove the existing directory."));
  console.error();
  process.exit(1);
}
function displayInvalidNameError(name, errors) {
  console.error();
  console.error(chalk.red(`Error: Invalid project name '${name}'.`));
  console.error();
  if (errors.length > 0) {
    console.error(chalk.yellow("Validation errors:"));
    errors.forEach((error) => {
      console.error(chalk.yellow(`  - ${error}`));
    });
    console.error();
  }
  console.error(chalk.yellow("Project names must be valid npm package names."));
  console.error(chalk.yellow("They should be lowercase, contain no spaces, and use hyphens for word separation."));
  console.error();
  process.exit(1);
}
function displayDirectoryNotEmptyError() {
  console.error();
  console.error(chalk.red("Error: Current directory is not empty."));
  console.error(chalk.yellow("Please use a different directory or provide a project name."));
  console.error();
  process.exit(1);
}
function displayPermissionError(path) {
  console.error();
  console.error(chalk.red(`Error: Permission denied when creating '${path}'.`));
  console.error(chalk.yellow("Please check your directory permissions."));
  console.error();
  process.exit(1);
}
function displaySuccessMessage(projectName, targetPath, isCurrentDir) {
  console.log();
  if (isCurrentDir) {
    console.log(chalk.green(`\u2713 Successfully created project '${projectName}' in current directory`));
  } else {
    console.log(chalk.green(`\u2713 Successfully created project '${projectName}' at ${targetPath}`));
  }
  console.log();
}

// src/installers/providers.ts
var OAUTH_PROVIDERS = {
  // ========================================
  // POPULAR PROVIDERS (10)
  // ========================================
  google: {
    id: "google",
    name: "Google",
    envPrefix: "GOOGLE",
    clientIdVar: "GOOGLE_CLIENT_ID",
    clientSecretVar: "GOOGLE_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"google"',
      socialProvider: `google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "GOOGLE_CLIENT_ID",
        type: "server",
        description: "Google OAuth Client ID"
      },
      {
        name: "GOOGLE_CLIENT_SECRET",
        type: "server",
        description: "Google OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://console.cloud.google.com/apis/credentials",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Google OAuth Setup",
      content: `## Google OAuth Setup

1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
2. Set the Authorized redirect URI to: \`http://localhost:3000/api/auth/callback/google\` (update for production)
3. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  github: {
    id: "github",
    name: "GitHub",
    envPrefix: "GITHUB",
    clientIdVar: "GITHUB_CLIENT_ID",
    clientSecretVar: "GITHUB_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"github"',
      socialProvider: `github({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    })`,
      scopes: ["user:email"]
    },
    env: [
      {
        name: "GITHUB_CLIENT_ID",
        type: "server",
        description: "GitHub OAuth App Client ID"
      },
      {
        name: "GITHUB_CLIENT_SECRET",
        type: "server",
        description: "GitHub OAuth App Client Secret"
      }
    ],
    docs: {
      provider: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
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

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  discord: {
    id: "discord",
    name: "Discord",
    envPrefix: "DISCORD",
    clientIdVar: "DISCORD_CLIENT_ID",
    clientSecretVar: "DISCORD_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"discord"',
      socialProvider: `discord({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "DISCORD_CLIENT_ID",
        type: "server",
        description: "Discord OAuth Application Client ID"
      },
      {
        name: "DISCORD_CLIENT_SECRET",
        type: "server",
        description: "Discord OAuth Application Client Secret"
      }
    ],
    docs: {
      provider: "https://discord.com/developers/applications",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "You can optionally add a permissions field to request additional Discord permissions.",
    readme: {
      title: "Discord OAuth Setup",
      content: `## Discord OAuth Setup

1. Create an application at https://discord.com/developers/applications
2. Add a redirect URL: \`http://localhost:3000/api/auth/callback/discord\` (update for production)
3. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  apple: {
    id: "apple",
    name: "Apple",
    envPrefix: "APPLE",
    clientIdVar: "APPLE_CLIENT_ID",
    clientSecretVar: "APPLE_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"apple"',
      socialProvider: `apple({
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: process.env.APPLE_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "APPLE_CLIENT_ID",
        type: "server",
        description: "Apple Sign In Service ID"
      },
      {
        name: "APPLE_CLIENT_SECRET",
        type: "server",
        description: "Apple Sign In Client Secret (JWT token)"
      }
    ],
    docs: {
      provider: "https://developer.apple.com/sign-in-with-apple/get-started/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: "Apple requires additional configuration: clientId is your Service ID, clientSecret must be a JWT token generated from your Team ID, Key ID, and Private Key. You may also need to provide appBundleIdentifier for iOS apps.",
    readme: {
      title: "Apple Sign In Setup",
      content: `## Apple Sign In Setup

1. Create a Sign In with Apple service at https://developer.apple.com
2. Configure your Service ID and return URLs
3. Generate a client secret JWT using your private key, Team ID, and Key ID
4. Add credentials to your \`.env\` file

**Note**: The clientSecret must be a JWT token generated from your Apple credentials, not a standard client secret.

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  microsoft: {
    id: "microsoft",
    name: "Microsoft",
    envPrefix: "MICROSOFT",
    clientIdVar: "MICROSOFT_CLIENT_ID",
    clientSecretVar: "MICROSOFT_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"microsoft"',
      socialProvider: `microsoft({
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID,
    })`,
      scopes: []
    },
    env: [
      {
        name: "MICROSOFT_CLIENT_ID",
        type: "server",
        description: "Microsoft Entra ID Application (client) ID"
      },
      {
        name: "MICROSOFT_CLIENT_SECRET",
        type: "server",
        description: "Microsoft Entra ID Client Secret"
      },
      {
        name: "MICROSOFT_TENANT_ID",
        type: "server",
        description: 'Microsoft Entra ID Tenant ID (optional, defaults to "common")'
      }
    ],
    docs: {
      provider: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: 'Optional fields: tenantId (defaults to "common"), authority (custom authority URL), prompt (consent behavior).',
    readme: {
      title: "Microsoft Entra ID OAuth Setup",
      content: `## Microsoft Entra ID OAuth Setup

1. Register an application at https://portal.azure.com
2. Add a redirect URI: \`http://localhost:3000/api/auth/callback/microsoft\` (update for production)
3. Create a client secret in "Certificates & secrets"
4. Copy the Application (client) ID and Client Secret to your \`.env\` file
5. (Optional) Copy the Directory (tenant) ID if you want to restrict to a specific tenant

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    envPrefix: "FACEBOOK",
    clientIdVar: "FACEBOOK_CLIENT_ID",
    clientSecretVar: "FACEBOOK_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"facebook"',
      socialProvider: `facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "FACEBOOK_CLIENT_ID",
        type: "server",
        description: "Facebook App ID"
      },
      {
        name: "FACEBOOK_CLIENT_SECRET",
        type: "server",
        description: "Facebook App Secret"
      }
    ],
    docs: {
      provider: "https://developers.facebook.com/apps/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Facebook supports custom scopes and fields arrays to request additional user data.",
    readme: {
      title: "Facebook OAuth Setup",
      content: `## Facebook OAuth Setup

1. Create an app at https://developers.facebook.com/apps/
2. Add Facebook Login product to your app
3. Add OAuth redirect URI: \`http://localhost:3000/api/auth/callback/facebook\` (update for production)
4. Copy the App ID and App Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  twitter: {
    id: "twitter",
    name: "Twitter/X",
    envPrefix: "TWITTER",
    clientIdVar: "TWITTER_CLIENT_ID",
    clientSecretVar: "TWITTER_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"twitter"',
      socialProvider: `twitter({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "TWITTER_CLIENT_ID",
        type: "server",
        description: "Twitter/X OAuth 2.0 Client ID"
      },
      {
        name: "TWITTER_CLIENT_SECRET",
        type: "server",
        description: "Twitter/X OAuth 2.0 Client Secret"
      }
    ],
    docs: {
      provider: "https://developer.twitter.com/en/portal/projects-and-apps",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Twitter/X OAuth Setup",
      content: `## Twitter/X OAuth Setup

1. Create an app at https://developer.twitter.com/en/portal/projects-and-apps
2. Enable OAuth 2.0 authentication
3. Add callback URL: \`http://localhost:3000/api/auth/callback/twitter\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    envPrefix: "LINKEDIN",
    clientIdVar: "LINKEDIN_CLIENT_ID",
    clientSecretVar: "LINKEDIN_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"linkedin"',
      socialProvider: `linkedin({
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "LINKEDIN_CLIENT_ID",
        type: "server",
        description: "LinkedIn OAuth Client ID"
      },
      {
        name: "LINKEDIN_CLIENT_SECRET",
        type: "server",
        description: "LinkedIn OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://www.linkedin.com/developers/apps",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "LinkedIn OAuth Setup",
      content: `## LinkedIn OAuth Setup

1. Create an app at https://www.linkedin.com/developers/apps
2. Add redirect URL: \`http://localhost:3000/api/auth/callback/linkedin\` (update for production)
3. Request access to Sign In with LinkedIn
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  twitch: {
    id: "twitch",
    name: "Twitch",
    envPrefix: "TWITCH",
    clientIdVar: "TWITCH_CLIENT_ID",
    clientSecretVar: "TWITCH_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"twitch"',
      socialProvider: `twitch({
      clientId: process.env.TWITCH_CLIENT_ID as string,
      clientSecret: process.env.TWITCH_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "TWITCH_CLIENT_ID",
        type: "server",
        description: "Twitch Application Client ID"
      },
      {
        name: "TWITCH_CLIENT_SECRET",
        type: "server",
        description: "Twitch Application Client Secret"
      }
    ],
    docs: {
      provider: "https://dev.twitch.tv/console/apps",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Twitch OAuth Setup",
      content: `## Twitch OAuth Setup

1. Register an application at https://dev.twitch.tv/console/apps
2. Set OAuth Redirect URL to: \`http://localhost:3000/api/auth/callback/twitch\` (update for production)
3. Copy the Client ID and generate a Client Secret
4. Add credentials to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  spotify: {
    id: "spotify",
    name: "Spotify",
    envPrefix: "SPOTIFY",
    clientIdVar: "SPOTIFY_CLIENT_ID",
    clientSecretVar: "SPOTIFY_CLIENT_SECRET",
    popular: true,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"spotify"',
      socialProvider: `spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "SPOTIFY_CLIENT_ID",
        type: "server",
        description: "Spotify App Client ID"
      },
      {
        name: "SPOTIFY_CLIENT_SECRET",
        type: "server",
        description: "Spotify App Client Secret"
      }
    ],
    docs: {
      provider: "https://developer.spotify.com/dashboard/applications",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Spotify OAuth Setup",
      content: `## Spotify OAuth Setup

1. Create an app at https://developer.spotify.com/dashboard/applications
2. Add redirect URI: \`http://localhost:3000/api/auth/callback/spotify\` (update for production)
3. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  // ========================================
  // ADDITIONAL PROVIDERS (23)
  // ========================================
  atlassian: {
    id: "atlassian",
    name: "Atlassian",
    envPrefix: "ATLASSIAN",
    clientIdVar: "ATLASSIAN_CLIENT_ID",
    clientSecretVar: "ATLASSIAN_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"atlassian"',
      socialProvider: `atlassian({
      clientId: process.env.ATLASSIAN_CLIENT_ID as string,
      clientSecret: process.env.ATLASSIAN_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "ATLASSIAN_CLIENT_ID",
        type: "server",
        description: "Atlassian OAuth 2.0 Client ID"
      },
      {
        name: "ATLASSIAN_CLIENT_SECRET",
        type: "server",
        description: "Atlassian OAuth 2.0 Client Secret"
      }
    ],
    docs: {
      provider: "https://developer.atlassian.com/console/myapps/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Default scopes include read:jira-user, read:jira-work, and offline_access.",
    readme: {
      title: "Atlassian OAuth Setup",
      content: `## Atlassian OAuth Setup

1. Create an app at https://developer.atlassian.com/console/myapps/
2. Configure OAuth 2.0 integration
3. Add callback URL: \`http://localhost:3000/api/auth/callback/atlassian\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  cognito: {
    id: "cognito",
    name: "AWS Cognito",
    envPrefix: "COGNITO",
    clientIdVar: "COGNITO_CLIENT_ID",
    clientSecretVar: "COGNITO_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"cognito"',
      socialProvider: `cognito({
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
      domain: process.env.COGNITO_DOMAIN as string,
      region: process.env.COGNITO_REGION as string,
      userPoolId: process.env.COGNITO_USER_POOL_ID as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "COGNITO_CLIENT_ID",
        type: "server",
        description: "AWS Cognito App Client ID"
      },
      {
        name: "COGNITO_CLIENT_SECRET",
        type: "server",
        description: "AWS Cognito App Client Secret"
      },
      {
        name: "COGNITO_DOMAIN",
        type: "server",
        description: "AWS Cognito domain (e.g., your-domain.auth.us-east-1.amazoncognito.com)"
      },
      {
        name: "COGNITO_REGION",
        type: "server",
        description: "AWS region (e.g., us-east-1)"
      },
      {
        name: "COGNITO_USER_POOL_ID",
        type: "server",
        description: "AWS Cognito User Pool ID"
      }
    ],
    docs: {
      provider: "https://console.aws.amazon.com/cognito/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: "AWS Cognito requires domain, region, and userPoolId in addition to clientId and clientSecret.",
    readme: {
      title: "AWS Cognito OAuth Setup",
      content: `## AWS Cognito OAuth Setup

1. Create a User Pool at https://console.aws.amazon.com/cognito/
2. Configure an App Client with OAuth 2.0 flows
3. Set up a Cognito domain for your user pool
4. Add callback URL: \`http://localhost:3000/api/auth/callback/cognito\` (update for production)
5. Copy the following to your \`.env\` file:
   - App Client ID
   - App Client Secret
   - Cognito Domain
   - AWS Region
   - User Pool ID

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  dropbox: {
    id: "dropbox",
    name: "Dropbox",
    envPrefix: "DROPBOX",
    clientIdVar: "DROPBOX_CLIENT_ID",
    clientSecretVar: "DROPBOX_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"dropbox"',
      socialProvider: `dropbox({
      clientId: process.env.DROPBOX_CLIENT_ID as string,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "DROPBOX_CLIENT_ID",
        type: "server",
        description: "Dropbox App Key"
      },
      {
        name: "DROPBOX_CLIENT_SECRET",
        type: "server",
        description: "Dropbox App Secret"
      }
    ],
    docs: {
      provider: "https://www.dropbox.com/developers/apps",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Dropbox OAuth Setup",
      content: `## Dropbox OAuth Setup

1. Create an app at https://www.dropbox.com/developers/apps
2. Choose OAuth 2 settings
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/dropbox\` (update for production)
4. Copy the App Key and App Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  figma: {
    id: "figma",
    name: "Figma",
    envPrefix: "FIGMA",
    clientIdVar: "FIGMA_CLIENT_ID",
    clientSecretVar: "FIGMA_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"figma"',
      socialProvider: `figma({
      clientId: process.env.FIGMA_CLIENT_ID as string,
      clientSecret: process.env.FIGMA_CLIENT_SECRET as string,
      clientKey: process.env.FIGMA_CLIENT_KEY as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "FIGMA_CLIENT_ID",
        type: "server",
        description: "Figma OAuth Client ID"
      },
      {
        name: "FIGMA_CLIENT_SECRET",
        type: "server",
        description: "Figma OAuth Client Secret"
      },
      {
        name: "FIGMA_CLIENT_KEY",
        type: "server",
        description: "Figma OAuth Client Key"
      }
    ],
    docs: {
      provider: "https://www.figma.com/developers/apps",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: "Figma requires a clientKey in addition to clientId and clientSecret.",
    readme: {
      title: "Figma OAuth Setup",
      content: `## Figma OAuth Setup

1. Create an app at https://www.figma.com/developers/apps
2. Configure OAuth settings
3. Add callback URL: \`http://localhost:3000/api/auth/callback/figma\` (update for production)
4. Copy the Client ID, Client Secret, and Client Key to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  gitlab: {
    id: "gitlab",
    name: "GitLab",
    envPrefix: "GITLAB",
    clientIdVar: "GITLAB_CLIENT_ID",
    clientSecretVar: "GITLAB_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"gitlab"',
      socialProvider: `gitlab({
      clientId: process.env.GITLAB_CLIENT_ID as string,
      clientSecret: process.env.GITLAB_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "GITLAB_CLIENT_ID",
        type: "server",
        description: "GitLab Application ID"
      },
      {
        name: "GITLAB_CLIENT_SECRET",
        type: "server",
        description: "GitLab Application Secret"
      }
    ],
    docs: {
      provider: "https://gitlab.com/-/profile/applications",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Optionally supports an issuer field for self-hosted GitLab instances.",
    readme: {
      title: "GitLab OAuth Setup",
      content: `## GitLab OAuth Setup

1. Create an application at https://gitlab.com/-/profile/applications
2. Add redirect URI: \`http://localhost:3000/api/auth/callback/gitlab\` (update for production)
3. Select the required scopes (read_user is recommended)
4. Copy the Application ID and Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  huggingface: {
    id: "huggingface",
    name: "Hugging Face",
    envPrefix: "HUGGINGFACE",
    clientIdVar: "HUGGINGFACE_CLIENT_ID",
    clientSecretVar: "HUGGINGFACE_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"huggingface"',
      socialProvider: `huggingface({
      clientId: process.env.HUGGINGFACE_CLIENT_ID as string,
      clientSecret: process.env.HUGGINGFACE_CLIENT_SECRET as string,
    })`,
      scopes: ["email"]
    },
    env: [
      {
        name: "HUGGINGFACE_CLIENT_ID",
        type: "server",
        description: "Hugging Face OAuth Client ID"
      },
      {
        name: "HUGGINGFACE_CLIENT_SECRET",
        type: "server",
        description: "Hugging Face OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://huggingface.co/settings/connected-applications",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: "You MUST include the email scope for Hugging Face.",
    readme: {
      title: "Hugging Face OAuth Setup",
      content: `## Hugging Face OAuth Setup

1. Create an OAuth app at https://huggingface.co/settings/connected-applications
2. Set redirect URI to: \`http://localhost:3000/api/auth/callback/huggingface\` (update for production)
3. Copy the Client ID and Client Secret to your \`.env\` file
4. **Important**: Make sure to include the \`email\` scope in your configuration

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  kakao: {
    id: "kakao",
    name: "Kakao",
    envPrefix: "KAKAO",
    clientIdVar: "KAKAO_CLIENT_ID",
    clientSecretVar: "KAKAO_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"kakao"',
      socialProvider: `kakao({
      clientId: process.env.KAKAO_CLIENT_ID as string,
      clientSecret: process.env.KAKAO_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "KAKAO_CLIENT_ID",
        type: "server",
        description: "Kakao REST API Key"
      },
      {
        name: "KAKAO_CLIENT_SECRET",
        type: "server",
        description: "Kakao Client Secret"
      }
    ],
    docs: {
      provider: "https://developers.kakao.com/console/app",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Kakao OAuth Setup",
      content: `## Kakao OAuth Setup

1. Create an application at https://developers.kakao.com/console/app
2. Enable Kakao Login in the app settings
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/kakao\` (update for production)
4. Copy the REST API Key and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  kick: {
    id: "kick",
    name: "Kick",
    envPrefix: "KICK",
    clientIdVar: "KICK_CLIENT_ID",
    clientSecretVar: "KICK_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"kick"',
      socialProvider: `kick({
      clientId: process.env.KICK_CLIENT_ID as string,
      clientSecret: process.env.KICK_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "KICK_CLIENT_ID",
        type: "server",
        description: "Kick OAuth Client ID"
      },
      {
        name: "KICK_CLIENT_SECRET",
        type: "server",
        description: "Kick OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://dev.kick.com/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Kick OAuth Setup",
      content: `## Kick OAuth Setup

1. Create an application at https://dev.kick.com/
2. Configure OAuth settings
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/kick\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  line: {
    id: "line",
    name: "LINE",
    envPrefix: "LINE",
    clientIdVar: "LINE_CLIENT_ID",
    clientSecretVar: "LINE_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"line"',
      socialProvider: `line({
      clientId: process.env.LINE_CLIENT_ID as string,
      clientSecret: process.env.LINE_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "LINE_CLIENT_ID",
        type: "server",
        description: "LINE Channel ID"
      },
      {
        name: "LINE_CLIENT_SECRET",
        type: "server",
        description: "LINE Channel Secret"
      }
    ],
    docs: {
      provider: "https://developers.line.biz/console/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Supports multi-channel configuration.",
    readme: {
      title: "LINE OAuth Setup",
      content: `## LINE OAuth Setup

1. Create a channel at https://developers.line.biz/console/
2. Enable LINE Login
3. Add callback URL: \`http://localhost:3000/api/auth/callback/line\` (update for production)
4. Copy the Channel ID and Channel Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  linear: {
    id: "linear",
    name: "Linear",
    envPrefix: "LINEAR",
    clientIdVar: "LINEAR_CLIENT_ID",
    clientSecretVar: "LINEAR_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"linear"',
      socialProvider: `linear({
      clientId: process.env.LINEAR_CLIENT_ID as string,
      clientSecret: process.env.LINEAR_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "LINEAR_CLIENT_ID",
        type: "server",
        description: "Linear OAuth Client ID"
      },
      {
        name: "LINEAR_CLIENT_SECRET",
        type: "server",
        description: "Linear OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://linear.app/settings/api",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Supports custom scope options.",
    readme: {
      title: "Linear OAuth Setup",
      content: `## Linear OAuth Setup

1. Create an OAuth application at https://linear.app/settings/api
2. Add redirect URL: \`http://localhost:3000/api/auth/callback/linear\` (update for production)
3. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  naver: {
    id: "naver",
    name: "Naver",
    envPrefix: "NAVER",
    clientIdVar: "NAVER_CLIENT_ID",
    clientSecretVar: "NAVER_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"naver"',
      socialProvider: `naver({
      clientId: process.env.NAVER_CLIENT_ID as string,
      clientSecret: process.env.NAVER_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "NAVER_CLIENT_ID",
        type: "server",
        description: "Naver Client ID"
      },
      {
        name: "NAVER_CLIENT_SECRET",
        type: "server",
        description: "Naver Client Secret"
      }
    ],
    docs: {
      provider: "https://developers.naver.com/apps/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Naver OAuth Setup",
      content: `## Naver OAuth Setup

1. Register an application at https://developers.naver.com/apps/
2. Configure Login API settings
3. Add callback URL: \`http://localhost:3000/api/auth/callback/naver\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  notion: {
    id: "notion",
    name: "Notion",
    envPrefix: "NOTION",
    clientIdVar: "NOTION_CLIENT_ID",
    clientSecretVar: "NOTION_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"notion"',
      socialProvider: `notion({
      clientId: process.env.NOTION_CLIENT_ID as string,
      clientSecret: process.env.NOTION_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "NOTION_CLIENT_ID",
        type: "server",
        description: "Notion OAuth Client ID"
      },
      {
        name: "NOTION_CLIENT_SECRET",
        type: "server",
        description: "Notion OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://www.notion.so/my-integrations",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "Notion OAuth Setup",
      content: `## Notion OAuth Setup

1. Create an integration at https://www.notion.so/my-integrations
2. Configure OAuth settings and capabilities
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/notion\` (update for production)
4. Copy the OAuth Client ID and Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  paybin: {
    id: "paybin",
    name: "Paybin",
    envPrefix: "PAYBIN",
    clientIdVar: "PAYBIN_CLIENT_ID",
    clientSecretVar: "PAYBIN_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"paybin"',
      socialProvider: `paybin({
      clientId: process.env.PAYBIN_CLIENT_ID as string,
      clientSecret: process.env.PAYBIN_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "PAYBIN_CLIENT_ID",
        type: "server",
        description: "Paybin OAuth Client ID"
      },
      {
        name: "PAYBIN_CLIENT_SECRET",
        type: "server",
        description: "Paybin OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://paybin.io/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Uses OpenID Connect scopes.",
    readme: {
      title: "Paybin OAuth Setup",
      content: `## Paybin OAuth Setup

1. Create an application at https://paybin.io/
2. Configure OAuth settings
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/paybin\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  paypal: {
    id: "paypal",
    name: "PayPal",
    envPrefix: "PAYPAL",
    clientIdVar: "PAYPAL_CLIENT_ID",
    clientSecretVar: "PAYPAL_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"paypal"',
      socialProvider: `paypal({
      clientId: process.env.PAYPAL_CLIENT_ID as string,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET as string,
      environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
    })`,
      scopes: []
    },
    env: [
      {
        name: "PAYPAL_CLIENT_ID",
        type: "server",
        description: "PayPal REST API Client ID"
      },
      {
        name: "PAYPAL_CLIENT_SECRET",
        type: "server",
        description: "PayPal REST API Secret"
      },
      {
        name: "PAYPAL_ENVIRONMENT",
        type: "server",
        description: 'PayPal environment: "sandbox" or "live" (default: sandbox)'
      }
    ],
    docs: {
      provider: "https://developer.paypal.com/dashboard/applications",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: "PayPal supports environment (sandbox/live) and requestShippingAddress options.",
    readme: {
      title: "PayPal OAuth Setup",
      content: `## PayPal OAuth Setup

1. Create an app at https://developer.paypal.com/dashboard/applications
2. Configure OAuth settings in the app
3. Add return URL: \`http://localhost:3000/api/auth/callback/paypal\` (update for production)
4. Copy the Client ID and Secret to your \`.env\` file
5. Set PAYPAL_ENVIRONMENT to "sandbox" for testing or "live" for production

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  polar: {
    id: "polar",
    name: "Polar",
    envPrefix: "POLAR",
    clientIdVar: "POLAR_CLIENT_ID",
    clientSecretVar: "POLAR_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"polar"',
      socialProvider: `polar({
      clientId: process.env.POLAR_CLIENT_ID as string,
      clientSecret: process.env.POLAR_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "POLAR_CLIENT_ID",
        type: "server",
        description: "Polar OAuth Client ID"
      },
      {
        name: "POLAR_CLIENT_SECRET",
        type: "server",
        description: "Polar OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://polar.sh/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Uses OpenID Connect scopes.",
    readme: {
      title: "Polar OAuth Setup",
      content: `## Polar OAuth Setup

1. Create an OAuth application at https://polar.sh/
2. Configure OAuth settings
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/polar\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  reddit: {
    id: "reddit",
    name: "Reddit",
    envPrefix: "REDDIT",
    clientIdVar: "REDDIT_CLIENT_ID",
    clientSecretVar: "REDDIT_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"reddit"',
      socialProvider: `reddit({
      clientId: process.env.REDDIT_CLIENT_ID as string,
      clientSecret: process.env.REDDIT_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "REDDIT_CLIENT_ID",
        type: "server",
        description: "Reddit App Client ID"
      },
      {
        name: "REDDIT_CLIENT_SECRET",
        type: "server",
        description: "Reddit App Client Secret"
      }
    ],
    docs: {
      provider: "https://www.reddit.com/prefs/apps",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Supports duration and scope fields for custom access.",
    readme: {
      title: "Reddit OAuth Setup",
      content: `## Reddit OAuth Setup

1. Create an app at https://www.reddit.com/prefs/apps
2. Choose "web app" as the app type
3. Set redirect URI to: \`http://localhost:3000/api/auth/callback/reddit\` (update for production)
4. Copy the Client ID (under app name) and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  roblox: {
    id: "roblox",
    name: "Roblox",
    envPrefix: "ROBLOX",
    clientIdVar: "ROBLOX_CLIENT_ID",
    clientSecretVar: "ROBLOX_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"roblox"',
      socialProvider: `roblox({
      clientId: process.env.ROBLOX_CLIENT_ID as string,
      clientSecret: process.env.ROBLOX_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "ROBLOX_CLIENT_ID",
        type: "server",
        description: "Roblox OAuth Client ID"
      },
      {
        name: "ROBLOX_CLIENT_SECRET",
        type: "server",
        description: "Roblox OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://create.roblox.com/credentials",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: "Note: Roblox OAuth does not provide user email addresses.",
    readme: {
      title: "Roblox OAuth Setup",
      content: `## Roblox OAuth Setup

1. Create OAuth credentials at https://create.roblox.com/credentials
2. Configure OAuth 2.0 settings
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/roblox\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

**Note**: Roblox does not provide email addresses through OAuth.

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  salesforce: {
    id: "salesforce",
    name: "Salesforce",
    envPrefix: "SALESFORCE",
    clientIdVar: "SALESFORCE_CLIENT_ID",
    clientSecretVar: "SALESFORCE_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"salesforce"',
      socialProvider: `salesforce({
      clientId: process.env.SALESFORCE_CLIENT_ID as string,
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET as string,
      environment: process.env.SALESFORCE_ENVIRONMENT || "login",
    })`,
      scopes: []
    },
    env: [
      {
        name: "SALESFORCE_CLIENT_ID",
        type: "server",
        description: "Salesforce Connected App Consumer Key"
      },
      {
        name: "SALESFORCE_CLIENT_SECRET",
        type: "server",
        description: "Salesforce Connected App Consumer Secret"
      },
      {
        name: "SALESFORCE_ENVIRONMENT",
        type: "server",
        description: 'Salesforce environment: "login" (production) or "test" (sandbox) (default: login)'
      }
    ],
    docs: {
      provider: "https://developer.salesforce.com/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: 'Salesforce supports environment field: "login" for production, "test" for sandbox.',
    readme: {
      title: "Salesforce OAuth Setup",
      content: `## Salesforce OAuth Setup

1. Create a Connected App in Salesforce Setup
2. Enable OAuth Settings
3. Add callback URL: \`http://localhost:3000/api/auth/callback/salesforce\` (update for production)
4. Copy the Consumer Key and Consumer Secret to your \`.env\` file
5. Set SALESFORCE_ENVIRONMENT to "login" for production or "test" for sandbox

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  slack: {
    id: "slack",
    name: "Slack",
    envPrefix: "SLACK",
    clientIdVar: "SLACK_CLIENT_ID",
    clientSecretVar: "SLACK_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"slack"',
      socialProvider: `slack({
      clientId: process.env.SLACK_CLIENT_ID as string,
      clientSecret: process.env.SLACK_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "SLACK_CLIENT_ID",
        type: "server",
        description: "Slack App Client ID"
      },
      {
        name: "SLACK_CLIENT_SECRET",
        type: "server",
        description: "Slack App Client Secret"
      }
    ],
    docs: {
      provider: "https://api.slack.com/apps",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Supports optional team field for workspace restrictions.",
    readme: {
      title: "Slack OAuth Setup",
      content: `## Slack OAuth Setup

1. Create a Slack app at https://api.slack.com/apps
2. Add OAuth & Permissions and configure redirect URLs
3. Add redirect URL: \`http://localhost:3000/api/auth/callback/slack\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    envPrefix: "TIKTOK",
    clientIdVar: "TIKTOK_CLIENT_KEY",
    clientSecretVar: "TIKTOK_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"tiktok"',
      socialProvider: `tiktok({
      clientKey: process.env.TIKTOK_CLIENT_KEY as string,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "TIKTOK_CLIENT_KEY",
        type: "server",
        description: "TikTok Client Key (not Client ID)"
      },
      {
        name: "TIKTOK_CLIENT_SECRET",
        type: "server",
        description: "TikTok Client Secret"
      }
    ],
    docs: {
      provider: "https://developers.tiktok.com/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: "TikTok uses clientKey instead of clientId. Make sure to use the correct field name.",
    readme: {
      title: "TikTok OAuth Setup",
      content: `## TikTok OAuth Setup

1. Register an app at https://developers.tiktok.com/
2. Configure Login Kit
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/tiktok\` (update for production)
4. Copy the Client Key (not Client ID) and Client Secret to your \`.env\` file

**Important**: TikTok uses clientKey instead of clientId.

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  vercel: {
    id: "vercel",
    name: "Vercel",
    envPrefix: "VERCEL",
    clientIdVar: "VERCEL_CLIENT_ID",
    clientSecretVar: "VERCEL_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"vercel"',
      socialProvider: `vercel({
      clientId: process.env.VERCEL_CLIENT_ID as string,
      clientSecret: process.env.VERCEL_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "VERCEL_CLIENT_ID",
        type: "server",
        description: "Vercel OAuth Client ID"
      },
      {
        name: "VERCEL_CLIENT_SECRET",
        type: "server",
        description: "Vercel OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://vercel.com/account/integrations",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "Uses PKCE for enhanced security.",
    readme: {
      title: "Vercel OAuth Setup",
      content: `## Vercel OAuth Setup

1. Create an integration at https://vercel.com/account/integrations
2. Configure OAuth settings
3. Add redirect URL: \`http://localhost:3000/api/auth/callback/vercel\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  vk: {
    id: "vk",
    name: "VK",
    envPrefix: "VK",
    clientIdVar: "VK_CLIENT_ID",
    clientSecretVar: "VK_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"vk"',
      socialProvider: `vk({
      clientId: process.env.VK_CLIENT_ID as string,
      clientSecret: process.env.VK_CLIENT_SECRET as string,
    })`,
      scopes: []
    },
    env: [
      {
        name: "VK_CLIENT_ID",
        type: "server",
        description: "VK Application ID"
      },
      {
        name: "VK_CLIENT_SECRET",
        type: "server",
        description: "VK Secure Key"
      }
    ],
    docs: {
      provider: "https://vk.com/apps?act=manage",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: false,
    extraConfigNotes: "",
    readme: {
      title: "VK OAuth Setup",
      content: `## VK OAuth Setup

1. Create an app at https://vk.com/apps?act=manage
2. Configure OAuth settings in the app
3. Add authorized redirect URI: \`http://localhost:3000/api/auth/callback/vk\` (update for production)
4. Copy the Application ID and Secure Key to your \`.env\` file

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  },
  zoom: {
    id: "zoom",
    name: "Zoom",
    envPrefix: "ZOOM",
    clientIdVar: "ZOOM_CLIENT_ID",
    clientSecretVar: "ZOOM_CLIENT_SECRET",
    popular: false,
    betterAuthConfig: {
      import: "",
      clientSideProvider: '"zoom"',
      socialProvider: `zoom({
      clientId: process.env.ZOOM_CLIENT_ID as string,
      clientSecret: process.env.ZOOM_CLIENT_SECRET as string,
    })`,
      scopes: ["user:read:user"]
    },
    env: [
      {
        name: "ZOOM_CLIENT_ID",
        type: "server",
        description: "Zoom OAuth Client ID"
      },
      {
        name: "ZOOM_CLIENT_SECRET",
        type: "server",
        description: "Zoom OAuth Client Secret"
      }
    ],
    docs: {
      provider: "https://marketplace.zoom.us/",
      betterAuth: "https://www.better-auth.com/docs/authentication/social"
    },
    requiresExtraConfig: true,
    extraConfigNotes: "You MUST include the user:read:user scope for Zoom.",
    readme: {
      title: "Zoom OAuth Setup",
      content: `## Zoom OAuth Setup

1. Create an app at https://marketplace.zoom.us/
2. Choose OAuth as the app type
3. Add redirect URL: \`http://localhost:3000/api/auth/callback/zoom\` (update for production)
4. Copy the Client ID and Client Secret to your \`.env\` file
5. **Important**: Make sure to include the \`user:read:user\` scope

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social).`
    }
  }
};
function getProvider(id) {
  return OAUTH_PROVIDERS[id];
}
function getPopularProviders() {
  return Object.values(OAUTH_PROVIDERS).filter(
    (provider) => provider.popular === true
  );
}
function getAdditionalProviders() {
  return Object.values(OAUTH_PROVIDERS).filter(
    (provider) => provider.popular !== true
  );
}

// src/installers/string-utils.ts
import fs3 from "fs-extra";
var DEFAULT_THEME = `--background: 0 0% 100%;
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
function detectIndentation(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : "";
}
async function replacePlaceholder(filePath, placeholder, content, options) {
  const fileContent = await fs3.readFile(filePath, "utf-8");
  if (!fileContent.includes(placeholder)) {
    if (options?.graceful) {
      console.warn(
        `Warning: Placeholder "${placeholder}" not found in file: ${filePath}. Skipping replacement.`
      );
      return;
    }
    throw new Error(
      `Placeholder "${placeholder}" not found in file: ${filePath}`
    );
  }
  const lines = fileContent.split("\n");
  const updatedLines = [];
  for (const line of lines) {
    if (line.includes(placeholder)) {
      if (content === "" || content.startsWith("__REMOVE_")) {
        continue;
      }
      const indentation = detectIndentation(line);
      const indentedContent = content.split("\n").map((contentLine, index) => {
        if (index === 0) {
          return indentation + contentLine;
        }
        return contentLine ? indentation + contentLine : "";
      }).join("\n");
      updatedLines.push(indentedContent);
    } else {
      updatedLines.push(line);
    }
  }
  await fs3.writeFile(filePath, updatedLines.join("\n"), "utf-8");
}
function generateAuthProvidersBlock(oauthProviders, emailPasswordEnabled) {
  const parts = [];
  if (emailPasswordEnabled) {
    parts.push(`emailAndPassword: {
      enabled: true
    },`);
  }
  if (oauthProviders.length > 0) {
    const providersObject = oauthProviders.map((providerId) => {
      const provider = getProvider(providerId);
      if (!provider) {
        throw new Error(`Unknown OAuth provider: ${providerId}`);
      }
      const configLines = [
        `clientId: process.env.${provider.envPrefix}_CLIENT_ID as string,`,
        `clientSecret: process.env.${provider.envPrefix}_CLIENT_SECRET as string,`
      ];
      if (providerId === "figma") {
        configLines.push(`clientKey: process.env.FIGMA_CLIENT_KEY as string,`);
      }
      return `${providerId}: {
        ${configLines.join("\n        ")}
      }`;
    }).join(",\n      ");
    parts.push(`socialProviders: {
      ${providersObject}
    },`);
  }
  return parts.join("\n    ");
}
function generateEnvTsServerSchema(providers) {
  if (providers.length === 0) {
    return "";
  }
  const schemas = providers.map((providerId) => {
    const provider = getProvider(providerId);
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerId}`);
    }
    const lines = [];
    lines.push(`${provider.envPrefix}_CLIENT_ID: z.string(),`);
    lines.push(`${provider.envPrefix}_CLIENT_SECRET: z.string(),`);
    if (providerId === "figma") {
      lines.push(`FIGMA_CLIENT_KEY: z.string(),`);
    }
    return lines.join("\n    ");
  }).join("\n    ");
  return schemas;
}
function generateEnvTsRuntimeMapping(providers) {
  if (providers.length === 0) {
    return "";
  }
  const mappings = providers.map((providerId) => {
    const provider = getProvider(providerId);
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerId}`);
    }
    const lines = [];
    lines.push(`${provider.envPrefix}_CLIENT_ID: process.env.${provider.envPrefix}_CLIENT_ID,`);
    lines.push(`${provider.envPrefix}_CLIENT_SECRET: process.env.${provider.envPrefix}_CLIENT_SECRET,`);
    if (providerId === "figma") {
      lines.push(`FIGMA_CLIENT_KEY: process.env.FIGMA_CLIENT_KEY,`);
    }
    return lines.join("\n    ");
  }).join("\n    ");
  return mappings;
}
function generateOAuthUIProvidersBlock(providers) {
  if (providers.length === 0) {
    return "__REMOVE_SOCIAL_PROP__";
  }
  const providerList = providers.map((id) => `"${id}"`).join(", ");
  return `social={{
  providers: [${providerList}]
}}`;
}
function generateEnvVarsBlock(providers, framework) {
  if (providers.length === 0) {
    return "";
  }
  const envVars = providers.flatMap((providerId) => {
    const provider = getProvider(providerId);
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerId}`);
    }
    if (provider.env && provider.env.length > 0) {
      return provider.env.map((envVar) => {
        let prefix = "";
        if (envVar.type === "client") {
          prefix = framework === "nextjs" ? "NEXT_PUBLIC_" : "VITE_";
        }
        return `# ${envVar.description}
${prefix}${envVar.name}=`;
      });
    } else {
      return [
        `${provider.clientIdVar}=`,
        `${provider.clientSecretVar}=`
      ];
    }
  });
  return envVars.join("\n");
}
function generateReadmeSection(providers) {
  if (providers.length === 0) {
    return "";
  }
  const sections = providers.map((providerId) => {
    const provider = getProvider(providerId);
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerId}`);
    }
    if (!provider.readme) {
      throw new Error(
        `Provider ${providerId} missing readme metadata`
      );
    }
    return provider.readme.content;
  }).filter(Boolean);
  if (sections.length === 0) {
    return "";
  }
  return `# OAuth Provider Setup

${sections.join("\n\n---\n\n")}`;
}
function getProvidersRequiringExtraConfig(providers) {
  return providers.map((providerId) => {
    const provider = getProvider(providerId);
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerId}`);
    }
    return provider;
  }).filter((provider) => provider.requiresExtraConfig === true);
}

// src/installers/tanstack.ts
import { join as join2 } from "path";

// src/installers/base.ts
import { execa } from "execa";
import ora from "ora";
import crypto from "crypto";
var FrameworkInstaller = class {
  /**
   * Constructor for FrameworkInstaller
   *
   * @param targetPath - Absolute path to the target project directory
   * @param projectName - Name of the project
   */
  constructor(targetPath, projectName) {
    this.targetPath = targetPath;
    this.projectName = projectName;
  }
  /**
   * Copy base template files to target directory
   * Uses existing copyTemplate utility from fileOperations
   */
  async copyBaseFiles() {
    await copyTemplate(this.frameworkName, this.targetPath);
  }
  /**
   * Detect the package manager used to invoke the CLI
   * Checks npm_config_user_agent environment variable
   *
   * @returns Detected package manager, defaults to 'npm'
   */
  detectPackageManager() {
    const userAgent = process.env.npm_config_user_agent || "";
    if (userAgent.includes("pnpm")) {
      return "pnpm";
    } else if (userAgent.includes("yarn")) {
      return "yarn";
    } else if (userAgent.includes("bun")) {
      return "bun";
    }
    return "npm";
  }
  /**
   * Install project dependencies using detected package manager
   * Shows progress with ora spinner
   */
  async installDependencies() {
    const packageManager = this.detectPackageManager();
    const spinner = ora(`Installing dependencies with ${packageManager}...`).start();
    try {
      await execa(packageManager, ["install"], {
        cwd: this.targetPath,
        stdio: "pipe"
      });
      spinner.succeed(`Dependencies installed with ${packageManager}`);
    } catch (error) {
      spinner.fail(`Failed to install dependencies with ${packageManager}`);
      throw new Error(
        `Dependency installation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Format generated files using the project's format command
   * Runs after all file modifications to ensure consistent code style
   */
  async formatCode() {
    const packageManager = this.detectPackageManager();
    const spinner = ora("Formatting generated files...").start();
    try {
      await execa(packageManager, ["run", "format"], {
        cwd: this.targetPath,
        stdio: "pipe"
      });
      spinner.succeed("Code formatted successfully");
    } catch (error) {
      spinner.warn("Failed to format code (you may need to run `npm run format` manually)");
    }
  }
  /**
   * Initialize Git repository in target directory
   * Creates initial commit with all files
   */
  async initGitRepo() {
    const spinner = ora("Initializing Git repository...").start();
    try {
      try {
        await execa("git", ["--version"], { stdio: "pipe" });
      } catch {
        spinner.fail("Git is not installed");
        throw new Error(
          "Git is not installed. Please install Git to initialize a repository."
        );
      }
      await execa("git", ["init"], { cwd: this.targetPath, stdio: "pipe" });
      await execa("git", ["add", "."], { cwd: this.targetPath, stdio: "pipe" });
      await execa(
        "git",
        ["commit", "-m", "Initial commit from create-z3"],
        { cwd: this.targetPath, stdio: "pipe" }
      );
      spinner.succeed("Git repository initialized");
    } catch (error) {
      spinner.fail("Failed to initialize Git repository");
      throw new Error(
        `Git initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Create GitHub repository and push initial commit
   * Uses GitHub CLI (gh) for repository creation
   *
   * @param repoName - Name for the GitHub repository
   * @param isPrivate - Whether the repository should be private
   */
  async createGitHubRepo(repoName, isPrivate) {
    const spinner = ora("Creating GitHub repository...").start();
    try {
      try {
        await execa("gh", ["--version"], { stdio: "pipe" });
      } catch {
        spinner.fail("GitHub CLI (gh) is not installed");
        throw new Error(
          "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
        );
      }
      const visibility = isPrivate ? "--private" : "--public";
      await execa(
        "gh",
        ["repo", "create", repoName, visibility, "--source=.", "--push"],
        { cwd: this.targetPath, stdio: "pipe" }
      );
      spinner.succeed(`GitHub repository created: ${repoName}`);
    } catch (error) {
      spinner.fail("Failed to create GitHub repository");
      throw new Error(
        `GitHub repository creation failed: ${error instanceof Error ? error.message : "Unknown error"}
Make sure you are authenticated with GitHub CLI (run "gh auth login")`
      );
    }
  }
  /**
   * Generate a secure random secret for Better Auth
   * Creates a 32-byte hex string
   *
   * @returns Generated secret string
   */
  generateAuthSecret() {
    return crypto.randomBytes(32).toString("hex");
  }
  /**
   * Fetch TweakCN theme CSS from URL
   * Handles network errors and provides retry suggestions
   *
   * @param url - URL to fetch theme from
   * @returns Theme CSS content
   */
  async fetchThemeFromUrl(url) {
    const spinner = ora("Fetching TweakCN theme...").start();
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const content = await response.text();
      spinner.succeed("TweakCN theme fetched");
      return content;
    } catch (error) {
      spinner.fail("Failed to fetch TweakCN theme");
      throw new Error(
        `Theme fetch failed: ${error instanceof Error ? error.message : "Unknown error"}
Please check the URL and your internet connection, then try again.`
      );
    }
  }
  /**
   * Main orchestration method for project initialization
   * Coordinates all setup steps in sequence
   *
   * @param options - Project configuration options from CLI survey
   */
  async initProject(options) {
    const copySpinner = ora("Copying template files...").start();
    try {
      await this.copyBaseFiles();
      copySpinner.succeed("Template files copied");
    } catch (error) {
      copySpinner.fail("Failed to copy template files");
      throw error;
    }
    if (options.emailPasswordAuth || options.oauthProviders.length > 0) {
      const authSpinner = ora("Configuring authentication...").start();
      try {
        await this.updateOAuthConfig(options.oauthProviders, options.emailPasswordAuth);
        authSpinner.succeed("Authentication configuration updated");
      } catch (error) {
        authSpinner.fail("Failed to configure authentication");
        throw error;
      }
    }
    const oauthUISpinner = ora("Configuring OAuth UI...").start();
    try {
      await this.updateOAuthUIConfig(options.oauthProviders);
      if (options.oauthProviders.length > 0) {
        oauthUISpinner.succeed("OAuth UI configuration updated");
      } else {
        oauthUISpinner.succeed("OAuth UI placeholders cleaned up");
      }
    } catch (error) {
      oauthUISpinner.fail("Failed to configure OAuth UI");
      throw error;
    }
    const envSpinner = ora("Updating .env.example...").start();
    try {
      await this.updateEnvExample(options.oauthProviders);
      if (options.oauthProviders.length > 0) {
        envSpinner.succeed(".env.example updated");
      } else {
        envSpinner.succeed(".env.example placeholders cleaned up");
      }
    } catch (error) {
      envSpinner.fail("Failed to update .env.example");
      throw error;
    }
    const envTsSpinner = ora("Updating typed env configuration...").start();
    try {
      await this.updateEnvTs(options.oauthProviders);
      if (options.oauthProviders.length > 0) {
        envTsSpinner.succeed("Typed env configuration updated");
      } else {
        envTsSpinner.succeed("Typed env placeholders cleaned up");
      }
    } catch (error) {
      envTsSpinner.fail("Failed to update typed env configuration");
      throw error;
    }
    const readmeSpinner = ora("Updating README...").start();
    try {
      await this.updateReadme(options.oauthProviders);
      if (options.oauthProviders.length > 0) {
        readmeSpinner.succeed("README updated");
      } else {
        readmeSpinner.succeed("README placeholders cleaned up");
      }
    } catch (error) {
      readmeSpinner.fail("Failed to update README");
      throw error;
    }
    const themeSpinner = ora("Applying theme...").start();
    try {
      let themeContent;
      if (options.tweakcnTheme) {
        if (options.tweakcnTheme.type === "url") {
          themeContent = await this.fetchThemeFromUrl(options.tweakcnTheme.content);
        } else {
          themeContent = options.tweakcnTheme.content;
        }
      } else {
        themeContent = DEFAULT_THEME;
      }
      await this.applyTweakCNTheme(themeContent);
      themeSpinner.succeed(
        options.tweakcnTheme ? "TweakCN theme applied" : "Default theme applied"
      );
    } catch (error) {
      themeSpinner.fail("Failed to apply theme");
      throw error;
    }
    if (options.initGit) {
      await this.initGitRepo();
    }
    if (options.installDependencies) {
      await this.installDependencies();
      await this.formatCode();
    }
  }
};

// src/installers/tanstack.ts
var TanStackInstaller = class extends FrameworkInstaller {
  /**
   * Framework identifier for TanStack Start
   */
  get frameworkName() {
    return "tanstack";
  }
  /**
   * Update OAuth configuration in Convex auth file
   * Target file: convex/auth/index.ts
   * Placeholders: // {{EMAIL_PASSWORD_AUTH}} and // {{OAUTH_PROVIDERS}}
   *
   * @param selectedProviders - Array of provider IDs to configure
   * @param emailPasswordEnabled - Whether email/password authentication is enabled
   */
  async updateOAuthConfig(selectedProviders, emailPasswordEnabled) {
    const authFilePath = join2(this.targetPath, "convex/auth/index.ts");
    const authProvidersBlock = generateAuthProvidersBlock(
      selectedProviders,
      emailPasswordEnabled
    );
    await replacePlaceholder(
      authFilePath,
      "// {{OAUTH_PROVIDERS}}",
      authProvidersBlock
    );
    await replacePlaceholder(
      authFilePath,
      "// {{EMAIL_PASSWORD_AUTH}}",
      "",
      { graceful: true }
    );
  }
  /**
   * Update OAuth UI configuration in providers file
   * Target file: src/providers.tsx
   * Placeholder: // {{OAUTH_UI_PROVIDERS}}
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateOAuthUIConfig(selectedProviders) {
    const providersFilePath = join2(this.targetPath, "src/providers.tsx");
    const uiConfigBlock = generateOAuthUIProvidersBlock(selectedProviders);
    await replacePlaceholder(
      providersFilePath,
      "// {{OAUTH_UI_PROVIDERS}}",
      uiConfigBlock
    );
  }
  /**
   * Update .env.example with OAuth environment variables
   * Target file: .env.example
   * Placeholder: # {{ENV_OAUTH_VARS}}
   * Applies VITE_ prefix for client-side variables
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateEnvExample(selectedProviders) {
    const envFilePath = join2(this.targetPath, ".env.example");
    const envVarsBlock = generateEnvVarsBlock(selectedProviders, "tanstack");
    if (envVarsBlock) {
      await replacePlaceholder(
        envFilePath,
        "# {{ENV_OAUTH_VARS}}",
        envVarsBlock
      );
    }
  }
  /**
   * Update README with OAuth provider setup guides
   * Target file: README.md
   * Placeholder: <!-- {{OAUTH_SETUP_GUIDE}} -->
   * Handles missing placeholder gracefully with warning
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateReadme(selectedProviders) {
    const readmeFilePath = join2(this.targetPath, "README.md");
    const readmeSection = generateReadmeSection(selectedProviders);
    if (readmeSection) {
      await replacePlaceholder(
        readmeFilePath,
        "<!-- {{OAUTH_SETUP_GUIDE}} -->",
        readmeSection,
        { graceful: true }
      );
    }
  }
  /**
   * Apply TweakCN theme to global CSS file
   * Target file: src/styles/globals.css
   * Placeholder: CSS comment with TWEAKCN_THEME variable
   *
   * @param themeContent - CSS content to apply
   */
  async applyTweakCNTheme(themeContent) {
    const cssFilePath = join2(this.targetPath, "src/styles/globals.css");
    await replacePlaceholder(
      cssFilePath,
      "/* {{TWEAKCN_THEME}} */",
      themeContent
    );
  }
  /**
   * Update env.ts with OAuth provider environment variables
   * Target file: src/env.ts
   * Placeholders: // {{OAUTH_ENV_SERVER_SCHEMA}} and // {{OAUTH_ENV_RUNTIME_MAPPING}}
   * Adds zod schema validation and runtime mappings for OAuth credentials
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateEnvTs(selectedProviders) {
    const envFilePath = join2(this.targetPath, "src/env.ts");
    const serverSchema = generateEnvTsServerSchema(selectedProviders);
    await replacePlaceholder(
      envFilePath,
      "// {{OAUTH_ENV_SERVER_SCHEMA}}",
      serverSchema
    );
    const runtimeMapping = generateEnvTsRuntimeMapping(selectedProviders);
    await replacePlaceholder(
      envFilePath,
      "// {{OAUTH_ENV_RUNTIME_MAPPING}}",
      runtimeMapping
    );
  }
};

// src/index.ts
var __filename = fileURLToPath2(import.meta.url);
var __dirname = dirname2(__filename);
var packageJson = JSON.parse(
  readFileSync(join3(__dirname, "../package.json"), "utf-8")
);
var program = new Command();
async function promptOAuthProviders() {
  const popularProviders = getPopularProviders();
  const additionalProviders = getAdditionalProviders();
  const allOAuthProviders = [...popularProviders, ...additionalProviders].sort(
    (a, b) => a.name.localeCompare(b.name)
  );
  const choices = [
    {
      name: "Email & Password",
      value: "__email_password__",
      checked: true
      // Default enabled
    },
    new Separator("OAuth Providers (A-Z):"),
    ...allOAuthProviders.map((provider) => ({
      name: provider.name,
      value: provider.id,
      checked: false
    }))
  ];
  const selectedProviders = await checkbox({
    message: "Select authentication providers (space to select, enter to confirm):",
    choices,
    pageSize: 15,
    // Show more items at once
    loop: false
    // Don't wrap around
  });
  const emailPassword = selectedProviders.includes("__email_password__");
  const oauthProviders = selectedProviders.filter(
    (id) => id !== "__email_password__"
  );
  if (oauthProviders.length > 0) {
    const providersNeedingExtraConfig = getProvidersRequiringExtraConfig(oauthProviders);
    if (providersNeedingExtraConfig.length > 0) {
      console.log();
      console.log(chalk2.yellow("\u26A0\uFE0F  Some providers require extra configuration:"));
      console.log();
      providersNeedingExtraConfig.forEach((provider) => {
        console.log(chalk2.yellow(`  ${provider.name}:`));
        console.log(chalk2.dim(`  ${provider.extraConfigNotes}`));
        console.log();
      });
    }
  }
  return { emailPassword, oauthProviders };
}
program.name("create-z3").version(packageJson.version).description("CLI for scaffolding Z3 Stack applications").argument("[project-name]", "Name of the project").action(async (projectNameArg) => {
  try {
    const cwd = process.cwd();
    let projectName = "";
    if (projectNameArg) {
      const resolvedName = resolveProjectName(projectNameArg, cwd);
      const validation = validateProjectName(resolvedName);
      if (!validation.valid) {
        displayInvalidNameError(resolvedName, validation.errors);
      }
      projectName = resolvedName;
    } else {
      let isValid = false;
      while (!isValid) {
        const inputName = await input({
          message: "What is your project named?",
          default: "my-z3-app"
        });
        const resolvedName = resolveProjectName(inputName, cwd);
        const validation = validateProjectName(resolvedName);
        if (validation.valid) {
          projectName = resolvedName;
          isValid = true;
        } else {
          console.error();
          console.error(chalk2.red(`Invalid project name '${resolvedName}'.`));
          if (validation.errors.length > 0) {
            validation.errors.forEach((error) => {
              console.error(chalk2.yellow(`  - ${error}`));
            });
          }
          console.error();
          console.error(chalk2.yellow("Please try again with a valid npm package name."));
          console.error();
        }
      }
    }
    const targetDir = getTargetDirectory(projectName, cwd);
    if (projectNameArg === ".") {
      const isEmpty = await isDirectoryEmpty(cwd);
      if (!isEmpty) {
        displayDirectoryNotEmptyError();
      }
    } else {
      const exists = await checkDirectoryExists(targetDir);
      if (exists) {
        displayDirectoryExistsError(projectName);
      }
    }
    const framework = await select({
      message: "Which framework would you like to use?",
      choices: [
        { name: "TanStack Start", value: "tanstack" },
        { name: "Next.js", value: "nextjs" }
      ],
      default: "tanstack"
    });
    const frameworkName = framework === "tanstack" ? "TanStack Start" : "Next.js";
    const { emailPassword, oauthProviders } = await promptOAuthProviders();
    if (!emailPassword && oauthProviders.length === 0) {
      console.log();
      console.log(chalk2.yellow("\u26A0\uFE0F  Warning: No authentication methods selected."));
      console.log(chalk2.yellow("   Your app will have no user authentication."));
      console.log();
    }
    const tweakcnThemeUrl = await input({
      message: "Enter TweakCN theme URL (optional, press Enter to skip):",
      default: ""
    });
    let tweakcnTheme;
    if (tweakcnThemeUrl.trim()) {
      tweakcnTheme = {
        type: "url",
        content: tweakcnThemeUrl.trim()
      };
    }
    const initGit = await confirm({
      message: "Initialize Git repository?",
      default: true
    });
    const installDependencies = await confirm({
      message: "Install dependencies?",
      default: true
    });
    const projectOptions = {
      projectName,
      framework,
      emailPasswordAuth: emailPassword,
      oauthProviders,
      tweakcnTheme,
      initGit,
      installDependencies
    };
    let createdPath;
    try {
      createdPath = await createProjectDirectory(projectName, cwd);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "EACCES") {
        displayPermissionError(targetDir);
      }
      throw error;
    }
    let installer;
    if (framework === "tanstack") {
      installer = new TanStackInstaller(createdPath, projectName);
    } else {
      throw new Error("Next.js installer not yet implemented. Please use TanStack Start.");
    }
    try {
      await installer.initProject(projectOptions);
    } catch (error) {
      console.error();
      console.error(chalk2.red("\u274C Project initialization failed:"));
      console.error(chalk2.red(error instanceof Error ? error.message : "Unknown error"));
      console.error();
      process.exit(1);
    }
    console.log();
    displaySuccessMessage(projectName, createdPath, projectNameArg === ".");
    console.log();
    console.log(chalk2.green("\u2705 Configuration complete!"));
    console.log();
    console.log(`Project name: ${projectName}`);
    console.log(`Framework: ${frameworkName}`);
    if (emailPassword && oauthProviders.length > 0) {
      console.log(`Authentication: Email/Password + OAuth (${oauthProviders.join(", ")})`);
    } else if (emailPassword) {
      console.log("Authentication: Email/Password");
    } else if (oauthProviders.length > 0) {
      console.log(`Authentication: OAuth (${oauthProviders.join(", ")})`);
    } else {
      console.log(chalk2.dim("Authentication: None selected"));
    }
    if (tweakcnTheme) {
      console.log("Theme: Custom TweakCN theme");
    } else {
      console.log("Theme: Default");
    }
    if (initGit) {
      console.log("Git: Initialized");
    } else {
      console.log("Git: Not initialized");
    }
    if (installDependencies) {
      console.log("Dependencies: Installed");
    } else {
      console.log("Dependencies: Not installed");
    }
    console.log();
    console.log(chalk2.dim("Next steps:"));
    if (projectNameArg !== ".") {
      console.log(chalk2.dim(`  cd ${projectName}`));
    }
    if (!installDependencies) {
      console.log(chalk2.dim("  npm install"));
    }
    console.log(chalk2.dim("  npm run dev"));
    console.log();
    process.exit(0);
  } catch (error) {
    if (error instanceof Error && error.name === "ExitPromptError") {
      console.log();
      process.exit(0);
    }
    throw error;
  }
});
program.parse();
