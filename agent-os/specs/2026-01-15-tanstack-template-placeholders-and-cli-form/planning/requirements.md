# Requirements: TanStack Template Placeholders and CLI Form Update

## Overview
Update the TanStack Start template repository with comment string placeholders and enhance the CLI form to collect all necessary user inputs for proper project configuration.

## User Decisions

### 1. Email/Password Authentication
**Decision**: User can toggle email/password on/off in OAuth provider selection
- Email/password appears at top of OAuth provider list
- Checked/enabled by default
- Users can uncheck to disable
- Dynamic placeholder in template to add/remove email/password config

### 2. AUTH_PROVIDERS Constant
**Decision**: Keep complete list as reference
- `src/db/constants/auth.ts` keeps all 34 providers
- No placeholder needed
- Serves as reference for developers

### 3. CLI Prompts to Add
**Decision**: Add these prompts to CLI form
- ✅ Git initialization (default: yes)
- ✅ Install dependencies (default: yes)
- ✅ Email/password toggle (in OAuth provider multi-select, default: checked)
- ✅ TweakCN theme URL prompt (optional, skip allowed)
- ❌ GitHub repo creation (not in this spec)

### 4. Installer Method Wiring
**Decision**: Yes, wire up installer methods
- Make `updateOAuthConfig()`, `updateOAuthUIConfig()`, `updateEnvExample()`, `updateReadme()` actually execute
- Connect CLI form outputs to installer method calls
- Ensure placeholders are properly replaced

### 5. Empty Authentication Selection
**Decision**: Show warning but allow
- If user unchecks email/password AND selects no OAuth providers
- Display yellow warning: "⚠️ Warning: No authentication methods selected. Your app will have no user authentication."
- Generate clean template with no auth config
- Allow user to proceed

### 6. TweakCN Theme Support
**Decision**: Yes, include theme prompt
- Add optional TweakCN theme URL prompt to CLI
- User can skip (press Enter)
- If skipped, use default theme
- Create `src/styles/globals.css` with `/* {{TWEAKCN_THEME}} */` placeholder
- Implement or verify `applyTweakCNTheme()` method in TanStackInstaller

### 7. Email/Password UI Location
**Decision**: At top of OAuth provider list
- Email/password appears as first item in multi-select checkbox
- Shows as "Email & Password" with description
- Checked by default
- Same UI as OAuth providers for consistency

## Template Files Requiring Placeholders

### 1. convex/auth/index.ts
**Placeholder**: `// {{EMAIL_PASSWORD_AUTH}}` and `// {{OAUTH_PROVIDERS}}`

Current state:
```typescript
export const { auth, signIn, signOut, signUp } = convexAuth({
  providers: [
    Google,
    emailAndPassword({ enabled: true }),
  ],
});
```

With placeholders:
```typescript
export const { auth, signIn, signOut, signUp } = convexAuth({
  providers: [
    // {{EMAIL_PASSWORD_AUTH}}
    // {{OAUTH_PROVIDERS}}
  ],
});
```

**Replacement logic**:
- If email/password enabled: `emailAndPassword({ enabled: true }),`
- If disabled: empty string
- If OAuth providers selected: generate provider list
- If NO OAuth providers selected: **remove the entire `socialProviders` section** (not empty object)

**Example outputs**:

With OAuth providers:
```typescript
export const { auth, signIn, signOut, signUp } = convexAuth({
  providers: [
    emailAndPassword({ enabled: true }),
    Google,
    GitHub,
  ],
});
```

Without OAuth providers (email/password only):
```typescript
export const { auth, signIn, signOut, signUp } = convexAuth({
  providers: [
    emailAndPassword({ enabled: true }),
  ],
});
```

Without any authentication:
```typescript
export const { auth, signIn, signOut, signUp } = convexAuth({
  providers: [],
});
```

### 2. src/providers.tsx
**Placeholder**: `// {{OAUTH_UI_PROVIDERS}}`

Current state:
```typescript
<AuthUIProviderTanstack
  authClient={authClient}
  navigate={(href) => router.navigate({ href })}
  replace={(href) => router.navigate({ href, replace: true })}
  Link={({ href, ...props }) => <Link to={href} {...props} />}
  social={{
    providers: ["google"]
  }}
>
```

With placeholder:
```typescript
<AuthUIProviderTanstack
  authClient={authClient}
  navigate={(href) => router.navigate({ href })}
  replace={(href) => router.navigate({ href, replace: true })}
  Link={({ href, ...props }) => <Link to={href} {...props} />}
  // {{OAUTH_UI_PROVIDERS}}
>
```

**Replacement logic**:
- If OAuth providers selected: `social={{ providers: ["google", "github"] }}`
- If NO OAuth providers selected: **remove entire social configuration** (including the comment placeholder line)

**Example outputs**:

With OAuth providers:
```typescript
<AuthUIProviderTanstack
  authClient={authClient}
  navigate={(href) => router.navigate({ href })}
  replace={(href) => router.navigate({ href, replace: true })}
  Link={({ href, ...props }) => <Link to={href} {...props} />}
  social={{
    providers: ["google", "github"]
  }}
>
```

Without OAuth providers (clean - no social prop):
```typescript
<AuthUIProviderTanstack
  authClient={authClient}
  navigate={(href) => router.navigate({ href })}
  replace={(href) => router.navigate({ href, replace: true })}
  Link={({ href, ...props }) => <Link to={href} {...props} />}
>
```

### 3. src/lib/auth/client.ts
**Note**: This file doesn't need placeholder - it only exports the authClient instance and doesn't configure providers

### 4. .env.example
**Placeholder**: `# {{ENV_OAUTH_VARS}}`

Current state:
```
VITE_AUTH_URL=http://localhost:3000
```

With placeholder:
```
VITE_AUTH_URL=http://localhost:3000

# OAuth Provider Credentials
# {{ENV_OAUTH_VARS}}
```

**Replacement logic**:
- Generate environment variable declarations with VITE_ prefix for client vars
- Include descriptions from provider metadata

### 5. README.md
**Placeholder**: `<!-- {{OAUTH_SETUP_GUIDE}} -->`

With placeholder (near bottom):
```markdown
## Authentication Setup

This project uses Better Auth for authentication.

<!-- {{OAUTH_SETUP_GUIDE}} -->
```

**Replacement logic**:
- Generate OAuth provider setup guides for selected providers
- If no OAuth providers: remove or leave empty

### 6. src/styles/globals.css
**Placeholder**: `/* {{TWEAKCN_THEME}} */`

Create new file with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* {{TWEAKCN_THEME}} */
  }
}
```

**Replacement logic**:
- If TweakCN theme URL provided: fetch and insert theme variables
- If skipped: insert default theme variables

**Default theme** (when user skips):
```css
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--card: 0 0% 100%;
--card-foreground: 240 10% 3.9%;
--popover: 0 0% 100%;
--popover-foreground: 240 10% 3.9%;
--primary: 240 5.9% 10%;
--primary-foreground: 0 0% 98%;
--secondary: 240 4.8% 95.9%;
--secondary-foreground: 240 5.9% 10%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
--accent: 240 4.8% 95.9%;
--accent-foreground: 240 5.9% 10%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
--border: 240 5.9% 90%;
--input: 240 5.9% 90%;
--ring: 240 5.9% 10%;
--radius: 0.5rem;
```

## CLI Form Updates

### Current State
```typescript
// Current prompts:
1. Project name
2. Framework selection
3. OAuth provider selection (via promptOAuthProviders)
```

### New Flow

```typescript
// Updated prompts:
1. Project name
2. Framework selection
3. Authentication providers (multi-select):
   - [x] Email & Password (default checked)
   - [ ] Google
   - [ ] GitHub
   - [ ] Discord
   - ... (rest of OAuth providers)
   - [ ] > Show more providers (23 additional)
4. TweakCN theme URL (optional, can skip)
5. Initialize Git repository? (default: yes)
6. Install dependencies? (default: yes)
```

### Updated promptOAuthProviders Function

Modify to include email/password as first checkbox item:

```typescript
async function promptOAuthProviders(): Promise<{
  emailPassword: boolean;
  oauthProviders: string[];
}> {
  const choices = [
    {
      name: 'Email & Password',
      value: '__email_password__',
      checked: true, // Default enabled
    },
    new Separator('Popular OAuth Providers:'),
    ...popularProviders,
    { name: '> Show more providers (23 additional)', value: '__show_more__' },
  ];

  const selected = await checkbox({
    message: 'Select authentication providers:',
    choices,
  });

  return {
    emailPassword: selected.includes('__email_password__'),
    oauthProviders: selected.filter(
      id => id !== '__email_password__' && id !== '__show_more__'
    ),
  };
}
```

### New Prompts to Add

#### 1. TweakCN Theme Prompt
```typescript
import { input } from '@inquirer/prompts';

const tweakcnThemeUrl = await input({
  message: 'Enter TweakCN theme URL (optional, press Enter to skip):',
  default: '',
});

// If not empty, fetch theme
let tweakcnTheme: TweakCNTheme | undefined;
if (tweakcnThemeUrl.trim()) {
  tweakcnTheme = {
    type: 'url',
    content: tweakcnThemeUrl.trim(),
  };
}
```

#### 2. Git Initialization Prompt
```typescript
import { confirm } from '@inquirer/prompts';

const initGit = await confirm({
  message: 'Initialize Git repository?',
  default: true,
});
```

#### 3. Install Dependencies Prompt
```typescript
const installDependencies = await confirm({
  message: 'Install dependencies?',
  default: true,
});
```

## ProjectOptions Interface Updates

### Current State
```typescript
export interface ProjectOptions {
  projectName: string;
  framework: Framework;
  oauthProviders: string[];
  tweakcnTheme?: TweakCNTheme;
  createGitHubRepo: boolean;
  gitHubRepoPrivate?: boolean;
  installDependencies: boolean;
}
```

### Required Updates
Add field for email/password:
```typescript
export interface ProjectOptions {
  projectName: string;
  framework: Framework;
  emailPasswordAuth: boolean;       // NEW
  oauthProviders: string[];
  tweakcnTheme?: TweakCNTheme;
  initGit: boolean;                 // NEW (replaces createGitHubRepo for now)
  installDependencies: boolean;
}
```

Remove `createGitHubRepo` and `gitHubRepoPrivate` (deferred to later spec).

## TanStackInstaller Method Requirements

### Methods to Verify/Implement

All methods already exist but need wiring:

1. ✅ `updateOAuthConfig(selectedProviders: string[])` - EXISTS
   - Needs: Also handle email/password config
   - Update to accept email/password boolean

2. ✅ `updateOAuthUIConfig(selectedProviders: string[])` - EXISTS
   - Current implementation should work as-is

3. ✅ `updateEnvExample(selectedProviders: string[])` - EXISTS
   - Current implementation should work as-is

4. ✅ `updateReadme(selectedProviders: string[])` - EXISTS
   - Current implementation should work as-is

5. ✅ `applyTweakCNTheme(themeContent: string)` - EXISTS
   - Verify it works with new globals.css file
   - Handle default theme when user skips

### New Method Signature

Update `updateOAuthConfig`:
```typescript
abstract updateOAuthConfig(
  selectedProviders: string[],
  emailPasswordEnabled: boolean
): Promise<void>;
```

## String Utils Updates

### New Function: generateEmailPasswordConfig

```typescript
export function generateEmailPasswordConfig(enabled: boolean): string {
  if (!enabled) {
    return '';
  }
  return 'emailAndPassword({ enabled: true }),';
}
```

### Update generateOAuthConfigBlock

Modify to handle both email/password and OAuth with clean removal:
```typescript
export function generateAuthProvidersBlock(
  oauthProviders: string[],
  emailPasswordEnabled: boolean
): string {
  const parts: string[] = [];

  // Add email/password if enabled
  if (emailPasswordEnabled) {
    parts.push('emailAndPassword({ enabled: true }),');
  }

  // Add OAuth providers
  if (oauthProviders.length > 0) {
    const oauthConfig = oauthProviders
      .map(providerId => {
        const provider = getProvider(providerId);
        return provider.betterAuthConfig.socialProvider;
      })
      .join(',\n');
    parts.push(oauthConfig);
  }

  // Return the providers array content
  // If empty, return empty string (the placeholder line itself will be removed)
  return parts.join(',\n');
}
```

### New Function: generateOAuthUIProvidersBlock

Generate the social prop for AuthUIProviderTanstack:
```typescript
export function generateOAuthUIProvidersBlock(providers: string[]): string {
  if (providers.length === 0) {
    // Return special marker to indicate removal of entire social prop
    return '__REMOVE_SOCIAL_PROP__';
  }

  const providerList = providers.map(id => `"${id}"`).join(', ');
  return `social={{
    providers: [${providerList}]
  }}`;
}
```

## Installer Orchestration

### Update initProject Method

Wire up all installer methods in correct sequence:

```typescript
async initProject(options: ProjectOptions): Promise<void> {
  const spinner = ora('Creating project...').start();

  try {
    // 1. Copy base template files
    await this.copyBaseFiles();
    spinner.text = 'Copied template files';

    // 2. Update OAuth configuration
    if (options.emailPasswordAuth || options.oauthProviders.length > 0) {
      await this.updateOAuthConfig(
        options.oauthProviders,
        options.emailPasswordAuth
      );
      spinner.text = 'Updated authentication configuration';
    }

    // 3. Update OAuth UI configuration
    if (options.oauthProviders.length > 0) {
      await this.updateOAuthUIConfig(options.oauthProviders);
      spinner.text = 'Updated client authentication';
    }

    // 4. Update environment variables
    if (options.oauthProviders.length > 0) {
      await this.updateEnvExample(options.oauthProviders);
      spinner.text = 'Updated environment variables';
    }

    // 5. Update README
    if (options.oauthProviders.length > 0) {
      await this.updateReadme(options.oauthProviders);
      spinner.text = 'Updated README';
    }

    // 6. Apply TweakCN theme
    if (options.tweakcnTheme) {
      let themeContent: string;
      if (options.tweakcnTheme.type === 'url') {
        themeContent = await this.fetchThemeFromUrl(options.tweakcnTheme.content);
      } else {
        themeContent = options.tweakcnTheme.content;
      }
      await this.applyTweakCNTheme(themeContent);
      spinner.text = 'Applied TweakCN theme';
    } else {
      // Apply default theme
      await this.applyTweakCNTheme(DEFAULT_THEME);
      spinner.text = 'Applied default theme';
    }

    // 7. Initialize Git
    if (options.initGit) {
      await this.initGitRepository();
      spinner.text = 'Initialized Git repository';
    }

    // 8. Install dependencies
    if (options.installDependencies) {
      await this.installDependencies();
      spinner.text = 'Installed dependencies';
    }

    spinner.succeed('Project created successfully!');
  } catch (error) {
    spinner.fail('Project creation failed');
    throw error;
  }
}
```

## Warning Messages

### No Authentication Selected
When user unchecks email/password AND selects no OAuth providers:

```typescript
if (!emailPassword && oauthProviders.length === 0) {
  console.log(
    chalk.yellow('\n⚠️  Warning: No authentication methods selected.')
  );
  console.log(
    chalk.yellow('   Your app will have no user authentication.\n')
  );
}
```

### Providers Requiring Extra Config
Existing functionality - keep current warning system.

## Placeholder Removal Strategy

**Critical Requirement**: When no OAuth providers are selected, placeholders must be **completely removed** along with any empty configuration objects/props.

### Implementation Details

The `replacePlaceholder()` function should support a special removal mode:

```typescript
export async function replacePlaceholder(
  filePath: string,
  placeholder: string,
  content: string,
  options?: { graceful?: boolean }
): Promise<void> {
  const fileContent = await fs.readFile(filePath, 'utf-8');

  // Special case: if content is empty or a removal marker, remove the placeholder line entirely
  if (content === '' || content === '__REMOVE_SOCIAL_PROP__') {
    const lines = fileContent.split('\n');
    const filteredLines = lines.filter(line => !line.includes(placeholder));
    await fs.writeFile(filePath, filteredLines.join('\n'), 'utf-8');
    return;
  }

  // Normal replacement logic...
}
```

### Files Requiring Clean Removal

1. **convex/auth/index.ts**: If no OAuth providers, don't include empty socialProviders
2. **src/providers.tsx**: If no OAuth providers, completely remove the `social={{}}` prop and placeholder line
3. **.env.example**: If no OAuth providers, remove OAuth section header and placeholder
4. **README.md**: If no OAuth providers, remove OAuth setup guide section and placeholder

## Success Criteria

1. ✅ TanStack Start template has all required placeholders
2. ✅ CLI form collects all necessary inputs
3. ✅ Email/password appears as first checkbox in OAuth provider selection
4. ✅ TweakCN theme prompt is optional with default fallback
5. ✅ Git initialization prompt works
6. ✅ Install dependencies prompt works
7. ✅ Installer methods are properly wired and execute
8. ✅ Empty authentication selection shows warning but proceeds
9. ✅ Generated projects compile without errors
10. ✅ All placeholders are properly replaced with correct content
11. ✅ **Empty OAuth configurations are completely removed, not left as empty objects**
12. ✅ **No unnecessary comment placeholders remain in generated code**

## Additional Notes

### src/providers.tsx Update
**Important**: The Better Auth UI provider configuration in `src/providers.tsx` must be updated to include the selected OAuth providers.

Current line 30 has hardcoded `providers: ["google"]` - this needs placeholder replacement.

The `updateOAuthUIConfig()` method should target this file and replace the placeholder with the dynamic provider list.

**Critical**: If no OAuth providers are selected, the entire `social` prop and the placeholder comment must be removed completely - not left as an empty object or empty array.

## Out of Scope

- GitHub repository creation (deferred to later spec)
- Next.js template updates (only TanStack in this spec)
- OAuth scope customization
- Advanced TweakCN theme features
- Email/password configuration beyond enable/disable
