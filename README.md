# Magpie 🐦‍⬛

Share, discover, and clone AI coding workflows.

Magpie is a platform where developers publish and install complete AI coding setups — config files, hooks, skills, commands, and scripts — packaged as shareable, installable units. Think GitHub, but for your Claude Code, Cursor, or Copilot configuration.

## How it works

1. **Publish** your AI coding setup via the CLI or web
2. **Discover** setups through search, trending, and user profiles
3. **Clone** a setup to your machine with a single command

A "setup" is the core entity: a manifest (`setup.json`) plus the config files, scripts, and documentation that define a workflow. Setups are browsable on the web and installable via the CLI.

## Surfaces

- **Web app** — browse setups, explore trending configs, follow creators, star your favorites
- **CLI (`magpie`)** — clone and install setups locally, publish your own, search and interact from the terminal

## Tech stack

- SvelteKit (TypeScript, SSR + SPA hybrid)
- PostgreSQL + Drizzle ORM
- Tailwind CSS + shadcn-svelte
- Lucia Auth (GitHub OAuth)
- CLI built with Commander

## Development

```sh
pnpm install
pnpm run dev
```

### Commands

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `pnpm run dev`       | Start dev server on localhost:5173 |
| `pnpm run build`     | Production build                   |
| `pnpm run preview`   | Preview production build           |
| `pnpm run check`     | TypeScript type checking           |
| `pnpm run lint`      | ESLint + Prettier                  |
| `pnpm run test:unit` | Vitest unit tests                  |
| `pnpm run test:e2e`  | Playwright end-to-end tests        |

## Project structure

```
magpie/
├── src/
│   ├── lib/           # Shared code (components, server, utils, types)
│   └── routes/        # SvelteKit pages and API endpoints
├── cli/               # CLI tool (published to npm as `magpie`)
├── docs/              # Architecture, data model, CLI spec, MVP plan
└── drizzle/           # Database migrations
```

## License

ISC
