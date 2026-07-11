import bcrypt from 'bcryptjs';
import { pool } from './db';

/**
 * Creates a default admin/owner account so the platform owner can log in
 * and provision streamer accounts. Run once with: npm run seed
 */
async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@streamhub.local';
  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const passwordHash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [username, email, passwordHash]
  );

  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${email} (change the password after first login)`);
  await pool.end();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
