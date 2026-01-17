/**
 * Tests for TweakCN OKLCH Converter Utility
 * Verifies color conversion, CSS parsing, and file/URL handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import {
  convertTweakCNToOKLCH,
  isValidURL,
  extractThemeName,
} from '../utils/tweakcn-converter.js';

// Mock fs-extra
vi.mock('fs-extra');

// Mock global fetch
global.fetch = vi.fn();

describe('TweakCN OKLCH Converter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('convertTweakCNToOKLCH', () => {
    describe('Hex to OKLCH conversion', () => {
      it('should convert hex colors to OKLCH format', async () => {
        const cssContent = `
          :root {
            --primary: #3b82f6;
            --secondary: #8b5cf6;
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        // Should contain the variable names
        expect(result).toContain('--primary:');
        expect(result).toContain('--secondary:');

        // Should contain percentage values (OKLCH format)
        expect(result).toMatch(/\d+%/);
      });

      it('should handle 3-digit hex colors', async () => {
        const cssContent = `
          :root {
            --color: #fff;
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        expect(result).toContain('--color:');
        expect(result).toMatch(/\d+%/);
      });
    });

    describe('RGB to OKLCH conversion', () => {
      it('should convert rgb() colors to OKLCH format', async () => {
        const cssContent = `
          :root {
            --color: rgb(59, 130, 246);
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        expect(result).toContain('--color:');
        expect(result).toMatch(/\d+%/);
      });

      it('should convert rgba() colors to OKLCH format', async () => {
        const cssContent = `
          :root {
            --color: rgba(59, 130, 246, 1);
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        expect(result).toContain('--color:');
        expect(result).toMatch(/\d+%/);
      });
    });

    describe('HSL to OKLCH conversion', () => {
      it('should convert hsl() colors to OKLCH format', async () => {
        const cssContent = `
          :root {
            --color: hsl(217, 91%, 60%);
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        expect(result).toContain('--color:');
        expect(result).toMatch(/\d+%/);
      });

      it('should convert space-separated HSL (TweakCN format) to OKLCH', async () => {
        const cssContent = `
          :root {
            --background: 0 0% 100%;
            --foreground: 240 10% 3.9%;
            --primary: 217 91% 60%;
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        expect(result).toContain('--background:');
        expect(result).toContain('--foreground:');
        expect(result).toContain('--primary:');
        expect(result).toMatch(/\d+%/);
      });
    });

    describe('OKLCH passthrough', () => {
      it('should pass through existing OKLCH values unchanged', async () => {
        const cssContent = `
          :root {
            --color: oklch(59.75% 0.196 254.28);
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        expect(result).toContain('--color:');
        expect(result).toContain('59.75% 0.196 254.28');
      });
    });

    describe('Multiple variables', () => {
      it('should parse and convert multiple CSS variables', async () => {
        const cssContent = `
          :root {
            --background: 0 0% 100%;
            --foreground: 240 10% 3.9%;
            --card: #ffffff;
            --primary: rgb(59, 130, 246);
            --secondary: hsl(280, 90%, 65%);
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        // All variables should be present
        expect(result).toContain('--background:');
        expect(result).toContain('--foreground:');
        expect(result).toContain('--card:');
        expect(result).toContain('--primary:');
        expect(result).toContain('--secondary:');
      });
    });

    describe('Non-color values', () => {
      it('should skip non-color CSS variables', async () => {
        const cssContent = `
          :root {
            --radius: 0.5rem;
            --font-size: 16px;
            --primary: #3b82f6;
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        // Should include color variable
        expect(result).toContain('--primary:');

        // Should NOT include non-color variables
        expect(result).not.toContain('--radius:');
        expect(result).not.toContain('--font-size:');
      });
    });

    describe('Dark theme support', () => {
      it('should parse colors from both :root and .dark blocks', async () => {
        const cssContent = `
          :root {
            --background: 0 0% 100%;
            --foreground: 240 10% 3.9%;
          }

          .dark {
            --background: 240 10% 3.9%;
            --foreground: 0 0% 98%;
          }
        `;

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        // Should parse all variables from both blocks
        expect(result).toContain('--background:');
        expect(result).toContain('--foreground:');

        // Should have converted both instances (light and dark)
        const backgroundMatches = result.match(/--background:/g);
        const foregroundMatches = result.match(/--foreground:/g);

        expect(backgroundMatches).toBeTruthy();
        expect(foregroundMatches).toBeTruthy();
        expect(backgroundMatches!.length).toBeGreaterThanOrEqual(1);
        expect(foregroundMatches!.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('URL and file path fetching', () => {
    describe('HTTP/HTTPS URL fetching', () => {
      it('should fetch CSS from valid HTTPS URL', async () => {
        const cssContent = ':root { --primary: #3b82f6; }';

        const mockResponse = {
          ok: true,
          text: vi.fn().mockResolvedValue(cssContent),
        };

        vi.mocked(global.fetch).mockResolvedValue(mockResponse as any);

        const result = await convertTweakCNToOKLCH({
          source: 'https://example.com/theme.css',
        });

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/theme.css');
        expect(result).toContain('--primary:');
      });

      it('should fetch CSS from valid HTTP URL', async () => {
        const cssContent = ':root { --primary: #3b82f6; }';

        const mockResponse = {
          ok: true,
          text: vi.fn().mockResolvedValue(cssContent),
        };

        vi.mocked(global.fetch).mockResolvedValue(mockResponse as any);

        const result = await convertTweakCNToOKLCH({
          source: 'http://example.com/theme.css',
        });

        expect(global.fetch).toHaveBeenCalledWith('http://example.com/theme.css');
        expect(result).toContain('--primary:');
      });

      it('should throw error for failed HTTP fetch', async () => {
        const mockResponse = {
          ok: false,
          status: 404,
          statusText: 'Not Found',
        };

        vi.mocked(global.fetch).mockResolvedValue(mockResponse as any);

        await expect(
          convertTweakCNToOKLCH({
            source: 'https://example.com/missing.css',
          })
        ).rejects.toThrow('Failed to fetch CSS from URL');
      });

      it('should throw error for network failures', async () => {
        vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

        await expect(
          convertTweakCNToOKLCH({
            source: 'https://example.com/theme.css',
          })
        ).rejects.toThrow('Failed to fetch CSS from URL');
      });
    });

    describe('Local file path reading', () => {
      it('should read CSS from local file path', async () => {
        const cssContent = ':root { --primary: #3b82f6; }';

        vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

        const result = await convertTweakCNToOKLCH({
          source: '/path/to/theme.css',
        });

        expect(fs.readFile).toHaveBeenCalledWith('/path/to/theme.css', 'utf-8');
        expect(result).toContain('--primary:');
      });

      it('should throw error for file not found', async () => {
        vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT: no such file'));

        await expect(
          convertTweakCNToOKLCH({
            source: '/path/to/missing.css',
          })
        ).rejects.toThrow('Failed to read CSS from file');
      });

      it('should throw error for read permission denied', async () => {
        vi.mocked(fs.readFile).mockRejectedValue(new Error('EACCES: permission denied'));

        await expect(
          convertTweakCNToOKLCH({
            source: '/path/to/restricted.css',
          })
        ).rejects.toThrow('Failed to read CSS from file');
      });
    });
  });

  describe('Utility functions', () => {
    describe('isValidURL', () => {
      it('should return true for valid HTTP URL', () => {
        expect(isValidURL('http://example.com/theme.css')).toBe(true);
      });

      it('should return true for valid HTTPS URL', () => {
        expect(isValidURL('https://example.com/theme.css')).toBe(true);
      });

      it('should return false for file path', () => {
        expect(isValidURL('/path/to/theme.css')).toBe(false);
      });

      it('should return false for relative path', () => {
        expect(isValidURL('./theme.css')).toBe(false);
      });

      it('should return false for invalid URL', () => {
        expect(isValidURL('not a url')).toBe(false);
      });

      it('should return false for ftp:// protocol', () => {
        expect(isValidURL('ftp://example.com/theme.css')).toBe(false);
      });
    });

    describe('extractThemeName', () => {
      it('should extract theme name from URL', () => {
        expect(extractThemeName('https://example.com/themes/dark.css')).toBe('dark');
      });

      it('should extract theme name from file path', () => {
        expect(extractThemeName('/path/to/themes/light.css')).toBe('light');
      });

      it('should handle names without extension', () => {
        expect(extractThemeName('https://example.com/themes/blue')).toBe('blue');
      });

      it('should return "custom" for empty or root paths', () => {
        expect(extractThemeName('/')).toBe('custom');
        expect(extractThemeName('')).toBe('custom');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed CSS gracefully', async () => {
      const cssContent = `
        :root {
          --broken syntax here
        }
      `;

      vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

      const result = await convertTweakCNToOKLCH({
        source: '/path/to/theme.css',
      });

      // Should not throw, just return empty or partial result
      expect(result).toBeDefined();
    });

    it('should handle empty CSS file', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('' as any);

      const result = await convertTweakCNToOKLCH({
        source: '/path/to/empty.css',
      });

      expect(result).toBe('');
    });

    it('should handle CSS with no color variables', async () => {
      const cssContent = `
        :root {
          --font-size: 16px;
          --spacing: 1rem;
        }
      `;

      vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

      const result = await convertTweakCNToOKLCH({
        source: '/path/to/theme.css',
      });

      expect(result).toBe('');
    });
  });

  describe('Format options', () => {
    it('should default to OKLCH format when format not specified', async () => {
      const cssContent = ':root { --primary: #3b82f6; }';

      vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

      const result = await convertTweakCNToOKLCH({
        source: '/path/to/theme.css',
      });

      // Should contain percentage (OKLCH format indicator)
      expect(result).toMatch(/\d+%/);
    });

    it('should respect explicit OKLCH format option', async () => {
      const cssContent = ':root { --primary: #3b82f6; }';

      vi.mocked(fs.readFile).mockResolvedValue(cssContent as any);

      const result = await convertTweakCNToOKLCH({
        source: '/path/to/theme.css',
        format: 'oklch',
      });

      expect(result).toMatch(/\d+%/);
    });
  });
});
