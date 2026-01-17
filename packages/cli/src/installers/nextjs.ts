/**
 * NextJSInstaller Implementation
 *
 * Framework-specific installer for Next.js projects.
 * Implements abstract methods with Next.js-specific file paths and configurations.
 */

import { join } from 'path';
import { FrameworkInstaller } from './base.js';
import {
  replacePlaceholder,
  generateAuthProvidersBlock,
  generateOAuthUIProvidersBlock,
  generateEnvVarsBlock,
  generateReadmeSection,
  generateEnvTsServerSchema,
  generateEnvTsRuntimeMapping,
  generateCredentialsValue,
} from './string-utils.js';

/**
 * Next.js framework installer
 * Handles Next.js App Router-specific file locations and configuration patterns
 */
export class NextJSInstaller extends FrameworkInstaller {
  /**
   * Framework identifier for Next.js
   */
  get frameworkName(): string {
    return 'nextjs';
  }

  /**
   * Update OAuth configuration in Convex auth file
   * Target file: convex/auth/index.ts (SAME as TanStack)
   * Placeholders: // {{EMAIL_PASSWORD_AUTH}} and // {{OAUTH_PROVIDERS}}
   *
   * @param selectedProviders - Array of provider IDs to configure
   * @param emailPasswordEnabled - Whether email/password authentication is enabled
   */
  async updateOAuthConfig(
    selectedProviders: string[],
    emailPasswordEnabled: boolean
  ): Promise<void> {
    const authFilePath = join(this.targetPath, 'convex/auth/index.ts');

    // Generate the combined auth providers block
    const authProvidersBlock = generateAuthProvidersBlock(
      selectedProviders,
      emailPasswordEnabled
    );

    // Replace EMAIL_PASSWORD_AUTH placeholder - this will be removed in the new approach
    // since we're using a unified providers block
    // The template will have both placeholders, but we'll use just OAUTH_PROVIDERS
    // for the combined block

    // Replace OAUTH_PROVIDERS placeholder with the combined auth providers block
    await replacePlaceholder(
      authFilePath,
      '// {{OAUTH_PROVIDERS}}',
      authProvidersBlock
    );

    // Remove the EMAIL_PASSWORD_AUTH placeholder line if it exists
    // by replacing it with empty string
    await replacePlaceholder(
      authFilePath,
      '// {{EMAIL_PASSWORD_AUTH}}',
      '',
      { graceful: true }
    );
  }

  /**
   * Update OAuth UI configuration in auth client file
   * Target file: src/auth/client.tsx (DIFFERENT from TanStack: src/providers.tsx)
   * Placeholders: OAUTH_UI_PROVIDERS and EMAIL_PASSWORD_CREDENTIALS
   *
   * @param selectedProviders - Array of provider IDs to configure
   * @param emailPasswordEnabled - Whether email/password authentication is enabled
   */
  async updateOAuthUIConfig(
    selectedProviders: string[],
    emailPasswordEnabled: boolean
  ): Promise<void> {
    const providersFilePath = join(this.targetPath, 'src/auth/client.tsx');

    // Replace OAuth UI providers list
    const uiConfigBlock = generateOAuthUIProvidersBlock(selectedProviders);
    await replacePlaceholder(
      providersFilePath,
      '// {{OAUTH_UI_PROVIDERS}}',
      uiConfigBlock
    );

    // Replace credentials prop
    const credentialsValue = generateCredentialsValue(emailPasswordEnabled);
    await replacePlaceholder(
      providersFilePath,
      '/* {{EMAIL_PASSWORD_CREDENTIALS}} */',
      credentialsValue
    );
  }

  /**
   * Update .env.example with OAuth environment variables
   * Target file: .env.example (SAME as TanStack)
   * Placeholder: # {{ENV_OAUTH_VARS}}
   * Applies NEXT_PUBLIC_ prefix for client-side variables (DIFFERENT parameter from TanStack)
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateEnvExample(selectedProviders: string[]): Promise<void> {
    const envFilePath = join(this.targetPath, '.env.example');
    const envVarsBlock = generateEnvVarsBlock(selectedProviders, 'nextjs');

    // Always call replacePlaceholder to remove placeholder even if envVarsBlock is empty
    await replacePlaceholder(
      envFilePath,
      '# {{ENV_OAUTH_VARS}}',
      envVarsBlock
    );
  }

  /**
   * Update README with OAuth provider setup guides
   * Target file: README.md (SAME as TanStack)
   * Placeholder: <!-- {{OAUTH_SETUP_GUIDE}} -->
   * Handles missing placeholder gracefully with warning
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateReadme(selectedProviders: string[]): Promise<void> {
    const readmeFilePath = join(this.targetPath, 'README.md');
    const readmeSection = generateReadmeSection(selectedProviders);

    // Always call replacePlaceholder to remove placeholder even if readmeSection is empty
    await replacePlaceholder(
      readmeFilePath,
      '<!-- {{OAUTH_SETUP_GUIDE}} -->',
      readmeSection,
      { graceful: true }
    );
  }

  /**
   * Apply TweakCN theme to global CSS file
   * Target file: src/app/(frontend)/globals.css (DIFFERENT from TanStack: src/styles/globals.css)
   * Placeholder: CSS comment with TWEAKCN_THEME variable
   *
   * @param themeContent - CSS content to apply
   */
  async applyTweakCNTheme(themeContent: string): Promise<void> {
    const cssFilePath = join(this.targetPath, 'src/app/(frontend)/globals.css');

    await replacePlaceholder(
      cssFilePath,
      '/* {{TWEAKCN_THEME}} */',
      themeContent
    );
  }

  /**
   * Update env.mjs with OAuth provider environment variables
   * Target file: src/env.mjs (DIFFERENT from TanStack: src/env.ts - Next.js uses env.mjs)
   * Placeholders: // {{OAUTH_ENV_SERVER_SCHEMA}} and // {{OAUTH_ENV_RUNTIME_MAPPING}}
   * Adds zod schema validation and runtime mappings for OAuth credentials
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateEnvTs(selectedProviders: string[]): Promise<void> {
    const envFilePath = join(this.targetPath, 'src/env.mjs');

    // Generate server schema (zod validation)
    const serverSchema = generateEnvTsServerSchema(selectedProviders);
    await replacePlaceholder(
      envFilePath,
      '// {{OAUTH_ENV_SERVER_SCHEMA}}',
      serverSchema
    );

    // Generate runtime mapping (process.env assignments)
    const runtimeMapping = generateEnvTsRuntimeMapping(selectedProviders);
    await replacePlaceholder(
      envFilePath,
      '// {{OAUTH_ENV_RUNTIME_MAPPING}}',
      runtimeMapping
    );
  }
}
