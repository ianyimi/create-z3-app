# Task Breakdown: CLI Survey Framework Selection

## Overview
Total Tasks: 16
Estimated Task Groups: 4

## Context

This spec implements a minimal interactive CLI that:
- Accepts an optional project name argument or prompts for it
- Displays a framework selection survey (TanStack Start or Next.js)
- Shows a success message with selections
- Publishes to npm as version 0.0.1

**Important Constraints:**
- NO new dependencies required (all already installed)
- NO file/directory creation (survey + output only)
- Focus on validating npm publish flow end-to-end

---

## Task List

### CLI Implementation

#### Task Group 1: Core CLI Entry Point
**Assigned implementer:** cli-engineer
**Dependencies:** None

- [x] 1.0 Complete CLI entry point implementation
  - [x] 1.1 Implement commander program setup in `src/index.ts`
    - Import commander and configure program
    - Set program name: `create-z3-app`
    - Set version from package.json (0.0.1)
    - Set description: "CLI for scaffolding Z3 Stack applications"
    - Configure to accept optional `[project-name]` argument
    - Parse arguments and extract project name
  - [x] 1.2 Implement project name handling logic
    - Check if project name was provided as CLI argument
    - If not provided, prompt using `@inquirer/input` with message: "What is your project named?"
    - Store project name for use in success message
  - [x] 1.3 Implement framework selection survey
    - Use `@inquirer/select` from `@inquirer/prompts`
    - Message: "Which framework would you like to use?"
    - Choices: TanStack Start (value: 'tanstack'), Next.js (value: 'nextjs')
    - Default: 'tanstack' (pre-selected)
  - [x] 1.4 Implement success message display
    - Use `chalk` for green colored output
    - Display checkmark symbol with "Configuration complete!"
    - Show project name from argument or prompt
    - Show selected framework name (human-readable)
    - Include note: "(No scaffolding yet - this is a test version)"
  - [x] 1.5 Ensure clean exit behavior
    - Exit with status code 0 on success
    - Handle Ctrl+C gracefully (exit without error message)

**Acceptance Criteria:**
- CLI parses project name from argument correctly
- CLI prompts for project name when not provided
- Framework survey displays with TanStack Start pre-selected
- Arrow keys navigate options, Enter confirms selection
- Success message displays correct project name and framework
- Clean exit with no errors or warnings

**Reference Code Pattern:**
```typescript
import { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import chalk from 'chalk';

const program = new Command();
program
  .name('create-z3-app')
  .version('0.0.1')
  .description('CLI for scaffolding Z3 Stack applications')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName) => {
    // Implementation here
  });
program.parse();
```

---

### Build & Verification

#### Task Group 2: Build and Local Verification
**Assigned implementer:** cli-engineer
**Dependencies:** Task Group 1

- [x] 2.0 Complete build and local verification
  - [x] 2.1 Run TypeScript build
    - Execute `pnpm build` in packages/cli directory
    - Verify no TypeScript compilation errors
    - Confirm `dist/index.js` is generated
  - [x] 2.2 Verify build output
    - Check `dist/index.js` has correct shebang (`#!/usr/bin/env node`)
    - Verify file is valid JavaScript (ESM format)
    - Confirm `dist/index.d.ts` type declarations exist
  - [x] 2.3 Run type checking
    - Execute `pnpm typecheck` if available
    - Verify no type errors in source code
  - [x] 2.4 Test local link installation
    - Run `npm link` in packages/cli directory
    - Verify `create-z3-app` command is available globally

**Acceptance Criteria:**
- Build completes without errors
- `dist/index.js` exists with correct shebang
- Type declarations generated
- Local link installs successfully

---

### Testing

#### Task Group 3: CLI Flow Testing
**Assigned implementer:** cli-engineer
**Dependencies:** Task Group 2

- [x] 3.0 Complete CLI flow testing
  - [x] 3.1 Test with project name argument
    - Run `create-z3-app test-project` (locally linked)
    - Verify framework survey displays immediately (no name prompt)
    - Select TanStack Start (default)
    - Verify success message shows "test-project" as project name
    - Verify success message shows "TanStack Start" as framework
  - [x] 3.2 Test without project name argument
    - Run `create-z3-app` (no argument)
    - Verify project name prompt appears: "What is your project named?"
    - Enter a project name (e.g., "my-app")
    - Verify framework survey displays after name entry
    - Select Next.js (non-default option)
    - Verify success message shows entered name and "Next.js"
  - [x] 3.3 Test cancel behavior
    - Run `create-z3-app` and press Ctrl+C during name prompt
    - Verify graceful exit (no error message)
    - Run `create-z3-app test` and press Ctrl+C during framework selection
    - Verify graceful exit (no error message)
  - [x] 3.4 Verify no filesystem changes
    - Run CLI in a test directory
    - Verify no files or directories are created
    - Confirm working directory is unchanged

**Acceptance Criteria:**
- Both argument and prompt flows work correctly
- Both framework options can be selected
- Ctrl+C exits gracefully without errors
- No filesystem modifications occur

---

### NPM Publishing

#### Task Group 4: NPM Publish and Verification
**Assigned implementer:** cli-engineer
**Dependencies:** Task Group 3

- [x] 4.0 Complete npm publishing and verification
  - [x] 4.1 Pre-publish verification
    - Verify package.json has correct name: `create-z3-app`
    - Verify version is `0.0.1`
    - Verify bin entry points to `./dist/index.js`
    - Verify type is set to `"module"`
    - Confirm build is up-to-date
  - [ ] 4.2 Publish to npm
    - Run `npm publish` from packages/cli directory
    - Verify publish succeeds without errors
    - Note: May require npm login first
  - [ ] 4.3 Unlink local package
    - Run `npm unlink -g create-z3-app`
    - Verify local link is removed
  - [ ] 4.4 Test npm installation
    - From a clean directory (outside project)
    - Run `npm create z3-app my-test-app`
    - Verify npm downloads and executes package from registry
    - Complete survey flow (select framework)
    - Verify success message displays correctly
  - [ ] 4.5 Cross-terminal verification
    - Test in different terminal emulators if available
    - Verify colors display correctly
    - Verify arrow key navigation works
    - Confirm overall UX is consistent

**Acceptance Criteria:**
- Package publishes to npm successfully
- `npm create z3-app` works from any directory
- Package downloads from npm registry (not local)
- Full survey flow works identically to local testing
- Colors and formatting display correctly
- Execution completes in under 5 seconds

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Core CLI Entry Point** - Implement the main CLI logic
2. **Task Group 2: Build and Local Verification** - Build and verify locally
3. **Task Group 3: CLI Flow Testing** - Test all CLI flows before publishing
4. **Task Group 4: NPM Publish and Verification** - Publish and verify from npm

**Notes:**
- All task groups must be completed sequentially due to dependencies
- Do not proceed to npm publishing until local testing is complete
- Keep the implementation minimal - no validation, no file creation

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/cli/src/index.ts` | Modify | Replace placeholder with CLI implementation |

**No new files required** - only modifying the existing entry point.

---

## Dependencies Confirmation

All dependencies are already installed:
- `commander` (^12.0.0) - CLI argument parsing
- `@inquirer/prompts` (^7.2.0) - Interactive prompts
- `chalk` (^5.3.0) - Terminal colors
- `typescript` (^5.7.0) - Type safety
- `tsup` (^8.0.0) - Build tool

**No package.json changes required.**

---

## Success Checklist

Before marking this spec complete, verify:

- [x] Package builds without errors (`pnpm build`)
- [ ] Package publishes to npm successfully
- [ ] Can install via `npm create z3-app`
- [x] Project name argument works (`npm create z3-app my-app`)
- [x] Project name prompt works (`npm create z3-app` then enter name)
- [x] Framework survey displays correctly
- [x] TanStack Start is pre-selected
- [x] Arrow keys navigate options
- [x] Enter selects option
- [x] Success message shows correct project name
- [x] Success message shows correct framework
- [x] No files created on filesystem
- [x] Clean exit with no errors
- [x] Ctrl+C exits gracefully
- [x] Total execution time under 5 seconds
