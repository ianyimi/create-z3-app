import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Creates a project directory for the given project name.
 * For dot notation ("."), returns the current working directory without creating a new directory.
 * For named projects, creates a new directory in the current working directory.
 *
 * @param projectName - The name of the project (or "." for current directory)
 * @param cwd - The current working directory path
 * @returns Promise that resolves to the absolute path of the project directory
 */
export async function createProjectDirectory(projectName: string, cwd: string): Promise<string> {
  if (projectName === '.') {
    // For dot notation, return cwd without creating a new directory
    return cwd;
  }

  // Get the target directory path
  const targetPath = getTargetDirectory(projectName, cwd);

  // Create the directory
  await fs.ensureDir(targetPath);

  return targetPath;
}

/**
 * Gets the target directory path for a project.
 * For dot notation ("."), returns the current working directory.
 * For named projects, returns the path to the new directory.
 * Handles scoped packages by creating nested directories (e.g., @org/my-app).
 *
 * @param projectName - The name of the project (or "." for current directory)
 * @param cwd - The current working directory path
 * @returns The absolute path to the target directory
 */
export function getTargetDirectory(projectName: string, cwd: string): string {
  if (projectName === '.') {
    return cwd;
  }

  // For scoped packages like @org/my-app, join will handle the path correctly
  // This creates nested directories: cwd/@org/my-app
  return join(cwd, projectName);
}

/**
 * Copies template files from the templates directory to the target project directory.
 *
 * @param framework - The framework name ('tanstack' or 'nextjs')
 * @param targetPath - The absolute path to the target project directory
 * @returns Promise that resolves when the copy is complete
 */
export async function copyTemplate(framework: string, targetPath: string): Promise<void> {
  // Get the CLI's directory to locate templates
  // __dirname will be the dist folder, so we go up one level to reach the CLI root
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Map framework value to template directory name
  const templateDir = framework === 'tanstack' ? 'tanstack-start' : 'nextjs';
  const templatePath = join(__dirname, '../templates', templateDir);

  // Copy all files from template to target directory
  await fs.copy(templatePath, targetPath, {
    overwrite: false,
    errorOnExist: false,
  });
}
