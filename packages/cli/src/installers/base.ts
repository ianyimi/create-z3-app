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
   */
  abstract updateOAuthConfig(selectedProviders: string[]): Promise<void>;

  /**
   * Abstract method: Update OAuth UI configuration
   * Framework-specific file path for better-auth-ui config
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  abstract updateOAuthUIConfig(selectedProviders: string[]): Promise<void>;

  /**
   * Abstract method: Update .env.example with OAuth environment variables
   * Framework-specific handling of environment files
   *
   * @param selectedProviders - Array of provider IDs to configure
   */
  abstract updateEnvExample(selectedProviders: string[]): Promise<void>;

  /**
   * Abstract method: Apply TweakCN theme to Tailwind configuration
   * Framework-specific config file location and format
   *
   * @param themeContent - CSS content to apply
   */
  abstract applyTweakCNTheme(themeContent: string): Promise<void>;

  /**
   * Copy base template files to target directory
   * Uses existing copyTemplate utility from fileOperations
   */
  protected async copyBaseFiles(): Promise<void> {
    await copyTemplate(this.frameworkName, this.targetPath);
  }

  /**
   * Detect the package manager used to invoke the CLI
   * Checks npm_config_user_agent environment variable
   *
   * @returns Detected package manager, defaults to 'npm'
   */
  protected detectPackageManager(): PackageManager {
    const userAgent = process.env.npm_config_user_agent || '';

    if (userAgent.includes('pnpm')) {
      return 'pnpm';
    } else if (userAgent.includes('yarn')) {
      return 'yarn';
    } else if (userAgent.includes('bun')) {
      return 'bun';
    }

    return 'npm';
  }

  /**
   * Install project dependencies using detected package manager
   * Shows progress with ora spinner
   */
  protected async installDependencies(): Promise<void> {
    const packageManager = this.detectPackageManager();
    const spinner = ora(`Installing dependencies with ${packageManager}...`).start();

    try {
      await execa(packageManager, ['install'], {
        cwd: this.targetPath,
        stdio: 'pipe',
      });

      spinner.succeed(`Dependencies installed with ${packageManager}`);
    } catch (error) {
      spinner.fail(`Failed to install dependencies with ${packageManager}`);
      throw new Error(
        `Dependency installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
   * Fetch TweakCN theme CSS from URL
   * Handles network errors and provides retry suggestions
   *
   * @param url - URL to fetch theme from
   * @returns Theme CSS content
   */
  protected async fetchThemeFromUrl(url: string): Promise<string> {
    const spinner = ora('Fetching TweakCN theme...').start();

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      spinner.succeed('TweakCN theme fetched');

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

    // Step 2: Configure OAuth providers (if any selected)
    if (options.oauthProviders.length > 0) {
      const oauthSpinner = ora('Configuring OAuth providers...').start();
      try {
        await this.updateOAuthConfig(options.oauthProviders);
        await this.updateOAuthUIConfig(options.oauthProviders);
        await this.updateEnvExample(options.oauthProviders);
        oauthSpinner.succeed(
          `OAuth providers configured: ${options.oauthProviders.join(', ')}`
        );
      } catch (error) {
        oauthSpinner.fail('Failed to configure OAuth providers');
        throw error;
      }
    }

    // Step 3: Apply TweakCN theme (if provided)
    if (options.tweakcnTheme) {
      const themeSpinner = ora('Applying TweakCN theme...').start();
      try {
        let themeContent = options.tweakcnTheme.content;

        // Fetch from URL if type is 'url'
        if (options.tweakcnTheme.type === 'url') {
          themeContent = await this.fetchThemeFromUrl(themeContent);
        }

        await this.applyTweakCNTheme(themeContent);
        themeSpinner.succeed('TweakCN theme applied');
      } catch (error) {
        themeSpinner.fail('Failed to apply TweakCN theme');
        throw error;
      }
    }

    // Step 4: Initialize Git repository (always done, as it's a prerequisite for GitHub repo)
    await this.initGitRepo();

    // Step 5: Create GitHub repository (if selected)
    if (options.createGitHubRepo) {
      await this.createGitHubRepo(
        this.projectName,
        options.gitHubRepoPrivate ?? false
      );
    }

    // Step 6: Install dependencies (if selected)
    if (options.installDependencies) {
      await this.installDependencies();
    }
  }
}
