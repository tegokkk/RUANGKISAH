import { createHash } from 'node:crypto';
import { sql } from 'kysely';

// Atomic UPSERT, shared by all Vercel instances. No raw IP or auth token is stored.
export async function consumeRateLimit(db, key, { window, max }) {
  const now = Date.now();
  const hashed = createHash('sha256')
    .update(key + ':' + window)
    .digest('hex');
  const row = await db
    .insertInto('request_limit')
    .values({ key: hashed, count: 1, resetAt: now + window * 1000 })
    .onConflict((conflict) =>
      conflict.column('key').doUpdateSet({
        count: sql`case when "request_limit"."resetAt" <= ${now} then 1 else "request_limit"."count" + 1 end`,
        resetAt: sql`case when "request_limit"."resetAt" <= ${now} then ${now + window * 1000} else "request_limit"."resetAt" end`,
      }),
    )
    .returning(['count', 'resetAt'])
    .executeTakeFirstOrThrow();
  const allowed = Number(row.count) <= max;
  return {
    allowed,
    retryAfter: allowed ? null : Math.max(1, Math.ceil((Number(row.resetAt) - now) / 1000)),
  };
}
