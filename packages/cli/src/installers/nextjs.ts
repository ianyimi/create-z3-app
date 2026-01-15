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
  generateOAuthConfigBlock,
  generateOAuthUIConfigBlock,
  generateEnvVarsBlock,
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
   * Placeholder: // {{OAUTH_PROVIDERS}}
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateOAuthConfig(selectedProviders: string[]): Promise<void> {
    const authFilePath = join(this.targetPath, 'lib/auth.ts');
    const configBlock = generateOAuthConfigBlock(selectedProviders);

    if (configBlock) {
      await replacePlaceholder(
        authFilePath,
        '// {{OAUTH_PROVIDERS}}',
        configBlock
      );
    }
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
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateEnvExample(selectedProviders: string[]): Promise<void> {
    const envFilePath = join(this.targetPath, '.env.example');
    const envVarsBlock = generateEnvVarsBlock(selectedProviders);

    if (envVarsBlock) {
      await replacePlaceholder(
        envFilePath,
        '# {{ENV_OAUTH_VARS}}',
        envVarsBlock
      );
    }
  }

  /**
   * Apply TweakCN theme to global CSS file
   * Target file: app/globals.css
   * Placeholder: /* {{TWEAKCN_THEME}} *\/
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
}
