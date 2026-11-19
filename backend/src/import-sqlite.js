import { DatabaseSync } from 'node:sqlite';
import { sql } from 'kysely';

// Optional one-off import: source remains read-only; no sessions or verification tokens migrate.
export async function importSqliteAccounts(database, filename) {
  if (database.authDatabase.type !== 'postgres') throw new Error('Tujuan impor harus PostgreSQL.');
  const source = new DatabaseSync(filename, { readOnly: true });
  let users, accounts, audit;
  try {
    source.exec('BEGIN');
    users = source.prepare('SELECT * FROM user').all();
    accounts = source.prepare('SELECT * FROM account').all();
    audit = source.prepare('SELECT * FROM audit_log').all();
    source.exec('COMMIT');
  } finally {
    source.close();
  }
  if (!users.length) throw new Error('Database sumber tidak memiliki akun.');
  const userFields = [
    'id',
    'name',
    'email',
    'emailVerified',
    'image',
    'createdAt',
    'updatedAt',
    'role',
    'status',
    'approvalStatus',
    'termsAccepted',
  ];
  const accountFields = [
    'id',
    'userId',
    'accountId',
    'providerId',
    'password',
    'createdAt',
    'updatedAt',
  ];
  if (accounts.some((account) => account.providerId !== 'credential'))
    throw new Error('Impor ini hanya mendukung akun email/kata sandi.');
  const convert = (row, fields) =>
    Object.fromEntries(
      fields.map((field) => [
        field,
        ['createdAt', 'updatedAt'].includes(field)
          ? new Date(row[field])
          : ['emailVerified', 'termsAccepted'].includes(field)
            ? Boolean(row[field])
            : field === 'approvalStatus'
              ? row.approvalStatus ||
                (['admin', 'superadmin'].includes(row.role) ? 'approved' : 'pending')
              : (row[field] ?? null),
      ]),
    );
  await database.db.transaction().execute(async (transaction) => {
    // Block registrations/other imports while checking an empty destination and inserting IDs.
    await sql`lock table ${sql.id('ruangkisah', 'user')}, ${sql.id('ruangkisah', 'account')}, ${sql.id('ruangkisah', 'audit_log')} in share row exclusive mode`.execute(
      transaction,
    );
    for (const table of ['user', 'account', 'audit_log']) {
      if (await transaction.selectFrom(table).select('id').limit(1).executeTakeFirst())
        throw new Error('Tujuan harus kosong; akun/audit yang ada tidak akan ditimpa.');
    }
    for (const [table, rows] of [
      ['user', users.map((row) => convert(row, userFields))],
      ['account', accounts.map((row) => convert(row, accountFields))],
      ['audit_log', audit],
    ]) {
      for (let index = 0; index < rows.length; index += 100)
        await transaction
          .insertInto(table)
          .values(rows.slice(index, index + 100))
          .execute();
    }
  });
  return { users: users.length, accounts: accounts.length };
}
