import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProjectDirectory, getTargetDirectory } from '../helpers/fileOperations.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn(),
  },
}));

import fs from 'fs-extra';

describe('getTargetDirectory', () => {
  it('should return cwd for dot notation', () => {
    const result = getTargetDirectory('.', '/path/to/cwd');

    expect(result).toBe('/path/to/cwd');
  });

  it('should return joined path for named projects', () => {
    const result = getTargetDirectory('my-app', '/path/to/cwd');

    expect(result).toBe('/path/to/cwd/my-app');
  });

  it('should handle scoped packages correctly', () => {
    const result = getTargetDirectory('@org/my-app', '/path/to/cwd');

    expect(result).toBe('/path/to/cwd/@org/my-app');
  });

  it('should handle nested paths in scoped packages', () => {
    const result = getTargetDirectory('@my-org/awesome-app', '/Users/dev/projects');

    expect(result).toBe('/Users/dev/projects/@my-org/awesome-app');
  });
});

describe('createProjectDirectory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cwd without creating directory for dot notation', async () => {
    const cwd = '/path/to/cwd';
    const result = await createProjectDirectory('.', cwd);

    expect(result).toBe(cwd);
    expect(fs.ensureDir).not.toHaveBeenCalled();
  });

  it('should create directory for standard project name', async () => {
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

    const result = await createProjectDirectory('my-app', '/path/to/cwd');

    expect(result).toBe('/path/to/cwd/my-app');
    expect(fs.ensureDir).toHaveBeenCalledWith('/path/to/cwd/my-app');
  });

  it('should create nested directories for scoped packages', async () => {
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

    const result = await createProjectDirectory('@org/my-app', '/path/to/cwd');

    expect(result).toBe('/path/to/cwd/@org/my-app');
    expect(fs.ensureDir).toHaveBeenCalledWith('/path/to/cwd/@org/my-app');
  });

  it('should propagate errors from ensureDir', async () => {
    const error = new Error('Permission denied');
    vi.mocked(fs.ensureDir).mockRejectedValue(error);

    await expect(createProjectDirectory('my-app', '/path/to/cwd')).rejects.toThrow('Permission denied');
  });
});
