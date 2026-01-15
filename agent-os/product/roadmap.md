# Product Roadmap

1. [ ] **Framework Installer Architecture** — Build abstract base class system with shared utility methods (env vars, placeholders, dependencies) and framework-specific implementations for TanStack Start and Next.js. Include OAuth provider registry and version management. `M`

2. [ ] **CLI Interactive Prompts** — Implement interactive CLI flow with project name validation, framework selection, multi-select OAuth provider choice, and optional Git/GitHub/install prompts using Commander and @inquirer/prompts. `S`

3. [ ] **Template Files with Placeholders** — Create base templates for both TanStack Start and Next.js with placeholder system ({{OAUTH_PROVIDERS}}, {{AUTH_CLIENT_IMPORT}}) in auth config files, client files, and .env.example. `S`

4. [ ] **Better Auth Integration** — Generate complete Better Auth configuration with email/password support, selected OAuth providers, environment variables, and framework-specific auth clients with proper imports and initialization code. `M`

5. [ ] **Convex Database Setup** — Configure Convex adapter for Better Auth, generate schema files with user/session models, create convex.json config, and add all required environment variables (CONVEX_DEPLOYMENT, CONVEX_URL, SITE_URL). `S`

6. [ ] **shadcn/ui Component System** — Initialize shadcn/ui with components.json config, install Base UI dependencies, setup Tailwind with proper paths, and configure component aliases for both frameworks. `S`

7. [ ] **Project Creation Orchestration** — Wire together all installers into main createProject flow: copy base template, run installer methods in sequence, update package.json, show progress with ora spinners, and handle errors gracefully. `M`

8. [ ] **Environment Variable Management** — Generate .env.example with all required variables and commented sections, create .env.local with generated secrets (BETTER_AUTH_SECRET), and provide clear setup instructions for OAuth credentials and Convex deployment. `S`

9. [ ] **Git and GitHub Integration** — Implement optional Git initialization with proper .gitignore, create initial commit, and optionally create GitHub repository using gh CLI with automatic remote setup and push. `S`

10. [ ] **Success Output and Documentation** — Display comprehensive success message with next steps, framework-specific dev commands, OAuth setup instructions for selected providers, Convex deployment guide, and links to relevant documentation. `XS`

11. [ ] **Dependency Installation** — Implement optional dependency installation with package manager detection (pnpm, npm, yarn, bun), progress indicators, timeout handling, and graceful fallback with manual installation instructions. `S`

12. [ ] **CLI Testing and Polish** — Test both TanStack Start and Next.js scaffolding with all OAuth combinations, verify generated projects run successfully, improve error messages and spinner text, and validate edge cases (scoped packages, existing directories, missing tools). `M`

> Notes
> - Each item represents a complete, end-to-end feature that can be developed and tested independently
> - Items are ordered by technical dependencies: installer architecture must be built before orchestration, templates before integration features
> - All features contribute directly to the mission of providing a batteries-included, production-ready starter template
> - The roadmap focuses on the most direct path to a working CLI that generates deployable applications
> - Testing is positioned last to allow for comprehensive validation once all features are integrated
