# Deploy manual RUANGKISAH ke Vercel + Supabase

Panduan untuk kode versi 1.4. Tidak ada deployment, pembelian layanan, atau perubahan database cloud yang dijalankan otomatis. Jalankan dari root proyek D:/PEOJECTTTTTTT/RUANGKISAH. Gunakan Node.js 24.x.

Proyek Supabase yang diberikan: https://veinqenogcvmxdbefhzm.supabase.co — ref veinqenogcvmxdbefhzm. URL ini adalah URL API proyek, **bukan DATABASE_URL PostgreSQL**. Koneksi MCP saat pengerjaan tidak memiliki izin ke proyek ini; migrasi cloud belum dijalankan.

## 1. Ambil koneksi database dan siapkan email

1. Buka proyek Supabase tersebut dan pilih **Connect**.
2. Salin connection string **Session pooler** untuk migrasi/administrasi lokal. Direct connection juga dapat dipakai jika jaringan mendukung koneksi yang diberikan Dashboard.
3. Salin connection string **Transaction pooler** untuk runtime Vercel. Gunakan host, port dan ref persis dari Connect; jangan menebak region. Simpan credential secara privat.
4. Unduh root CA database bila diperlukan dari pengaturan SSL Supabase. Kode memverifikasi sertifikat; jangan mematikan TLS untuk mengatasi error certificate.
5. Siapkan SMTP dari penyedia email Anda dan alamat pengirim yang sudah disetujui. Aplikasi tetap memakai **Better Auth**, sehingga SMTP diatur lewat environment aplikasi, bukan menu Supabase Auth. Akun aplikasi nantinya berada pada schema ruangkisah, bukan auth.users.

## 2. Isi konfigurasi privat lokal

Install dependency dan salin template apabila backend/.env belum ada:

```powershell
npm --prefix backend ci
npm --prefix frontend ci
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.production.example backend/.env }
```

Jika backend/.env sudah ada, pertahankan salinan privatnya sebelum mengedit. File tersebut diabaikan Git. Isi dengan editor lokal, bukan di chat:

| Variabel               | Isi                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| NODE_ENV               | production                                                                                   |
| DATABASE_PROVIDER      | postgres                                                                                     |
| MIGRATION_DATABASE_URL | Koneksi admin Supabase melalui Session pooler/Direct                                         |
| DATABASE_URL           | Sementara dapat memakai koneksi admin untuk setup; diganti runtime pada langkah 4            |
| DATABASE_SSL           | true                                                                                         |
| DATABASE_POOL_MAX      | 1                                                                                            |
| DATABASE_CA_CERT       | Isi PEM root CA dari Supabase jika rantai sertifikat memerlukannya                           |
| AUTH_SECRET            | Secret acak unik minimal 32 karakter; pertahankan stabil antar-deployment                    |
| PUBLIC_URL             | Origin HTTPS situs final, misalnya https://NAMA-PROYEK.vercel.app; tanpa slash/path tambahan |
| MAIL_MODE              | smtp                                                                                         |
| SMTP_URL               | URI SMTP privat milik penyedia Anda                                                          |
| MAIL_FROM              | Alamat pengirim yang disetujui penyedia                                                      |
| SERVE_FRONTEND         | false                                                                                        |
| TRUST_PROXY_HOPS       | 1                                                                                            |

Jangan memakai akun/credential fixture E2E. Jika domain Vercel akhirnya berbeda, ubah PUBLIC_URL ke domain aktual dan redeploy. Percent-encode karakter khusus password pada URI database/SMTP.

## 3. Jalankan migrasi database satu kali

```powershell
npm --prefix backend run db:migrate
```

Migrasi schema 2 membuat/memperbarui schema privat ruangkisah, tabel Better Auth, audit, rate limit bersama, metadata versi, indeks, RLS dan role grup ruangkisah_app. Tabel tidak diberikan kepada anon/authenticated/service_role. Jangan tambahkan schema ini ke daftar schema Data API yang diekspos. Migrasi idempotent dan tidak menghapus tabel/data. Jalankan satu proses migrasi pada satu waktu; ulangi saat versi kode menambah migrasi.

**Perubahan versi 1.4:** akun siswa lama yang belum memiliki persetujuan menjadi pending dan sesinya dicabut. Admin/Superadmin lama tetap disetujui agar bisa meninjau antrean. ID akun dan catatan lokal tidak dihapus; pendaftaran baru selalu pending. Migrasi ulang tidak menyetujui akun baru. Jika memperbarui situs versi lama yang sudah aktif, lakukan cutover dalam jendela pemeliharaan dengan login/pendaftaran ditutup sampai migrasi dan kode baru selesai diterapkan.

Jika ingin membawa akun SQLite lama, lakukan **sebelum bootstrap atau menerima pendaftaran**:

```powershell
npm --prefix backend run db:import-sqlite -- --source "D:/PEOJECTTTTTTT/RUANGKISAH/backend/.data/accounts.sqlite"
```

Impor hanya ke tujuan yang belum memiliki akun/audit. Sumber dibaca read-only; ID, hash sandi, role dan audit dipertahankan; sesi/token lama tidak dipindahkan. Siswa dari sumber lama tanpa approvalStatus tetap memerlukan persetujuan; pengelola lama dipertahankan aksesnya. Impor bukan backup jurnal. Jangan jalankan langkah impor jika ingin mulai dengan database kosong.

## 4. Buat credential runtime terbatas

Isi RUNTIME_DB_PASSWORD secara privat pada backend/.env dengan password database baru minimal 32 karakter, lalu:

```powershell
npm --prefix backend run db:create-runtime
```

Script membuat login ruangkisah_runtime dan memberinya role ruangkisah_app untuk akses tabel aplikasi, tanpa izin membuat schema/tabel atau melewati RLS. Script menolak rotasi otomatis bila role sudah ada.

Ubah DATABASE_URL menjadi URI **Transaction pooler** dengan user runtime. Pada shared pooler, format user umumnya ruangkisah_runtime.veinqenogcvmxdbefhzm; pertahankan host/port/database dari Connect dan gunakan password runtime. Jangan memakai password admin untuk user runtime. MIGRATION_DATABASE_URL tetap hanya pada mesin administrasi lokal.

## 5. Buat Superadmin pertama

Jika mulai dengan database kosong, isi BOOTSTRAP_EMAIL, BOOTSTRAP_PASSWORD unik minimal 12 karakter dan BOOTSTRAP_NAME pada backend/.env, lalu:

```powershell
npm --prefix backend run bootstrap
```

Jika impor sudah membawa Superadmin, lewati bootstrap. Tidak ada akun produksi bawaan. Bootstrap tidak boleh dijadikan endpoint publik atau build command Vercel.

Hapus BOOTSTRAP_PASSWORD dan RUNTIME_DB_PASSWORD dari file setelah setup jika tidak lagi diperlukan. Simpan credential database runtime pada pengelola password/secret yang aman.

## 6. Simpan kode pada repository GitHub

Gunakan repository yang Anda miliki dan push source. Jika belum pernah membuat repo lokal:

```powershell
git init
git add .
git commit -m "Prepare Vercel and Supabase deployment"
git branch -M main
git remote add origin URL_REPOSITORY_ANDA
git push -u origin main
```

Ganti URL_REPOSITORY_ANDA. Jangan commit .env, database SQLite, outbox email atau folder .data. .gitignore proyek sudah menutupi file-file tersebut. Jika repo sudah tersedia, gunakan alur commit/push repo tersebut.

## 7. Import ke Vercel

1. Buka Vercel → **Add New → Project** → import repository tadi.
2. **Root Directory: root repository**, jangan frontend atau backend.
3. Framework: **Other**. Pilih Node.js **24.x**.
4. vercel.json sudah mengatur install/build/output dan routing:
   - Install: npm --prefix backend ci && npm --prefix frontend ci
   - Build: npm run build
   - Output: frontend/dist
   - API: api/index.js, satu origin dengan website.
5. Pilih region fungsi yang dekat dengan database Supabase jika tersedia pada pengaturan akun Anda.

## 8. Isi environment Production Vercel

Masukkan melalui **Project Settings → Environment Variables**, tanpa prefix VITE_:

- NODE_ENV=production
- DATABASE_PROVIDER=postgres
- DATABASE_URL=URI Transaction pooler dengan credential runtime
- DATABASE_SSL=true
- DATABASE_POOL_MAX=1
- DATABASE_CA_CERT=PEM Supabase bila dibutuhkan
- AUTH_SECRET=secret stabil yang sama dengan konfigurasi aplikasi
- PUBLIC_URL=origin HTTPS final
- MAIL_MODE=smtp
- SMTP_URL=credential SMTP
- MAIL_FROM=pengirim yang disetujui
- SERVE_FRONTEND=false
- TRUST_PROXY_HOPS=1

**Jangan masukkan MIGRATION_DATABASE_URL, BOOTSTRAP_PASSWORD, RUNTIME_DB_PASSWORD atau credential admin Supabase ke runtime Vercel.** Tidak diperlukan anon key, publishable key atau service-role Supabase untuk frontend pada arsitektur ini.

Untuk Preview, gunakan database/credential uji terpisah dan AUTH_SECRET uji tersendiri. Jangan memberi Preview akses database produksi. PUBLIC_URL dapat tidak diisi pada Preview agar kode mengambil origin VERCEL_URL deployment; Production harus memakai origin final yang benar.

## 9. Deploy dan periksa hasil

Klik **Deploy**. Jika environment/domain berubah setelah build, lakukan **Redeploy**. Sesudah status Ready:

1. Buka /api/health: harus HTTP 200 dengan ok true. HTTP 503 berarti konfigurasi/koneksi/migrasi belum siap; periksa log Vercel tanpa membagikan secret.
2. Buka /api/me tanpa login: harus 401, bukan halaman HTML.
3. Buka /masuk dan refresh langsung; halaman SPA tidak boleh 404.
4. Coba URL fitur saat guest → harus menuju login.
5. Daftar akun uji → verifikasi email → login harus menampilkan menunggu Admin → pengelola membuka Persetujuan Akun dan menyetujui → login berhasil menuju fitur.
6. Uji lupa sandi dan tautan reset sekali pakai.
7. Login Superadmin, periksa role, nonaktif/hapus akun uji dan pencabutan sesi.
8. Periksa cookie Secure/HttpOnly pada domain HTTPS.
9. Simpan jurnal fiktif, reload, lalu hapus; isi tidak boleh dikirim ke API. Catatan tetap per akun/browser. Catatan localhost tidak muncul otomatis pada domain deployment.

Jangan langsung menghapus data lokal lama setelah deploy. Siapkan backup database akun dan uji restore terisolasi sebelum penggunaan nyata. Review materi BK dan uji siswa/perangkat fisik tetap terpisah dari keberhasilan deployment.

## Rujukan resmi

[Vite di Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Express di Vercel](https://vercel.com/docs/frameworks/backend/express), [koneksi Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres), [Better Auth PostgreSQL/schema privat](https://better-auth.com/docs/adapters/postgresql).
