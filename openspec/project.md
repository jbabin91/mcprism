# Project Context

## Purpose

MCPrism is an open-source MCP (Model Context Protocol) gateway that implements progressive tool disclosure to reduce context window usage in AI conversations.

**Problem**: Traditional MCP clients load all tool schemas upfront, consuming significant context (e.g., 64,600 tokens for 88 tools = 32% of a 200k context window) before the conversation even starts.

**Solution**: MCPrism acts as a gateway that:
- Loads lightweight metadata upfront instead of full schemas
- Provides semantic search to discover relevant tools
- Fetches complete tool schemas only when needed
- Significantly reduces context usage through on-demand loading

**Key Goals**:
- Reduce context window consumption for MCP tool usage
- Maintain full MCP protocol compatibility
- Provide both MCP protocol interface AND web UI
- Enable RBAC (organizations, teams, users)
- Support self-hosting (Docker, Coolify)
- Open source (MIT license)

## Tech Stack

### Backend
- **Bun** - JavaScript runtime (v1.0+)
- **Elysia.js** - High-performance web framework
- **Drizzle ORM** - TypeScript-first ORM
- **PostgreSQL** - Primary database
- **pgvector** - Vector similarity search
- **@xenova/transformers** - Local embeddings (all-MiniLM-L6-v2)
- **Better Auth** - Authentication library

### Frontend
- **TanStack Start** - Modern React framework
- **Base UI** - Unstyled component primitives
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Data fetching and caching
- **TanStack Form** - Type-safe form management
- **ArkType** - Runtime validation

### Infrastructure
- **Turborepo** - High-performance monorepo
- **Docker Compose** - Local development
- **Coolify** - Self-hosted deployment
- **Fumadocs** - Documentation site

## Project Conventions

### Code Style
- **TypeScript everywhere** - All code is TypeScript, strict mode enabled
- **No emojis** - Unless explicitly requested by user
- **Bun native** - Prefer `bun:sqlite`, `Bun.serve()`, etc.
- **Functional patterns** - Prefer pure functions, immutability

### Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `user-service.ts`)
- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Functions**: `camelCase` (e.g., `getUserById`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Database tables**: `snake_case` (e.g., `user_profiles`)

### Architecture Patterns

**Monorepo Structure**:
```
mcprism/
├── apps/
│   ├── gateway/          # Elysia.js MCP gateway
│   ├── web/              # TanStack Start frontend
│   └── docs/             # Fumadocs documentation
├── packages/
│   ├── db/               # Drizzle ORM schemas
│   ├── auth/             # Better Auth config
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Base UI components
```

**Key Patterns**:
- **Progressive Disclosure**: Load metadata upfront, schemas on-demand
- **Semantic Search**: pgvector for natural language tool discovery
- **MCP Protocol Compatibility**: Gateway must be fully MCP-compliant
- **Workspace Packages**: Use `workspace:*` for internal dependencies

### Testing Strategy

**Testing Approach** (To be defined):
- Unit tests for business logic
- Integration tests for database operations
- E2E tests for critical user flows
- MCP protocol compliance tests

### Git Workflow

**Commit Conventions** (Conventional Commits):
```
feat: add semantic search endpoint
fix: correct pgvector similarity calculation
docs: update README with installation steps
chore: upgrade dependencies
```

**Branch Strategy**:
- `main` - Production-ready code
- `feature/[name]` - New features
- `fix/[name]` - Bug fixes
- `chore/[name]` - Maintenance

## Domain Context

### Model Context Protocol (MCP)
- **Version**: 2025-03-26 (current spec)
- **Protocol**: JSON-RPC 2.0 over stdio or HTTP
- **Key Methods**: `initialize`, `tools/list`, `tools/call`
- **Problem**: `tools/list` requires full `inputSchema` for every tool
- **Context Issue**: Large tool sets consume massive context upfront

### Progressive Disclosure Strategy
1. **Metadata Phase**: Load tool names + descriptions only
2. **Search Phase**: Use semantic search to find relevant tools
3. **Schema Phase**: Fetch full JSON Schema only when needed
4. **Execution Phase**: Forward tool calls to actual MCP servers

### RBAC Concepts
- **Organizations**: Top-level grouping
- **Teams**: Sub-groups within org
- **Users**: Individual accounts
- **Permissions**: Read-only, read-write, admin
- **Tool Filtering**: Teams can restrict which tools are exposed

## Important Constraints

### Technical Constraints
- **Bun Only**: Must use Bun runtime (not Node.js)
- **PostgreSQL Required**: Need pgvector for semantic search
- **MCP Compatibility**: Must support MCP protocol 2025-03-26
- **Self-Hosted First**: No vendor lock-in, easy to self-host

### UX Principles
- **Honest Messaging**: No overpromising (e.g., "helps reduce" not "saves 98%")
- **Clear WIP Status**: Project is early-stage, set expectations
- **Progressive Enhancement**: Start simple, add features incrementally

### Business Constraints
- **Open Source**: MIT license, fully open
- **No Hosted Service**: Self-hosting only (no SaaS)
- **Community Driven**: Accept contributions, transparent roadmap

## External Dependencies

### MCP Ecosystem
- **MCP Servers**: Connect to existing MCP servers (filesystem, GitHub, browser, etc.)
- **MCP Spec**: https://spec.modelcontextprotocol.io

### Embeddings
- **Model**: all-MiniLM-L6-v2 (384 dimensions)
- **Library**: @xenova/transformers (local, no API calls)
- **Storage**: pgvector in PostgreSQL

### Authentication
- **Better Auth**: https://better-auth.com
- **OAuth Providers**: GitHub (initially), expandable
- **SSO/OIDC**: For enterprise deployments

### Documentation & Deployment
- **Fumadocs**: https://fumadocs.vercel.app
- **Docker**: For PostgreSQL + pgvector
- **Coolify**: One-click deployment option

## Reference Documentation

### Planning Documents
Located in `/Users/jacebabin/.code/github/mcpProjects/`:
- `MCP_SPEC_ANALYSIS.md` - MCP protocol deep dive
- `EXISTING_MCP_DISCUSSIONS.md` - Community discussions (SEP-1576)
- `TECH_STACK_ANALYSIS.md` - Tech stack rationale
- `BASE_UI_TAILWIND_SETUP.md` - UI component patterns
- `PROJECT_SETUP_GUIDE.md` - Complete setup instructions
- `FINAL_NAME_DECISION.md` - Project naming rationale

### Key Decisions
1. **Name**: MCPrism (prism refracts light → gateway refracts tools)
2. **Domain**: mcprism.dev (no hyphens)
3. **GitHub**: github.com/jbabin91/mcprism
4. **npm**: @mcprism scope
5. **Tech Stack**: Bun + Elysia + PostgreSQL + TanStack Start + Base UI
