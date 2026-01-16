# Critical Requirements: Clean Code Generation

## Overview
This document highlights the critical requirement for **clean code generation** - ensuring that when users don't select certain options, the generated code is clean without empty objects, unused props, or leftover comment placeholders.

## The Problem

**Bad (what we don't want)**:
```typescript
// Empty socialProviders object
export const auth = betterAuth({
  socialProviders: {},
});

// Empty social prop
<AuthUIProviderTanstack
  social={{
    providers: []
  }}
>

// Leftover placeholder comments
// {{OAUTH_PROVIDERS}}
```

**Good (what we want)**:
```typescript
// No socialProviders when not needed
export const auth = betterAuth({
  providers: [
    emailAndPassword({ enabled: true }),
  ],
});

// No social prop when not needed
<AuthUIProviderTanstack
  authClient={authClient}
  navigate={(href) => router.navigate({ href })}
>
```

## Critical Rules

### Rule 1: Remove Empty Configurations
If a user selects **no OAuth providers**, the following must be **completely removed**:
- The entire `social={{}}` prop in `src/providers.tsx`
- Any empty `socialProviders: {}` objects
- The placeholder comment line itself

### Rule 2: Remove Placeholder Comments
After replacement, **no placeholder comments should remain** in the code:
- ❌ `// {{OAUTH_PROVIDERS}}`
- ❌ `// {{EMAIL_PASSWORD_AUTH}}`
- ❌ `// {{OAUTH_UI_PROVIDERS}}`

### Rule 3: Context-Aware Removal
The `replacePlaceholder()` function must support:
1. **Normal replacement**: Replace placeholder with content
2. **Empty string replacement**: Remove placeholder line entirely
3. **Removal marker**: Special marker like `__REMOVE_SOCIAL_PROP__` to remove surrounding code

## Implementation Strategy

### Enhanced replacePlaceholder Function

```typescript
export async function replacePlaceholder(
  filePath: string,
  placeholder: string,
  content: string,
  options?: {
    graceful?: boolean;
    removeEntireLine?: boolean;  // NEW: Remove the line itself
  }
): Promise<void> {
  const fileContent = await fs.readFile(filePath, 'utf-8');

  if (!fileContent.includes(placeholder)) {
    if (options?.graceful) {
      console.warn(`Warning: Placeholder "${placeholder}" not found`);
      return;
    }
    throw new Error(`Placeholder "${placeholder}" not found`);
  }

  const lines = fileContent.split('\n');
  const updatedLines: string[] = [];

  for (const line of lines) {
    if (line.includes(placeholder)) {
      // If content is empty or removal marker, skip this line entirely
      if (content === '' || content === '__REMOVE__' || options?.removeEntireLine) {
        continue; // Don't add this line to output
      }

      // Normal replacement with indentation
      const indentation = detectIndentation(line);
      const indentedContent = content
        .split('\n')
        .map((contentLine, index) => {
          if (index === 0) return indentation + contentLine;
          return contentLine ? indentation + contentLine : '';
        })
        .join('\n');

      updatedLines.push(indentedContent);
    } else {
      updatedLines.push(line);
    }
  }

  await fs.writeFile(filePath, updatedLines.join('\n'), 'utf-8');
}
```

### Smart Content Generation

```typescript
// String utils should return empty string or removal marker for empty cases
export function generateOAuthUIProvidersBlock(providers: string[]): string {
  if (providers.length === 0) {
    return ''; // Empty string triggers line removal
  }

  const providerList = providers.map(id => `"${id}"`).join(', ');
  return `social={{
    providers: [${providerList}]
  }}`;
}
```

## Files Requiring Smart Removal

### 1. convex/auth/index.ts
**Scenario**: User selects email/password only (no OAuth)
```typescript
// Template with placeholders
providers: [
  // {{EMAIL_PASSWORD_AUTH}}
  // {{OAUTH_PROVIDERS}}
]

// Generated output (clean)
providers: [
  emailAndPassword({ enabled: true }),
]
```

### 2. src/providers.tsx
**Scenario**: User selects email/password only (no OAuth)
```typescript
// Template with placeholder
<AuthUIProviderTanstack
  authClient={authClient}
  navigate={(href) => router.navigate({ href })}
  replace={(href) => router.navigate({ href, replace: true })}
  Link={({ href, ...props }) => <Link to={href} {...props} />}
  // {{OAUTH_UI_PROVIDERS}}
>

// Generated output (clean - no social prop, no comment)
<AuthUIProviderTanstack
  authClient={authClient}
  navigate={(href) => router.navigate({ href })}
  replace={(href) => router.navigate({ href, replace: true })}
  Link={({ href, ...props }) => <Link to={href} {...props} />}
>
```

### 3. .env.example
**Scenario**: User selects email/password only (no OAuth)
```
# Template
VITE_AUTH_URL=http://localhost:3000

# OAuth Provider Credentials
# {{ENV_OAUTH_VARS}}

# Generated output (clean - no OAuth section)
VITE_AUTH_URL=http://localhost:3000
```

### 4. README.md
**Scenario**: User selects email/password only (no OAuth)
```markdown
<!-- Template -->
## Authentication Setup

This project uses Better Auth for authentication.

<!-- {{OAUTH_SETUP_GUIDE}} -->

<!-- Generated output (clean - no OAuth section, no comment) -->
## Authentication Setup

This project uses Better Auth for authentication.
```

## Testing Checklist

When implementing this spec, verify:

- [ ] Generate project with email/password only → no OAuth code/props/comments
- [ ] Generate project with OAuth only → no email/password code
- [ ] Generate project with both → both present
- [ ] Generate project with neither → warning shown, clean empty auth config
- [ ] No placeholder comments like `// {{...}}` remain in any file
- [ ] No empty objects like `social={{}}` or `socialProviders: {}`
- [ ] Code compiles without errors
- [ ] Code lints without warnings about unused props

## Why This Matters

**Professional code quality**: Generated projects should look like they were hand-written by an experienced developer, not like they came from a template generator.

**No technical debt**: Users shouldn't have to clean up placeholder comments or remove empty configurations.

**Clear intent**: When reading the code, it should be immediately obvious what authentication methods are enabled, without having to parse through empty objects or commented-out placeholders.

## Summary

**The Golden Rule**:
> If the user didn't select it, it shouldn't appear in the generated code at all.

Not as an empty object. Not as a commented placeholder. Not at all.
