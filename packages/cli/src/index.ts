#!/usr/bin/env node

import { Command } from 'commander';
import { select, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateProjectName, checkDirectoryExists, isDirectoryEmpty, resolveProjectName } from './utils/validation.js';
import { createProjectDirectory, getTargetDirectory, copyTemplate } from './helpers/fileOperations.js';
import {
  displayDirectoryExistsError,
  displayInvalidNameError,
  displayDirectoryNotEmptyError,
  displayPermissionError,
  displaySuccessMessage
} from './utils/messages.js';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('create-z3')
  .version(packageJson.version)
  .description('CLI for scaffolding Z3 Stack applications')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectNameArg?: string) => {
    try {
      const cwd = process.cwd();
      let projectName = '';

      // Handle project name - from argument or prompt
      if (projectNameArg) {
        // Resolve project name (handle dot notation)
        const resolvedName = resolveProjectName(projectNameArg, cwd);

        // Validate project name from argument
        const validation = validateProjectName(resolvedName);

        if (!validation.valid) {
          displayInvalidNameError(resolvedName, validation.errors);
        }

        projectName = resolvedName;
      } else {
        // Prompt for project name with validation loop
        let isValid = false;

        while (!isValid) {
          const inputName = await input({
            message: 'What is your project named?',
            default: 'my-z3-app',
          });

          // Resolve project name (handle dot notation)
          const resolvedName = resolveProjectName(inputName, cwd);

          // Validate the input
          const validation = validateProjectName(resolvedName);

          if (validation.valid) {
            projectName = resolvedName;
            isValid = true;
          } else {
            console.error();
            console.error(chalk.red(`Invalid project name '${resolvedName}'.`));

            if (validation.errors.length > 0) {
              validation.errors.forEach(error => {
                console.error(chalk.yellow(`  - ${error}`));
              });
            }

            console.error();
            console.error(chalk.yellow('Please try again with a valid npm package name.'));
            console.error();
          }
        }
      }

      // Check for directory conflicts
      const targetDir = getTargetDirectory(projectName, cwd);

      if (projectNameArg === '.') {
        // For dot notation, check if current directory is empty
        const isEmpty = await isDirectoryEmpty(cwd);

        if (!isEmpty) {
          displayDirectoryNotEmptyError();
        }
      } else {
        // For named projects, check if directory already exists
        const exists = await checkDirectoryExists(targetDir);

        if (exists) {
          displayDirectoryExistsError(projectName);
        }
      }

      // Create project directory
      let createdPath: string;
      try {
        createdPath = await createProjectDirectory(projectName, cwd);
      } catch (error) {
        // Handle permission errors
        if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
          displayPermissionError(targetDir);
        }

        // Re-throw other errors
        throw error;
      }

      // Framework selection survey
      const framework = await select({
        message: 'Which framework would you like to use?',
        choices: [
          { name: 'TanStack Start', value: 'tanstack' },
          { name: 'Next.js', value: 'nextjs' }
        ],
        default: 'tanstack'
      });

      // Map framework value to display name
      const frameworkName = framework === 'tanstack' ? 'TanStack Start' : 'Next.js';

      // Copy template files to target directory
      await copyTemplate(framework, createdPath);

      // TODO: Perform template string replacements here
      // This is where we'll:
      // 1. Process template strings and perform replacements
      // 2. Update package.json with project name
      // 3. Run any framework-specific setup

      // Display success message after all configuration is complete
      console.log();
      displaySuccessMessage(projectName, createdPath, projectNameArg === '.');
      console.log();
      console.log(chalk.green('✅ Configuration complete!'));
      console.log();
      console.log(`Project name: ${projectName}`);
      console.log(`Framework: ${frameworkName}`);
      console.log();
      console.log(chalk.dim('Next steps:'));
      console.log(chalk.dim(`  cd ${projectName}`));
      console.log(chalk.dim('  npm install'));
      console.log(chalk.dim('  npm run dev'));
      console.log();

      // Clean exit
      process.exit(0);
    } catch (error) {
      // Handle Ctrl+C gracefully
      if (error instanceof Error && error.name === 'ExitPromptError') {
        console.log();
        process.exit(0);
      }

      // Re-throw other errors
      throw error;
    }
  });

program.parse();
