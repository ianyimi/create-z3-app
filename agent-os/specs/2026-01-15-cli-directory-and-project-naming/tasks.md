# Task Breakdown: CLI Directory and Project Naming

## Overview
Total Tasks: 16
Assigned roles: api-engineer, testing-engineer

## Task List

### Validation Layer

#### Task Group 1: Project Name Validation Module
**Assigned implementer:** api-engineer
**Dependencies:** None

- [x] 1.0 Complete project name validation module
  - [x] 1.1 Create validation utilities file (`src/utils/validation.ts`)
    - Create new file at `/Users/zaye/Documents/Projects/create-z3-app.git/dev/packages/cli/src/utils/validation.ts`
    - Export `validateProjectName(name: string)` function
    - Wrap `validate-npm-package-name` package (already in dependencies)
    - Return object with `valid: boolean` and `errors: string[]`
    - Handle npm scoped packages (e.g., `@org/my-app`)
  - [x] 1.2 Create directory validation utilities
    - Add to same validation.ts file
    - Export `checkDirectoryExists(targetPath: string): Promise<boolean>`
    - Export `isDirectoryEmpty(dirPath: string): Promise<boolean>` (excluding hidden files like `.git`)
    - Use `fs-extra` package (already in dependencies) for `pathExists` checks
  - [x] 1.3 Create project name resolution function
    - Export `resolveProjectName(input: string, cwd: string): string`
    - If input is `.`, return basename of cwd (current directory name)
    - Otherwise return input unchanged
    - Handle edge case where cwd basename is invalid npm name

**Acceptance Criteria:**
- `validateProjectName` correctly validates npm package names
- `validateProjectName` accepts scoped packages like `@org/my-app`
- `validateProjectName` rejects names with spaces, uppercase (outside scope), special characters
- `checkDirectoryExists` accurately detects existing directories
- `isDirectoryEmpty` correctly ignores hidden files when checking emptiness
- `resolveProjectName` returns directory name for `.` input

---

### File Operations Layer

#### Task Group 2: Directory Management Module
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 1

- [x] 2.0 Complete directory management module
  - [x] 2.1 Create file operations helper (`src/helpers/fileOperations.ts`)
    - Create new file at `/Users/zaye/Documents/Projects/create-z3-app.git/dev/packages/cli/src/helpers/fileOperations.ts`
    - Export `createProjectDirectory(projectName: string, cwd: string): Promise<string>`
    - Use `fs-extra.ensureDir()` for directory creation
    - Return the absolute path to the created directory
    - Handle `.` case by returning cwd without creating new directory
  - [x] 2.2 Add target path resolution
    - Export `getTargetDirectory(projectName: string, cwd: string): string`
    - For `.` input: return cwd
    - For named projects: return `path.join(cwd, projectName)`
    - Handle scoped packages (create nested directories for `@org/my-app`)

**Acceptance Criteria:**
- Directory creation works for standard project names
- Directory creation handles scoped packages correctly
- Dot notation returns current directory without modification
- Functions use `fs-extra` consistently

---

### Error Handling Layer

#### Task Group 3: CLI Error Messages
**Assigned implementer:** api-engineer
**Dependencies:** Task Groups 1-2

- [x] 3.0 Complete error handling utilities
  - [x] 3.1 Create error and success message utilities (`src/utils/messages.ts`)
    - Create new file at `/Users/zaye/Documents/Projects/create-z3-app.git/dev/packages/cli/src/utils/messages.ts`
    - Export `displayDirectoryExistsError(dirName: string): void`
    - Export `displayInvalidNameError(name: string, errors: string[]): void`
    - Export `displayDirectoryNotEmptyError(): void`
    - Export `displayPermissionError(path: string): void`
    - Export `displaySuccessMessage(projectName: string, targetPath: string, isCurrentDir: boolean): void`
    - Use `chalk` (already in dependencies) for colored error and success output
    - Include actionable suggestions in each error message
  - [x] 3.2 Define message constants
    - Directory exists: `Error: Directory '{name}' already exists. Please choose a different name or remove the existing directory.`
    - Invalid name: `Error: Invalid project name '{name}'. {validation-errors}`
    - Not empty: `Error: Current directory is not empty. Please use a different directory or provide a project name.`
    - Permission denied: `Error: Permission denied when creating '{path}'. Please check your directory permissions.`
    - Success (new directory): `✓ Successfully created project '{name}' at {path}`
    - Success (current directory): `✓ Successfully created project '{name}' in current directory`

**Acceptance Criteria:**
- Error messages are clear and actionable
- All errors use consistent formatting with chalk
- Each error includes a suggestion for resolution
- Errors exit with non-zero status code
- Success message displays project name and location
- Success message uses green/positive chalk styling

---

### CLI Flow Integration

#### Task Group 4: Main CLI Flow Update
**Assigned implementer:** api-engineer
**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete CLI flow integration
  - [x] 4.1 Update main CLI file (`src/index.ts`)
    - Modify `/Users/zaye/Documents/Projects/create-z3-app.git/dev/packages/cli/src/index.ts`
    - Import validation, file operations, and message modules
    - Maintain existing commander setup (`.argument('[project-name]')` already exists)
  - [x] 4.2 Implement project name argument handling
    - If project name provided as argument:
      - Validate immediately with `validateProjectName`
      - If invalid, display error and exit (no re-prompt)
      - If `.`, resolve to current directory name
    - If no argument provided:
      - Prompt for project name first (before framework selection)
      - Use `my-z3-app` as default value
      - Validate input and re-prompt if invalid
  - [x] 4.3 Implement directory conflict detection
    - After project name is determined, before any other prompts
    - For named projects: check if `process.cwd()/project-name` exists
    - For dot notation: check if current directory is empty (excluding hidden files)
    - If conflict detected, display error and exit immediately
  - [x] 4.4 Implement directory creation
    - After conflict check passes
    - Create directory for named projects
    - Skip creation for dot notation
    - Catch and handle permission errors gracefully
  - [x] 4.5 Display success message upon completion
    - After directory creation succeeds, call `displaySuccessMessage()`
    - Pass project name, target path, and whether it's current directory
    - Display before continuing to framework selection or other prompts

**Acceptance Criteria:**
- Project name prompt appears before framework selection
- CLI argument `create-z3 my-app` creates directory correctly
- CLI argument `create-z3 .` scaffolds in current directory
- Invalid names from CLI args exit immediately without prompts
- Invalid names from prompts allow re-entry
- Directory conflicts halt execution with clear error
- Empty current directory allows dot notation scaffolding
- Success message displays after directory creation with project name and location

---

### Template Layer

#### Task Group 5: Next.js Template Placeholder
**Assigned implementer:** api-engineer
**Dependencies:** None (can run in parallel with Task Groups 1-3)

- [x] 5.0 Complete Next.js template placeholder
  - [x] 5.1 Create Next.js template directory structure
    - Create directory at `/Users/zaye/Documents/Projects/create-z3-app.git/dev/packages/cli/templates/nextjs/`
    - Add placeholder `package.json` with name field set to `{{projectName}}`
    - Add minimal `.gitignore` file
    - Add empty `src/` directory with `.gitkeep`
  - [x] 5.2 Add template README
    - Create `templates/nextjs/README.md` explaining this is a placeholder
    - Note that full implementation will come in future spec

**Acceptance Criteria:**
- Next.js template directory exists at correct location
- Template has minimal valid structure
- Template package.json includes `{{projectName}}` placeholder
- CLI can detect and list Next.js as valid template option

---

### Testing Layer

#### Task Group 6: Core User Flow Tests
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1-5

- [x] 6.0 Complete core user flow test coverage
  - [x] 6.1 Set up test infrastructure
    - Configure test framework (vitest or jest) in package.json
    - Create test directory at `/Users/zaye/Documents/Projects/create-z3-app.git/dev/packages/cli/src/__tests__/`
    - Set up mocking for `fs-extra` and `process.cwd()`
  - [x] 6.2 Write validation module tests (`validation.test.ts`)
    - Test valid npm package names pass validation
    - Test scoped packages (`@org/my-app`) pass validation
    - Test invalid names (spaces, uppercase, special chars) fail validation
    - Test `.` resolves to directory name correctly
    - Mock filesystem for directory checks
  - [x] 6.3 Write file operations tests (`fileOperations.test.ts`)
    - Test directory creation with standard names
    - Test directory creation with scoped packages
    - Test dot notation returns cwd unchanged
    - Mock `fs-extra.ensureDir` calls
  - [x] 6.4 Write CLI integration tests (`index.test.ts`)
    - Test CLI with project name argument creates directory
    - Test CLI with `.` argument uses current directory
    - Test CLI without argument prompts for name
    - Test directory conflict detection exits with error
    - Mock prompts and filesystem operations
  - [x] 6.5 Validate all tests pass
    - Run full test suite
    - Verify all critical paths covered
    - Ensure tests run in isolation (no shared state)

**Acceptance Criteria:**
- Test infrastructure configured and working
- Validation module has tests for valid/invalid names
- File operations module has tests for directory creation
- CLI flow has integration tests for main user paths
- All tests pass and run independently
- Tests mock external dependencies (filesystem, prompts)

---

## Execution Order

Recommended implementation sequence:

```
Phase 1 (Foundation - Parallel):
  - Task Group 1: Validation Module
  - Task Group 5: Next.js Template Placeholder

Phase 2 (Sequential):
  - Task Group 2: Directory Management (depends on Group 1)
  - Task Group 3: Error Handling (depends on Groups 1-2)
  - Task Group 4: CLI Flow Integration (depends on Groups 1-3)

Phase 3 (Verification):
  - Task Group 6: Core User Flow Tests (depends on Groups 1-5)
```

## File Structure Summary

New files to create:
```
packages/cli/src/
  utils/
    validation.ts      (Task Group 1)
    messages.ts        (Task Group 3)
  helpers/
    fileOperations.ts  (Task Group 2)
  __tests__/
    validation.test.ts     (Task Group 6)
    fileOperations.test.ts (Task Group 6)
    index.test.ts          (Task Group 6)

packages/cli/templates/
  nextjs/
    package.json       (Task Group 5)
    .gitignore         (Task Group 5)
    README.md          (Task Group 5)
    src/
      .gitkeep         (Task Group 5)
```

Files to modify:
```
packages/cli/src/index.ts     (Task Group 4)
packages/cli/package.json     (Task Group 6 - test script)
```

## Dependencies Reference

All required packages are already in `package.json`:
- `validate-npm-package-name` - npm name validation
- `fs-extra` - file system operations (`ensureDir`, `pathExists`)
- `chalk` - colored terminal output
- `commander` - CLI framework
- `@inquirer/prompts` - user prompts

## Notes

- This feature does NOT include template scaffolding (copying files to target directory) - that is a separate future feature
- Git initialization is explicitly out of scope
- OAuth provider selection is explicitly out of scope
- Dependency installation is explicitly out of scope
- The Next.js template is intentionally minimal (placeholder only)
