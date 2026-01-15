# Specification: CLI Directory and Project Naming

## Goal
Enable the CLI to create project directories and prompt for project names before framework selection, supporting both new directory creation and current directory scaffolding.

## User Stories
- As a developer, I want to run `create-z3 my-app` and have the CLI create a new `my-app` directory in my current location, so I don't have to manually create folders
- As a developer, I want to run `create-z3 .` to scaffold in my current directory, so I can use existing folder structures
- As a developer, I want to be prompted for a project name first if I don't provide one, so the CLI guides me through setup in the right order
- As a developer, I want validation on my project name, so I don't accidentally create invalid npm packages
- As a developer, I want clear error messages when a directory already exists, so I don't accidentally overwrite existing projects

## Core Requirements

### Directory Creation
- When user provides a project name argument (e.g., `create-z3 my-app`), create a new directory with that name in the current working directory (`process.cwd()`)
- When user provides `.` as the argument (e.g., `create-z3 .`), scaffold directly into the current directory without creating a new folder
- If a directory with the specified name already exists, fail immediately with a clear error message before any prompts
- The project name and directory name are always identical (no separate specification)

### Project Name Prompting
- Project name prompt must be the first prompt in the CLI flow, appearing before framework selection
- Only prompt for project name if user did not provide it as a command-line argument
- Use `my-z3-app` as the default suggested value
- Validate project name using `validate-npm-package-name` package (already a dependency)
- Support npm scopes (e.g., `@org/my-app`)
- Reject names with spaces, uppercase letters (unless in scope), or other invalid npm package name characters

### Directory Conflict Detection
- Check if target directory exists before showing any prompts
- For named projects: Check if `process.cwd()/project-name` exists
- For dot notation: Check if current directory is empty or contains conflicting files
- Exit with error code and helpful message if conflict detected
- Do not attempt to merge, overwrite, or prompt for resolution

### Package.json Name Field
- Set the `name` field in generated `package.json` to match the project name exactly
- For dot notation (`.`), use the current directory's folder name as the project name
- Maintain lowercase requirement for package names

### Success Message
- Display a success message upon completion of the project folder creation
- Message should include the project name and the directory location
- Use `chalk` for colored, friendly output
- Example format: `✓ Successfully created project 'my-app' at /path/to/my-app`

## Visual Design
No visual assets provided for this feature.

## Reusable Components

### Existing Code to Leverage
**CLI Framework**:
- `commander` already configured in `/Users/zaye/Documents/Projects/create-z3-app.git/dev/packages/cli/src/index.ts`
- `.argument('[project-name]', 'Name of the project')` already accepts project name argument
- `@inquirer/prompts` `input` function already used for prompting

**Dependencies**:
- `validate-npm-package-name` already in package.json dependencies
- `fs-extra` already in package.json (provides `ensureDir`, `pathExists`)
- `chalk` already in use for colored output

**Template Structure**:
- TanStack Start template exists at `/Users/zaye/Documents/Projects/create-z3-app.git/dev/packages/cli/templates/tanstack-start/`
- Template `package.json` exists at `templates/tanstack-start/package.json`

### New Components Required
**Validation Module** (`src/utils/validation.ts`):
- Project name validation function wrapping `validate-npm-package-name`
- Directory existence checking function
- Empty directory validation for dot notation

**File Operations Module** (`src/helpers/fileOperations.ts`):
- Directory creation with `fs-extra.ensureDir()`
- Template copying utilities
- Package.json name replacement

**Error Handling**:
- Directory conflict error with suggested fix (use different name or remove existing directory)
- Invalid project name error with validation details
- Current directory not empty error (for dot notation)

## Technical Approach

### Implementation Sequence
1. **Add validation utilities** before modifying main CLI flow
2. **Update CLI flow** in `src/index.ts`:
   - Parse project name argument (already exists)
   - If no argument provided, prompt for project name first
   - Validate project name
   - Check for directory conflicts
   - Create target directory (if not using dot notation)
   - Continue with existing framework selection flow
3. **Create file operation helpers** for directory management
4. **Update template scaffolding** to operate in target directory

### Validation Logic
```
Input: projectNameInput (from CLI arg or prompt)

1. If projectNameInput is "." → use current directory name
2. Validate with validate-npm-package-name
3. If invalid → show error, re-prompt (if interactive) or exit (if from arg)
4. If valid → proceed to directory conflict check
```

### Directory Conflict Logic
```
Input: projectName, currentWorkingDir

1. If projectName is "." →
   - Check if currentWorkingDir is empty
   - If not empty → exit with error
2. Else →
   - targetPath = path.join(currentWorkingDir, projectName)
   - Check if targetPath exists
   - If exists → exit with error (do not prompt)
3. If no conflicts → proceed to directory creation
```

### Directory Creation Logic
```
Input: projectName, currentWorkingDir

1. If projectName is "." →
   - targetDir = currentWorkingDir
   - No directory creation needed
2. Else →
   - targetDir = path.join(currentWorkingDir, projectName)
   - Create directory with fs-extra.ensureDir()
3. Return targetDir for subsequent operations
```

### Environment Variables
- `process.cwd()` for current working directory
- No additional environment configuration needed

### Error Messages
- **Directory exists**: `Error: Directory 'my-app' already exists. Please choose a different name or remove the existing directory.`
- **Invalid name**: `Error: Invalid project name 'My-App'. Package names must be lowercase and cannot contain spaces.`
- **Current directory not empty**: `Error: Current directory is not empty. Please use a different directory or provide a project name.`

### Success Messages
- **Project created**: `✓ Successfully created project 'my-app' at /path/to/my-app`
- **Project created with dot notation**: `✓ Successfully created project 'my-app' in current directory`

## Out of Scope
The following items are explicitly excluded from this specification:
- Git initialization prompts (planned in separate feature)
- OAuth provider selection (planned in separate feature)
- Dependency installation logic (planned in separate feature)
- Full Next.js template implementation (only empty structure needed)
- GitHub repository creation
- Custom project directory paths (only `process.cwd()` + name supported)

## Edge Cases and Error Handling

### Edge Case: Dot Notation in Non-Empty Directory
**Scenario**: User runs `create-z3 .` in a directory that already has files

**Handling**:
- Check if current directory contains any files/folders (excluding hidden files like `.git`)
- If not empty, exit with error message
- Do not attempt to merge or prompt for confirmation

### Edge Case: Invalid Characters in Project Name
**Scenario**: User provides `My App!` or `my_app@latest`

**Handling**:
- Run validation before any prompts
- Show specific error from `validate-npm-package-name`
- If from CLI argument, exit immediately
- If from prompt, show error and re-prompt

### Edge Case: Scoped Package Names
**Scenario**: User provides `@myorg/my-app`

**Handling**:
- Validate as normal (scopes are valid npm package names)
- Create directory named `@myorg/my-app` (including the `@` symbol in folder name)
- Set package.json name to `@myorg/my-app`

### Edge Case: Very Long Project Names
**Scenario**: User provides a name exceeding filesystem limits

**Handling**:
- Let filesystem return error naturally
- Catch and display filesystem error with suggestion to use shorter name
- `validate-npm-package-name` already enforces 214 character limit

### Edge Case: Permission Denied on Directory Creation
**Scenario**: User lacks write permissions in current directory

**Handling**:
- Let `fs-extra.ensureDir()` throw error
- Catch error and display message about checking permissions
- Exit with non-zero status code

### Edge Case: Dot Notation with Empty Current Directory
**Scenario**: User runs `create-z3 .` in an empty directory

**Handling**:
- Use parent directory's folder name as project name
- Proceed with scaffolding in current directory
- This is the successful case for dot notation

### Error Recovery
- No automatic recovery for directory conflicts
- For validation errors during prompts, allow user to re-enter name
- For validation errors from CLI args, exit immediately (no re-prompt)

## Success Criteria
- CLI successfully creates new directory when project name is provided as argument
- CLI successfully prompts for project name first when no argument provided
- CLI validates project name and rejects invalid names with clear error messages
- CLI supports dot notation (`.`) for scaffolding in current directory
- CLI fails gracefully with helpful error when target directory already exists
- CLI displays success message with project name and location upon completion
- Empty Next.js template folder structure exists and can be selected
- Generated package.json contains correct project name in `name` field
- All existing functionality (framework selection) continues to work
- Project can be created with scoped npm names (e.g., `@org/my-app`)
- Error messages are clear and actionable for all failure scenarios

## Next Steps After Implementation
Once this specification is implemented, the following features can be built:
1. Template scaffolding (copying template files to target directory)
2. OAuth provider selection and configuration
3. Git initialization
4. Dependency installation
5. Complete Next.js template implementation
