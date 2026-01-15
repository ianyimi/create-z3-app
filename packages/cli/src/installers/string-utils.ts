/**
 * String Replacement Utilities
 *
 * This module provides utilities for placeholder-based string replacement
 * and code generation for OAuth configuration.
 */

import fs from 'fs-extra';
import { getProvider } from './providers.js';

/**
 * Detects the indentation (leading whitespace) of a line
 *
 * @param line - The line to analyze
 * @returns The leading whitespace string
 */
export function detectIndentation(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

/**
 * Replaces a placeholder in a file with the provided content
 * Preserves the indentation of the placeholder line
 *
 * @param filePath - Absolute path to the file
 * @param placeholder - The placeholder to replace (e.g., '// {{OAUTH_PROVIDERS}}')
 * @param content - The content to insert in place of the placeholder
 * @throws Error if file not found or placeholder not found
 */
export async function replacePlaceholder(
  filePath: string,
  placeholder: string,
  content: string
): Promise<void> {
  // Read the file content
  const fileContent = await fs.readFile(filePath, 'utf-8');

  // Check if placeholder exists
  if (!fileContent.includes(placeholder)) {
    throw new Error(
      `Placeholder "${placeholder}" not found in file: ${filePath}`
    );
  }

  // Split content into lines to preserve indentation
  const lines = fileContent.split('\n');
  const updatedLines: string[] = [];

  for (const line of lines) {
    if (line.includes(placeholder)) {
      // Detect indentation of the placeholder line
      const indentation = detectIndentation(line);

      // Apply indentation to each line of the content
      const indentedContent = content
        .split('\n')
        .map((contentLine, index) => {
          // First line replaces the placeholder, so use its indentation
          if (index === 0) {
            return indentation + contentLine;
          }
          // Subsequent lines also get indented
          return contentLine ? indentation + contentLine : '';
        })
        .join('\n');

      updatedLines.push(indentedContent);
    } else {
      updatedLines.push(line);
    }
  }

  // Write the updated content back to the file
  await fs.writeFile(filePath, updatedLines.join('\n'), 'utf-8');
}

/**
 * Generates OAuth configuration block for Better Auth
 * Creates socialProviders configuration with clientId, clientSecret, and redirectURI
 *
 * @param providers - Array of provider IDs (e.g., ['google', 'github'])
 * @returns Generated configuration code as string
 */
export function generateOAuthConfigBlock(providers: string[]): string {
  if (providers.length === 0) {
    return '';
  }

  const providerConfigs = providers
    .map(providerId => {
      const provider = getProvider(providerId);
      if (!provider) {
        throw new Error(`Unknown OAuth provider: ${providerId}`);
      }

      return `  ${providerId}: {
    clientId: process.env.${provider.clientIdVar}!,
    clientSecret: process.env.${provider.clientSecretVar}!,
    redirectURI: \`\${process.env.SITE_URL}/api/auth/callback/${providerId}\`,
  }`;
    })
    .join(',\n');

  return `socialProviders: {
${providerConfigs}
},`;
}

/**
 * Generates OAuth UI configuration block for better-auth-ui
 * Creates an array of provider IDs for the UI component
 *
 * @param providers - Array of provider IDs (e.g., ['google', 'github'])
 * @returns Generated provider array as string
 */
export function generateOAuthUIConfigBlock(providers: string[]): string {
  if (providers.length === 0) {
    return '';
  }

  const providerList = providers.map(id => `'${id}'`).join(', ');
  return `providers: [${providerList}],`;
}

/**
 * Generates environment variable declarations for OAuth providers
 * Creates CLIENT_ID and CLIENT_SECRET pairs for each provider
 *
 * @param providers - Array of provider IDs (e.g., ['google', 'github'])
 * @returns Generated environment variable declarations as string
 */
export function generateEnvVarsBlock(providers: string[]): string {
  if (providers.length === 0) {
    return '';
  }

  return providers
    .map(providerId => {
      const provider = getProvider(providerId);
      if (!provider) {
        throw new Error(`Unknown OAuth provider: ${providerId}`);
      }

      return `${provider.clientIdVar}=\n${provider.clientSecretVar}=`;
    })
    .join('\n');
}
