#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import { select, input } from "@inquirer/prompts";
import chalk2 from "chalk";
import { readFileSync } from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2, join as join2 } from "path";

// src/utils/validation.ts
import validateNpmPackageName from "validate-npm-package-name";
import fs from "fs-extra";
import { basename } from "path";
function validateProjectName(name) {
  const result = validateNpmPackageName(name);
  if (result.validForNewPackages) {
    return { valid: true, errors: [] };
  }
  const errors = [];
  if (result.errors) {
    errors.push(...result.errors);
  }
  if (result.warnings) {
    errors.push(...result.warnings);
  }
  return { valid: false, errors };
}
async function checkDirectoryExists(targetPath) {
  return await fs.pathExists(targetPath);
}
async function isDirectoryEmpty(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const visibleFiles = files.filter((file) => !file.startsWith("."));
    return visibleFiles.length === 0;
  } catch (error) {
    return true;
  }
}
function resolveProjectName(input2, cwd) {
  if (input2 === ".") {
    const dirName = basename(cwd);
    const validation = validateProjectName(dirName);
    if (!validation.valid) {
      return dirName;
    }
    return dirName;
  }
  return input2;
}

// src/helpers/fileOperations.ts
import fs2 from "fs-extra";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
async function createProjectDirectory(projectName, cwd) {
  if (projectName === ".") {
    return cwd;
  }
  const targetPath = getTargetDirectory(projectName, cwd);
  await fs2.ensureDir(targetPath);
  return targetPath;
}
function getTargetDirectory(projectName, cwd) {
  if (projectName === ".") {
    return cwd;
  }
  return join(cwd, projectName);
}
async function copyTemplate(framework, targetPath) {
  const __filename2 = fileURLToPath(import.meta.url);
  const __dirname2 = dirname(__filename2);
  const templateDir = framework === "tanstack" ? "tanstack-start" : "nextjs";
  const templatePath = join(__dirname2, "../templates", templateDir);
  await fs2.copy(templatePath, targetPath, {
    overwrite: false,
    errorOnExist: false
  });
}

// src/utils/messages.ts
import chalk from "chalk";
function displayDirectoryExistsError(dirName) {
  console.error();
  console.error(chalk.red(`Error: Directory '${dirName}' already exists.`));
  console.error(chalk.yellow("Please choose a different name or remove the existing directory."));
  console.error();
  process.exit(1);
}
function displayInvalidNameError(name, errors) {
  console.error();
  console.error(chalk.red(`Error: Invalid project name '${name}'.`));
  console.error();
  if (errors.length > 0) {
    console.error(chalk.yellow("Validation errors:"));
    errors.forEach((error) => {
      console.error(chalk.yellow(`  - ${error}`));
    });
    console.error();
  }
  console.error(chalk.yellow("Project names must be valid npm package names."));
  console.error(chalk.yellow("They should be lowercase, contain no spaces, and use hyphens for word separation."));
  console.error();
  process.exit(1);
}
function displayDirectoryNotEmptyError() {
  console.error();
  console.error(chalk.red("Error: Current directory is not empty."));
  console.error(chalk.yellow("Please use a different directory or provide a project name."));
  console.error();
  process.exit(1);
}
function displayPermissionError(path) {
  console.error();
  console.error(chalk.red(`Error: Permission denied when creating '${path}'.`));
  console.error(chalk.yellow("Please check your directory permissions."));
  console.error();
  process.exit(1);
}
function displaySuccessMessage(projectName, targetPath, isCurrentDir) {
  console.log();
  if (isCurrentDir) {
    console.log(chalk.green(`\u2713 Successfully created project '${projectName}' in current directory`));
  } else {
    console.log(chalk.green(`\u2713 Successfully created project '${projectName}' at ${targetPath}`));
  }
  console.log();
}

// src/index.ts
var __filename = fileURLToPath2(import.meta.url);
var __dirname = dirname2(__filename);
var packageJson = JSON.parse(
  readFileSync(join2(__dirname, "../package.json"), "utf-8")
);
var program = new Command();
program.name("create-z3").version(packageJson.version).description("CLI for scaffolding Z3 Stack applications").argument("[project-name]", "Name of the project").action(async (projectNameArg) => {
  try {
    const cwd = process.cwd();
    let projectName = "";
    if (projectNameArg) {
      const resolvedName = resolveProjectName(projectNameArg, cwd);
      const validation = validateProjectName(resolvedName);
      if (!validation.valid) {
        displayInvalidNameError(resolvedName, validation.errors);
      }
      projectName = resolvedName;
    } else {
      let isValid = false;
      while (!isValid) {
        const inputName = await input({
          message: "What is your project named?",
          default: "my-z3-app"
        });
        const resolvedName = resolveProjectName(inputName, cwd);
        const validation = validateProjectName(resolvedName);
        if (validation.valid) {
          projectName = resolvedName;
          isValid = true;
        } else {
          console.error();
          console.error(chalk2.red(`Invalid project name '${resolvedName}'.`));
          if (validation.errors.length > 0) {
            validation.errors.forEach((error) => {
              console.error(chalk2.yellow(`  - ${error}`));
            });
          }
          console.error();
          console.error(chalk2.yellow("Please try again with a valid npm package name."));
          console.error();
        }
      }
    }
    const targetDir = getTargetDirectory(projectName, cwd);
    if (projectNameArg === ".") {
      const isEmpty = await isDirectoryEmpty(cwd);
      if (!isEmpty) {
        displayDirectoryNotEmptyError();
      }
    } else {
      const exists = await checkDirectoryExists(targetDir);
      if (exists) {
        displayDirectoryExistsError(projectName);
      }
    }
    let createdPath;
    try {
      createdPath = await createProjectDirectory(projectName, cwd);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "EACCES") {
        displayPermissionError(targetDir);
      }
      throw error;
    }
    const framework = await select({
      message: "Which framework would you like to use?",
      choices: [
        { name: "TanStack Start", value: "tanstack" },
        { name: "Next.js", value: "nextjs" }
      ],
      default: "tanstack"
    });
    const frameworkName = framework === "tanstack" ? "TanStack Start" : "Next.js";
    await copyTemplate(framework, createdPath);
    console.log();
    displaySuccessMessage(projectName, createdPath, projectNameArg === ".");
    console.log();
    console.log(chalk2.green("\u2705 Configuration complete!"));
    console.log();
    console.log(`Project name: ${projectName}`);
    console.log(`Framework: ${frameworkName}`);
    console.log();
    console.log(chalk2.dim("Next steps:"));
    console.log(chalk2.dim(`  cd ${projectName}`));
    console.log(chalk2.dim("  npm install"));
    console.log(chalk2.dim("  npm run dev"));
    console.log();
    process.exit(0);
  } catch (error) {
    if (error instanceof Error && error.name === "ExitPromptError") {
      console.log();
      process.exit(0);
    }
    throw error;
  }
});
program.parse();
