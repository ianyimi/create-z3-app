/**
 * FrameworkInstaller Base Class
 *
 * Abstract base class for framework-specific project installers.
 * Provides template method pattern with concrete utility methods
 * and abstract methods for framework-specific operations.
 */

import { execa } from 'execa';
import ora from 'ora';
import crypto from 'crypto';
import type { ProjectOptions, PackageManager } from './types.js';
import { copyTemplate } from '../helpers/fileOperations.js';
import { DEFAULT_THEME } from './string-utils.js';
import { convertTweakCNToOKLCH } from '../utils/tweakcn-converter.js';

/**
 * Abstract base class for framework-specific installers
 * Implements the Template Method pattern for project initialization
 */
export abstract class FrameworkInstaller {
  /**
   * Constructor for FrameworkInstaller
   *
   * @param targetPath - Absolute path to the target project directory
   * @param projectName - Name of the project
   */
  constructor(
    protected targetPath: string,
    protected projectName: string
  ) {}

  /**
   * Abstract property: Framework identifier
   * Used for template selection and logging
   */
  abstract get frameworkName(): string;

  /**
   * Abstract method: Update OAuth configuration in auth file
   * Framework-specific file path and configuration format
   *
   * @param selectedProviders - Array of provider IDs to configure
   * @param emailPasswordEnabled - Whether email/password authentication is enabled
   */
  abstract updateOAuthConfig(
    selectedProviders: string[],
    emailPasswordEnabled: boolean
  ): Promise<void>;

  /**
   * Abstract method: Update OAuth UI configuration
   * Framework-specific file path for better-auth-ui config
   *
   * @param selectedProviders - Array of provider IDs to configure
   * @param emailPasswordEnabled - Whether email/password authentication is enabled
   */
  abstract updateOAuthUIConfig(
    selectedProviders: string[],
    emailPasswordEnabled: boolean
  ): Promise<void>;

  /**
   * Abstract method: Update .env.example with OAuth environment variables
   * Framework-specific handling of environment files
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  abstract updateEnvExample(selectedProviders: string[]): Promise<void>;

  /**
   * Abstract method: Update README with OAuth provider setup guides
   * Framework-specific README location and placeholder handling
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  abstract updateReadme(selectedProviders: string[]): Promise<void>;

  /**
   * Abstract method: Apply TweakCN theme to Tailwind configuration
   * Framework-specific config file location and format
   *
   * @param themeContent - CSS content to apply
   */
  abstract applyTweakCNTheme(themeContent: string): Promise<void>;

  /**
   * Abstract method: Update env.ts with OAuth provider environment variables
   * Framework-specific typed env configuration (TanStack uses env.ts, Next.js uses env.mjs)
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  abstract updateEnvTs(selectedProviders: string[]): Promise<void>;

  /**
   * Copy base template files to target directory
   * Uses existing copyTemplate utility from fileOperations
   */
  protected async copyBaseFiles(): Promise<void> {
    await copyTemplate(this.frameworkName, this.targetPath);
  }

  /**
   * Detect the package manager used to invoke the CLI
   * Checks environment variables set by package managers
   *
   * @returns Detected package manager ('npm', 'yarn', 'pnpm', or 'bun')
   */
  protected detectPackageManager(): PackageManager {
    const userAgent = process.env.npm_config_user_agent;

    if (userAgent) {
      if (userAgent.includes('pnpm')) return 'pnpm';
      if (userAgent.includes('yarn')) return 'yarn';
      if (userAgent.includes('bun')) return 'bun';
    }

    return 'npm';
  }

  /**
   * Install project dependencies using detected package manager
   * Shows progress spinner during installation
   */
  protected async installDependencies(): Promise<void> {
    const packageManager = this.detectPackageManager();
    const spinner = ora(`Installing dependencies with ${packageManager}...`).start();

    try {
      await execa(packageManager, ['install'], {
        cwd: this.targetPath,
        stdio: 'pipe',
      });

      spinner.succeed('Dependencies installed successfully');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      throw new Error(
        `Dependency installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Format code using project's formatter (Prettier via package.json script)
   * Non-blocking - continues even if formatting fails
   */
  protected async formatCode(): Promise<void> {
    const packageManager = this.detectPackageManager();
    const spinner = ora('Formatting code...').start();

    try {
      const result = await execa(packageManager, ['run', 'format'], {
        cwd: this.targetPath,
        stdio: 'pipe',
        reject: false,
      });

      if (result.exitCode === 0) {
        spinner.succeed('Code formatted successfully');
      } else {
        spinner.warn(`Formatting completed with warnings`);
        if (result.stderr) {
          console.log(result.stderr);
        }
      }
    } catch (error) {
      // Don't fail the entire installation if formatting fails
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      spinner.warn(`Failed to format code: ${errorMessage}`);
      console.log('You may need to run `npm run format` manually');
    }
  }

  /**
   * Lint and fix code using project's ESLint configuration
   * Runs ESLint with --fix flag to auto-fix issues like import sorting
   * Non-blocking - continues even if linting fails
   */
  protected async lintCode(): Promise<void> {
    const packageManager = this.detectPackageManager();
    const spinner = ora('Linting and fixing code...').start();

    try {
      // Build the command args based on package manager
      // For pnpm: pnpm lint --fix
      // For npm/yarn: npm run lint -- --fix
      const args = packageManager === 'pnpm'
        ? ['lint', '--fix']
        : ['run', 'lint', '--', '--fix'];

      const result = await execa(packageManager, args, {
        cwd: this.targetPath,
        stdio: 'pipe',
        reject: false,
      });

      if (result.exitCode === 0) {
        spinner.succeed('Code linted and fixed successfully');
      } else {
        spinner.warn(`Linting completed with warnings`);
        if (result.stderr) {
          console.log(result.stderr);
        }
      }
    } catch (error) {
      // Don't fail the entire installation if linting fails
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      spinner.warn(`Failed to lint code: ${errorMessage}`);
      console.log('You may need to run `npm run lint -- --fix` manually');
    }
  }

  /**
   * Initialize Git repository in target directory
   * Creates initial commit with all files
   */
  protected async initGitRepo(): Promise<void> {
    const spinner = ora('Initializing Git repository...').start();

    try {
      // Check if git is installed
      try {
        await execa('git', ['--version'], { stdio: 'pipe' });
      } catch {
        spinner.fail('Git is not installed');
        throw new Error(
          'Git is not installed. Please install Git to initialize a repository.'
        );
      }

      // Initialize git repository
      await execa('git', ['init'], { cwd: this.targetPath, stdio: 'pipe' });

      // Add all files
      await execa('git', ['add', '.'], { cwd: this.targetPath, stdio: 'pipe' });

      // Create initial commit
      await execa(
        'git',
        ['commit', '-m', 'Initial commit from create-z3'],
        { cwd: this.targetPath, stdio: 'pipe' }
      );

      spinner.succeed('Git repository initialized');
    } catch (error) {
      spinner.fail('Failed to initialize Git repository');
      throw new Error(
        `Git initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create GitHub repository and push initial commit
   * Uses GitHub CLI (gh) for repository creation
   *
   * @param repoName - Name for the GitHub repository
   * @param isPrivate - Whether the repository should be private
   */
  protected async createGitHubRepo(
    repoName: string,
    isPrivate: boolean
  ): Promise<void> {
    const spinner = ora('Creating GitHub repository...').start();

    try {
      // Check if gh CLI is installed
      try {
        await execa('gh', ['--version'], { stdio: 'pipe' });
      } catch {
        spinner.fail('GitHub CLI (gh) is not installed');
        throw new Error(
          'GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/'
        );
      }

      // Create repository
      const visibility = isPrivate ? '--private' : '--public';
      await execa(
        'gh',
        ['repo', 'create', repoName, visibility, '--source=.', '--push'],
        { cwd: this.targetPath, stdio: 'pipe' }
      );

      spinner.succeed(`GitHub repository created: ${repoName}`);
    } catch (error) {
      spinner.fail('Failed to create GitHub repository');
      throw new Error(
        `GitHub repository creation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        'Make sure you are authenticated with GitHub CLI (run "gh auth login")'
      );
    }
  }

  /**
   * Generate a secure random secret for Better Auth
   * Creates a 32-byte hex string
   *
   * @returns Generated secret string
   */
  protected generateAuthSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Fetch TweakCN theme CSS from URL and convert to OKLCH format
   * Handles network errors and provides retry suggestions
   * Optionally converts fetched theme through OKLCH converter for consistent color format
   *
   * @param url - URL to fetch theme from
   * @param convertToOklch - Whether to convert theme colors to OKLCH format (default: true)
   * @returns Theme CSS content in OKLCH format (if conversion enabled)
   */
  protected async fetchThemeFromUrl(url: string, convertToOklch = true): Promise<string> {
    const spinner = ora('Fetching TweakCN theme...').start();

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      spinner.succeed('TweakCN theme fetched');

      // Optionally convert to OKLCH format using the TweakCN converter utility
      if (convertToOklch) {
        const convertSpinner = ora('Converting theme to OKLCH format...').start();
        try {
          // Use the converter utility to transform colors to OKLCH
          const convertedContent = await convertTweakCNToOKLCH({
            source: url,
            format: 'oklch',
          });
          convertSpinner.succeed('Theme converted to OKLCH format');
          return convertedContent;
        } catch (convertError) {
          // If conversion fails, fall back to raw content with warning
          convertSpinner.warn('OKLCH conversion failed, using raw theme CSS');
          console.warn(
            `Warning: Failed to convert theme to OKLCH: ${convertError instanceof Error ? convertError.message : 'Unknown error'}`
          );
          return content;
        }
      }

      return content;
    } catch (error) {
      spinner.fail('Failed to fetch TweakCN theme');
      throw new Error(
        `Theme fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        'Please check the URL and your internet connection, then try again.'
      );
    }
  }

  /**
   * Main orchestration method for project initialization
   * Coordinates all setup steps in sequence
   *
   * @param options - Project configuration options from CLI survey
   */
  async initProject(options: ProjectOptions): Promise<void> {
    // Step 1: Copy base template files
    const copySpinner = ora('Copying template files...').start();
    try {
      await this.copyBaseFiles();
      copySpinner.succeed('Template files copied');
    } catch (error) {
      copySpinner.fail('Failed to copy template files');
      throw error;
    }

    // Step 2: Configure OAuth providers and email/password auth (always call to handle placeholder removal)
    const authSpinner = ora('Configuring authentication...').start();
    try {
      await this.updateOAuthConfig(options.oauthProviders, options.emailPasswordAuth);
      if (options.emailPasswordAuth || options.oauthProviders.length > 0) {
        authSpinner.succeed('Authentication configuration updated');
      } else {
        authSpinner.succeed('Authentication placeholders cleaned up');
      }
    } catch (error) {
      authSpinner.fail('Failed to configure authentication');
      throw error;
    }

    // Step 3: Configure OAuth UI (always call to handle placeholder removal)
    const oauthUISpinner = ora('Configuring OAuth UI...').start();
    try {
      await this.updateOAuthUIConfig(
        options.oauthProviders,
        options.emailPasswordAuth
      );
      if (options.oauthProviders.length > 0) {
        oauthUISpinner.succeed('OAuth UI configuration updated');
      } else {
        oauthUISpinner.succeed('OAuth UI placeholders cleaned up');
      }
    } catch (error) {
      oauthUISpinner.fail('Failed to configure OAuth UI');
      throw error;
    }

    // Step 4: Update environment variables .env.example (always call to handle placeholder removal)
    const envSpinner = ora('Updating .env.example...').start();
    try {
      await this.updateEnvExample(options.oauthProviders);
      if (options.oauthProviders.length > 0) {
        envSpinner.succeed('.env.example updated');
      } else {
        envSpinner.succeed('.env.example placeholders cleaned up');
      }
    } catch (error) {
      envSpinner.fail('Failed to update .env.example');
      throw error;
    }

    // Step 5: Update typed environment configuration (always call to handle placeholder removal)
    const envTsSpinner = ora('Updating typed env configuration...').start();
    try {
      await this.updateEnvTs(options.oauthProviders);
      if (options.oauthProviders.length > 0) {
        envTsSpinner.succeed('Typed env configuration updated');
      } else {
        envTsSpinner.succeed('Typed env placeholders cleaned up');
      }
    } catch (error) {
      envTsSpinner.fail('Failed to update typed env configuration');
      throw error;
    }

    // Step 6: Update README with OAuth setup guides (always call to handle placeholder removal)
    const readmeSpinner = ora('Updating README...').start();
    try {
      await this.updateReadme(options.oauthProviders);
      if (options.oauthProviders.length > 0) {
        readmeSpinner.succeed('README updated');
      } else {
        readmeSpinner.succeed('README placeholders cleaned up');
      }
    } catch (error) {
      readmeSpinner.fail('Failed to update README');
      throw error;
    }

    // Step 7: Apply TweakCN theme or use default
    const themeSpinner = ora('Applying theme...').start();
    try {
      let themeContent: string;

      if (options.tweakcnTheme) {
        if (options.tweakcnTheme.type === 'url') {
          // Fetch and convert theme from URL
          themeContent = await this.fetchThemeFromUrl(options.tweakcnTheme.content);
        } else if (options.tweakcnTheme.type === 'css') {
          // Use raw CSS content directly (no OKLCH conversion for inline CSS)
          themeContent = options.tweakcnTheme.content;
        } else {
          // Fallback for any unexpected type
          themeContent = options.tweakcnTheme.content;
        }

        await this.applyTweakCNTheme(themeContent);
        themeSpinner.succeed('TweakCN theme applied');
      } else {
        // Use default theme from string-utils.ts (already in OKLCH format)
        await this.applyTweakCNTheme(DEFAULT_THEME);
        themeSpinner.succeed('Default theme applied');
      }
    } catch (error) {
      themeSpinner.fail('Failed to apply theme');
      throw error;
    }

    // Step 8: Initialize Git repository (optional)
    if (options.initGit) {
      await this.initGitRepo();
    }

    // Step 9: Install dependencies (optional)
    if (options.installDependencies) {
      await this.installDependencies();

      // Step 10: Lint and fix code (import sorting, etc.)
      await this.lintCode();

      // Step 11: Format code with Prettier
      await this.formatCode();
    }
  }
}
