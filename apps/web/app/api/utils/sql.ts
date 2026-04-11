import { neon } from '@neondatabase/serverless';

// Use placeholder for build time - will be replaced at runtime
const buildTimeDbUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@placeholder.db.neon.tech/placeholder?sslmode=require';

const sql = neon(buildTimeDbUrl);

// Helper function to get SQL client (for files that import getSqlClient)
export function getSqlClient() {
  const url = process.env.DATABASE_URL || buildTimeDbUrl;
  return neon(url);
}

// Re-export neon for direct imports
export { neon };

export default sql;
