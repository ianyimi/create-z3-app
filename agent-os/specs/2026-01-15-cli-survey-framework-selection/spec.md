# Specification: CLI Survey Framework Selection

## Goal
Implement a minimal interactive CLI that prompts users for framework selection (TanStack Start or Next.js), accepts an optional project name argument, and publishes to npm as version 0.0.1 to validate the end-to-end CLI flow without any file scaffolding.

## User Stories
- As a developer, I want to run `npm create z3-app my-app` so that I can test the CLI installation from npm
- As a developer, I want to be prompted for a framework choice so that I can select between TanStack Start and Next.js
- As a developer, I want to provide a project name as an argument OR be prompted for it so that I have flexibility in how I use the CLI
- As a developer, I want to see a confirmation message with my selections so that I know the survey captured my input correctly
- As a developer, I want the CLI to exit cleanly without creating files so that I can verify the survey flow works before building the full scaffolding feature

## Core Requirements

### Project Name Handling
- Accept optional project name as first CLI argument: `npm create z3-app my-app`
- If no project name provided, prompt user for it using `@inquirer/input`
- Store and display project name in success message
- No validation required in this version (no directory creation)

### Framework Selection Survey
- Display interactive prompt: "Which framework would you like to use?"
- Provide two options: TanStack Start and Next.js
- TanStack Start is pre-selected as default
- Use arrow keys to navigate, Enter to confirm selection
- Implement with `@inquirer/select` from `@inquirer/prompts`

### Post-Selection Behavior
- Display success message showing:
  - Project name (from argument or prompt)
  - Selected framework
  - Note that this is a test version with no scaffolding
- Use green checkmark emoji with `chalk` for visual feedback
- Exit cleanly with status code 0

### NPM Publishing
- Publish to npm as `create-z3-app` version 0.0.1
- Verify users can run: `npm create z3-app my-app`
- Ensure the npm bin entry points to compiled `dist/index.js`
- Test that survey displays and captures input correctly

## Visual Design
No visual assets provided. CLI output should be clean and professional:
- Use `chalk` green for success messages
- Use `@inquirer/select` default styling for survey prompts
- Clear whitespace between sections
- Checkmark symbol for success state

## Reusable Components

### Existing Code to Leverage
**Dependencies (Already Installed):**
- `commander` (^12.0.0) - CLI argument parsing and program structure
- `@inquirer/prompts` (^7.2.0) - Interactive survey prompts (`select`, `input`)
- `chalk` (^5.3.0) - Terminal color and styling for success messages
- `typescript` (^5.7.0) - Type safety
- `tsup` (^8.0.0) - Build tool for compiling TypeScript to ESM

**Package Configuration (Already Configured):**
- `package.json` already has correct `bin` entry pointing to `./dist/index.js`
- Package name `create-z3-app` is set
- Version `0.0.1` is ready
- Type is set to `"module"` for ESM support
- Build script configured: `tsup src/index.ts --format esm --dts`

**Entry Point:**
- `src/index.ts` exists with shebang (`#!/usr/bin/env node`) and placeholder content

### New Components Required
**CLI Entry Point Implementation:**
- Need to replace placeholder in `src/index.ts` with actual CLI logic
- Parse CLI arguments using `commander` to extract optional project name
- Implement project name prompt if not provided as argument
- Implement framework selection survey using `@inquirer/select`
- Display formatted success message with selections
- No existing survey or prompt logic to reuse (starting from scratch)

**Why New Code is Needed:**
- No CLI survey implementation exists yet (current index.ts is placeholder)
- No prompt handling logic exists
- No success message formatting exists
- This is the first user-facing feature implementation

## Technical Approach

### CLI Structure
Use `commander` to set up the program:
- Program name: `create-z3-app`
- Version: Read from package.json (0.0.1)
- Description: "CLI for scaffolding Z3 Stack applications"
- Accept optional project name as first argument
- Parse arguments and extract project name if provided

### Project Name Handling
If project name not provided as CLI argument:
- Use `@inquirer/input` to prompt with message: "What is your project named?"
- Store result for display in success message
- No validation in this minimal version

### Framework Selection Implementation
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

### Success Message Format
Use `chalk` to format output:
```
✅ Configuration complete!

Project name: my-app
Framework: TanStack Start

(No scaffolding yet - this is a test version)
```

### Build and Publish Flow
1. Build with: `pnpm build` (runs tsup, compiles to `dist/index.js`)
2. Test locally with: `npm link` then `create-z3-app test-project`
3. Publish with: `npm publish` from packages/cli directory
4. Test from npm: `npm create z3-app my-app` from any directory

### File Structure
```
packages/cli/
├── src/
│   └── index.ts          # Main entry point (implement survey here)
├── dist/                 # Compiled output (generated by tsup)
│   ├── index.js         # Executable with shebang
│   └── index.d.ts       # TypeScript declarations
├── package.json         # Already configured
└── tsconfig.json        # Already configured
```

## Out of Scope

This minimal test version explicitly excludes:
- File or directory creation
- Project scaffolding or template copying
- Project name validation (format checking, existing directory checks)
- Additional survey questions (OAuth, Git, deployment, etc.)
- Dependency installation
- Git initialization
- Any actual project setup functionality
- Error handling beyond basic survey cancellation (Ctrl+C)

**Rationale:** The goal is to test that:
1. NPM publishing works correctly
2. The `npm create` alias executes the package
3. Interactive survey displays and captures input
4. CLI completes successfully without errors

## Success Criteria

### Build and Publish
- CLI builds successfully with `pnpm build`
- No TypeScript compilation errors
- `dist/index.js` is executable and has correct shebang
- Package publishes to npm as `create-z3-app@0.0.1`

### CLI Execution
- Users can run `npm create z3-app my-app` from any terminal
- CLI accepts project name as argument OR prompts for it
- Framework selection survey displays with correct options
- TanStack Start appears as pre-selected default

### User Interaction
- User can navigate options with arrow keys
- User can select with Enter key
- User can cancel with Ctrl+C (graceful exit)
- Success message displays with correct project name and framework
- CLI exits cleanly with status code 0

### Output Quality
- No files or directories are created on filesystem
- No error messages or warnings appear
- End-to-end flow completes in under 5 seconds
- Output is clean, readable, and professionally formatted

## Testing Approach

### Local Testing (Pre-Publish)
1. **Build Test:**
   - Run `pnpm build` in packages/cli
   - Verify `dist/index.js` exists and has shebang
   - Check for TypeScript errors with `pnpm typecheck`

2. **Link Test:**
   - Run `npm link` in packages/cli directory
   - Execute `create-z3-app test-project` from different directory
   - Verify survey displays and works correctly

3. **Argument Test:**
   - Test WITH project name: `create-z3-app my-app`
   - Test WITHOUT project name: `create-z3-app` (should prompt)
   - Verify both flows work correctly

4. **Selection Test:**
   - Select TanStack Start (default)
   - Select Next.js (non-default)
   - Verify both selections appear correctly in success message

### NPM Testing (Post-Publish)
1. **Clean Install Test:**
   - Unlink local package: `npm unlink -g create-z3-app`
   - From clean directory: `npm create z3-app my-test-app`
   - Verify npm downloads package and executes correctly

2. **Environment Test:**
   - Test on different terminal (iTerm, Terminal.app, VS Code terminal)
   - Verify colors and formatting display correctly
   - Ensure arrow key navigation works

### Edge Cases
- Ctrl+C during project name prompt (should exit gracefully)
- Ctrl+C during framework selection (should exit gracefully)
- Empty project name input (current version allows this)
- Special characters in project name (current version allows this)
- Running from directory with existing files (should not affect anything since no files created)

### Acceptance Checklist
- [ ] Package builds without errors
- [ ] Package publishes to npm successfully
- [ ] Can install via `npm create z3-app`
- [ ] Project name argument works
- [ ] Project name prompt works
- [ ] Framework survey displays correctly
- [ ] TanStack Start is pre-selected
- [ ] Arrow keys navigate options
- [ ] Enter selects option
- [ ] Success message shows correct data
- [ ] No files created on filesystem
- [ ] Clean exit with no errors
- [ ] Total execution time under 5 seconds

## Future Extensions

This minimal version sets the foundation for:
- **Phase 2:** Add OAuth provider multi-select survey
- **Phase 3:** Add Git initialization prompts
- **Phase 4:** Add GitHub repository creation
- **Phase 5:** Add deployment platform selection
- **Phase 6:** Implement actual project scaffolding (file creation)
- **Phase 7:** Add template copying and placeholder replacement
- **Phase 8:** Add dependency installation
- **Phase 9:** Add project name validation and error handling

The current implementation establishes:
- CLI argument parsing pattern
- Survey prompt pattern with `@inquirer/prompts`
- Success message formatting pattern
- Build and publish workflow
- Testing methodology for CLI tools

These patterns will be extended and enhanced in future specifications as we build out the complete CLI functionality described in PLAN.md.
