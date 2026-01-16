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
  generateOAuthUIConfigBlock,
  generateEnvVarsBlock,
  generateReadmeSection,
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
   * Update OAuth configuration in Better Auth file
   * Target file: lib/auth.ts
   * Placeholders: // {{EMAIL_PASSWORD_AUTH}} and // {{OAUTH_PROVIDERS}}
   *
   * @param selectedProviders - Array of provider IDs to configure
   * @param emailPasswordEnabled - Whether email/password authentication is enabled
   */
  async updateOAuthConfig(
    selectedProviders: string[],
    emailPasswordEnabled: boolean
  ): Promise<void> {
    const authFilePath = join(this.targetPath, 'lib/auth.ts');

    // Generate the combined auth providers block
    const authProvidersBlock = generateAuthProvidersBlock(
      selectedProviders,
      emailPasswordEnabled
    );

    // Replace OAUTH_PROVIDERS placeholder with the combined auth providers block
    await replacePlaceholder(
      authFilePath,
      '// {{OAUTH_PROVIDERS}}',
      authProvidersBlock
    );

    // Remove the EMAIL_PASSWORD_AUTH placeholder line if it exists
    await replacePlaceholder(
      authFilePath,
      '// {{EMAIL_PASSWORD_AUTH}}',
      '',
      { graceful: true }
    );
  }

  /**
   * Update OAuth UI configuration in auth client file
   * Target file: lib/auth-client.ts
   * Placeholder: // {{OAUTH_UI_PROVIDERS}}
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateOAuthUIConfig(selectedProviders: string[]): Promise<void> {
    const clientFilePath = join(this.targetPath, 'lib/auth-client.ts');
    const uiConfigBlock = generateOAuthUIConfigBlock(selectedProviders);

    if (uiConfigBlock) {
      await replacePlaceholder(
        clientFilePath,
        '// {{OAUTH_UI_PROVIDERS}}',
        uiConfigBlock
      );
    }
  }

  /**
   * Update .env.example with OAuth environment variables
   * Target file: .env.example
   * Placeholder: # {{ENV_OAUTH_VARS}}
   * Applies NEXT_PUBLIC_ prefix for client-side variables
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateEnvExample(selectedProviders: string[]): Promise<void> {
    const envFilePath = join(this.targetPath, '.env.example');
    const envVarsBlock = generateEnvVarsBlock(selectedProviders, 'nextjs');

    if (envVarsBlock) {
      await replacePlaceholder(
        envFilePath,
        '# {{ENV_OAUTH_VARS}}',
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
  async updateReadme(selectedProviders: string[]): Promise<void> {
    const readmeFilePath = join(this.targetPath, 'README.md');
    const readmeSection = generateReadmeSection(selectedProviders);

    if (readmeSection) {
      await replacePlaceholder(
        readmeFilePath,
        '<!-- {{OAUTH_SETUP_GUIDE}} -->',
        readmeSection,
        { graceful: true }
      );
    }
  }

  /**
   * Apply TweakCN theme to global CSS file
   * Target file: app/globals.css
   * Placeholder: CSS comment with TWEAKCN_THEME variable
   *
   * @param themeContent - CSS content to apply
   */
  async applyTweakCNTheme(themeContent: string): Promise<void> {
    const cssFilePath = join(this.targetPath, 'app/globals.css');

    await replacePlaceholder(
      cssFilePath,
      '/* {{TWEAKCN_THEME}} */',
      themeContent
    );
  }

  /**
   * Update env.mjs with OAuth provider environment variables
   * Target file: src/env.mjs (Next.js uses env.mjs instead of env.ts)
   * Placeholders: // {{OAUTH_ENV_SERVER_SCHEMA}} and // {{OAUTH_ENV_RUNTIME_MAPPING}}
   *
   * NOTE: This is a stub implementation for Next.js
   * TODO: Implement when Next.js template is created
   *
   * @param _selectedProviders - Array of provider IDs to configure (unused in stub)
   */
  async updateEnvTs(_selectedProviders: string[]): Promise<void> {
    // TODO: Implement for Next.js when template is ready
    // Next.js uses env.mjs instead of env.ts
    console.warn('Next.js env configuration not yet implemented');
  }
}
