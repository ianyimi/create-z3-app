# Requirements: Next.js Template Comment Placeholders

## Overview
Add comment replacement strings to the Next.js template to match TanStack template's installer capabilities, enabling dynamic configuration of OAuth providers, authentication, environment variables, themes, and documentation.

## Key Decisions

### 1. Scope
- **Add all 8 placeholder types** to achieve full parity with TanStack
- Remove hardcoded Spotify configuration from Next.js template
- Create custom README similar to TanStack's structure

### 2. Architecture Changes

#### Framework-Agnostic Installer Design
**CRITICAL**: The base `FrameworkInstaller` class must be refactored to remove hardcoded file paths.

**Current Problem**: Methods assume specific file locations (e.g., `updateEnvTs()` assumes `src/env.ts`)

**Solution**:
- Make file path-dependent methods **abstract** in base class
- Each framework installer implements its own file paths
- Processes remain the same, but target files differ per framework

**Example**:
```typescript
// Base class (abstract)
abstract class FrameworkInstaller {
  abstract updateEnvTs(providers: string[]): Promise<void>;
  abstract updateOAuthUIConfig(providers: string[]): Promise<void>;
  // etc.
}

// TanStack implementation
class TanStackInstaller extends FrameworkInstaller {
  async updateEnvTs(providers: string[]) {
    const envPath = join(this.targetPath, 'src/env.ts');
    // ... implementation
  }

  async updateOAuthUIConfig(providers: string[]) {
    const uiPath = join(this.targetPath, 'src/providers.tsx');
    // ... implementation
  }
}

// Next.js implementation
class NextJSInstaller extends FrameworkInstaller {
  async updateEnvTs(providers: string[]) {
    const envPath = join(this.targetPath, 'src/env.mjs');
    // ... implementation
  }

  async updateOAuthUIConfig(providers: string[]) {
    const uiPath = join(this.targetPath, 'src/auth/client.tsx');
    // ... implementation
  }
}
```

### 3. TweakCN Theme with OKLCH Conversion

**Requirement**: Framework-independent utility for TweakCN theme processing

**Functionality**:
- Parse TweakCN stylesheet from URL or local file
- Convert all colors to OKLCH format using `color-convert` library
- Generate CSS variables in OKLCH format
- Replace `/* {{TWEAKCN_THEME}} */` placeholder

**Library**: https://github.com/Qix-/color-convert

**Example Output**:
```css
:root {
  --color-primary: oklch(60% 0.15 280);
  --color-secondary: oklch(70% 0.10 200);
  /* etc. */
}
```

## Placeholders to Add

### Next.js Template Files and Placeholders

| Placeholder | Target File | Purpose |
|-------------|-------------|---------|
| `// {{EMAIL_PASSWORD_AUTH}}` | `convex/auth/index.ts` | Email/password auth configuration |
| `// {{OAUTH_PROVIDERS}}` | `convex/auth/index.ts` | OAuth provider configuration (remove hardcoded Spotify) |
| `// {{OAUTH_UI_PROVIDERS}}` | `src/auth/client.tsx` | UI provider social config in AuthUIProvider |
| `# {{ENV_OAUTH_VARS}}` | `.env.example` | OAuth environment variables |
| `// {{OAUTH_ENV_SERVER_SCHEMA}}` | `src/env.mjs` | Zod schema for OAuth env vars |
| `// {{OAUTH_ENV_RUNTIME_MAPPING}}` | `src/env.mjs` | Runtime env mappings |
| `/* {{TWEAKCN_THEME}} */` | `src/app/(frontend)/globals.css` | TweakCN theme CSS (replace existing oklch definitions) |
| `<!-- {{OAUTH_SETUP_GUIDE}} -->` | `README.md` | OAuth setup documentation (create new custom README) |

## File Structure Comparison

### TanStack Template
```
templates/tanstack-start/
├── convex/auth/index.ts          (auth config)
├── src/
│   ├── env.ts                    (typed env with zod)
│   ├── providers.tsx             (OAuth UI config)
│   └── styles/globals.css        (theme CSS)
├── .env.example
└── README.md
```

### Next.js Template
```
templates/nextjs/
├── convex/auth/index.ts          (auth config - same location!)
├── src/
│   ├── env.mjs                   (typed env - different extension!)
│   ├── auth/client.tsx           (OAuth UI config - different path!)
│   └── app/(frontend)/globals.css (theme CSS - different path!)
├── .env.example
└── README.md
```

## Detailed Changes Required

### 1. `convex/auth/index.ts`
**Current**: Hardcoded Spotify provider
```typescript
socialProviders: {
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    // ...
  },
},
```

**Target**: Add placeholders
```typescript
socialProviders: {
  // {{OAUTH_PROVIDERS}}
},
// ... in betterAuth config
emailAndPassword: {
  // {{EMAIL_PASSWORD_AUTH}}
},
```

### 2. `src/auth/client.tsx`
**Current**: Hardcoded Spotify in social providers
```typescript
social={{
  providers: ["spotify"],
}}
```

**Target**: Add placeholder
```typescript
social={{
  providers: [
    // {{OAUTH_UI_PROVIDERS}}
  ],
}}
```

### 3. `src/env.mjs`
Add two placeholders for OAuth environment variables:
```javascript
server: {
  // ... existing
  // {{OAUTH_ENV_SERVER_SCHEMA}}
},

runtimeEnv: {
  // ... existing
  // {{OAUTH_ENV_RUNTIME_MAPPING}}
}
```

### 4. `.env.example`
Add placeholder for OAuth credentials:
```
# {{ENV_OAUTH_VARS}}
```

### 5. `src/app/(frontend)/globals.css`
**Current**: Has existing Tailwind 4 oklch definitions
**Target**: Remove existing color variables, add placeholder inside `:root {}`
```css
:root {
  /* {{TWEAKCN_THEME}} */
}
```

### 6. `README.md`
**Current**: Basic create-next-app README
**Target**: Create custom README with structure:
- Project description
- Setup instructions
- OAuth configuration section with `<!-- {{OAUTH_SETUP_GUIDE}} -->` placeholder
- Development guide
- Deployment notes

Reference TanStack's README structure.

## New Utility: TweakCN OKLCH Converter

### Location
`packages/cli/src/utils/tweakcn-converter.ts`

### Interface
```typescript
interface TweakCNConverterOptions {
  source: string; // URL or file path to TweakCN stylesheet
  format?: 'oklch' | 'rgb' | 'hsl'; // Output format, default 'oklch'
}

export async function convertTweakCNToOKLCH(
  options: TweakCNConverterOptions
): Promise<string>;
```

### Dependencies
- `color-convert` library for color format conversion
- Node `fetch` or `fs` for fetching/reading stylesheets
- CSS parser for extracting color values

### Output
Returns CSS variable definitions as a string:
```css
--color-primary: oklch(60% 0.15 280);
--color-secondary: oklch(70% 0.10 200);
```

## Installer Refactoring

### Base Class Changes
File: `packages/cli/src/installers/base.ts`

**Make these methods abstract**:
- `updateEnvTs(providers: string[]): Promise<void>`
- `updateOAuthUIConfig(providers: string[]): Promise<void>`
- `getCSSFilePath(): string` (new method for getting CSS file location)

### TanStack Installer
File: `packages/cli/src/installers/tanstack.ts`

Move current implementation from base class to TanStack:
- File paths: `src/env.ts`, `src/providers.tsx`, `src/styles/globals.css`

### Next.js Installer
File: `packages/cli/src/installers/nextjs.ts`

Implement all abstract methods:
- File paths: `src/env.mjs`, `src/auth/client.tsx`, `src/app/(frontend)/globals.css`

## Success Criteria

### Template Files
- [ ] All 8 placeholders added to Next.js template
- [ ] Hardcoded Spotify config removed from `convex/auth/index.ts`
- [ ] Existing oklch colors removed from `globals.css`
- [ ] Custom README created with OAuth setup section

### Installer Architecture
- [ ] Base `FrameworkInstaller` class refactored (abstract methods)
- [ ] TanStack installer implements all abstract methods
- [ ] Next.js installer implements all abstract methods
- [ ] No hardcoded file paths in base class

### Utilities
- [ ] TweakCN OKLCH converter utility created
- [ ] `color-convert` library integrated
- [ ] Converter supports URL and file path inputs
- [ ] Converter outputs valid OKLCH CSS variables

### Documentation
- [ ] Installer refactoring documented in codebase
- [ ] TweakCN converter usage documented
- [ ] README template structure documented

## Out of Scope

- Implementation of Next.js installer logic (save for next spec)
- Testing OAuth flows (focus on placeholder setup only)
- UI/design changes beyond placeholder additions
- Migration scripts for existing projects

## Dependencies

### NPM Packages
- `color-convert` - Color format conversion library
- Existing dependencies remain unchanged

### Existing Code
- `packages/cli/src/installers/string-utils.ts` - OAuth string generation functions
- `packages/cli/src/utils/oauth-providers.ts` - Provider metadata
- `packages/cli/src/utils/file-utils.ts` - Placeholder replacement utilities

## Notes

### Framework Differences
- **File extensions**: TanStack uses `.ts`, Next.js uses `.mjs` for env config
- **File paths**: Different locations for auth client and CSS files
- **CSS setup**: Next.js uses Tailwind 4 with different structure
- **README**: Each framework should have custom setup instructions

### Color Conversion Strategy
The TweakCN theme utility needs to:
1. Fetch/read the TweakCN stylesheet
2. Parse CSS to extract color values (could be hex, rgb, hsl, etc.)
3. Convert each color to OKLCH using `color-convert`
4. Generate CSS custom properties in OKLCH format
5. Maintain the same variable names from TweakCN

### Environment Variable Naming
- TanStack: `VITE_` prefix for client-side vars
- Next.js: `NEXT_PUBLIC_` prefix for client-side vars
- Server vars: No prefix for both frameworks
- OAuth vars: Framework-specific (handled by `generateEnvVarsBlock()`)

## Implementation Order Suggestion

1. **Phase 1: Installer Refactoring**
   - Make base class methods abstract
   - Move TanStack implementation to TanStack installer
   - Ensure TanStack still works correctly

2. **Phase 2: TweakCN Utility**
   - Create converter utility
   - Add tests for color conversion
   - Integrate with string-utils for theme generation

3. **Phase 3: Next.js Template Updates**
   - Add placeholders to all 8 locations
   - Remove hardcoded configs
   - Create custom README

4. **Phase 4: Next.js Installer**
   - Implement all abstract methods
   - Test with various OAuth provider combinations
   - Verify placeholder replacement works correctly

**This spec covers Phases 1-3. Phase 4 will be a separate spec.**
