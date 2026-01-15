/**
 * OAuth Provider Registry
 *
 * This module provides a centralized registry of all OAuth providers
 * supported by Better Auth, along with helper functions for provider lookup.
 */

import type { OAuthProvider } from './types.js';

/**
 * Registry of all supported OAuth providers
 * Maps provider ID to provider configuration
 */
export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    envPrefix: 'GOOGLE',
    clientIdVar: 'GOOGLE_CLIENT_ID',
    clientSecretVar: 'GOOGLE_CLIENT_SECRET',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    envPrefix: 'GITHUB',
    clientIdVar: 'GITHUB_CLIENT_ID',
    clientSecretVar: 'GITHUB_CLIENT_SECRET',
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    envPrefix: 'DISCORD',
    clientIdVar: 'DISCORD_CLIENT_ID',
    clientSecretVar: 'DISCORD_CLIENT_SECRET',
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    envPrefix: 'TWITTER',
    clientIdVar: 'TWITTER_CLIENT_ID',
    clientSecretVar: 'TWITTER_CLIENT_SECRET',
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    envPrefix: 'APPLE',
    clientIdVar: 'APPLE_CLIENT_ID',
    clientSecretVar: 'APPLE_CLIENT_SECRET',
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    envPrefix: 'MICROSOFT',
    clientIdVar: 'MICROSOFT_CLIENT_ID',
    clientSecretVar: 'MICROSOFT_CLIENT_SECRET',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    envPrefix: 'FACEBOOK',
    clientIdVar: 'FACEBOOK_CLIENT_ID',
    clientSecretVar: 'FACEBOOK_CLIENT_SECRET',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    envPrefix: 'LINKEDIN',
    clientIdVar: 'LINKEDIN_CLIENT_ID',
    clientSecretVar: 'LINKEDIN_CLIENT_SECRET',
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    envPrefix: 'TWITCH',
    clientIdVar: 'TWITCH_CLIENT_ID',
    clientSecretVar: 'TWITCH_CLIENT_SECRET',
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    envPrefix: 'SPOTIFY',
    clientIdVar: 'SPOTIFY_CLIENT_ID',
    clientSecretVar: 'SPOTIFY_CLIENT_SECRET',
  },
};

/**
 * Gets a provider configuration by ID
 *
 * @param id - The provider ID to lookup
 * @returns The provider configuration, or undefined if not found
 */
export function getProvider(id: string): OAuthProvider | undefined {
  return OAUTH_PROVIDERS[id];
}

/**
 * Gets an array of all supported provider IDs
 *
 * @returns Array of provider IDs
 */
export function getProviderIds(): string[] {
  return Object.keys(OAUTH_PROVIDERS);
}
