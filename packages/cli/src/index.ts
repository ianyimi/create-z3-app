#!/usr/bin/env node

import { Command } from 'commander';
import { select, input, checkbox, confirm, Separator } from '@inquirer/prompts';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateProjectName, checkDirectoryExists, isDirectoryEmpty, resolveProjectName } from './utils/validation.js';
import { createProjectDirectory, getTargetDirectory } from './helpers/fileOperations.js';
import {
  displayDirectoryExistsError,
  displayInvalidNameError,
  displayDirectoryNotEmptyError,
  displayPermissionError,
  displaySuccessMessage
} from './utils/messages.js';
import { getPopularProviders, getAdditionalProviders } from './installers/providers.js';
import { getProvidersRequiringExtraConfig } from './installers/string-utils.js';
import type { TweakCNTheme, ProjectOptions, Framework } from './installers/types.js';
import { TanStackInstaller } from './installers/tanstack.js';
import { NextJSInstaller } from './installers/nextjs.js';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

/**
 * Prompts user to select authentication methods including email/password and OAuth providers
 * Shows email/password checkbox at the top (checked by default), followed by all OAuth providers alphabetically
 *
 * @returns Promise<{ emailPassword: boolean; oauthProviders: string[] }> - Authentication selections
 */
async function promptOAuthProviders(): Promise<{
  emailPassword: boolean;
  oauthProviders: string[];
}> {
  const popularProviders = getPopularProviders();
  const additionalProviders = getAdditionalProviders();

  // Combine all OAuth providers and sort alphabetically
  const allOAuthProviders = [...popularProviders, ...additionalProviders].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Build choices with email/password first, then all OAuth providers alphabetically
  const choices = [
    {
      name: 'Email & Password',
      value: '__email_password__',
      checked: true, // Default enabled
    },
    new Separator('OAuth Providers (A-Z):'),
    ...allOAuthProviders.map(provider => ({
      name: provider.name,
      value: provider.id,
      checked: false,
    })),
  ];

  // Single prompt with all providers
  const selectedProviders = await checkbox({
    message: 'Select authentication providers (space to select, enter to confirm):',
    choices,
    pageSize: 15, // Show more items at once
    loop: false, // Don't wrap around
  });

  // Filter out sentinel values and extract email/password selection
  const emailPassword = selectedProviders.includes('__email_password__');
  const oauthProviders = selectedProviders.filter(
    id => id !== '__email_password__'
  );

  // Display warnings for providers requiring extra config
  if (oauthProviders.length > 0) {
    const providersNeedingExtraConfig = getProvidersRequiringExtraConfig(oauthProviders);

    if (providersNeedingExtraConfig.length > 0) {
      console.log();
      console.log(chalk.yellow('⚠️  Some providers require extra configuration:'));
      console.log();

      providersNeedingExtraConfig.forEach(provider => {
        console.log(chalk.yellow(`  ${provider.name}:`));
        console.log(chalk.dim(`  ${provider.extraConfigNotes}`));
        console.log();
      });
    }
  }

  return { emailPassword, oauthProviders };
}

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

      // Check for directory conflicts BEFORE prompts (but don't create yet)
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

      // Authentication provider selection (email/password + OAuth)
      const { emailPassword, oauthProviders } = await promptOAuthProviders();

      // Display warning if no authentication methods selected
      if (!emailPassword && oauthProviders.length === 0) {
        console.log();
        console.log(chalk.yellow('⚠️  Warning: No authentication methods selected.'));
        console.log(chalk.yellow('   Your app will have no user authentication.'));
        console.log();
      }

      // TweakCN theme URL prompt (optional)
      const tweakcnThemeUrl = await input({
        message: 'Enter TweakCN theme URL (optional, press Enter to skip):',
        default: '',
      });

      let tweakcnTheme: TweakCNTheme | undefined;
      if (tweakcnThemeUrl.trim()) {
        tweakcnTheme = {
          type: 'url',
          content: tweakcnThemeUrl.trim(),
        };
      }

      // Git initialization prompt
      const initGit = await confirm({
        message: 'Initialize Git repository?',
        default: true,
      });

      // Install dependencies prompt
      const installDependencies = await confirm({
        message: 'Install dependencies?',
        default: true,
      });

      // Build ProjectOptions object with all collected inputs
      const projectOptions: ProjectOptions = {
        projectName,
        framework: framework as Framework,
        emailPasswordAuth: emailPassword,
        oauthProviders,
        tweakcnTheme,
        initGit,
        installDependencies,
      };

      // NOW create the project directory (after all prompts complete successfully)
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

      // Instantiate correct installer based on framework selection
      let installer;
      if (framework === 'tanstack') {
        installer = new TanStackInstaller(createdPath, projectName);
      } else {
        installer = new NextJSInstaller(createdPath, projectName);
      }

      // Execute all configuration steps through the installer
      try {
        await installer.initProject(projectOptions);
      } catch (error) {
        console.error();
        console.error(chalk.red('❌ Project initialization failed:'));
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        console.error();
        process.exit(1);
      }

      // Display success message after all configuration is complete
      console.log();
      displaySuccessMessage(projectName, createdPath, projectNameArg === '.');
      console.log();
      console.log(chalk.green('✅ Configuration complete!'));
      console.log();
      console.log(`Project name: ${projectName}`);
      console.log(`Framework: ${frameworkName}`);

      // Display authentication selection summary
      if (emailPassword && oauthProviders.length > 0) {
        console.log(`Authentication: Email/Password + OAuth (${oauthProviders.join(', ')})`);
      } else if (emailPassword) {
        console.log('Authentication: Email/Password');
      } else if (oauthProviders.length > 0) {
        console.log(`Authentication: OAuth (${oauthProviders.join(', ')})`);
      } else {
        console.log(chalk.dim('Authentication: None selected'));
      }

      // Display TweakCN theme status
      if (tweakcnTheme) {
        console.log('Theme: Custom TweakCN theme');
      } else {
        console.log('Theme: Default');
      }

      // Display Git initialization status
      if (initGit) {
        console.log('Git: Initialized');
      } else {
        console.log('Git: Not initialized');
      }

      // Display dependency installation status
      if (installDependencies) {
        console.log('Dependencies: Installed');
      } else {
        console.log('Dependencies: Not installed');
      }

      console.log();
      console.log(chalk.dim('Next steps:'));
      if (projectNameArg !== '.') {
        console.log(chalk.dim(`  cd ${projectName}`));
      }
      if (!installDependencies) {
        console.log(chalk.dim('  npm install'));
      }
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
