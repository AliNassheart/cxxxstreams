import bcrypt from 'bcryptjs';
import { pool } from './db';

/**
 * Resets the admin password to ChangeMe123!
 * Run with: ts-node src/config/resetAdmin.ts
 */
async function resetAdmin() {
  const email = 'admin@streamhub.local';
  const username = 'admin';
  const password = 'ChangeMe123!';

  const passwordHash = await bcrypt.hash(password, 12);

  // Delete existing admin if exists
  await pool.query('DELETE FROM users WHERE email = $1', [email]);

  // Insert fresh admin
  await pool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')`,
    [username, email, passwordHash]
  );

  // eslint-disable-next-line no-console
  console.log(`Reset admin user: ${email} with password: ${password}`);
  await pool.end();
}

resetAdmin().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Reset failed:', err);
  process.exit(1);
});
