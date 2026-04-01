import { neon } from '@neondatabase/serverless';

const NullishQueryFunction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set'
  );
};

NullishQueryFunction.transaction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set'
  );
};

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : NullishQueryFunction;

// Helper function to get SQL client (for files that import getSqlClient)
export function getSqlClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set');
  }
  return neon(process.env.DATABASE_URL);
}

// Re-export neon for direct imports
export { neon };

export default sql;
