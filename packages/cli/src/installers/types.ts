/**
 * Type Definitions and Interfaces for FrameworkInstaller System
 *
 * This module provides type definitions for project configuration,
 * OAuth providers, and framework selection.
 */

/**
 * Supported package managers for dependency installation
 */
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

/**
 * Supported frameworks for project scaffolding
 */
export type Framework = 'nextjs' | 'tanstack';

/**
 * Environment variable configuration interface
 * Defines the structure for OAuth provider environment variables
 */
export interface EnvVariable {
  /** Environment variable name (e.g., 'GOOGLE_CLIENT_ID') */
  name: string;

  /** Variable type determines framework-specific prefix application */
  type: 'server' | 'client';

  /** Human-readable description of the variable's purpose */
  description: string;
}

/**
 * OAuth provider configuration interface
 * Defines the structure for each OAuth provider supported by Better Auth
 */
export interface OAuthProvider {
  /** Unique identifier for the provider (e.g., 'google', 'github') */
  id: string;

  /** Display name for the provider (e.g., 'Google', 'GitHub') */
  name: string;

  /** Environment variable prefix (e.g., 'GOOGLE', 'GITHUB') */
  envPrefix: string;

  /** Environment variable name for client ID */
  clientIdVar: string;

  /** Environment variable name for client secret */
  clientSecretVar: string;

  /** Indicates if provider appears in default/popular list (defaults to false if not specified) */
  popular?: boolean;

  /** Better Auth configuration code snippets for code generation */
  betterAuthConfig?: {
    /** Import statement if needed (empty string for most providers) */
    import: string;

    /** Complete provider config code snippet for socialProviders block */
    socialProvider: string;

    /** Client-side provider string for UI (e.g., '"google"' for signIn.social) */
    clientSideProvider: string;

    /** Optional required scopes array (e.g., ['user:email'] for GitHub) */
    scopes?: string[];
  };

  /** Environment variables to generate for this provider */
  env?: Array<EnvVariable>;

  /** Documentation URLs for provider setup */
  docs?: {
    /** URL to provider's OAuth setup documentation */
    provider: string;

    /** URL to Better Auth provider-specific documentation */
    betterAuth: string;
  };

  /** Flag for providers needing more than clientId/clientSecret (defaults to false if not specified) */
  requiresExtraConfig?: boolean;

  /** Documentation for extra setup requirements */
  extraConfigNotes?: string;

  /** README template for setup guide generation */
  readme?: {
    /** Section heading for README (e.g., 'GitHub OAuth Setup') */
    title: string;

    /** Markdown setup guide content */
    content: string;
  };
}

/**
 * TweakCN theme configuration interface
 * Supports direct CSS paste from TweakCN's code dialog
 */
export interface TweakCNTheme {
  /** Type of theme input: only 'css' is supported */
  type: 'css';

  /** CSS content string with :root and .dark blocks */
  content: string;
}

/**
 * Project options interface
 * Contains all configuration options selected during CLI survey
 */
export interface ProjectOptions {
  /** Name of the project (must be valid npm package name) */
  projectName: string;

  /** Selected framework for the project */
  framework: Framework;

  /** Whether to enable email/password authentication */
  emailPasswordAuth: boolean;

  /** Array of OAuth provider IDs to configure (e.g., ['google', 'github']) */
  oauthProviders: string[];

  /** Optional TweakCN theme configuration */
  tweakcnTheme?: TweakCNTheme;

  /** Whether to initialize Git repository */
  initGit: boolean;

  /** Whether to install dependencies after project creation */
  installDependencies: boolean;
}
