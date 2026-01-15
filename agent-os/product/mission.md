# Product Mission

## Pitch
**Z3 Stack** (create-z3-app) is a modern CLI scaffolding tool that helps full-stack developers bootstrap production-ready applications by providing a batteries-included, opinionated starter template with dual framework support, integrated authentication, real-time database, and beautiful UI components out of the box.

## Users

### Primary Customers
- **Full-stack developers**: Engineers building modern web applications who want to skip repetitive setup and jump straight into building features
- **Development teams**: Organizations looking for a standardized, type-safe starting point for new projects
- **Solo founders & indie hackers**: Builders who need to ship fast with modern tooling without spending days on infrastructure

### User Personas

**Senior Full-Stack Developer** (28-40)
- **Role:** Lead developer or tech lead at a startup or agency
- **Context:** Regularly starts new client projects or internal tools, values type safety and modern tooling
- **Pain Points:** Wastes 1-2 days on every new project configuring auth, database, UI components, and TypeScript. Tired of maintaining custom boilerplates that drift out of date
- **Goals:** Ship production features faster, maintain consistency across projects, use proven patterns with modern tech stack

**Solo Indie Developer** (25-35)
- **Role:** Building SaaS products or side projects
- **Context:** Limited time outside of day job, needs to validate ideas quickly
- **Pain Points:** Analysis paralysis choosing between frameworks and tools. Struggles with auth implementation and database setup. Wants beautiful UI without design skills
- **Goals:** Launch MVP in weeks not months, avoid reinventing the wheel, focus on unique product features

**Development Team Lead** (30-45)
- **Role:** Engineering manager or technical director
- **Context:** Oversees multiple projects and junior developers
- **Pain Points:** Inconsistent project structures across teams. Junior developers struggle with auth and database configuration. Code reviews are harder when every project has different patterns
- **Goals:** Standardize tech stack across organization, reduce onboarding time for new developers, ensure best practices are followed from day one

## The Problem

### Repetitive Project Setup Steals Time from Building Features
Every new full-stack project requires the same tedious configuration: setting up TypeScript, configuring authentication providers, connecting a database, installing UI components, setting up environment variables, and wiring everything together. This repetitive work wastes 8-16 hours per project and is error-prone.

**Our Solution:** Z3 Stack automates the entire setup process with an interactive CLI that scaffolds a complete, type-safe application in under 5 minutes. Choose your framework, select OAuth providers, and get a fully configured project ready for feature development.

### Decision Fatigue Around Framework and Tool Selection
The modern JavaScript ecosystem offers too many choices. Developers spend hours researching which framework, auth library, database, and UI components work well together, often making suboptimal choices or ending up with incompatible tools.

**Our Solution:** Z3 Stack provides a curated, battle-tested tech stack with proven integration patterns. We support the two best full-stack React frameworks (TanStack Start and Next.js), the most modern auth library (Better Auth), a real-time serverless database (Convex), and production-ready accessible components (shadcn/ui + Base UI).

### Authentication Implementation is Complex and Insecure
Setting up secure authentication with multiple OAuth providers, session management, and proper TypeScript types is notoriously difficult. Many developers roll their own insecure implementations or spend days integrating auth libraries.

**Our Solution:** Z3 Stack generates fully configured Better Auth integration with your choice of OAuth providers (Google, GitHub, Discord, Twitter), email/password auth, proper session management, and complete TypeScript type safety. Just add your OAuth credentials and you're ready to ship.

## Differentiators

### Dual Framework Support with Shared Patterns
Unlike create-t3-app (Next.js only) or other single-framework CLIs, Z3 Stack supports both TanStack Start and Next.js with consistent patterns across both. Teams can choose the right framework for each project while maintaining familiar code structure and best practices.

This results in faster developer onboarding and code reusability across projects, regardless of framework choice.

### Better Auth Integration Out of the Box
Unlike other starters that use legacy auth libraries (NextAuth, Clerk) or no auth at all, Z3 Stack uses Better Auth - a modern, lightweight, framework-agnostic authentication library with excellent TypeScript support and OAuth integration.

This results in simpler auth code, better type safety, easier customization, and lower bundle sizes compared to alternatives.

### Real-Time Database with Zero Infrastructure
Unlike traditional starters that require setting up PostgreSQL, managing migrations, or configuring Redis, Z3 Stack uses Convex - a serverless, real-time database with automatic TypeScript schema generation and built-in backend functions.

This results in zero DevOps overhead, instant real-time features, and seamless local-to-production workflow with no separate staging databases needed.

### Interactive OAuth Provider Selection
Unlike static templates where you get all providers or none, Z3 Stack's CLI lets you choose exactly which OAuth providers you need (Google, GitHub, Discord, Twitter). The generated code only includes what you selected, with proper environment variables and setup instructions.

This results in cleaner codebases, fewer unused dependencies, and personalized setup guides for only the providers you actually need.

### Accessible, Customizable UI Components
Unlike UI-less starters or those locked into specific component libraries, Z3 Stack combines shadcn/ui (beautiful, pre-styled components) with Base UI primitives (Radix UI), giving you both speed and flexibility.

This results in beautiful interfaces out of the box with complete customization control and WAI-ARIA accessibility built in.

## Key Features

### Core Features
- **Dual Framework Support:** Choose between TanStack Start (file-based routing, Vite-powered) or Next.js (App Router, production-proven) based on project needs
- **Interactive CLI:** Beautiful terminal prompts guide you through project setup with validation, progress indicators, and helpful error messages
- **Full TypeScript:** End-to-end type safety from database queries to React components, with strict mode enabled by default
- **Monorepo Structure:** Organized with pnpm workspaces for clean separation between app code, shared utilities, and configuration

### Authentication Features
- **Better Auth Integration:** Modern authentication library with session management, CSRF protection, and rate limiting built in
- **Email/Password Auth:** Secure credential-based authentication with password hashing and email verification ready to enable
- **Flexible OAuth Providers:** Select any combination of Google, GitHub, Discord, and Twitter OAuth during setup
- **Type-Safe Auth Client:** Framework-specific auth client with full TypeScript inference for user sessions and auth methods

### Database & Backend Features
- **Convex Real-Time Database:** Serverless database with automatic scaling, real-time subscriptions, and zero infrastructure management
- **Convex Auth Adapter:** Pre-configured Better Auth adapter for Convex with proper session storage and user management
- **Environment Configuration:** Generated .env files with all required variables, examples, and setup documentation
- **Database Migrations:** Convex schema files ready for your data models with TypeScript validation

### UI & Developer Experience Features
- **shadcn/ui Components:** Beautiful, accessible components built on Radix UI that you own and can customize
- **Tailwind CSS:** Utility-first styling with sensible defaults and custom color system support
- **Git Integration:** Optional Git initialization with proper .gitignore and initial commit
- **GitHub Repository Creation:** Optional GitHub repo creation via GitHub CLI with automatic remote setup

### Advanced Features
- **Smart Template System:** String replacement with placeholders ensures generated code remains valid TypeScript throughout the process
- **Dependency Version Management:** Centralized version control for all dependencies ensures compatibility and easy updates
- **Comprehensive Documentation:** Generated README with next steps, environment variable guides, and OAuth setup instructions specific to your selections
- **Package Manager Detection:** Automatically detects and uses your preferred package manager (pnpm, npm, yarn, bun)
