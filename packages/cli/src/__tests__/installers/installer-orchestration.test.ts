/**
 * Task Group 6: Integration Tests for Installer Orchestration
 *
 * Tests the complete project generation flow through FrameworkInstaller including:
 * - Various authentication combinations (email only, OAuth only, both, neither)
 * - Theme application (default and custom)
 * - Git initialization and dependency installation options
 * - ProjectOptions object construction
 * - Method orchestration sequence
 *
 * Note: These tests focus on the orchestration logic and option handling.
 * Full end-to-end tests with template copying require the built distribution.
 */

import { describe, it, expect, vi } from 'vitest';
import { TanStackInstaller } from '../../installers/tanstack.js';
import type { ProjectOptions } from '../../installers/types.js';

describe('Task Group 6: Installer Orchestration Integration Tests', () => {
  describe('ProjectOptions Object Construction', () => {
    it('should construct ProjectOptions with email/password only', () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        initGit: false,
        installDependencies: false,
      };

      expect(options.projectName).toBe('test-project');
      expect(options.framework).toBe('tanstack');
      expect(options.emailPasswordAuth).toBe(true);
      expect(options.oauthProviders).toEqual([]);
      expect(options.initGit).toBe(false);
      expect(options.installDependencies).toBe(false);
      expect(options.tweakcnTheme).toBeUndefined();
    });

    it('should construct ProjectOptions with OAuth only', () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        framework: 'tanstack',
        emailPasswordAuth: false,
        oauthProviders: ['google', 'github'],
        initGit: true,
        installDependencies: true,
      };

      expect(options.emailPasswordAuth).toBe(false);
      expect(options.oauthProviders).toEqual(['google', 'github']);
      expect(options.initGit).toBe(true);
      expect(options.installDependencies).toBe(true);
    });

    it('should construct ProjectOptions with both email/password and OAuth', () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: ['google', 'discord'],
        initGit: true,
        installDependencies: false,
      };

      expect(options.emailPasswordAuth).toBe(true);
      expect(options.oauthProviders).toEqual(['google', 'discord']);
    });

    it('should construct ProjectOptions with neither email/password nor OAuth (edge case)', () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        framework: 'tanstack',
        emailPasswordAuth: false,
        oauthProviders: [],
        initGit: false,
        installDependencies: false,
      };

      expect(options.emailPasswordAuth).toBe(false);
      expect(options.oauthProviders).toEqual([]);
    });

    it('should construct ProjectOptions with custom TweakCN theme', () => {
      const options: ProjectOptions = {
        projectName: 'test-project',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        tweakcnTheme: {
          type: 'url',
          content: 'https://example.com/theme.css',
        },
        initGit: true,
        installDependencies: true,
      };

      expect(options.tweakcnTheme).toBeDefined();
      expect(options.tweakcnTheme?.type).toBe('url');
      expect(options.tweakcnTheme?.content).toBe('https://example.com/theme.css');
    });

    it('should construct ProjectOptions with CSS theme content', () => {
      const themeContent = '--background: 0 0% 0%;';
      const options: ProjectOptions = {
        projectName: 'test-project',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        tweakcnTheme: {
          type: 'css',
          content: themeContent,
        },
        initGit: false,
        installDependencies: false,
      };

      expect(options.tweakcnTheme?.type).toBe('css');
      expect(options.tweakcnTheme?.content).toBe(themeContent);
    });
  });

  describe('TanStackInstaller Instance Creation', () => {
    it('should create TanStackInstaller with correct parameters', () => {
      const targetPath = '/tmp/test-project';
      const projectName = 'test-project';
      const installer = new TanStackInstaller(targetPath, projectName);

      expect(installer).toBeInstanceOf(TanStackInstaller);
      expect(installer.frameworkName).toBe('tanstack');
    });

    it('should expose correct framework name', () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      expect(installer.frameworkName).toBe('tanstack');
    });
  });

  describe('Method Orchestration Sequence', () => {
    it('should call updateOAuthConfig when emailPasswordAuth is true and no OAuth', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      const updateOAuthConfigSpy = vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      const copyBaseFilesSpy = vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      const applyTweakCNThemeSpy = vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      // Should call updateOAuthConfig because emailPasswordAuth is true
      expect(updateOAuthConfigSpy).toHaveBeenCalledWith([], true);
      expect(updateOAuthConfigSpy).toHaveBeenCalledTimes(1);

      // Should not call updateOAuthUIConfig when no OAuth providers
      expect(copyBaseFilesSpy).toHaveBeenCalledTimes(1);
      expect(applyTweakCNThemeSpy).toHaveBeenCalledTimes(1);
    });

    it('should call updateOAuthConfig when OAuth providers are selected', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      const updateOAuthConfigSpy = vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      const updateOAuthUIConfigSpy = vi.spyOn(installer, 'updateOAuthUIConfig').mockResolvedValue();
      const updateEnvExampleSpy = vi.spyOn(installer, 'updateEnvExample').mockResolvedValue();
      const updateReadmeSpy = vi.spyOn(installer, 'updateReadme').mockResolvedValue();
      const copyBaseFilesSpy = vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      const applyTweakCNThemeSpy = vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: false,
        oauthProviders: ['google', 'github'],
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      // Should call updateOAuthConfig with providers and emailPasswordAuth=false
      expect(updateOAuthConfigSpy).toHaveBeenCalledWith(['google', 'github'], false);
      expect(updateOAuthConfigSpy).toHaveBeenCalledTimes(1);

      // Should call updateOAuthUIConfig when OAuth providers exist
      expect(updateOAuthUIConfigSpy).toHaveBeenCalledWith(['google', 'github']);
      expect(updateOAuthUIConfigSpy).toHaveBeenCalledTimes(1);

      expect(updateEnvExampleSpy).toHaveBeenCalledWith(['google', 'github']);
      expect(updateReadmeSpy).toHaveBeenCalledWith(['google', 'github']);
      expect(copyBaseFilesSpy).toHaveBeenCalledTimes(1);
      expect(applyTweakCNThemeSpy).toHaveBeenCalledTimes(1);
    });

    it('should NOT call auth methods when neither emailPassword nor OAuth selected', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      const updateOAuthConfigSpy = vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      const updateOAuthUIConfigSpy = vi.spyOn(installer, 'updateOAuthUIConfig').mockResolvedValue();
      const copyBaseFilesSpy = vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      const applyTweakCNThemeSpy = vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: false,
        oauthProviders: [],
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      // Should NOT call updateOAuthConfig when both are false/empty
      expect(updateOAuthConfigSpy).not.toHaveBeenCalled();

      // Should NOT call updateOAuthUIConfig
      expect(updateOAuthUIConfigSpy).not.toHaveBeenCalled();

      // Should still call base methods
      expect(copyBaseFilesSpy).toHaveBeenCalledTimes(1);
      expect(applyTweakCNThemeSpy).toHaveBeenCalledTimes(1);
    });

    it('should call updateEnvExample and updateReadme only when OAuth providers exist', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthUIConfig').mockResolvedValue();
      const updateEnvExampleSpy = vi.spyOn(installer, 'updateEnvExample').mockResolvedValue();
      const updateReadmeSpy = vi.spyOn(installer, 'updateReadme').mockResolvedValue();
      vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: ['google'],
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      // Should call both methods when OAuth providers exist
      expect(updateEnvExampleSpy).toHaveBeenCalledWith(['google']);
      expect(updateEnvExampleSpy).toHaveBeenCalledTimes(1);
      expect(updateReadmeSpy).toHaveBeenCalledWith(['google']);
      expect(updateReadmeSpy).toHaveBeenCalledTimes(1);
    });

    it('should NOT call updateEnvExample and updateReadme when no OAuth providers', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      const updateEnvExampleSpy = vi.spyOn(installer, 'updateEnvExample').mockResolvedValue();
      const updateReadmeSpy = vi.spyOn(installer, 'updateReadme').mockResolvedValue();
      vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      // Should NOT call these methods when no OAuth providers
      expect(updateEnvExampleSpy).not.toHaveBeenCalled();
      expect(updateReadmeSpy).not.toHaveBeenCalled();
    });

    it('should apply custom theme when tweakcnTheme is provided', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      const applyTweakCNThemeSpy = vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();

      const customTheme = '--background: 0 0% 0%;';
      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        tweakcnTheme: {
          type: 'css',
          content: customTheme,
        },
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      // Should call applyTweakCNTheme with custom theme
      expect(applyTweakCNThemeSpy).toHaveBeenCalledWith(customTheme);
      expect(applyTweakCNThemeSpy).toHaveBeenCalledTimes(1);
    });

    it('should apply default theme when tweakcnTheme is not provided', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      const applyTweakCNThemeSpy = vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        // No tweakcnTheme
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      // Should call applyTweakCNTheme with default theme
      expect(applyTweakCNThemeSpy).toHaveBeenCalled();
      const calledWith = applyTweakCNThemeSpy.mock.calls[0][0];
      expect(calledWith).toContain('--background:');
      expect(calledWith).toContain('--foreground:');
      expect(calledWith).toContain('--primary:');
    });

    it('should call initGitRepo when initGit is true', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();
      const initGitRepoSpy = vi.spyOn(installer as any, 'initGitRepo').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        initGit: true,
        installDependencies: false,
      };

      await installer.initProject(options);

      expect(initGitRepoSpy).toHaveBeenCalledTimes(1);
    });

    it('should NOT call initGitRepo when initGit is false', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();
      const initGitRepoSpy = vi.spyOn(installer as any, 'initGitRepo').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      expect(initGitRepoSpy).not.toHaveBeenCalled();
    });

    it('should call installDependencies when installDependencies is true', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();
      const installDependenciesSpy = vi.spyOn(installer as any, 'installDependencies').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        initGit: false,
        installDependencies: true,
      };

      await installer.initProject(options);

      expect(installDependenciesSpy).toHaveBeenCalledTimes(1);
    });

    it('should NOT call installDependencies when installDependencies is false', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();
      const installDependenciesSpy = vi.spyOn(installer as any, 'installDependencies').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: [],
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      expect(installDependenciesSpy).not.toHaveBeenCalled();
    });

    it('should execute methods in correct sequence', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      const callOrder: string[] = [];

      vi.spyOn(installer as any, 'copyBaseFiles').mockImplementation(async () => {
        callOrder.push('copyBaseFiles');
      });
      vi.spyOn(installer, 'updateOAuthConfig').mockImplementation(async () => {
        callOrder.push('updateOAuthConfig');
      });
      vi.spyOn(installer, 'updateOAuthUIConfig').mockImplementation(async () => {
        callOrder.push('updateOAuthUIConfig');
      });
      vi.spyOn(installer, 'updateEnvExample').mockImplementation(async () => {
        callOrder.push('updateEnvExample');
      });
      vi.spyOn(installer, 'updateReadme').mockImplementation(async () => {
        callOrder.push('updateReadme');
      });
      vi.spyOn(installer, 'applyTweakCNTheme').mockImplementation(async () => {
        callOrder.push('applyTweakCNTheme');
      });
      vi.spyOn(installer as any, 'initGitRepo').mockImplementation(async () => {
        callOrder.push('initGitRepo');
      });
      vi.spyOn(installer as any, 'installDependencies').mockImplementation(async () => {
        callOrder.push('installDependencies');
      });

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: ['google'],
        initGit: true,
        installDependencies: true,
      };

      await installer.initProject(options);

      // Verify correct sequence
      expect(callOrder).toEqual([
        'copyBaseFiles',
        'updateOAuthConfig',
        'updateOAuthUIConfig',
        'updateEnvExample',
        'updateReadme',
        'applyTweakCNTheme',
        'initGitRepo',
        'installDependencies',
      ]);
    });
  });

  describe('Complete Orchestration Scenarios', () => {
    it('should orchestrate complete flow with all options enabled', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      const copyBaseFilesSpy = vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      const updateOAuthConfigSpy = vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      const updateOAuthUIConfigSpy = vi.spyOn(installer, 'updateOAuthUIConfig').mockResolvedValue();
      const updateEnvExampleSpy = vi.spyOn(installer, 'updateEnvExample').mockResolvedValue();
      const updateReadmeSpy = vi.spyOn(installer, 'updateReadme').mockResolvedValue();
      const applyTweakCNThemeSpy = vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();
      const initGitRepoSpy = vi.spyOn(installer as any, 'initGitRepo').mockResolvedValue();
      const installDependenciesSpy = vi.spyOn(installer as any, 'installDependencies').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: true,
        oauthProviders: ['google', 'github', 'discord'],
        tweakcnTheme: {
          type: 'css',
          content: '--background: 0 0% 0%;',
        },
        initGit: true,
        installDependencies: true,
      };

      await installer.initProject(options);

      // Verify all methods were called
      expect(copyBaseFilesSpy).toHaveBeenCalledTimes(1);
      expect(updateOAuthConfigSpy).toHaveBeenCalledWith(['google', 'github', 'discord'], true);
      expect(updateOAuthUIConfigSpy).toHaveBeenCalledWith(['google', 'github', 'discord']);
      expect(updateEnvExampleSpy).toHaveBeenCalledWith(['google', 'github', 'discord']);
      expect(updateReadmeSpy).toHaveBeenCalledWith(['google', 'github', 'discord']);
      expect(applyTweakCNThemeSpy).toHaveBeenCalledWith('--background: 0 0% 0%;');
      expect(initGitRepoSpy).toHaveBeenCalledTimes(1);
      expect(installDependenciesSpy).toHaveBeenCalledTimes(1);
    });

    it('should orchestrate minimal flow with all options disabled', async () => {
      const installer = new TanStackInstaller('/tmp/test', 'test');
      const copyBaseFilesSpy = vi.spyOn(installer as any, 'copyBaseFiles').mockResolvedValue();
      const updateOAuthConfigSpy = vi.spyOn(installer, 'updateOAuthConfig').mockResolvedValue();
      const updateOAuthUIConfigSpy = vi.spyOn(installer, 'updateOAuthUIConfig').mockResolvedValue();
      const updateEnvExampleSpy = vi.spyOn(installer, 'updateEnvExample').mockResolvedValue();
      const updateReadmeSpy = vi.spyOn(installer, 'updateReadme').mockResolvedValue();
      const applyTweakCNThemeSpy = vi.spyOn(installer, 'applyTweakCNTheme').mockResolvedValue();
      const initGitRepoSpy = vi.spyOn(installer as any, 'initGitRepo').mockResolvedValue();
      const installDependenciesSpy = vi.spyOn(installer as any, 'installDependencies').mockResolvedValue();

      const options: ProjectOptions = {
        projectName: 'test',
        framework: 'tanstack',
        emailPasswordAuth: false,
        oauthProviders: [],
        // No theme (will use default)
        initGit: false,
        installDependencies: false,
      };

      await installer.initProject(options);

      // Verify only essential methods were called
      expect(copyBaseFilesSpy).toHaveBeenCalledTimes(1);
      expect(updateOAuthConfigSpy).not.toHaveBeenCalled();
      expect(updateOAuthUIConfigSpy).not.toHaveBeenCalled();
      expect(updateEnvExampleSpy).not.toHaveBeenCalled();
      expect(updateReadmeSpy).not.toHaveBeenCalled();
      expect(applyTweakCNThemeSpy).toHaveBeenCalledTimes(1); // Default theme
      expect(initGitRepoSpy).not.toHaveBeenCalled();
      expect(installDependenciesSpy).not.toHaveBeenCalled();
    });
  });
});
