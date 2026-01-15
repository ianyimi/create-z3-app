import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateProjectName, checkDirectoryExists, isDirectoryEmpty, resolveProjectName } from '../utils/validation.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readdir: vi.fn(),
  },
}));

// Import mocked modules after mock setup
import fs from 'fs-extra';
const { pathExists, readdir } = fs;

describe('validateProjectName', () => {
  it('should validate a standard npm package name', () => {
    const result = validateProjectName('my-app');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate scoped packages', () => {
    const result = validateProjectName('@org/my-app');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject names with spaces', () => {
    const result = validateProjectName('my app');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject names with uppercase letters', () => {
    const result = validateProjectName('MyApp');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject names with special characters', () => {
    const result = validateProjectName('my-app!');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject names starting with a dot', () => {
    const result = validateProjectName('.myapp');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate lowercase names with hyphens', () => {
    const result = validateProjectName('my-awesome-app');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('checkDirectoryExists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true if directory exists', async () => {
    vi.mocked(pathExists).mockResolvedValue(true as never);

    const result = await checkDirectoryExists('/path/to/directory');

    expect(result).toBe(true);
    expect(pathExists).toHaveBeenCalledWith('/path/to/directory');
  });

  it('should return false if directory does not exist', async () => {
    vi.mocked(pathExists).mockResolvedValue(false as never);

    const result = await checkDirectoryExists('/path/to/directory');

    expect(result).toBe(false);
    expect(pathExists).toHaveBeenCalledWith('/path/to/directory');
  });
});

describe('isDirectoryEmpty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true for an empty directory', async () => {
    vi.mocked(readdir).mockResolvedValue([] as never);

    const result = await isDirectoryEmpty('/path/to/directory');

    expect(result).toBe(true);
  });

  it('should return true for directory with only hidden files', async () => {
    vi.mocked(readdir).mockResolvedValue(['.git', '.gitignore', '.env'] as never);

    const result = await isDirectoryEmpty('/path/to/directory');

    expect(result).toBe(true);
  });

  it('should return false for directory with visible files', async () => {
    vi.mocked(readdir).mockResolvedValue(['index.ts', 'README.md'] as never);

    const result = await isDirectoryEmpty('/path/to/directory');

    expect(result).toBe(false);
  });

  it('should return false for directory with both hidden and visible files', async () => {
    vi.mocked(readdir).mockResolvedValue(['.git', 'index.ts', '.gitignore'] as never);

    const result = await isDirectoryEmpty('/path/to/directory');

    expect(result).toBe(false);
  });

  it('should return true if directory cannot be read', async () => {
    vi.mocked(readdir).mockRejectedValue(new Error('ENOENT') as never);

    const result = await isDirectoryEmpty('/path/to/directory');

    expect(result).toBe(true);
  });
});

describe('resolveProjectName', () => {
  it('should return the directory name when input is "."', () => {
    const result = resolveProjectName('.', '/path/to/my-project');

    expect(result).toBe('my-project');
  });

  it('should return the input unchanged when it is not "."', () => {
    const result = resolveProjectName('my-app', '/path/to/directory');

    expect(result).toBe('my-app');
  });

  it('should handle root directory', () => {
    const result = resolveProjectName('.', '/my-project');

    expect(result).toBe('my-project');
  });

  it('should return directory name even if it is invalid npm name', () => {
    // This allows the validation to catch it later
    const result = resolveProjectName('.', '/path/to/My Invalid Project');

    expect(result).toBe('My Invalid Project');
  });
});
