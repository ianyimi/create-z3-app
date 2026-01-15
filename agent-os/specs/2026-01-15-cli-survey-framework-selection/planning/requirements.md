# Requirements - CLI Survey Framework Selection

## Overview
Implement the initial CLI survey system that prompts users for framework selection (Next.js or TanStack Start) and publish to npm for testing. This is the first user-facing feature of the create-z3-app CLI.

## Key Decisions

### Project Name Handling
- **Approach:** Accept optional project name as CLI argument
- **Usage:** `npm create z3-app my-app` or `npm create z3-app` (will prompt for name)
- **Behavior:** Parse and store project name, display it in output
- **No File Creation:** Project name is logged but no directories/files are created yet

### Framework Selection Survey
- **Prompt Tool:** Use `@inquirer/select` from `@inquirer/prompts`
- **Question:** "Which framework would you like to use?"
- **Options:**
  1. TanStack Start (default, pre-selected)
  2. Next.js
- **Default Selection:** TanStack Start is pre-selected
- **User Experience:** Arrow keys to navigate, Enter to confirm

### Post-Selection Behavior
- **Action:** Display success message with selections
- **Message Format:**
  ```
  ✅ Configuration complete!

  Project name: my-app
  Framework: TanStack Start

  (No scaffolding yet - this is a test version)
  ```
- **Exit:** Clean exit after displaying message

### NPM Publishing
- **Package Name:** `create-z3-app` (already configured in package.json)
- **Version:** `0.0.1` (keep current version)
- **Usage:** Users run `npm create z3-app my-app` to test
- **Testing Goal:** Verify the CLI runs and survey works end-to-end

### Dependencies
- **No New Dependencies Required:**
  - `commander` - Already installed for CLI parsing
  - `@inquirer/prompts` - Already installed for interactive prompts
  - `chalk` - Already installed for colored output
- **Current Dependencies Are Sufficient:** No changes to package.json dependencies needed

### Package Configuration
- **Name:** `create-z3-app` (unchanged)
- **Version:** `0.0.1` (unchanged)
- **Bin Entry:** `"create-z3-app": "./dist/index.js"` (already configured)
- **Type:** `"module"` (ESM, already configured)

## Explicitly Out of Scope

This first version intentionally excludes:
- ❌ File/directory creation
- ❌ Project scaffolding
- ❌ Template copying
- ❌ Project name validation
- ❌ Existing directory checks
- ❌ Additional survey questions (OAuth, Git, deployment, etc.)
- ❌ Dependency installation
- ❌ Git initialization
- ❌ Any actual project setup

**Rationale:** This is a minimal test version to validate:
1. NPM publishing works correctly
2. Users can run `npm create z3-app my-app`
3. Interactive survey displays and captures input
4. CLI executes successfully from npm

## Technical Approach

### CLI Entry Point (`src/index.ts`)
- Use `commander` to parse CLI arguments
- Accept optional project name as first argument
- If no project name provided, prompt using `@inquirer/input`
- Launch framework selection survey
- Display success message with selections
- Exit cleanly

### Survey Implementation
```typescript
import { select } from '@inquirer/prompts';

const framework = await select({
  message: 'Which framework would you like to use?',
  choices: [
    { name: 'TanStack Start', value: 'tanstack' },
    { name: 'Next.js', value: 'nextjs' }
  ],
  default: 'tanstack'
});
```

### Output Formatting
- Use `chalk` for colored output
- Green checkmark for success
- Clear, readable message format
- Include note that this is a test version

## Success Criteria

1. ✅ CLI package builds successfully with `pnpm build`
2. ✅ Package publishes to npm as `create-z3-app@0.0.1`
3. ✅ Users can run `npm create z3-app my-app` from any terminal
4. ✅ CLI accepts project name as argument OR prompts for it
5. ✅ Framework selection survey displays with TanStack Start as default
6. ✅ User can navigate options with arrow keys and select with Enter
7. ✅ Success message displays project name and selected framework
8. ✅ CLI exits cleanly with no errors
9. ✅ No files or directories are created
10. ✅ End-to-end flow completes in under 10 seconds

## Testing Plan

### Local Testing (Pre-Publish)
1. Build CLI: `pnpm build`
2. Link locally: `npm link` in packages/cli
3. Test command: `create-z3-app test-project`
4. Verify survey runs and displays correctly
5. Test with and without project name argument

### NPM Testing (Post-Publish)
1. Publish to npm: `npm publish` in packages/cli
2. From a different directory: `npm create z3-app my-app`
3. Verify npm downloads and executes package correctly
4. Test on clean system (no local linking)

### Edge Cases to Test
- Running without project name argument
- Running with project name argument
- Selecting TanStack Start (default)
- Selecting Next.js (non-default)
- Ctrl+C to cancel (should exit gracefully)

## Future Extensions

This minimal version sets the foundation for:
- Phase 2: Add OAuth provider selection
- Phase 3: Add Git/GitHub initialization prompts
- Phase 4: Add deployment platform selection
- Phase 5: Add actual project scaffolding
- Phase 6: Add template file copying
- Phase 7: Add dependency installation

## Dependencies Confirmation

**Answer to "Does this change any dependency requirements?"**

**NO** - This spec does not require any new dependencies. All necessary packages are already installed:
- ✅ `commander` (^12.0.0) - CLI framework
- ✅ `@inquirer/prompts` (^7.2.0) - Interactive prompts
- ✅ `chalk` (^5.3.0) - Terminal colors
- ✅ `typescript` (^5.7.0) - TypeScript support
- ✅ `tsup` (^8.0.0) - Build tool

The existing dependencies are sufficient for this implementation.
