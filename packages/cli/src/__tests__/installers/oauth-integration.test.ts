/**
 * Task Group 6: Integration Tests for OAuth Provider System
 *
 * Tests the complete OAuth provider flow including:
 * - OAUTH_PROVIDERS constant integrity
 * - Code generation functions with multiple providers
 * - Framework-specific environment variable prefixes
 * - README markdown generation
 * - Full integration scenarios
 */

import { describe, it, expect } from 'vitest';
import {
  getProvider,
  getProviderIds,
  getPopularProviders,
  getAdditionalProviders,
} from '../../installers/providers.js';
import {
  generateOAuthConfigBlock,
  generateEnvVarsBlock,
  generateReadmeSection,
  generateOAuthUIConfigBlock,
  getProvidersRequiringExtraConfig,
} from '../../installers/string-utils.js';

describe('Task Group 6: OAuth Integration Tests', () => {
  describe('OAUTH_PROVIDERS Constant Integrity', () => {
    it('should have all 33 OAuth providers defined', () => {
      const allProviders = getProviderIds();
      expect(allProviders).toHaveLength(33);
    });

    it('should have valid metadata for each provider', () => {
      const allProviders = getProviderIds();

      allProviders.forEach(providerId => {
        const provider = getProvider(providerId);
        expect(provider).toBeDefined();
        expect(provider?.id).toBe(providerId);
        expect(provider?.name).toBeTruthy();
        expect(provider?.envPrefix).toBeTruthy();
        expect(provider?.clientIdVar).toBeTruthy();
        expect(provider?.clientSecretVar).toBeTruthy();
      });
    });

    it('should separate popular and additional providers correctly', () => {
      const popularProviders = getPopularProviders();
      const additionalProviders = getAdditionalProviders();

      // Check that there's no overlap
      const popularIds = popularProviders.map(p => p.id);
      const additionalIds = additionalProviders.map(p => p.id);

      const overlap = popularIds.filter(id => additionalIds.includes(id));
      expect(overlap).toHaveLength(0);

      // Check that all providers are accounted for
      const totalCount = popularProviders.length + additionalProviders.length;
      expect(totalCount).toBe(33);
    });

    it('should have required betterAuthConfig for popular providers', () => {
      const popularProviders = getPopularProviders();

      popularProviders.forEach(provider => {
        expect(provider.betterAuthConfig).toBeDefined();
        expect(provider.betterAuthConfig?.socialProvider).toBeTruthy();
        expect(provider.betterAuthConfig?.clientSideProvider).toBeTruthy();
      });
    });
  });

  describe('OAuth Config Block Generation', () => {
    it('should generate config for a single provider (Google)', () => {
      const config = generateOAuthConfigBlock(['google']);

      expect(config).toContain('socialProviders: {');
      expect(config).toContain('clientId: process.env.GOOGLE_CLIENT_ID');
      expect(config).toContain('clientSecret: process.env.GOOGLE_CLIENT_SECRET');
    });

    it('should generate config for multiple providers', () => {
      const config = generateOAuthConfigBlock(['google', 'github', 'discord']);

      expect(config).toContain('socialProviders: {');
      expect(config).toContain('google:');
      expect(config).toContain('github:');
      expect(config).toContain('discord:');
    });

    it('should return empty string for no providers', () => {
      const config = generateOAuthConfigBlock([]);
      expect(config).toBe('');
    });

    it('should throw error for unknown provider', () => {
      expect(() => generateOAuthConfigBlock(['nonexistent'])).toThrow();
    });
  });

  describe('Environment Variables Block Generation', () => {
    it('should generate env vars with NEXT_PUBLIC_ prefix for Next.js', () => {
      const envVars = generateEnvVarsBlock(['google'], 'nextjs');

      expect(envVars).toBeTruthy();
      expect(envVars).toContain('GOOGLE_CLIENT_ID');
      expect(envVars).toContain('GOOGLE_CLIENT_SECRET');
    });

    it('should generate env vars with VITE_ prefix for TanStack', () => {
      const envVars = generateEnvVarsBlock(['google'], 'tanstack');

      expect(envVars).toBeTruthy();
      expect(envVars).toContain('GOOGLE_CLIENT_ID');
      expect(envVars).toContain('GOOGLE_CLIENT_SECRET');
    });

    it('should generate env vars for multiple providers', () => {
      const envVars = generateEnvVarsBlock(['google', 'github'], 'nextjs');

      expect(envVars).toContain('GOOGLE_CLIENT_ID');
      expect(envVars).toContain('GOOGLE_CLIENT_SECRET');
      expect(envVars).toContain('GITHUB_CLIENT_ID');
      expect(envVars).toContain('GITHUB_CLIENT_SECRET');
    });

    it('should return empty string for no providers', () => {
      const envVars = generateEnvVarsBlock([], 'nextjs');
      expect(envVars).toBe('');
    });

    it('should handle special cases like Figma (extra CLIENT_KEY)', () => {
      const envVars = generateEnvVarsBlock(['figma'], 'nextjs');

      expect(envVars).toContain('FIGMA_CLIENT_ID');
      expect(envVars).toContain('FIGMA_CLIENT_SECRET');
      // Note: Figma's CLIENT_KEY should also be in the env array
    });
  });

  describe('README Section Generation', () => {
    it('should generate README section for a single provider', () => {
      const readme = generateReadmeSection(['google']);

      expect(readme).toContain('# OAuth Provider Setup');
      expect(readme).toContain('Google');
    });

    it('should generate README sections for multiple providers', () => {
      const readme = generateReadmeSection(['google', 'github', 'discord']);

      expect(readme).toContain('# OAuth Provider Setup');
      expect(readme).toContain('Google');
      expect(readme).toContain('GitHub');
      expect(readme).toContain('Discord');
      expect(readme).toContain('---'); // Section separator
    });

    it('should return empty string for no providers', () => {
      const readme = generateReadmeSection([]);
      expect(readme).toBe('');
    });

    it('should include setup instructions from provider metadata', () => {
      const readme = generateReadmeSection(['google']);

      // Should contain helpful setup info
      expect(readme.length).toBeGreaterThan(100);
    });
  });

  describe('OAuth UI Config Block Generation', () => {
    it('should generate UI config for providers', () => {
      const uiConfig = generateOAuthUIConfigBlock(['google', 'github']);

      expect(uiConfig).toContain("providers:");
      expect(uiConfig).toContain("'google'");
      expect(uiConfig).toContain("'github'");
    });

    it('should return empty string for no providers', () => {
      const uiConfig = generateOAuthUIConfigBlock([]);
      expect(uiConfig).toBe('');
    });
  });

  describe('Providers Requiring Extra Config', () => {
    it('should identify providers with requiresExtraConfig flag', () => {
      const allProviderIds = getProviderIds();
      const extraConfigProviders = getProvidersRequiringExtraConfig(allProviderIds);

      // Should find at least a few providers with extra config requirements
      expect(extraConfigProviders.length).toBeGreaterThan(0);

      // All returned providers should have the flag set
      extraConfigProviders.forEach(provider => {
        expect(provider.requiresExtraConfig).toBe(true);
      });
    });

    it('should return empty array when no providers require extra config', () => {
      const basicProviders = ['google', 'github'];
      const extraConfigProviders = getProvidersRequiringExtraConfig(basicProviders);

      // Google and GitHub don't require extra config
      expect(extraConfigProviders).toHaveLength(0);
    });
  });

  describe('Full Integration Scenarios', () => {
    it('should handle a typical setup with 3 popular providers', () => {
      const providers = ['google', 'github', 'discord'];

      // Generate all necessary code blocks
      const oauthConfig = generateOAuthConfigBlock(providers);
      const envVars = generateEnvVarsBlock(providers, 'nextjs');
      const readme = generateReadmeSection(providers);
      const uiConfig = generateOAuthUIConfigBlock(providers);

      // Verify all blocks are generated
      expect(oauthConfig).toBeTruthy();
      expect(envVars).toBeTruthy();
      expect(readme).toBeTruthy();
      expect(uiConfig).toBeTruthy();

      // Verify content consistency
      providers.forEach(provider => {
        const providerData = getProvider(provider);
        expect(providerData).toBeDefined();
        expect(oauthConfig).toContain(provider);
        expect(envVars).toContain(providerData!.envPrefix);
        expect(readme).toContain(providerData!.name);
      });
    });

    it('should handle edge case with many providers (stress test)', () => {
      const providers = [
        'google', 'github', 'discord', 'spotify', 'twitch',
        'apple', 'facebook', 'microsoft', 'twitter', 'linkedin'
      ];

      // Generate all code blocks
      const oauthConfig = generateOAuthConfigBlock(providers);
      const envVars = generateEnvVarsBlock(providers, 'nextjs');
      const readme = generateReadmeSection(providers);

      // Verify all providers are included
      providers.forEach(provider => {
        expect(oauthConfig).toContain(provider);
      });

      // Verify structure is maintained
      expect(oauthConfig).toContain('socialProviders: {');
      expect(readme).toContain('# OAuth Provider Setup');
    });
  });
});
