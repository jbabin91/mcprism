# MCPrism 🌈

> Progressive Tool Disclosure for MCP Servers

MCPrism is an open-source MCP gateway that helps reduce context window usage through progressive tool disclosure.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Bun](https://img.shields.io/badge/built%20with-Bun-black)](https://bun.sh)

## What is Progressive Tool Disclosure?

Like a prism refracts light into a spectrum revealed progressively, MCPrism refracts your MCP tool stack into layers disclosed only when needed:

- **Load lightweight metadata** upfront instead of full schemas
- **Search semantically** for tools you need
- **Fetch complete schemas** only when needed
- **Reduce context usage** by loading tools on-demand

### The Problem

Traditional MCP clients load all tool schemas upfront, consuming a significant portion of your context window before you start your conversation. With many MCP servers enabled, this can mean tens of thousands of tokens used just for tool definitions.

### The Solution

MCPrism acts as a gateway between your AI client and MCP servers, implementing progressive disclosure:

```
Traditional:  Load all tool schemas → High context usage
MCPrism:      Load metadata → Search → Fetch schemas as needed
Result:       Significantly reduced context usage
```

## Features

- 🌈 **Progressive Disclosure** - Load tools on-demand, not upfront
- 🔍 **Semantic Search** - Find tools with natural language queries
- 🔐 **RBAC** - Organization, team, and user-level permissions
- 🐳 **Self-Hosted** - Docker Compose, Coolify, or manual deployment
- 🌐 **Web UI** - Manage MCP servers without CLI (coming soon)
- 🔧 **MCP Tools** - Configure gateway via natural language (coming soon)
- 📊 **PostgreSQL + pgvector** - Semantic search with vector embeddings
- ⚡ **Fast** - Built with Elysia.js on Bun runtime

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Docker](https://docker.com) (for PostgreSQL)
- Node.js v18+ (optional, for npm compatibility)

### Installation

```bash
# Clone repository
git clone https://github.com/jbabin91/mcprism.git
cd mcprism

# Install dependencies
bun install

# Start PostgreSQL
docker compose up -d

# Copy environment file
cp .env.example .env

# Run database migrations (coming soon)
# bun run db:migrate

# Start development servers
bun run dev
```

### URLs

- **Gateway API:** http://localhost:3001 (coming soon)
- **Web UI:** http://localhost:3000 (coming soon)
- **Documentation:** http://localhost:3002 (coming soon)

## Architecture

```
mcprism/
├── apps/
│   ├── gateway/          # Elysia.js backend (MCP gateway)
│   ├── web/              # TanStack Start frontend (coming soon)
│   └── docs/             # Fumadocs documentation (coming soon)
├── packages/
│   ├── db/               # Drizzle ORM + PostgreSQL schemas
│   ├── auth/             # Better Auth (coming soon)
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Base UI components (coming soon)
└── docker-compose.yml    # PostgreSQL + pgvector
```

## Tech Stack

### Backend
- **[Bun](https://bun.sh)** - Fast JavaScript runtime (4x faster than Node.js)
- **[Elysia.js](https://elysiajs.com)** - High-performance web framework (3x faster than Hono)
- **[Drizzle ORM](https://orm.drizzle.team)** - TypeScript-first ORM
- **[PostgreSQL](https://postgresql.org) + [pgvector](https://github.com/pgvector/pgvector)** - Vector database for semantic search

### Frontend (Coming Soon)
- **[TanStack Start](https://tanstack.com/start)** - Modern React framework
- **[Base UI](https://base-ui.com)** - Unstyled component primitives
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first styling
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching
- **[TanStack Form](https://tanstack.com/form)** - Type-safe forms

### Infrastructure
- **[Turborepo](https://turbo.build/repo)** - High-performance monorepo
- **[Docker Compose](https://docs.docker.com/compose/)** - Local development
- **[Coolify](https://coolify.io)** - Self-hosted deployment (coming soon)

## Development

### Available Commands

```bash
# Development
bun run dev              # Start all apps
bun run dev --filter=@mcprism/gateway  # Start gateway only

# Build
bun run build            # Build all apps
bun run build --filter=@mcprism/gateway

# Database
bun run db:generate      # Generate migrations (coming soon)
bun run db:migrate       # Run migrations (coming soon)
bun run db:studio        # Open Drizzle Studio (coming soon)

# Linting & Type-checking
bun run lint             # Lint all code
bun run typecheck        # Type-check all code

# Docker
docker compose up -d     # Start PostgreSQL
docker compose down      # Stop services
docker compose logs -f postgres  # View logs
```

### Project Status

This project is in active development. Current status:

- ✅ Domain registered: [mcprism.dev](https://mcprism.dev)
- ✅ Proof-of-concept validated
- ✅ Repository created: [github.com/jbabin91/mcprism](https://github.com/jbabin91/mcprism)
- ✅ Turborepo monorepo initialized
- ✅ Gateway app structure (migrating from POC)
- 🚧 Database package (Drizzle + PostgreSQL)
- 🚧 Web UI (TanStack Start)
- 🚧 Documentation (Fumadocs)
- 🚧 Authentication (Better Auth)
- 🚧 RBAC system

## How It Works

### 1. Traditional MCP Client

```typescript
// Client loads ALL tool schemas upfront
const tools = await client.listTools();
// All schemas loaded into context immediately
```

### 2. MCPrism Gateway

```typescript
// 1. Search for tools using natural language
const tools = await mcprism.searchTools("read file");
// Returns: [{ name: "read_file", description: "...", server: "filesystem" }]

// 2. Fetch full schema only when needed
const schema = await mcprism.getToolSchema("read_file");

// 3. Execute tool
const result = await mcprism.executeTool("read_file", { path: "/tmp/foo.txt" });
```

**Result:** Only load what you need, when you need it.

## Roadmap

### Phase 1: Core Gateway (Current)
- [x] Initialize Turborepo monorepo
- [x] Proof-of-concept validation
- [ ] Migrate POC to production structure
- [ ] PostgreSQL + pgvector integration
- [ ] MCP protocol client
- [ ] Semantic search engine
- [ ] Progressive disclosure API

### Phase 2: Web Interface
- [ ] TanStack Start app setup
- [ ] Base UI component library
- [ ] Server management UI
- [ ] Tool browser & search
- [ ] Real-time monitoring

### Phase 3: Authentication & RBAC
- [ ] Better Auth integration
- [ ] User management
- [ ] Organization & team support
- [ ] Permission system
- [ ] SSO/OIDC for enterprise

### Phase 4: Documentation & Launch
- [ ] Fumadocs site
- [ ] Getting started guides
- [ ] API documentation
- [ ] Deployment guides (Docker, Coolify)
- [ ] Show HN launch

### Phase 5: Advanced Features
- [ ] Natural language MCP configuration
- [ ] Tool usage analytics
- [ ] Cost tracking
- [ ] Multi-region deployment
- [ ] Kubernetes support

## Contributing

Contributions welcome! This project is just getting started.

**Current needs:**
- Logo design (geometric prism + spectrum)
- Documentation writers
- Frontend developers (TanStack Start + Base UI)
- Backend developers (Elysia + Drizzle)
- DevOps (Docker, Coolify templates)

**Coming soon:**
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- Developer setup guide

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

Built with:
- Inspired by [Model Context Protocol](https://spec.modelcontextprotocol.io)
- Validated through proof-of-concept testing
- Community feedback from MCP Discord

## Links

- **Website:** [mcprism.dev](https://mcprism.dev) (coming soon)
- **Documentation:** [docs.mcprism.dev](https://docs.mcprism.dev) (coming soon)
- **GitHub:** [github.com/jbabin91/mcprism](https://github.com/jbabin91/mcprism)
- **Issues:** [github.com/jbabin91/mcprism/issues](https://github.com/jbabin91/mcprism/issues)

---

**Like a prism refracts light, MCPrism refracts tool access.** 🌈
