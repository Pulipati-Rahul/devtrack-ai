import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';
import { env } from '../config/env';

async function main() {
  console.log('⏳ Connecting to database...');
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  console.log('⏳ Running migrations...');
  
  await migrate(db, {
    migrationsFolder: path.join(__dirname, 'migrations'),
  });

  console.log('✅ Migrations completed successfully!');
  
  await migrationClient.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
