/**
 * Tests for Task Group 2: String Utils Enhancements
 * Tests the enhanced replacePlaceholder function and new string generation functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { tmpdir } from 'os';
import {
  replacePlaceholder,
  generateEmailPasswordConfig,
  generateAuthProvidersBlock,
  generateOAuthUIProvidersBlock,
} from '../installers/string-utils.js';

describe('Task Group 2: String Utils Enhancements', () => {
  let testDir: string;
  let testFile: string;

  beforeEach(async () => {
    // Create temporary test directory and file
    testDir = await fs.mkdtemp(path.join(tmpdir(), 'string-utils-test-'));
    testFile = path.join(testDir, 'test.ts');
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.remove(testDir);
  });

  describe('replacePlaceholder - Line Removal', () => {
    it('should remove entire placeholder line when content is empty string', async () => {
      const content = `export const config = {
  // {{PLACEHOLDER}}
  otherProp: true,
};`;

      await fs.writeFile(testFile, content, 'utf-8');
      await replacePlaceholder(testFile, '// {{PLACEHOLDER}}', '');

      const result = await fs.readFile(testFile, 'utf-8');

      // Placeholder line should be completely removed
      expect(result).not.toContain('// {{PLACEHOLDER}}');
      expect(result).toContain('export const config = {');
      expect(result).toContain('otherProp: true,');

      // Should not have extra blank lines where placeholder was
      expect(result).not.toContain('{\n\n  otherProp');
    });

    it('should remove entire placeholder line when content is removal marker', async () => {
      const content = `<Component
  prop1="value1"
  // {{SOCIAL_PROP}}
  prop2="value2"
>`;

      await fs.writeFile(testFile, content, 'utf-8');
      await replacePlaceholder(testFile, '// {{SOCIAL_PROP}}', '__REMOVE_SOCIAL_PROP__');

      const result = await fs.readFile(testFile, 'utf-8');

      // Placeholder line should be completely removed
      expect(result).not.toContain('// {{SOCIAL_PROP}}');
      expect(result).toContain('prop1="value1"');
      expect(result).toContain('prop2="value2"');
    });

    it('should replace placeholder with content when content is not empty', async () => {
      const content = `providers: [
  // {{AUTH_PROVIDERS}}
]`;

      await fs.writeFile(testFile, content, 'utf-8');
      await replacePlaceholder(
        testFile,
        '// {{AUTH_PROVIDERS}}',
        'emailAndPassword: {\n      enabled: true\n    },'
      );

      const result = await fs.readFile(testFile, 'utf-8');

      // Placeholder should be replaced with content
      expect(result).not.toContain('// {{AUTH_PROVIDERS}}');
      expect(result).toContain('emailAndPassword: {');
      expect(result).toContain('enabled: true');
    });

    it('should preserve indentation when replacing placeholder', async () => {
      const content = `export const config = {
    providers: [
      // {{AUTH_PROVIDERS}}
    ],
  };`;

      await fs.writeFile(testFile, content, 'utf-8');
      await replacePlaceholder(
        testFile,
        '// {{AUTH_PROVIDERS}}',
        'Google,\nGitHub,'
      );

      const result = await fs.readFile(testFile, 'utf-8');

      // Content should be indented to match placeholder
      expect(result).toContain('      Google,\n      GitHub,');
    });
  });

  describe('generateEmailPasswordConfig', () => {
    it('should return config object when enabled is true', () => {
      const result = generateEmailPasswordConfig(true);

      expect(result).toContain('emailAndPassword: {');
      expect(result).toContain('enabled: true');
    });

    it('should return empty string when enabled is false', () => {
      const result = generateEmailPasswordConfig(false);

      expect(result).toBe('');
    });
  });

  describe('generateAuthProvidersBlock', () => {
    it('should generate combined email/password and OAuth config using object structure', () => {
      const result = generateAuthProvidersBlock(['google', 'github'], true);

      // Should include email/password config as object
      expect(result).toContain('emailAndPassword: {');
      expect(result).toContain('enabled: true');

      // Should include OAuth providers in socialProviders object
      expect(result).toContain('socialProviders: {');
      expect(result).toContain('google: {');
      expect(result).toContain('clientId: process.env.GOOGLE_CLIENT_ID as string');
      expect(result).toContain('github: {');
      expect(result).toContain('clientId: process.env.GITHUB_CLIENT_ID as string');
    });

    it('should generate only email/password when OAuth providers empty', () => {
      const result = generateAuthProvidersBlock([], true);

      // Should only include email/password object
      expect(result).toContain('emailAndPassword: {');
      expect(result).toContain('enabled: true');
      expect(result).not.toContain('socialProviders');
      expect(result).not.toContain('google');
    });

    it('should generate only OAuth when email/password disabled', () => {
      const result = generateAuthProvidersBlock(['google'], false);

      // Should only include OAuth providers in socialProviders object
      expect(result).toContain('socialProviders: {');
      expect(result).toContain('google: {');
      expect(result).toContain('clientId: process.env.GOOGLE_CLIENT_ID as string');
      expect(result).not.toContain('emailAndPassword');
    });

    it('should return empty string when both are disabled/empty', () => {
      const result = generateAuthProvidersBlock([], false);

      // Should return empty string to trigger line removal
      expect(result).toBe('');
    });

    it('should format multiple OAuth providers with proper newlines', () => {
      const result = generateAuthProvidersBlock(['google', 'github'], false);

      // Should have newline between providers in object format
      expect(result).toContain(',\n');
      expect(result).toContain('socialProviders: {');
      expect(result).toContain('google: {');
      expect(result).toContain('github: {');
    });
  });

  describe('generateOAuthUIProvidersBlock', () => {
    it('should generate social prop with providers array when providers exist', () => {
      const result = generateOAuthUIProvidersBlock(['google', 'github']);

      // Should generate proper social prop format
      expect(result).toContain('social={{');
      expect(result).toContain('providers: ["google", "github"]');
      expect(result).toContain('}}');
    });

    it('should generate social prop with single provider', () => {
      const result = generateOAuthUIProvidersBlock(['google']);

      expect(result).toContain('social={{');
      expect(result).toContain('providers: ["google"]');
      expect(result).toContain('}}');
    });

    it('should return removal marker when providers array is empty', () => {
      const result = generateOAuthUIProvidersBlock([]);

      // Should return special removal marker
      expect(result).toBe('__REMOVE_SOCIAL_PROP__');
    });

    it('should use double quotes for provider IDs', () => {
      const result = generateOAuthUIProvidersBlock(['google', 'github']);

      // Should use double quotes, not single quotes
      expect(result).toContain('"google"');
      expect(result).toContain('"github"');
      expect(result).not.toContain("'google'");
    });
  });

  describe('Integration: Clean Code Generation', () => {
    it('should generate clean code without placeholders - email/password only', async () => {
      const content = `export const { auth } = convexAuth({
  providers: [
    // {{AUTH_PROVIDERS}}
  ],
});`;

      await fs.writeFile(testFile, content, 'utf-8');

      const authProviders = generateAuthProvidersBlock([], true);
      await replacePlaceholder(testFile, '// {{AUTH_PROVIDERS}}', authProviders);

      const result = await fs.readFile(testFile, 'utf-8');

      // Should have clean output with no placeholder comments using object format
      expect(result).not.toContain('// {{AUTH_PROVIDERS}}');
      expect(result).toContain('emailAndPassword: {');
      expect(result).toContain('enabled: true');
    });

    it('should generate clean code without placeholders - OAuth only', async () => {
      const content = `export const { auth } = convexAuth({
  providers: [
    // {{AUTH_PROVIDERS}}
  ],
});`;

      await fs.writeFile(testFile, content, 'utf-8');

      const authProviders = generateAuthProvidersBlock(['google'], false);
      await replacePlaceholder(testFile, '// {{AUTH_PROVIDERS}}', authProviders);

      const result = await fs.readFile(testFile, 'utf-8');

      // Should have clean output with no placeholder comments using object format
      expect(result).not.toContain('// {{AUTH_PROVIDERS}}');
      expect(result).toContain('socialProviders: {');
      expect(result).toContain('google: {');
      expect(result).toContain('clientId: process.env.GOOGLE_CLIENT_ID as string');
      expect(result).not.toContain('emailAndPassword');
    });

    it('should remove placeholder line when no auth methods selected', async () => {
      const content = `export const { auth } = convexAuth({
  providers: [
    // {{AUTH_PROVIDERS}}
  ],
});`;

      await fs.writeFile(testFile, content, 'utf-8');

      const authProviders = generateAuthProvidersBlock([], false);
      await replacePlaceholder(testFile, '// {{AUTH_PROVIDERS}}', authProviders);

      const result = await fs.readFile(testFile, 'utf-8');

      // Placeholder line should be completely removed
      expect(result).not.toContain('// {{AUTH_PROVIDERS}}');
      // Empty providers array should remain clean
      expect(result).toContain('providers: [\n  ]');
    });

    it('should remove social prop line when no OAuth providers', async () => {
      const content = `<AuthUIProviderTanstack
  authClient={authClient}
  // {{OAUTH_UI_PROVIDERS}}
>`;

      await fs.writeFile(testFile, content, 'utf-8');

      const socialProp = generateOAuthUIProvidersBlock([]);
      await replacePlaceholder(testFile, '// {{OAUTH_UI_PROVIDERS}}', socialProp);

      const result = await fs.readFile(testFile, 'utf-8');

      // Placeholder and social prop should be completely removed
      expect(result).not.toContain('// {{OAUTH_UI_PROVIDERS}}');
      expect(result).not.toContain('social={{');
      expect(result).toContain('<AuthUIProviderTanstack\n  authClient={authClient}\n>');
    });
  });
});
