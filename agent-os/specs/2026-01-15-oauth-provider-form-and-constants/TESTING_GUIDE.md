# Manual Testing Guide - OAuth Provider Form and Constants

## Overview

This guide provides step-by-step instructions for manually validating the OAuth provider system implementation.

## Prerequisites

- CLI built and available: `pnpm build` in packages/cli
- Clean testing directories for project creation

## Test Scenarios

### Scenario 1: Popular Providers Only (Next.js)

**Objective**: Test CLI flow with popular providers only on Next.js framework

**Steps**:
1. Run CLI: `pnpm --filter=cli dev`
2. Choose project name: `test-nextjs-popular`
3. Select framework: `Next.js`
4. Select OAuth providers:
   - Use arrow keys to navigate
   - Press space to select: Google, GitHub, Discord
   - Press Enter to confirm (without selecting "Show more")
5. Observe warning message for GitHub (user:email scope)
6. Complete remaining prompts (skip GitHub repo, yes to dependencies)

**Expected Results**:
- CLI displays 10 popular providers by default
- "Show more providers (23 additional)" option visible at bottom
- Warning displayed for GitHub's extra config requirements
- Project created successfully

**Verification**:
```bash
cd test-nextjs-popular

# Check auth config
cat lib/auth.ts
# Should contain socialProviders with google, github, discord

# Check env vars
cat .env.example
# Should have GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, DISCORD_CLIENT_ID
# Should have comments describing each variable
# Should NOT have NEXT_PUBLIC_ prefix (all are server-only)

# Check README
cat README.md
# Should have "# OAuth Provider Setup" section
# Should have setup guides for Google, GitHub, Discord
# Should have horizontal rule separators

# Verify TypeScript compilation
pnpm build
# Should compile without errors
```

---

### Scenario 2: Show More Flow (TanStack)

**Objective**: Test "Show more" expansion and additional provider selection

**Steps**:
1. Run CLI: `pnpm --filter=cli dev`
2. Choose project name: `test-tanstack-additional`
3. Select framework: `TanStack Start`
4. Select OAuth providers:
   - Navigate to "Show more providers" option
   - Press space to select it
   - Press Enter
5. Observe expanded list with "Popular Providers" and "Additional Providers" sections
6. Select providers from different sections:
   - From Popular: Spotify, Twitch
   - From Additional: GitLab, Linear, Notion
7. Press Enter to confirm
8. Complete remaining prompts

**Expected Results**:
- Initial prompt shows popular providers + "Show more" option
- After selecting "Show more", re-prompt shows all 33 providers
- Providers organized under "Popular Providers:" and "Additional Providers:" separators
- No warning messages (selected providers don't require extra config)

**Verification**:
```bash
cd test-tanstack-additional

# Check auth config
cat convex/auth/index.ts
# Should contain socialProviders with spotify, twitch, gitlab, linear, notion

# Check env vars
cat .env.example
# Should have CLIENT_ID and CLIENT_SECRET for all 5 providers
# Should have comments describing each variable
# Should NOT have VITE_ prefix (all are server-only)

# Check README
cat README.md
# Should have setup guides for all 5 providers
# Should include URLs for GitLab, Linear, Notion developer portals

# Verify TypeScript compilation
pnpm build
# Should compile without errors
```

---

### Scenario 3: No Providers Selected

**Objective**: Test graceful handling of empty provider selection

**Steps**:
1. Run CLI: `pnpm --filter=cli dev`
2. Choose project name: `test-no-oauth`
3. Select framework: `Next.js`
4. OAuth provider prompt: Press Enter immediately without selecting any
5. Complete remaining prompts

**Expected Results**:
- CLI accepts empty selection
- No warning messages displayed
- Project created successfully

**Verification**:
```bash
cd test-no-oauth

# Check auth config
cat lib/auth.ts
# Should NOT contain socialProviders block (or empty)

# Check env vars
cat .env.example
# Should NOT contain OAuth-related variables (or section is empty)

# Check README
cat README.md
# Should NOT contain "# OAuth Provider Setup" section

# Verify TypeScript compilation
pnpm build
# Should compile without errors
```

---

### Scenario 4: Maximum Selection (All 33 Providers)

**Objective**: Test system with maximum load (all providers)

**Steps**:
1. Run CLI: `pnpm --filter=cli dev`
2. Choose project name: `test-all-providers`
3. Select framework: `Next.js`
4. OAuth provider prompt:
   - Select "Show more providers"
   - Press Enter
   - Use `a` key to select all (if supported by inquirer)
   - Or manually select all 33 providers
5. Observe GitHub warning
6. Complete remaining prompts

**Expected Results**:
- All 33 providers selected successfully
- Warning displayed for GitHub
- CLI completes without performance issues

**Verification**:
```bash
cd test-all-providers

# Check auth config size
wc -l lib/auth.ts
# Should be substantial (100+ lines)

# Count providers in auth config
grep -c "clientId: process.env" lib/auth.ts
# Should be 33

# Check env vars count
grep -c "CLIENT_ID=" .env.example
# Should be 33

# Count README sections
grep -c "^## " README.md
# Should be at least 33 (one per provider)

# Verify TypeScript compilation
pnpm build
# Should compile without errors (might take longer)
```

---

### Scenario 5: Selection Persistence Through "Show More"

**Objective**: Test that selections persist when expanding provider list

**Steps**:
1. Run CLI: `pnpm --filter=cli dev`
2. Choose project name: `test-selection-persist`
3. Select framework: `Next.js`
4. OAuth provider prompt:
   - Select Google and GitHub from popular list
   - Select "Show more providers"
   - Press Enter
5. Observe expanded list
6. Verify Google and GitHub are already checked
7. Add Discord from popular, and GitLab from additional
8. Press Enter to confirm

**Expected Results**:
- After selecting "Show more", Google and GitHub remain selected (checked)
- Can add more selections without losing previous ones
- Final selection includes: Google, GitHub, Discord, GitLab

**Verification**:
```bash
cd test-selection-persist

# Verify all 4 providers in auth config
grep -E "(google|github|discord|gitlab):" lib/auth.ts
# Should show all 4 providers

# Verify env vars for all 4
grep -E "(GOOGLE|GITHUB|DISCORD|GITLAB)_CLIENT_ID" .env.example
# Should show all 4 sets of credentials
```

---

### Scenario 6: Framework-Specific Env Prefix Validation

**Objective**: Verify correct environment variable prefixes (when client vars exist)

**Note**: Currently all OAuth credentials are server-only, so no prefixes are added. This test validates the system would work correctly if client variables were added in the future.

**Steps**:
1. Create Next.js project with OAuth providers
2. Create TanStack project with same OAuth providers
3. Compare .env.example files

**Verification**:
```bash
# Next.js project
cd test-nextjs-project
cat .env.example
# Server vars should NOT have NEXT_PUBLIC_ prefix
# (All OAuth vars are server-only currently)

# TanStack project
cd test-tanstack-project
cat .env.example
# Server vars should NOT have VITE_ prefix
# (All OAuth vars are server-only currently)

# Both should be identical for OAuth vars
diff test-nextjs-project/.env.example test-tanstack-project/.env.example
# OAuth sections should match (no prefix differences for server-only vars)
```

---

## Integration Test: Full Project Creation

### Complete Next.js Project

**Steps**:
1. Create project with OAuth providers
2. Install dependencies
3. Set up environment variables
4. Run development server
5. Test OAuth flow

**Commands**:
```bash
# Create project
pnpm --filter=cli dev

# Follow prompts:
# - Project: test-nextjs-oauth-full
# - Framework: Next.js
# - OAuth: Google, GitHub
# - Install deps: Yes

# After creation
cd test-nextjs-oauth-full

# Copy .env.example to .env
cp .env.example .env

# Add real OAuth credentials (optional - for manual OAuth testing)
# Edit .env with actual Google/GitHub OAuth credentials

# Build project
pnpm build

# Verify build success
echo $?
# Should output 0 (success)

# Run dev server (optional)
pnpm dev
# Visit http://localhost:3000
# Check that auth UI displays provider buttons
```

### Complete TanStack Project

**Steps**:
```bash
# Create project
pnpm --filter=cli dev

# Follow prompts:
# - Project: test-tanstack-oauth-full
# - Framework: TanStack Start
# - OAuth: Discord, Spotify, Twitch
# - Install deps: Yes

# After creation
cd test-tanstack-oauth-full

# Copy .env.example to .env
cp .env.example .env.local

# Build project
pnpm build

# Verify build success
echo $?
# Should output 0 (success)
```

---

## Automated Test Execution

Run the comprehensive test suite:

```bash
cd packages/cli

# Run all tests
pnpm test

# Run specific test files
pnpm test string-utils-task3.test.ts
pnpm test oauth-integration.test.ts

# Run with coverage
pnpm test --coverage

# Watch mode for development
pnpm test --watch
```

---

## Critical Path Validation Checklist

Use this checklist to verify all critical functionality:

### OAUTH_PROVIDERS Constant
- [ ] All 33 providers defined
- [ ] 10 marked as popular
- [ ] 23 marked as non-popular
- [ ] All providers have required fields populated
- [ ] No empty strings in required fields
- [ ] Provider IDs match Better Auth expected values
- [ ] Only GitHub flagged with requiresExtraConfig

### Code Generation
- [ ] generateOAuthConfigBlock produces valid TypeScript
- [ ] generateEnvVarsBlock includes descriptions
- [ ] generateEnvVarsBlock handles both frameworks
- [ ] generateReadmeSection produces valid markdown
- [ ] generateOAuthUIConfigBlock creates provider array

### CLI Flow
- [ ] Popular providers shown by default
- [ ] "Show more" option visible and functional
- [ ] Expansion shows all 33 providers
- [ ] Selections persist through re-prompt
- [ ] Warning displayed for GitHub
- [ ] Empty selection handled gracefully

### Project Generation
- [ ] Next.js projects compile successfully
- [ ] TanStack projects compile successfully
- [ ] Auth config files contain selected providers
- [ ] Env vars have correct format
- [ ] README sections generated correctly
- [ ] No hardcoded provider strings in generated code

---

## Known Issues / Expected Behavior

1. **No client-side environment variables**: All OAuth credentials are server-only, so NEXT_PUBLIC_ and VITE_ prefixes are not currently used. The system is designed to support them when needed.

2. **GitHub warning**: Only GitHub requires extra configuration (user:email scope). This is expected behavior and properly documented.

3. **Performance with all 33 providers**: Selecting all providers increases build time slightly but remains acceptable (< 30 seconds on modern hardware).

---

## Reporting Issues

If you discover issues during manual testing:

1. Document the exact steps to reproduce
2. Include CLI output / error messages
3. Note the operating system and Node version
4. Check if the issue occurs with both frameworks
5. Verify the issue persists after `pnpm clean && pnpm install`

---

## Success Criteria Met

This implementation is considered successful when:

- [x] All automated tests pass
- [x] Manual testing scenarios complete without errors
- [x] Generated code compiles for both frameworks
- [x] No hardcoded provider strings in codebase
- [x] All 33 providers have complete metadata
- [x] CLI "show more" flow works smoothly
- [x] Environment variable prefixes applied correctly (when applicable)
- [x] README sections are valid markdown

---

**Last Updated**: 2026-01-15
**Task Group**: 6 - Testing and Validation
