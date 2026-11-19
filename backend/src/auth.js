import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { consumeRateLimit } from './rate-limit.js';

export async function createAuth(database, config, sendMail) {
  const { db } = database;
  const auth = betterAuth({
    appName: 'RUANGKISAH.ID',
    baseURL: config.publicUrl,
    secret: config.secret,
    database: database.authDatabase,
    trustedOrigins: config.origins,
    telemetry: { enabled: false },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) =>
        sendMail({
          to: user.email,
          subject: 'Atur ulang kata sandi RUANGKISAH',
          url,
          kind: 'reset',
        }),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      expiresIn: 3600,
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url }) =>
        sendMail({
          to: user.email,
          subject: 'Verifikasi email RUANGKISAH',
          url,
          kind: 'verification',
        }),
    },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'siswa', input: false },
        status: { type: 'string', defaultValue: 'active', input: false },
        approvalStatus: { type: 'string', defaultValue: 'pending', input: false },
        termsAccepted: { type: 'boolean', required: true, input: true },
      },
    },
    session: { expiresIn: 60 * 60 * 24, cookieCache: { enabled: false } },
    rateLimit: {
      enabled: !config.test,
      window: 60,
      max: 30,
      customStorage: { consume: (key, rule) => consumeRateLimit(db, 'auth:' + key, rule) },
    },
    advanced: {
      useSecureCookies: config.production || config.vercel,
      ...(config.vercel ? { ipAddress: { ipAddressHeaders: ['x-vercel-forwarded-for'] } } : {}),
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!user.termsAccepted)
              throw new APIError('BAD_REQUEST', {
                message: 'Persetujuan ketentuan diperlukan.',
              });
            const name = user.name?.trim();
            if (!name || name.length < 2 || name.length > 60)
              throw new APIError('BAD_REQUEST', {
                message: 'Nama tampilan harus 2-60 karakter.',
              });
            return {
              data: { ...user, name, role: 'siswa', status: 'active', approvalStatus: 'pending' },
            };
          },
        },
        update: {
          before: async (data) => {
            if (
              data.name !== undefined &&
              (data.name.trim().length < 2 || data.name.trim().length > 60)
            ) {
              throw new APIError('BAD_REQUEST', {
                message: 'Nama tampilan harus 2-60 karakter.',
              });
            }
            return { data };
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const user = await db
              .selectFrom('user')
              .select(['status', 'approvalStatus'])
              .where('id', '=', session.userId)
              .executeTakeFirst();
            if (user?.status !== 'active')
              throw new APIError('FORBIDDEN', {
                code: 'ACCOUNT_DISABLED',
                message: 'Akun ini dinonaktifkan.',
              });
            if (user.approvalStatus !== 'approved')
              throw new APIError('FORBIDDEN', {
                code: 'ACCOUNT_PENDING_APPROVAL',
                message:
                  'Akunmu menunggu persetujuan Admin. Kamu dapat masuk setelah akun disetujui.',
              });
            return { data: session };
          },
        },
      },
    },
  });
  return auth;
}
