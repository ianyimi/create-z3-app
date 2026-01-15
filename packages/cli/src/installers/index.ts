/**
 * FrameworkInstaller Module Exports
 *
 * Central export point for all installer types, utilities, and factory function.
 * Provides a clean API for CLI integration.
 */

// Export all types
export type {
  PackageManager,
  Framework,
  OAuthProvider,
  TweakCNTheme,
  ProjectOptions,
} from './types.js';

// Export OAuth provider registry and helpers
export {
  OAUTH_PROVIDERS,
  getProvider,
  getProviderIds,
} from './providers.js';

// Export string utilities (for advanced use cases)
export {
  replacePlaceholder,
  generateOAuthConfigBlock,
  generateOAuthUIConfigBlock,
  generateEnvVarsBlock,
  detectIndentation,
} from './string-utils.js';

// Export base class (for potential extension)
export { FrameworkInstaller } from './base.js';

// Export concrete installer classes
export { NextJSInstaller } from './nextjs.js';
export { TanStackInstaller } from './tanstack.js';

// Import for factory function
import type { Framework } from './types.js';
import { FrameworkInstaller } from './base.js';
import { NextJSInstaller } from './nextjs.js';
import { TanStackInstaller } from './tanstack.js';

/**
 * Factory function to create the appropriate installer for a framework
 *
 * @param framework - The framework to create an installer for
 * @param targetPath - Absolute path to the target project directory
 * @param projectName - Name of the project
 * @returns The appropriate FrameworkInstaller instance
 * @throws Error if framework is not supported
 */
export function createInstaller(
  framework: Framework,
  targetPath: string,
  projectName: string
): FrameworkInstaller {
  switch (framework) {
    case 'nextjs':
      return new NextJSInstaller(targetPath, projectName);
    case 'tanstack':
      return new TanStackInstaller(targetPath, projectName);
    default:
      throw new Error(
        `Unsupported framework: ${framework}. Supported frameworks: nextjs, tanstack`
      );
  }
}
