import { test as base, expect } from '@playwright/test';
export async function signInTestContext(context) {
  const response = await context.request.post('http://127.0.0.1:4001/api/auth/sign-in/email', {
    headers: { Origin: 'http://127.0.0.1:4001' },
    data: { email: 'student@example.test', password: 'E2E-Only-Password-123!' },
  });
  if (!response.ok()) throw new Error('Fixture login failed: ' + response.status());
  const { user } = await response.json();
  await context.addInitScript((userId) => {
    window.__TEST_STORAGE_KEY = 'ruangkisah:account:' + encodeURIComponent(userId) + ':data:v1';
  }, user.id);
}
export const test = base.extend({
  authenticated: [true, { option: true }],
  context: async ({ context, authenticated }, provide) => {
    if (authenticated) await signInTestContext(context);
    await provide(context);
  },
});
export { expect };
