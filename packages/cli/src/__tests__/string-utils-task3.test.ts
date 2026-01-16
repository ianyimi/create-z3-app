/**
 * Tests for Task Group 3: String Utils Enhanced Generation Functions
 * Verifies all new and updated generation functions
 */

import { describe, it, expect } from 'vitest';
import {
  generateOAuthConfigBlock,
  generateEnvVarsBlock,
  generateReadmeSection,
  getProvidersRequiringExtraConfig,
} from '../installers/string-utils.js';

describe('Task Group 3: String Utils Enhanced Generation', () => {
  const testProviders = ['google', 'github'];

  describe('generateOAuthConfigBlock', () => {
    it('should use betterAuthConfig.socialProvider from OAUTH_PROVIDERS', () => {
      const result = generateOAuthConfigBlock(testProviders);

      // Should contain socialProviders wrapper
      expect(result).toContain('socialProviders: {');

      // Should contain Google config from betterAuthConfig.socialProvider
      expect(result).toContain('google: {');
      expect(result).toContain('clientId: process.env.GOOGLE_CLIENT_ID as string');
      expect(result).toContain('clientSecret: process.env.GOOGLE_CLIENT_SECRET as string');

      // Should contain GitHub config from betterAuthConfig.socialProvider
      expect(result).toContain('github: {');
      expect(result).toContain('clientId: process.env.GITHUB_CLIENT_ID as string');
      expect(result).toContain('clientSecret: process.env.GITHUB_CLIENT_SECRET as string');
    });

    it('should return empty string for empty provider array', () => {
      const result = generateOAuthConfigBlock([]);
      expect(result).toBe('');
    });
  });

  describe('generateEnvVarsBlock', () => {
    it('should include descriptions for Next.js', () => {
      const result = generateEnvVarsBlock(testProviders, 'nextjs');

      // Should include descriptions as comments
      expect(result).toContain('# Google OAuth Client ID');
      expect(result).toContain('# Google OAuth Client Secret');
      expect(result).toContain('# GitHub OAuth App Client ID');
      expect(result).toContain('# GitHub OAuth App Client Secret');

      // Should NOT have NEXT_PUBLIC_ prefix for server-only vars
      expect(result).toContain('GOOGLE_CLIENT_ID=');
      expect(result).toContain('GOOGLE_CLIENT_SECRET=');
      expect(result).toContain('GITHUB_CLIENT_ID=');
      expect(result).toContain('GITHUB_CLIENT_SECRET=');
    });

    it('should include descriptions for TanStack', () => {
      const result = generateEnvVarsBlock(testProviders, 'tanstack');

      // Should include descriptions as comments
      expect(result).toContain('# Google OAuth Client ID');
      expect(result).toContain('# Google OAuth Client Secret');

      // Should NOT have VITE_ prefix for server-only vars
      expect(result).toContain('GOOGLE_CLIENT_ID=');
      expect(result).toContain('GOOGLE_CLIENT_SECRET=');
    });

    it('should return empty string for empty provider array', () => {
      const resultNextjs = generateEnvVarsBlock([], 'nextjs');
      const resultTanstack = generateEnvVarsBlock([], 'tanstack');
      
      expect(resultNextjs).toBe('');
      expect(resultTanstack).toBe('');
    });
  });

  describe('generateReadmeSection', () => {
    it('should generate README markdown from provider.readme.content', () => {
      const result = generateReadmeSection(testProviders);

      // Should have main heading
      expect(result).toContain('# OAuth Provider Setup');

      // Should include Google setup content
      expect(result).toContain('## Google OAuth Setup');
      expect(result).toContain('https://console.cloud.google.com/apis/credentials');

      // Should include GitHub setup content
      expect(result).toContain('## GitHub OAuth Setup');
      expect(result).toContain('https://github.com/settings/developers');

      // Should have horizontal rule separator between sections
      expect(result).toContain('---');
    });

    it('should return empty string for empty provider array', () => {
      const result = generateReadmeSection([]);
      expect(result).toBe('');
    });
  });

  describe('getProvidersRequiringExtraConfig', () => {
    it('should filter providers with requiresExtraConfig=true', () => {
      const result = getProvidersRequiringExtraConfig(testProviders);

      // GitHub requires extra config (user:email scope)
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('github');
      expect(result[0].requiresExtraConfig).toBe(true);
      expect(result[0].extraConfigNotes).toContain('user:email scope');
    });

    it('should return empty array for providers without extra config', () => {
      const result = getProvidersRequiringExtraConfig(['google']);
      expect(result.length).toBe(0);
    });

    it('should return empty array for empty provider array', () => {
      const result = getProvidersRequiringExtraConfig([]);
      expect(result.length).toBe(0);
    });
  });
});
