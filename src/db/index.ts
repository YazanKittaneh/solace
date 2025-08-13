import db from './drizzle';
export { db };
export * from './schema';

// Default export for compatibility
export default db;