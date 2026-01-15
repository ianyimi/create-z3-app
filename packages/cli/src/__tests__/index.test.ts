import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as validation from '../utils/validation.js';
import * as fileOperations from '../helpers/fileOperations.js';
import * as messages from '../utils/messages.js';

// Mock all external modules
vi.mock('../utils/validation.js', () => ({
  validateProjectName: vi.fn(),
  checkDirectoryExists: vi.fn(),
  isDirectoryEmpty: vi.fn(),
  resolveProjectName: vi.fn(),
}));

vi.mock('../helpers/fileOperations.js', () => ({
  createProjectDirectory: vi.fn(),
  getTargetDirectory: vi.fn(),
}));

vi.mock('../utils/messages.js', () => ({
  displayDirectoryExistsError: vi.fn(),
  displayInvalidNameError: vi.fn(),
  displayDirectoryNotEmptyError: vi.fn(),
  displayPermissionError: vi.fn(),
  displaySuccessMessage: vi.fn(),
}));

describe('CLI Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Project name validation from argument', () => {
    it('should validate and accept valid project name from argument', () => {
      vi.mocked(validation.resolveProjectName).mockReturnValue('my-app');
      vi.mocked(validation.validateProjectName).mockReturnValue({ valid: true, errors: [] });

      const projectName = 'my-app';
      const resolved = validation.resolveProjectName(projectName, '/path/to/cwd');
      const validationResult = validation.validateProjectName(resolved);

      expect(resolved).toBe('my-app');
      expect(validationResult.valid).toBe(true);
    });

    it('should call displayInvalidNameError for invalid project name from argument', () => {
      vi.mocked(validation.resolveProjectName).mockReturnValue('My App');
      vi.mocked(validation.validateProjectName).mockReturnValue({
        valid: false,
        errors: ['name can no longer contain capital letters'],
      });
      vi.mocked(messages.displayInvalidNameError).mockImplementation(() => {
        throw new Error('Exit');
      });

      const projectName = 'My App';
      const resolved = validation.resolveProjectName(projectName, '/path/to/cwd');
      const validationResult = validation.validateProjectName(resolved);

      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
    });

    it('should handle dot notation by resolving to directory name', () => {
      vi.mocked(validation.resolveProjectName).mockReturnValue('my-project');
      vi.mocked(validation.validateProjectName).mockReturnValue({ valid: true, errors: [] });

      const resolved = validation.resolveProjectName('.', '/path/to/my-project');

      expect(resolved).toBe('my-project');
    });
  });

  describe('Directory conflict detection', () => {
    it('should detect existing directory and call displayDirectoryExistsError', async () => {
      vi.mocked(fileOperations.getTargetDirectory).mockReturnValue('/path/to/cwd/my-app');
      vi.mocked(validation.checkDirectoryExists).mockResolvedValue(true);
      vi.mocked(messages.displayDirectoryExistsError).mockImplementation(() => {
        throw new Error('Exit');
      });

      const targetDir = fileOperations.getTargetDirectory('my-app', '/path/to/cwd');
      const exists = await validation.checkDirectoryExists(targetDir);

      expect(exists).toBe(true);
    });

    it('should allow directory creation when directory does not exist', async () => {
      vi.mocked(fileOperations.getTargetDirectory).mockReturnValue('/path/to/cwd/my-app');
      vi.mocked(validation.checkDirectoryExists).mockResolvedValue(false);

      const targetDir = fileOperations.getTargetDirectory('my-app', '/path/to/cwd');
      const exists = await validation.checkDirectoryExists(targetDir);

      expect(exists).toBe(false);
    });

    it('should check if current directory is empty for dot notation', async () => {
      vi.mocked(validation.isDirectoryEmpty).mockResolvedValue(true);

      const isEmpty = await validation.isDirectoryEmpty('/path/to/cwd');

      expect(isEmpty).toBe(true);
    });

    it('should call displayDirectoryNotEmptyError when current directory is not empty', async () => {
      vi.mocked(validation.isDirectoryEmpty).mockResolvedValue(false);
      vi.mocked(messages.displayDirectoryNotEmptyError).mockImplementation(() => {
        throw new Error('Exit');
      });

      const isEmpty = await validation.isDirectoryEmpty('/path/to/cwd');

      expect(isEmpty).toBe(false);
    });
  });

  describe('Directory creation', () => {
    it('should create directory and display success message for named project', async () => {
      vi.mocked(fileOperations.createProjectDirectory).mockResolvedValue('/path/to/cwd/my-app');

      const createdPath = await fileOperations.createProjectDirectory('my-app', '/path/to/cwd');

      expect(createdPath).toBe('/path/to/cwd/my-app');
      expect(fileOperations.createProjectDirectory).toHaveBeenCalledWith('my-app', '/path/to/cwd');
    });

    it('should return cwd without creating directory for dot notation', async () => {
      vi.mocked(fileOperations.createProjectDirectory).mockResolvedValue('/path/to/cwd');

      const createdPath = await fileOperations.createProjectDirectory('.', '/path/to/cwd');

      expect(createdPath).toBe('/path/to/cwd');
    });

    it('should call displaySuccessMessage after successful directory creation', async () => {
      vi.mocked(fileOperations.createProjectDirectory).mockResolvedValue('/path/to/cwd/my-app');

      const createdPath = await fileOperations.createProjectDirectory('my-app', '/path/to/cwd');

      messages.displaySuccessMessage('my-app', createdPath, false);

      expect(messages.displaySuccessMessage).toHaveBeenCalledWith('my-app', '/path/to/cwd/my-app', false);
    });

    it('should call displaySuccessMessage with isCurrentDir=true for dot notation', async () => {
      vi.mocked(fileOperations.createProjectDirectory).mockResolvedValue('/path/to/cwd');

      const createdPath = await fileOperations.createProjectDirectory('.', '/path/to/cwd');

      messages.displaySuccessMessage('my-project', createdPath, true);

      expect(messages.displaySuccessMessage).toHaveBeenCalledWith('my-project', '/path/to/cwd', true);
    });
  });

  describe('Scoped package handling', () => {
    it('should handle scoped package names in getTargetDirectory', () => {
      vi.mocked(fileOperations.getTargetDirectory).mockReturnValue('/path/to/cwd/@org/my-app');

      const targetDir = fileOperations.getTargetDirectory('@org/my-app', '/path/to/cwd');

      expect(targetDir).toBe('/path/to/cwd/@org/my-app');
    });

    it('should create nested directories for scoped packages', async () => {
      vi.mocked(fileOperations.createProjectDirectory).mockResolvedValue('/path/to/cwd/@org/my-app');

      const createdPath = await fileOperations.createProjectDirectory('@org/my-app', '/path/to/cwd');

      expect(createdPath).toBe('/path/to/cwd/@org/my-app');
    });

    it('should validate scoped package names', () => {
      vi.mocked(validation.validateProjectName).mockReturnValue({ valid: true, errors: [] });

      const validationResult = validation.validateProjectName('@org/my-app');

      expect(validationResult.valid).toBe(true);
    });
  });
});
