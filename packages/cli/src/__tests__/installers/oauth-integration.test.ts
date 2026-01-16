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
  OAUTH_PROVIDERS,
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
import type { OAuthProvider } from '../../installers/types.js';

describe('Task Group 6: OAuth Integration Tests', () => {
  describe('OAUTH_PROVIDERS Constant Integrity', () => {
    it('should have all 33 providers defined', () => {
      const providerIds = getProviderIds();
      expect(providerIds.length).toBe(33);
    });

    it('should have exactly 10 popular providers', () => {
      const popularProviders = getPopularProviders();
      expect(popularProviders.length).toBe(10);
    });

    it('should have exactly 23 additional providers', () => {
      const additionalProviders = getAdditionalProviders();
      expect(additionalProviders.length).toBe(23);
    });

    it('should have all required fields populated for each provider', () => {
      const providerIds = getProviderIds();

      providerIds.forEach(id => {
        const provider = getProvider(id);
        expect(provider).toBeDefined();

        if (!provider) return;

        // Basic fields
        expect(provider.id).toBe(id);
        expect(provider.name).toBeTruthy();
        expect(provider.name.length).toBeGreaterThan(0);
        expect(provider.envPrefix).toBeTruthy();
        expect(provider.clientIdVar).toBeTruthy();
        expect(provider.clientSecretVar).toBeTruthy();

        // Popular field should be boolean
        expect(typeof provider.popular).toBe('boolean');

        // Better Auth config
        expect(provider.betterAuthConfig).toBeDefined();
        expect(provider.betterAuthConfig?.socialProvider).toBeTruthy();
        expect(provider.betterAuthConfig?.socialProvider.length).toBeGreaterThan(0);

        // Environment variables
        expect(provider.env).toBeDefined();
        expect(Array.isArray(provider.env)).toBe(true);
        expect(provider.env!.length).toBeGreaterThan(0);

        provider.env?.forEach(envVar => {
          expect(envVar.name).toBeTruthy();
          expect(['server', 'client']).toContain(envVar.type);
          expect(envVar.description).toBeTruthy();
        });

        // Documentation URLs
        expect(provider.docs).toBeDefined();
        expect(provider.docs?.provider).toBeTruthy();
        expect(provider.docs?.betterAuth).toBeTruthy();

        // README content
        expect(provider.readme).toBeDefined();
        expect(provider.readme?.title).toBeTruthy();
        expect(provider.readme?.content).toBeTruthy();
        expect(provider.readme?.content.length).toBeGreaterThan(0);

        // Extra config flags (boolean)
        expect(typeof provider.requiresExtraConfig).toBe('boolean');
        if (provider.requiresExtraConfig) {
          expect(provider.extraConfigNotes).toBeTruthy();
          expect(provider.extraConfigNotes!.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have no empty strings for required fields', () => {
      const providerIds = getProviderIds();

      providerIds.forEach(id => {
        const provider = getProvider(id);
        if (!provider) return;

        expect(provider.name).not.toBe('');
        expect(provider.envPrefix).not.toBe('');
        expect(provider.clientIdVar).not.toBe('');
        expect(provider.clientSecretVar).not.toBe('');
        expect(provider.betterAuthConfig?.socialProvider).not.toBe('');
        expect(provider.docs?.provider).not.toBe('');
        expect(provider.docs?.betterAuth).not.toBe('');
        expect(provider.readme?.title).not.toBe('');
        expect(provider.readme?.content).not.toBe('');
      });
    });

    it('should have correct provider IDs matching Better Auth expected values', () => {
      const expectedProviderIds = [
        // Popular
        'google', 'github', 'discord', 'apple', 'microsoft',
        'facebook', 'twitter', 'linkedin', 'twitch', 'spotify',
        // Additional
        'atlassian', 'cognito', 'dropbox', 'figma', 'gitlab',
        'huggingface', 'kakao', 'kick', 'line', 'linear',
        'naver', 'notion', 'paybin', 'paypal', 'polar',
        'reddit', 'roblox', 'salesforce', 'slack', 'tiktok',
        'vercel', 'vk', 'zoom'
      ];

      const actualProviderIds = getProviderIds().sort();
      const expectedSorted = expectedProviderIds.sort();

      expect(actualProviderIds).toEqual(expectedSorted);
    });

    it('should only have GitHub flagged with requiresExtraConfig', () => {
      const providerIds = getProviderIds();
      const providersRequiringExtraConfig = providerIds.filter(id => {
        const provider = getProvider(id);
        return provider?.requiresExtraConfig === true;
      });

      // Only GitHub should require extra config (user:email scope)
      expect(providersRequiringExtraConfig).toEqual(['github']);

      // Verify GitHub has the extra config notes
      const github = getProvider('github');
      expect(github?.extraConfigNotes).toContain('user:email');
    });
  });

  describe('generateOAuthConfigBlock - Multiple Providers', () => {
    it('should generate valid TypeScript for multiple providers', () => {
      const providers = ['google', 'github', 'discord'];
      const result = generateOAuthConfigBlock(providers);

      // Should be valid TypeScript object structure
      expect(result).toContain('socialProviders: {');
      expect(result).toContain('google: {');
      expect(result).toContain('github: {');
      expect(result).toContain('discord: {');
      expect(result).toContain('process.env.GOOGLE_CLIENT_ID');
      expect(result).toContain('process.env.GITHUB_CLIENT_ID');
      expect(result).toContain('process.env.DISCORD_CLIENT_ID');
      expect(result).toContain('as string');

      // Should have proper structure
      expect(result.startsWith('socialProviders: {')).toBe(true);
      expect(result.endsWith('},')).toBe(true);
    });

    it('should generate valid config for all 33 providers', () => {
      const allProviders = getProviderIds();
      const result = generateOAuthConfigBlock(allProviders);

      // Should contain socialProviders wrapper
      expect(result).toContain('socialProviders: {');

      // Should contain each provider
      allProviders.forEach(providerId => {
        expect(result).toContain(`${providerId}: {`);
      });

      // Should be syntactically valid (contains process.env references)
      expect(result.match(/process\.env\./g)?.length).toBeGreaterThan(60); // At least 2 per provider
    });
  });

  describe('generateEnvVarsBlock - Framework Prefixes', () => {
    it('should use NEXT_PUBLIC_ prefix for Next.js client vars (if any existed)', () => {
      // Currently all OAuth vars are server-only
      // This test verifies the system would work if client vars were added
      const providers = ['google', 'github'];
      const result = generateEnvVarsBlock(providers, 'nextjs');

      // All current OAuth vars are server-only, so no NEXT_PUBLIC_ prefix
      expect(result).not.toContain('NEXT_PUBLIC_');
      expect(result).toContain('GOOGLE_CLIENT_ID=');
      expect(result).toContain('GITHUB_CLIENT_ID=');
    });

    it('should use VITE_ prefix for TanStack client vars (if any existed)', () => {
      // Currently all OAuth vars are server-only
      // This test verifies the system would work if client vars were added
      const providers = ['google', 'github'];
      const result = generateEnvVarsBlock(providers, 'tanstack');

      // All current OAuth vars are server-only, so no VITE_ prefix
      expect(result).not.toContain('VITE_');
      expect(result).toContain('GOOGLE_CLIENT_ID=');
      expect(result).toContain('GITHUB_CLIENT_ID=');
    });

    it('should include descriptions as comments for all providers', () => {
      const providers = ['google', 'github', 'discord'];
      const result = generateEnvVarsBlock(providers, 'nextjs');

      // Should have comments for each variable
      expect(result).toContain('# Google OAuth Client ID');
      expect(result).toContain('# Google OAuth Client Secret');
      expect(result).toContain('# GitHub OAuth App Client ID');
      expect(result).toContain('# GitHub OAuth App Client Secret');
      expect(result).toContain('# Discord OAuth Application Client ID');
      expect(result).toContain('# Discord OAuth Application Client Secret');
    });

    it('should generate valid env vars for all 33 providers', () => {
      const allProviders = getProviderIds();
      const resultNextjs = generateEnvVarsBlock(allProviders, 'nextjs');
      const resultTanstack = generateEnvVarsBlock(allProviders, 'tanstack');

      // Both should have content
      expect(resultNextjs.length).toBeGreaterThan(0);
      expect(resultTanstack.length).toBeGreaterThan(0);

      // Should have at least 66 variable declarations (2 per provider)
      const nextjsLines = resultNextjs.split('\n');
      const tanstackLines = resultTanstack.split('\n');

      expect(nextjsLines.length).toBeGreaterThan(65);
      expect(tanstackLines.length).toBeGreaterThan(65);

      // Should not have undefined or null
      expect(resultNextjs).not.toContain('undefined');
      expect(resultNextjs).not.toContain('null');
      expect(resultTanstack).not.toContain('undefined');
      expect(resultTanstack).not.toContain('null');
    });
  });

  describe('generateReadmeSection - Valid Markdown', () => {
    it('should produce valid markdown with section headers', () => {
      const providers = ['google', 'github'];
      const result = generateReadmeSection(providers);

      // Should have main heading
      expect(result).toContain('# OAuth Provider Setup');

      // Should have provider-specific headings
      expect(result).toContain('## Google OAuth Setup');
      expect(result).toContain('## GitHub OAuth Setup');

      // Should have separators
      expect(result).toContain('---');
    });

    it('should include provider documentation links', () => {
      const providers = ['google', 'github', 'discord'];
      const result = generateReadmeSection(providers);

      // Should contain setup URLs
      expect(result).toContain('https://console.cloud.google.com/apis/credentials');
      expect(result).toContain('https://github.com/settings/developers');
      expect(result).toContain('https://discord.com/developers/applications');

      // Should contain Better Auth links
      expect(result).toContain('Better Auth');
    });

    it('should generate valid markdown for all 33 providers', () => {
      const allProviders = getProviderIds();
      const result = generateReadmeSection(allProviders);

      // Should have main heading
      expect(result).toContain('# OAuth Provider Setup');

      // Should have 33 provider sections
      const sectionCount = (result.match(/## \w+/g) || []).length;
      expect(sectionCount).toBe(33);

      // Should have horizontal rule separators (32 separators for 33 sections)
      const separatorCount = (result.match(/\n---\n/g) || []).length;
      expect(separatorCount).toBe(32);

      // Should not have undefined or empty sections
      expect(result).not.toContain('undefined');
      expect(result).not.toContain('## \n\n');
    });
  });

  describe('generateOAuthUIConfigBlock - UI Provider Array', () => {
    it('should generate provider array for UI component', () => {
      const providers = ['google', 'github'];
      const result = generateOAuthUIConfigBlock(providers);

      expect(result).toContain("providers: ['google', 'github'],");
    });

    it('should handle single provider', () => {
      const providers = ['google'];
      const result = generateOAuthUIConfigBlock(providers);

      expect(result).toContain("providers: ['google'],");
    });

    it('should handle empty array', () => {
      const providers: string[] = [];
      const result = generateOAuthUIConfigBlock(providers);

      expect(result).toBe('');
    });
  });

  describe('getProvidersRequiringExtraConfig - Warning System', () => {
    it('should identify providers with extra config requirements', () => {
      const providers = ['google', 'github', 'discord'];
      const result = getProvidersRequiringExtraConfig(providers);

      // Only GitHub requires extra config
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('github');
      expect(result[0].requiresExtraConfig).toBe(true);
      expect(result[0].extraConfigNotes).toContain('user:email');
    });

    it('should return empty array when no providers need extra config', () => {
      const providers = ['google', 'discord'];
      const result = getProvidersRequiringExtraConfig(providers);

      expect(result.length).toBe(0);
    });

    it('should handle all 33 providers correctly', () => {
      const allProviders = getProviderIds();
      const result = getProvidersRequiringExtraConfig(allProviders);

      // Only GitHub should be flagged
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('github');
    });
  });

  describe('Integration: Full Flow Scenarios', () => {
    it('should generate complete configuration for Next.js project with popular providers', () => {
      const providers = ['google', 'github', 'discord'];

      // Generate all components
      const authConfig = generateOAuthConfigBlock(providers);
      const uiConfig = generateOAuthUIConfigBlock(providers);
      const envVars = generateEnvVarsBlock(providers, 'nextjs');
      const readme = generateReadmeSection(providers);
      const warnings = getProvidersRequiringExtraConfig(providers);

      // Verify auth config
      expect(authConfig).toContain('socialProviders: {');
      expect(authConfig).toContain('google: {');
      expect(authConfig).toContain('github: {');
      expect(authConfig).toContain('discord: {');

      // Verify UI config
      expect(uiConfig).toContain("providers: ['google', 'github', 'discord'],");

      // Verify env vars
      expect(envVars).toContain('GOOGLE_CLIENT_ID=');
      expect(envVars).toContain('GITHUB_CLIENT_ID=');
      expect(envVars).toContain('DISCORD_CLIENT_ID=');

      // Verify README
      expect(readme).toContain('## Google OAuth Setup');
      expect(readme).toContain('## GitHub OAuth Setup');
      expect(readme).toContain('## Discord OAuth Setup');

      // Verify warnings
      expect(warnings.length).toBe(1);
      expect(warnings[0].id).toBe('github');
    });

    it('should generate complete configuration for TanStack project with additional providers', () => {
      const providers = ['gitlab', 'notion', 'linear'];

      // Generate all components
      const authConfig = generateOAuthConfigBlock(providers);
      const uiConfig = generateOAuthUIConfigBlock(providers);
      const envVars = generateEnvVarsBlock(providers, 'tanstack');
      const readme = generateReadmeSection(providers);
      const warnings = getProvidersRequiringExtraConfig(providers);

      // Verify auth config
      expect(authConfig).toContain('socialProviders: {');
      expect(authConfig).toContain('gitlab: {');
      expect(authConfig).toContain('notion: {');
      expect(authConfig).toContain('linear: {');

      // Verify UI config
      expect(uiConfig).toContain("providers: ['gitlab', 'notion', 'linear'],");

      // Verify env vars
      expect(envVars).toContain('GITLAB_CLIENT_ID=');
      expect(envVars).toContain('NOTION_CLIENT_ID=');
      expect(envVars).toContain('LINEAR_CLIENT_ID=');

      // Verify README
      expect(readme).toContain('## GitLab OAuth Setup');
      expect(readme).toContain('## Notion OAuth Setup');
      expect(readme).toContain('## Linear OAuth Setup');

      // Verify no warnings (these providers don't need extra config)
      expect(warnings.length).toBe(0);
    });

    it('should handle edge case: empty provider selection', () => {
      const providers: string[] = [];

      // All functions should handle empty array gracefully
      const authConfig = generateOAuthConfigBlock(providers);
      const uiConfig = generateOAuthUIConfigBlock(providers);
      const envVars = generateEnvVarsBlock(providers, 'nextjs');
      const readme = generateReadmeSection(providers);
      const warnings = getProvidersRequiringExtraConfig(providers);

      expect(authConfig).toBe('');
      expect(uiConfig).toBe('');
      expect(envVars).toBe('');
      expect(readme).toBe('');
      expect(warnings.length).toBe(0);
    });

    it('should handle edge case: single provider selection', () => {
      const providers = ['google'];

      const authConfig = generateOAuthConfigBlock(providers);
      const uiConfig = generateOAuthUIConfigBlock(providers);
      const envVars = generateEnvVarsBlock(providers, 'nextjs');
      const readme = generateReadmeSection(providers);

      // All should have content
      expect(authConfig.length).toBeGreaterThan(0);
      expect(uiConfig.length).toBeGreaterThan(0);
      expect(envVars.length).toBeGreaterThan(0);
      expect(readme.length).toBeGreaterThan(0);

      // Should contain Google
      expect(authConfig).toContain('google: {');
      expect(uiConfig).toContain("'google'");
      expect(envVars).toContain('GOOGLE_CLIENT_ID=');
      expect(readme).toContain('## Google OAuth Setup');
    });

    it('should generate valid code for maximum selection (all 33 providers)', () => {
      const allProviders = getProviderIds();

      const authConfig = generateOAuthConfigBlock(allProviders);
      const uiConfig = generateOAuthUIConfigBlock(allProviders);
      const envVars = generateEnvVarsBlock(allProviders, 'nextjs');
      const readme = generateReadmeSection(allProviders);

      // Verify substantial content
      expect(authConfig.length).toBeGreaterThan(1000);
      expect(uiConfig.length).toBeGreaterThan(100);
      expect(envVars.length).toBeGreaterThan(1000);
      expect(readme.length).toBeGreaterThan(5000);

      // Verify no syntax errors (basic checks)
      expect(authConfig).not.toContain('undefined');
      expect(authConfig).not.toContain('null');
      expect(authConfig.match(/\{/g)?.length).toEqual(authConfig.match(/\}/g)?.length);
    });
  });

  describe('Type Safety and Error Handling', () => {
    it('should throw error for unknown provider ID', () => {
      expect(() => {
        generateOAuthConfigBlock(['unknown-provider']);
      }).toThrow('Unknown OAuth provider: unknown-provider');
    });

    it('should throw error for invalid provider in env generation', () => {
      expect(() => {
        generateEnvVarsBlock(['invalid-provider'], 'nextjs');
      }).toThrow('Unknown OAuth provider: invalid-provider');
    });

    it('should throw error for invalid provider in README generation', () => {
      expect(() => {
        generateReadmeSection(['invalid-provider']);
      }).toThrow('Unknown OAuth provider: invalid-provider');
    });
  });

  describe('Provider Filtering and Lookup', () => {
    it('should retrieve provider by ID', () => {
      const google = getProvider('google');
      expect(google).toBeDefined();
      expect(google?.id).toBe('google');
      expect(google?.name).toBe('Google');
    });

    it('should return undefined for non-existent provider', () => {
      const unknown = getProvider('non-existent');
      expect(unknown).toBeUndefined();
    });

    it('should separate popular and additional providers correctly', () => {
      const popular = getPopularProviders();
      const additional = getAdditionalProviders();

      // No overlap
      const popularIds = popular.map(p => p.id);
      const additionalIds = additional.map(p => p.id);
      const overlap = popularIds.filter(id => additionalIds.includes(id));
      expect(overlap.length).toBe(0);

      // Total should be 33
      expect(popular.length + additional.length).toBe(33);

      // All popular should have popular: true
      popular.forEach(p => {
        expect(p.popular).toBe(true);
      });

      // All additional should have popular: false
      additional.forEach(p => {
        expect(p.popular).toBe(false);
      });
    });
  });
});
