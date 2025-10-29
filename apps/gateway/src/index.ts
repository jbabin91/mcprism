import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

// Initialize
const db = new Database('mcp-tools.db');
let embedder: any;

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

// Initialize embedder (lazy load)
async function getEmbedder() {
  if (!embedder) {
    console.log('Loading embedding model (one-time, ~22MB)...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedder ready!');
  }
  return embedder;
}

// Generate embedding
async function generateEmbedding(text: string): Promise<Float32Array> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return output.data;
}

// Cosine similarity search
function searchTools(queryEmbedding: Float32Array, limit: number = 5) {
  const stmt = db.query('SELECT id, name, description, server, category, input_schema, embedding FROM tools');
  const tools = stmt.all() as any[];

  const results = tools.map(tool => {
    // Convert Buffer to Float32Array properly
    const buffer = tool.embedding instanceof Buffer ? tool.embedding : Buffer.from(tool.embedding);
    const toolEmbedding = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
    const similarity = cos_sim(queryEmbedding, toolEmbedding);

    return {
      name: tool.name,
      description: tool.description,
      server: tool.server,
      category: tool.category,
      similarity: similarity
    };
  });

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// Elysia app
const app = new Elysia()
  .get('/health', () => {
    const result = db.query('SELECT COUNT(*) as count FROM tools').get() as any;
    return {
      status: 'ok',
      tools: result.count
    };
  })

  .get('/tools', () => {
    const tools = db.query(`
      SELECT name, description, server, category
      FROM tools
      ORDER BY server, name
    `).all();
    return { tools };
  })

  .post('/search', async ({ body }: any) => {
    const { query, limit = 5 } = body;

    if (!query) {
      return { error: 'Query required' };
    }

    try {
      const queryEmbedding = await generateEmbedding(query);
      const results = searchTools(queryEmbedding, limit);

      return { tools: results };
    } catch (error: any) {
      return { error: error.message };
    }
  })

  .get('/tool/:name', ({ params }: any) => {
    const tool = db.query(`
      SELECT name, description, server, category, input_schema
      FROM tools
      WHERE name = ?
    `).get(params.name) as any;

    if (!tool) {
      return { error: 'Tool not found' };
    }

    return {
      ...tool,
      inputSchema: JSON.parse(tool.input_schema)
    };
  })

  .post('/execute', async ({ body }: any) => {
    const { tool, args } = body;

    if (!tool || !args) {
      return { error: 'Tool and args required' };
    }

    // For POC, we'll just return a mock response
    // In production, this would forward to actual MCP server
    return {
      success: true,
      tool,
      args,
      message: 'POC: Tool execution would happen here. In production, this would forward to the actual MCP server.',
      note: 'To implement: Forward request to MCP server based on tool.server field'
    };
  })

  .listen(3001);

console.log(`🚀 MCP Gateway running on http://localhost:${app.server?.port}`);
console.log('');
console.log('Endpoints:');
console.log('  GET  /health         - Health check');
console.log('  GET  /tools          - List all tools');
console.log('  POST /search         - Search tools (body: {query, limit?})');
console.log('  GET  /tool/:name     - Get tool schema');
console.log('  POST /execute        - Execute tool (body: {tool, args})');
console.log('');
console.log('Next: Populate database with tools');
console.log('  bun run src/populate.ts');
