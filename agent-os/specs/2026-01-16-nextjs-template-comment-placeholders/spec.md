# Specification: Next.js Template Comment Placeholders

## Goal

Add comment replacement placeholders to the Next.js template to achieve full feature parity with the TanStack template, enabling dynamic OAuth provider configuration, email/password authentication, environment variables, theme customization, and documentation generation through the CLI installer.

## User Stories

- As a developer, I want to select OAuth providers during CLI setup so that authentication is pre-configured in my Next.js project
- As a developer, I want email/password authentication to be automatically configured when selected during setup
- As a developer, I want environment variables to be properly typed and validated for my selected OAuth providers
- As a developer, I want to apply custom TweakCN themes in OKLCH color format so that my Next.js project has a consistent design system
- As a developer, I want clear OAuth setup documentation in the README so that I can quickly configure provider credentials

## Core Requirements

### Template Modifications
- Add 8 comment placeholders to Next.js template files for dynamic content injection
- Remove hardcoded Spotify OAuth configuration from Next.js template
- Create custom README.md with OAuth setup section placeholder
- Remove existing OKLCH color definitions from globals.css (will be replaced by theme)

### Framework-Agnostic Architecture
- Refactor base `FrameworkInstaller` class to use abstract methods for file-specific operations
- Move TanStack-specific implementation from base class to TanStackInstaller
- Implement Next.js-specific methods in NextJSInstaller with correct file paths

### Theme System
- Create TweakCN OKLCH converter utility for framework-independent theme processing
- Support both URL and local file theme sources
- Convert all color formats to OKLCH using `color-convert` library
- Generate CSS custom properties in OKLCH format

## Visual Design

No visual mockups provided. Theme system will preserve TweakCN design tokens while converting to OKLCH color format.

## Reusable Components

### Existing Code to Leverage

**String Utilities** (`packages/cli/src/installers/string-utils.ts`):
- `replacePlaceholder()` - Core placeholder replacement with indentation preservation
- `generateAuthProvidersBlock()` - OAuth provider configuration generation
- `generateOAuthUIProvidersBlock()` - UI provider list generation
- `generateEnvVarsBlock()` - Environment variable generation with framework-specific prefixes
- `generateEnvTsServerSchema()` - Zod schema generation for env validation
- `generateEnvTsRuntimeMapping()` - Runtime env mappings
- `generateReadmeSection()` - OAuth setup guide generation
- `DEFAULT_THEME` - Fallback theme when user skips TweakCN

**OAuth Provider Registry** (`packages/cli/src/installers/providers.ts`):
- `OAUTH_PROVIDERS` - Complete registry of 33 OAuth providers with metadata
- `getProvider()` - Provider lookup by ID
- Provider metadata includes: env vars, Better Auth config, README content, scopes

**Base Installer** (`packages/cli/src/installers/base.ts`):
- `initProject()` - Main orchestration method for project initialization
- `copyBaseFiles()` - Template file copying
- `installDependencies()` - Package manager detection and dependency installation
- `formatCode()` - Code formatting after generation
- `initGitRepo()` - Git initialization
- `fetchThemeFromUrl()` - Theme fetching with error handling
- `generateAuthSecret()` - Secure random secret generation

**TanStack Installer** (`packages/cli/src/installers/tanstack.ts`):
- Implementation reference for all abstract methods
- File paths: `src/env.ts`, `src/providers.tsx`, `src/styles/globals.css`
- Demonstrates proper placeholder replacement patterns

**File Operations** (`packages/cli/src/helpers/fileOperations.ts`):
- `copyTemplate()` - Template directory copying
- `createProjectDirectory()` - Project directory creation

### New Components Required

**TweakCN OKLCH Converter** (`packages/cli/src/utils/tweakcn-converter.ts`):
- Why new: Framework-independent theme processing not currently available
- Functionality: Parse TweakCN CSS, extract colors, convert to OKLCH format
- Will be used by both TanStack and Next.js installers

**Next.js Template Placeholders**:
- Why new: Next.js template currently has hardcoded Spotify config
- 8 placeholder comments needed in specific Next.js file locations
- Custom README structure for Next.js-specific setup instructions

## Technical Approach

### Phase 1: Installer Architecture Verification

**Objective**: Verify base installer is framework-agnostic with abstract methods

**Current Architecture** (`packages/cli/src/installers/base.ts`):
- ✅ All file-specific methods are already abstract:
  - `updateOAuthConfig()` - Framework implements with correct auth file path
  - `updateOAuthUIConfig()` - Framework implements with correct UI config file path
  - `updateEnvExample()` - Framework implements with correct .env.example path
  - `updateReadme()` - Framework implements with correct README.md path
  - `applyTweakCNTheme()` - Framework implements with correct CSS file path
  - `updateEnvTs()` - Framework implements with correct typed env file path
- ✅ Base class has no hardcoded file paths
- ✅ All placeholder replacement logic is in shared utilities (`string-utils.ts`)
- ✅ Each framework only needs to specify **file paths** - logic is identical

**TanStack Installer Reference** (`packages/cli/src/installers/tanstack.ts`):
- Implements all abstract methods with TanStack file paths
- File paths: `convex/auth/index.ts`, `src/providers.tsx`, `src/env.ts`, `src/styles/globals.css`
- Logic: Uses shared utilities from `string-utils.ts`
- No changes required - serves as reference implementation for Next.js

**Key Insight**: The architecture is already correct. Next.js installer just needs to implement the same abstract methods with different file paths. No refactoring needed.

### Phase 2: TweakCN Utility

**Utility Implementation** (`packages/cli/src/utils/tweakcn-converter.ts`):

```typescript
interface TweakCNConverterOptions {
  source: string; // URL or file path
  format?: 'oklch' | 'rgb' | 'hsl'; // Default 'oklch'
}

export async function convertTweakCNToOKLCH(
  options: TweakCNConverterOptions
): Promise<string>
```

**Processing Steps**:
1. Fetch/read stylesheet from URL or file path
2. Parse CSS to extract color values (hex, rgb, hsl, etc.)
3. Convert each color to OKLCH using `color-convert` library
4. Generate CSS custom properties maintaining variable names
5. Return formatted CSS string for placeholder replacement

**Dependencies**:
- Add `color-convert` package to package.json dependencies
- Add `@types/color-convert` to devDependencies

### Phase 3: Next.js Template Updates

**File: `convex/auth/index.ts`**
- Remove hardcoded Spotify configuration
- Add `// {{EMAIL_PASSWORD_AUTH}}` placeholder in emailAndPassword section
- Add `// {{OAUTH_PROVIDERS}}` placeholder in socialProviders section

**File: `src/auth/client.tsx`**
- Remove hardcoded `providers: ["spotify"]`
- Add `// {{OAUTH_UI_PROVIDERS}}` placeholder in AuthUIProvider social prop

**File: `src/env.mjs`**
- Add `// {{OAUTH_ENV_SERVER_SCHEMA}}` in server schema section
- Add `// {{OAUTH_ENV_RUNTIME_MAPPING}}` in runtimeEnv section

**File: `.env.example`**
- Add `# {{ENV_OAUTH_VARS}}` placeholder for OAuth credentials

**File: `src/app/(frontend)/globals.css`**
- Remove existing OKLCH color variable definitions
- Add `/* {{TWEAKCN_THEME}} */` placeholder inside `:root {}` block

**File: `README.md`**
- Create custom README structure similar to TanStack template
- Include project description, setup instructions, development guide
- Add `<!-- {{OAUTH_SETUP_GUIDE}} -->` placeholder in OAuth configuration section

### Phase 4: Next.js Installer Implementation

**Update NextJSInstaller** (`packages/cli/src/installers/nextjs.ts`):

**Pattern**: Each method implements the **same logic** as TanStack, just with **different file paths**.

**Implementation Strategy**:
1. Copy the logic from TanStack installer methods
2. Update only the file path constant
3. Use the same shared utility functions from `string-utils.ts`

**Example - `updateEnvTs()` method**:
```typescript
async updateEnvTs(selectedProviders: string[]): Promise<void> {
  // Only difference: file path
  const envFilePath = join(this.targetPath, 'src/env.mjs'); // Next.js uses .mjs

  // Logic is identical to TanStack - uses shared utilities
  const serverSchema = generateEnvTsServerSchema(selectedProviders);
  await replacePlaceholder(
    envFilePath,
    '// {{OAUTH_ENV_SERVER_SCHEMA}}',
    serverSchema
  );

  const runtimeMapping = generateEnvTsRuntimeMapping(selectedProviders);
  await replacePlaceholder(
    envFilePath,
    '// {{OAUTH_ENV_RUNTIME_MAPPING}}',
    runtimeMapping
  );
}
```

**All methods to implement** (copy logic from TanStack, change file paths only):

| Method | TanStack Path | Next.js Path |
|--------|---------------|--------------|
| `updateOAuthConfig()` | `convex/auth/index.ts` | `convex/auth/index.ts` *(same)* |
| `updateOAuthUIConfig()` | `src/providers.tsx` | `src/auth/client.tsx` |
| `updateEnvExample()` | `.env.example` | `.env.example` *(same)* |
| `updateReadme()` | `README.md` | `README.md` *(same)* |
| `applyTweakCNTheme()` | `src/styles/globals.css` | `src/app/(frontend)/globals.css` |
| `updateEnvTs()` | `src/env.ts` | `src/env.mjs` |

**No code duplication concerns** - The logic lives in shared utilities (`generateAuthProvidersBlock`, `generateOAuthUIProvidersBlock`, etc). Framework installers are just thin wrappers that specify file paths.

## Out of Scope

- Actual implementation of installer logic (covered in separate spec)
- Testing OAuth flows with real providers
- UI/UX design changes beyond placeholder additions
- Migration scripts for existing Next.js projects
- Template content beyond placeholder additions
- Database schema changes
- Convex function modifications
- Better Auth plugin development

## Success Criteria

### Template Files
- All 8 placeholders added to correct Next.js template locations
- Hardcoded Spotify removed from `convex/auth/index.ts`
- Hardcoded Spotify removed from `src/auth/client.tsx`
- Existing OKLCH colors removed from `src/app/(frontend)/globals.css`
- Custom README created with OAuth setup placeholder

### Installer Architecture
- Base `FrameworkInstaller` verified as framework-agnostic (no file path changes needed)
- TanStack installer continues working with no regressions
- Next.js installer implements all abstract methods with correct file paths

### TweakCN Utility
- Utility created at `packages/cli/src/utils/tweakcn-converter.ts`
- `color-convert` library added to dependencies
- Utility supports URL and file path inputs
- Utility outputs valid OKLCH CSS custom properties
- Integration with `applyTweakCNTheme()` method

### Documentation
- Code comments explain framework-specific file paths
- TweakCN converter usage documented in function JSDoc
- Placeholder purpose documented in template files

## Implementation Phases

### Phase 1: Architecture Verification (No Code Changes)
**Duration**: 30 minutes

**Tasks**:
- Review base class abstract methods
- Verify no hardcoded file paths in base class
- Review TanStack installer as reference implementation
- Confirm architecture pattern: abstract methods + shared utilities
- Document file path mappings for Next.js vs TanStack

### Phase 2: TweakCN Utility
**Duration**: 3-4 hours

**Tasks**:
- Install `color-convert` and `@types/color-convert` packages
- Create `packages/cli/src/utils/tweakcn-converter.ts`
- Implement `convertTweakCNToOKLCH()` function
- Add CSS parsing logic for color extraction
- Add color format conversion using `color-convert`
- Add unit tests for converter
- Integrate with base installer `applyTweakCNTheme()` if needed

### Phase 3: Next.js Template Updates
**Duration**: 2-3 hours

**Tasks**:
- Update `convex/auth/index.ts` - remove Spotify, add 2 placeholders
- Update `src/auth/client.tsx` - remove Spotify, add 1 placeholder
- Update `src/env.mjs` - add 2 placeholders
- Update `.env.example` - add 1 placeholder
- Update `src/app/(frontend)/globals.css` - remove colors, add 1 placeholder
- Create custom `README.md` - add 1 placeholder
- Verify all placeholders use correct comment syntax

### Phase 4: Next.js Installer Implementation
**Duration**: 2-3 hours

**Tasks**:
- Update `updateEnvTs()` method with real implementation
- Update file paths in all methods to match Next.js structure
- Test placeholder replacement with sample OAuth providers
- Verify generated code is valid TypeScript/JavaScript
- Verify integration with base class orchestration

### Phase 5: Testing and Validation
**Duration**: 2-3 hours

**Tasks**:
- Test CLI with Next.js template and various OAuth providers
- Verify all placeholders are replaced correctly
- Verify generated project builds and runs
- Verify theme application works with TweakCN converter
- Test with no OAuth providers (placeholder removal)
- Test with email/password only
- Test with multiple OAuth providers

**Total Estimated Duration**: 10-14 hours

## Technical Details

### File Structure Differences

**TanStack Template**:
- Auth config: `convex/auth/index.ts`
- Typed env: `src/env.ts`
- OAuth UI: `src/providers.tsx`
- Global CSS: `src/styles/globals.css`
- Env example: `.env.example`

**Next.js Template**:
- Auth config: `convex/auth/index.ts` (same)
- Typed env: `src/env.mjs` (different extension)
- OAuth UI: `src/auth/client.tsx` (different path)
- Global CSS: `src/app/(frontend)/globals.css` (different path)
- Env example: `.env.example` (same)

### Environment Variable Prefixes

**TanStack**: `VITE_` prefix for client-side variables
**Next.js**: `NEXT_PUBLIC_` prefix for client-side variables
**Both**: No prefix for server-side variables

The `generateEnvVarsBlock()` function already handles this correctly via the `framework` parameter.

### Placeholder Comment Syntax

- TypeScript/JavaScript: `// {{PLACEHOLDER_NAME}}`
- CSS: `/* {{PLACEHOLDER_NAME}} */`
- Markdown: `<!-- {{PLACEHOLDER_NAME}} -->`
- Shell/Env: `# {{PLACEHOLDER_NAME}}`

All placeholders follow this consistent naming pattern for easy identification.

### Color Conversion Strategy

TweakCN themes typically use hex, rgb, or hsl color formats. The OKLCH converter must:

1. Parse CSS to identify color values in any format
2. Normalize color values to a common intermediate format
3. Use `color-convert` library for OKLCH conversion
4. Maintain semantic variable names from TweakCN
5. Generate valid CSS custom property syntax

Example conversion:
```css
/* Input from TweakCN */
--color-primary: #3b82f6;

/* Output after OKLCH conversion */
--color-primary: oklch(59.75% 0.196 254.28);
```

### Better Auth Configuration Structure

Both TanStack and Next.js use the same Better Auth configuration structure in `convex/auth/index.ts`:

```typescript
export const authOptions = {
  emailAndPassword: {
    // {{EMAIL_PASSWORD_AUTH}}
  },
  socialProviders: {
    // {{OAUTH_PROVIDERS}}
  },
}
```

The `generateAuthProvidersBlock()` function generates the correct object structure for both frameworks.
