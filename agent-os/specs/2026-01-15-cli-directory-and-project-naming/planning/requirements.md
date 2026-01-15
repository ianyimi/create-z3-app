# Requirements - CLI Directory and Project Naming

## Overview
Update the CLI to create a new directory for the project and add project name prompting before framework selection.

## Key Requirements

### 1. Directory Creation
- **With Name Argument**: When user runs `create-z3 my-app`, create a new directory named `my-app` in the current working directory and scaffold the project inside it
- **Dot Notation Support**: When user runs `create-z3 .`, scaffold in the current directory without creating a new folder
- **Conflict Handling**: If a directory with the project name already exists, fail gracefully with an error message (do not overwrite or merge)
- **Location**: Use `process.cwd()` to determine where to create the new folder

### 2. Project Name Prompting
- **Prompt Order**: Ask for project name as the **first** prompt, before framework selection
- **When to Prompt**: Only prompt if user does not specify a project folder name in the command
- **Default Value**: Use `my-z3-app` as the default suggestion
- **Validation**: Use the same validation as `validate-npm-package-name` (lowercase, no spaces, valid npm scope format allowed)
- **Naming Consistency**: Project name and directory name are always the same (no separate specification)

### 3. Next.js Template
- **Current State**: Create an empty Next.js template folder structure for now
- **Future State**: Will include everything like TanStack template (full Convex setup, Better Auth integration, shadcn/ui components), but user will build it manually later
- **Minimal Requirement**: Just create the empty file/folder structure to support Next.js selection in the CLI

### 4. Success Message
- **Display on Completion**: Upon successful creation of the new project folder, the CLI should display a success message
- **Message Content**: Should inform the user that the project was created successfully and show the project name and location
- **Format**: Clear, friendly message using chalk for colored output

### 5. Scope Exclusions
The following items are explicitly **excluded** from this spec:
- Git initialization prompts (already planned in roadmap)
- OAuth provider selection (already planned in roadmap)
- Dependency installation logic

## User Answers Summary

| Question | Answer |
|----------|--------|
| Directory conflict handling | Fail gracefully with error message |
| Project name = directory name | Always the same |
| Next.js template completeness | Empty file for now, will build manually later |
| Default project name | my-z3-app |
| Support dot notation | Yes |
| Exclusions | Git init, OAuth selection, dependency installation |
| Visual assets | None provided |

## Success Criteria
- [ ] CLI creates new directory when name argument is provided
- [ ] CLI prompts for project name first when no argument provided
- [ ] CLI uses project name for both directory and package.json name
- [ ] CLI supports dot notation for current directory scaffolding
- [ ] CLI fails gracefully when directory already exists
- [ ] CLI displays success message upon completion of project folder creation
- [ ] Empty Next.js template folder structure exists
- [ ] All existing functionality continues to work
