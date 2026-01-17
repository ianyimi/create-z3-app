# create-z3

A CLI tool for scaffolding modern full-stack TypeScript applications with the **Z3 Stack**.

## What is the Z3 Stack?

The Z3 Stack is a modern, type-safe full-stack development stack that combines:

- **Framework**: [TanStack Start](https://tanstack.com/router/latest) or [Next.js](https://nextjs.org/) (App Router)
- **Backend**: [Convex](https://www.convex.dev/) - Reactive backend with real-time sync
- **Authentication**: [Better Auth](https://www.better-auth.com/) - Flexible authentication framework
- **UI**: [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [TweakCN](https://tweakcn.com/) theme support
- **Type Safety**: Full end-to-end TypeScript

## Quick Start

Create a new Z3 Stack application with a single command:

```bash
pnpm create z3@latest
```

Or with other package managers:

```bash
npm create z3@latest
# or
yarn create z3@latest
# or
bun create z3@latest
```

## Interactive Setup

The CLI will guide you through:

1. **Project Name** - Choose your project directory name
2. **Framework** - Select TanStack Start or Next.js
3. **Authentication** - Enable email/password and/or OAuth providers
4. **OAuth Providers** - Choose from 20+ providers (Google, GitHub, Discord, etc.)
5. **Theme** - Apply a TweakCN theme or use the default shadcn theme
6. **Dependencies** - Optionally install dependencies immediately

## What Gets Generated?

Your project will include:

- Full authentication setup with Better Auth
- Convex backend configuration with schema
- Type-safe API routes and queries
- Pre-configured shadcn/ui components
- Tailwind CSS with your chosen theme
- ESLint and Prettier configuration
- Environment variable templates
- Setup guides for OAuth providers in the README

## OAuth Providers

Supported providers include:

- Google, GitHub, GitLab, Microsoft, Apple
- Discord, Spotify, Twitch, LinkedIn
- Dropbox, Facebook, Twitter/X
- And 10+ more

## Development

After creating your project:

```bash
cd your-project-name
pnpm install  # if you didn't install during setup
pnpm dev      # start development server
```

Configure your environment variables in `.env` based on `.env.example`.

## Requirements

- Node.js 18.0.0 or higher
- A Convex account (free tier available at [convex.dev](https://www.convex.dev/))

## Repository Structure

This is a monorepo containing:

- `packages/cli` - The create-z3 CLI tool
- `templates/nextjs` - Next.js project template
- `templates/tanstack-start` - TanStack Start project template

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Links

- [GitHub Repository](https://github.com/zayecq/create-z3-app)
- [npm Package](https://www.npmjs.com/package/create-z3)
- [Convex Documentation](https://docs.convex.dev/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [Next.js Documentation](https://nextjs.org/docs)
