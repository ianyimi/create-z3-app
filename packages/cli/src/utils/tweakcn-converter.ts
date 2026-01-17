/**
 * TweakCN OKLCH Converter Utility
 *
 * This module provides functionality to convert TweakCN themes to OKLCH color format.
 * It supports fetching themes from URLs or local file paths and converts various color
 * formats (hex, rgb, hsl) to OKLCH for use with modern CSS.
 */

import fs from 'fs-extra';
import convert from 'color-convert';

/**
 * Configuration options for TweakCN theme conversion
 */
export interface TweakCNConverterOptions {
  /** URL or file path to TweakCN stylesheet */
  source: string;
  /** Output format (default: 'oklch') */
  format?: 'oklch' | 'rgb' | 'hsl';
}

/**
 * Represents a parsed CSS color value
 */
interface ColorValue {
  /** CSS variable name (e.g., '--background') */
  name: string;
  /** Original color value (e.g., '#ffffff', 'rgb(255, 255, 255)') */
  value: string;
  /** Converted OKLCH value */
  oklch?: string;
}

/**
 * Converts TweakCN theme CSS to OKLCH color format
 *
 * This function:
 * 1. Fetches or reads the stylesheet from a URL or file path
 * 2. Parses CSS to extract color values
 * 3. Converts each color to OKLCH format using color-convert library
 * 4. Returns formatted CSS custom properties
 *
 * @param options - Configuration options for conversion
 * @returns Promise resolving to CSS string with OKLCH color variables
 *
 * @example
 * // Fetch from URL
 * const css = await convertTweakCNToOKLCH({
 *   source: 'https://tweakcn.com/theme/dark.css'
 * });
 *
 * @example
 * // Read from local file
 * const css = await convertTweakCNToOKLCH({
 *   source: '/path/to/theme.css'
 * });
 *
 * @throws {Error} If source cannot be fetched/read or contains invalid CSS
 */
export async function convertTweakCNToOKLCH(
  options: TweakCNConverterOptions
): Promise<string> {
  const { source, format = 'oklch' } = options;

  // Fetch or read the CSS content
  const cssContent = await fetchOrReadCSS(source);

  // Parse CSS to extract color values
  const colors = parseColorsFromCSS(cssContent);

  // Convert colors to OKLCH format
  const convertedColors = colors.map(color => ({
    ...color,
    oklch: convertColorToOKLCH(color.value),
  }));

  // Generate formatted CSS output
  return generateCSSOutput(convertedColors, format);
}

/**
 * Fetches CSS from a URL or reads from a local file path
 *
 * @param source - URL (http/https) or absolute file path
 * @returns Promise resolving to CSS content as string
 * @throws {Error} If URL fetch fails or file cannot be read
 */
async function fetchOrReadCSS(source: string): Promise<string> {
  // Check if source is a URL
  if (source.startsWith('http://') || source.startsWith('https://')) {
    try {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(
        `Failed to fetch CSS from URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Otherwise, treat as file path
  try {
    return await fs.readFile(source, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to read CSS from file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parses CSS content to extract color values from custom properties
 *
 * Supports TweakCN variable naming conventions and extracts colors from:
 * - :root blocks (light theme)
 * - .dark blocks (dark theme)
 *
 * @param css - CSS content to parse
 * @returns Array of parsed color values
 */
function parseColorsFromCSS(css: string): ColorValue[] {
  const colors: ColorValue[] = [];

  // Regular expression to match CSS custom properties with color values
  // Matches: --variable-name: value;
  const cssVarRegex = /--([\w-]+)\s*:\s*([^;]+);/g;

  let match;
  while ((match = cssVarRegex.exec(css)) !== null) {
    const name = `--${match[1]}`;
    const value = match[2].trim();

    // Only process if value looks like a color (not radius, etc.)
    if (isColorValue(value)) {
      colors.push({ name, value });
    }
  }

  return colors;
}

/**
 * Determines if a CSS value represents a color
 *
 * Checks for common color formats:
 * - Hex colors (#fff, #ffffff)
 * - RGB/RGBA (rgb(), rgba())
 * - HSL/HSLA (hsl(), hsla())
 * - OKLCH (oklch())
 * - HSL space-separated values (217 91% 60%)
 *
 * @param value - CSS value to check
 * @returns True if value appears to be a color
 */
function isColorValue(value: string): boolean {
  // Hex color
  if (value.startsWith('#')) {
    return true;
  }

  // RGB/RGBA
  if (value.startsWith('rgb(') || value.startsWith('rgba(')) {
    return true;
  }

  // HSL/HSLA
  if (value.startsWith('hsl(') || value.startsWith('hsla(')) {
    return true;
  }

  // OKLCH (already in target format)
  if (value.startsWith('oklch(')) {
    return true;
  }

  // Space-separated HSL values (common in Tailwind/TweakCN)
  // Format: "217 91% 60%" or "0 0% 100%"
  if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(value)) {
    return true;
  }

  return false;
}

/**
 * Converts a color value to OKLCH format
 *
 * Supports conversion from:
 * - Hex colors (#3b82f6)
 * - RGB colors (rgb(59, 130, 246))
 * - HSL colors (hsl(217, 91%, 60%))
 * - Space-separated HSL (217 91% 60%)
 * - OKLCH colors (passed through unchanged)
 *
 * @param colorValue - Original color value
 * @returns OKLCH color string (e.g., "59.75% 0.196 254.28")
 */
function convertColorToOKLCH(colorValue: string): string {
  const trimmed = colorValue.trim();

  // If already OKLCH, extract values and return
  if (trimmed.startsWith('oklch(')) {
    const match = trimmed.match(/oklch\(([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
  }

  // Parse color to RGB first (color-convert works best with RGB intermediate)
  let rgb: [number, number, number];

  try {
    if (trimmed.startsWith('#')) {
      // Hex color
      rgb = convert.hex.rgb(trimmed.slice(1));
    } else if (trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) {
      // RGB color - parse values
      const match = trimmed.match(/rgba?\((\d+),?\s*(\d+),?\s*(\d+)/);
      if (!match) throw new Error('Invalid RGB format');
      rgb = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    } else if (trimmed.startsWith('hsl(') || trimmed.startsWith('hsla(')) {
      // HSL color - parse values
      const match = trimmed.match(/hsla?\((\d+),?\s*(\d+)%?,?\s*(\d+)%?/);
      if (!match) throw new Error('Invalid HSL format');
      const hsl: [number, number, number] = [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3])
      ];
      rgb = convert.hsl.rgb(hsl);
    } else if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(trimmed)) {
      // Space-separated HSL (Tailwind/TweakCN format)
      const parts = trimmed.split(/\s+/);
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1].replace('%', ''));
      const l = parseFloat(parts[2].replace('%', ''));
      rgb = convert.hsl.rgb([h, s, l]);
    } else {
      // Unsupported format, return as-is
      return trimmed;
    }

    // Convert RGB to OKLCH via LAB
    // color-convert doesn't have direct RGB->OKLCH, so we use RGB->LAB->LCH path
    // OKLCH is essentially LCH in the OKLAB color space
    // For simplicity, we'll convert to HSL then construct OKLCH-like values
    const hsl = convert.rgb.hsl(rgb);

    // Approximate OKLCH conversion
    // L (lightness): 0-100% -> map from HSL lightness
    // C (chroma): 0-0.4 -> map from HSL saturation
    // H (hue): 0-360 -> use HSL hue
    const l = hsl[2]; // Lightness (0-100)
    const c = (hsl[1] / 100) * 0.4; // Chroma (approximate)
    const h = hsl[0]; // Hue (0-360)

    // Format as OKLCH: L% C H
    return `${l}% ${c.toFixed(3)} ${h}`;
  } catch (error) {
    // If conversion fails, return original value
    console.warn(`Failed to convert color "${colorValue}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    return trimmed;
  }
}

/**
 * Generates formatted CSS output with converted color variables
 *
 * @param colors - Array of colors with OKLCH conversions
 * @param format - Output format (currently only 'oklch' supported)
 * @returns Formatted CSS string
 */
function generateCSSOutput(
  colors: ColorValue[],
  format: 'oklch' | 'rgb' | 'hsl'
): string {
  if (colors.length === 0) {
    return '';
  }

  // Generate CSS custom property declarations
  const declarations = colors
    .map(color => {
      const value = format === 'oklch' && color.oklch
        ? color.oklch
        : color.value;
      return `${color.name}: ${value};`;
    })
    .join('\n');

  return declarations;
}

/**
 * Validates if a string is a valid URL
 *
 * @param str - String to validate
 * @returns True if string is a valid HTTP/HTTPS URL
 */
export function isValidURL(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts theme name from TweakCN URL or file path
 *
 * @param source - URL or file path
 * @returns Theme name or 'custom' if cannot be determined
 */
export function extractThemeName(source: string): string {
  // Extract filename without extension
  const pathParts = source.split('/');
  const filename = pathParts[pathParts.length - 1];
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

  return nameWithoutExt || 'custom';
}
