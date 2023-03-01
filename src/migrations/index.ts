import { mongoMigrateCli } from 'mongo-migrate-ts';

mongoMigrateCli({
  uri: process.env.MONGO_URL,
  database: 'rapid_capsule',
  migrationsDir: `${__dirname}/migrations`,
  migrationsCollection: 'migration',
});
