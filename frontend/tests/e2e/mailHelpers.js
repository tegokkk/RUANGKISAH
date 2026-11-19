import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { expect } from '@playwright/test';

const root = fileURLToPath(new URL('../../../backend/.data/', import.meta.url));
export async function readTestMail(email, kind) {
  let found;
  await expect
    .poll(
      () => {
        const messages = [];
        for (const dir of readdirSync(root).filter((name) => name.startsWith('e2e-'))) {
          try {
            for (const file of readdirSync(resolve(root, dir, 'mail'))) {
              try {
                messages.push(JSON.parse(readFileSync(resolve(root, dir, 'mail', file), 'utf8')));
              } catch {
                /* Message still being written. */
              }
            }
          } catch {
            /* Another test run may have removed its private outbox. */
          }
        }
        found = messages
          .filter((item) => item.to === email && item.kind === kind)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .at(-1);
        return Boolean(found);
      },
      { timeout: 10000 }
    )
    .toBe(true);
  return found;
}
