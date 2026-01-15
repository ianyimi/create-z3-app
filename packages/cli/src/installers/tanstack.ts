/**
 * TanStackInstaller Implementation
 *
 * Framework-specific installer for TanStack Start projects.
 * Implements abstract methods with TanStack-specific file paths and configurations.
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
 * TanStack Start framework installer
 * Handles TanStack-specific file locations and configuration patterns
 */
export class TanStackInstaller extends FrameworkInstaller {
  /**
   * Framework identifier for TanStack Start
   */
  get frameworkName(): string {
    return 'tanstack';
  }

  /**
   * Update OAuth configuration in Convex auth file
   * Target file: convex/auth/index.ts
   * Placeholder: // {{OAUTH_PROVIDERS}}
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateOAuthConfig(selectedProviders: string[]): Promise<void> {
    const authFilePath = join(this.targetPath, 'convex/auth/index.ts');
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
   * Target file: src/lib/auth/client.ts
   * Placeholder: // {{OAUTH_UI_PROVIDERS}}
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  async updateOAuthUIConfig(selectedProviders: string[]): Promise<void> {
    const clientFilePath = join(this.targetPath, 'src/lib/auth/client.ts');
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
   * Target file: src/styles/globals.css
   * Placeholder: /* {{TWEAKCN_THEME}} *\/
   *
   * @param themeContent - CSS content to apply
   */
  async applyTweakCNTheme(themeContent: string): Promise<void> {
    const cssFilePath = join(this.targetPath, 'src/styles/globals.css');

    await replacePlaceholder(
      cssFilePath,
      '/* {{TWEAKCN_THEME}} */',
      themeContent
    );
  }
}
