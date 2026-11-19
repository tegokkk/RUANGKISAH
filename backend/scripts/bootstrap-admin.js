import { createApplication } from '../src/app.js';

const email = process.env.BOOTSTRAP_EMAIL;
const password = process.env.BOOTSTRAP_PASSWORD;
if (!email || !password || password.length < 12)
  throw new Error('Atur BOOTSTRAP_EMAIL dan BOOTSTRAP_PASSWORD unik minimal 12 karakter.');
const service = await createApplication();
try {
  const existing = await service.db
    .selectFrom('user')
    .select('id')
    .where('role', '=', 'superadmin')
    .executeTakeFirst();
  if (existing) throw new Error('Superadmin sudah tersedia. Bootstrap tidak dijalankan ulang.');
  if (
    await service.db
      .selectFrom('user')
      .select('id')
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst()
  )
    throw new Error('Email sudah terdaftar. Gunakan email pengelola baru.');
  const result = await service.auth.api.signUpEmail({
    body: {
      name: process.env.BOOTSTRAP_NAME || 'Pengelola RUANGKISAH',
      email,
      password,
      termsAccepted: true,
    },
  });
  await service.db
    .updateTable('user')
    .set({
      role: 'superadmin',
      approvalStatus: 'approved',
      emailVerified: service.database.boolean(true),
    })
    .where('id', '=', result.user.id)
    .execute();
  console.log('Superadmin dibuat. Gunakan halaman Masuk; credential tidak ditampilkan.');
} finally {
  await service.close();
}
