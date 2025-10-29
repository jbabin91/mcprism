import { Database } from 'bun:sqlite';
import { pipeline } from '@xenova/transformers';

const db = new Database('mcp-tools.db');

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    server TEXT NOT NULL,
    category TEXT,
    input_schema TEXT NOT NULL,
    embedding BLOB
  );

  CREATE INDEX IF NOT EXISTS idx_server ON tools(server);
  CREATE INDEX IF NOT EXISTS idx_category ON tools(category);
`);

// Sample MCP tools (from your current Claude Code session)
const SAMPLE_TOOLS = [
  // Filesystem tools
  {
    name: 'read_file',
    description: 'Read contents from a file on the local filesystem',
    server: 'filesystem',
    category: 'read',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the file' }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file on the local filesystem',
    server: 'filesystem',
    category: 'write',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the file' },
        content: { type: 'string', description: 'Content to write' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'list_directory',
    description: 'List files and directories in a path',
    server: 'filesystem',
    category: 'read',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path to list' }
      },
      required: ['path']
    }
  },
  {
    name: 'search_files',
    description: 'Search for files matching a pattern',
    server: 'filesystem',
    category: 'read',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory to search in' },
        pattern: { type: 'string', description: 'Search pattern (glob or regex)' }
      },
      required: ['path', 'pattern']
    }
  },

  // GitHub tools (read-only)
  {
    name: 'get_file_contents',
    description: 'Get the contents of a file or directory from a GitHub repository',
    server: 'github',
    category: 'read',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner (username or organization)' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'Path to file/directory' }
      },
      required: ['owner', 'repo']
    }
  },
  {
    name: 'search_code',
    description: 'Search for code across GitHub repositories using GitHub\'s native search',
    server: 'github',
    category: 'read',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query using GitHub code search syntax' }
      },
      required: ['query']
    }
  },
  {
    name: 'list_issues',
    description: 'List issues in a GitHub repository',
    server: 'github',
    category: 'read',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' }
      },
      required: ['owner', 'repo']
    }
  },
  {
    name: 'get_commit',
    description: 'Get details for a commit from a GitHub repository',
    server: 'github',
    category: 'read',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        sha: { type: 'string', description: 'Commit SHA, branch name, or tag name' }
      },
      required: ['owner', 'repo', 'sha']
    }
  },

  // Browser tools (Chrome DevTools)
  {
    name: 'navigate_page',
    description: 'Navigate browser to a URL',
    server: 'chrome-devtools',
    category: 'browser',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' }
      },
      required: ['url']
    }
  },
  {
    name: 'take_screenshot',
    description: 'Take a screenshot of the current browser page or specific element',
    server: 'chrome-devtools',
    category: 'browser',
    inputSchema: {
      type: 'object',
      properties: {
        fullPage: { type: 'boolean', description: 'Capture full scrollable page' }
      }
    }
  },
  {
    name: 'click',
    description: 'Click on an element in the browser page',
    server: 'chrome-devtools',
    category: 'browser',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string', description: 'Element UID from page snapshot' }
      },
      required: ['uid']
    }
  },
  {
    name: 'fill',
    description: 'Type text into input field or select option',
    server: 'chrome-devtools',
    category: 'browser',
    inputSchema: {
      type: 'object',
      properties: {
        uid: { type: 'string', description: 'Element UID' },
        value: { type: 'string', description: 'Value to fill in' }
      },
      required: ['uid', 'value']
    }
  }
];

async function populate() {
  console.log('Loading embedding model...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('Model loaded!\n');

  const stmt = db.query(`
    INSERT OR REPLACE INTO tools (name, description, server, category, input_schema, embedding)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (const tool of SAMPLE_TOOLS) {
    // Generate embedding from name + description
    const text = `${tool.name} ${tool.description}`;
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    const embedding = Buffer.from(output.data.buffer);

    stmt.run(
      tool.name,
      tool.description,
      tool.server,
      tool.category,
      JSON.stringify(tool.inputSchema),
      embedding
    );

    count++;
    console.log(`✓ Added ${tool.name} (${tool.server})`);
  }

  console.log(`\n✅ Populated ${count} tools`);
  console.log('\nStart the gateway:');
  console.log('  bun run src/index.ts');
  console.log('\nTest search:');
  console.log('  curl -X POST http://localhost:3001/search -H "Content-Type: application/json" -d \'{"query": "read file"}\'');
}

populate().catch(console.error);
