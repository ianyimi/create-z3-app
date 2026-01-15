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
}

/**
 * TweakCN theme configuration interface
 * Supports both URL fetching and direct CSS paste
 */
export interface TweakCNTheme {
  /** Type of theme input: URL to fetch or raw CSS content */
  type: 'url' | 'css';

  /** Theme content: URL string or CSS content string */
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

  /** Array of OAuth provider IDs to configure (e.g., ['google', 'github']) */
  oauthProviders: string[];

  /** Optional TweakCN theme configuration */
  tweakcnTheme?: TweakCNTheme;

  /** Whether to create a GitHub repository */
  createGitHubRepo: boolean;

  /** Whether the GitHub repository should be private (only relevant if createGitHubRepo is true) */
  gitHubRepoPrivate?: boolean;

  /** Whether to install dependencies after project creation */
  installDependencies: boolean;
}
