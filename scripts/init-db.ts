import { config } from 'dotenv';
import { initDatabase } from '../lib/db';

// Load .env.local
config({ path: '.env.local' });

async function main() {
  console.log('Initializing Turso database...');
  console.log('Database URL:', process.env.TURSO_DATABASE_URL ? '✓' : '✗');

  try {
    await initDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();
