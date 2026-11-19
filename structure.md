# Struktur Proyek dan Tech Stack - RUANGKISAH.ID

> **Aturan aktif versi 1.4 — persetujuan pengelola:** setiap pendaftaran publik masuk status menunggu persetujuan. Email harus diverifikasi sendiri oleh pengguna, lalu Admin/Superadmin menyetujui akun sebelum login dan aktivitas diizinkan. Persetujuan tidak mengubah verifikasi email atau memberi akses jurnal. Akun siswa lama tanpa persetujuan juga menunggu tinjauan setelah migrasi schema 2; akun pengelola lama dipertahankan agar dapat memproses antrean.

> **Target produksi versi 1.3 — 19 November 2026:** Vercel untuk frontend/API dan PostgreSQL Supabase (ref veinqenogcvmxdbefhzm) untuk akun/sesi/audit. Autentikasi tetap Better Auth dan catatan tetap lokal per akun. SQLite hanya pengembangan lokal. Migrasi dan deploy cloud dilakukan manual mengikuti [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md); hasil tes lokal tidak menyatakan cloud telah aktif.

> **Ketentuan aktif versi 1.2 — 19 November 2026:** login dengan email terverifikasi diwajibkan sebelum menggunakan Kenali Diriku, Jurnal Perasaan, Langkah Berani, Catatan Saya, contoh fiktif, atau pengelolaan data lokal. Beranda, Bantuan, Tentang, Privasi dan halaman autentikasi tetap publik. Ketentuan ini menggantikan aturan akun opsional pada versi sebelumnya. Catatan tetap lokal, dipisahkan menurut akun; tidak diunggah ke server. Catatan lama dipindahkan hanya melalui konfirmasi di Privasi.

**Versi:** 1.1  
**Tanggal:** 19 November 2026  
**Acuan:** [PRD.md](./PRD.md), [design.md](./design.md), [keputusan terbaru](./docs/DECISIONS.md).

## 1. Arsitektur aktif

Dua folder aplikasi utama adalah **frontend** dan **backend**. Platform untuk siswa/siswi lintas sekolah. Login wajib untuk aktivitas refleksi dan catatan; informasi bantuan/privasi tetap publik.

- Frontend: React + JavaScript + Vite + React Router + CSS Modules.
- Backend: Node.js + Express + Better Auth + Kysely/PostgreSQL Supabase; SQLite hanya lokal.
- Akun/sesi/otorisasi/audit pengelola berada di server.
- Jawaban refleksi, jurnal, dan target tetap pada memori/browser pengguna. Tidak ada API atau tabel isi jurnal.
- Database akun tidak mengimpor akun simulasi localStorage lama; tidak ada credential pengelola produksi bawaan.

## 2. Tech stack

| Lapisan                   | Teknologi                                      | Pemakaian                                                         |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Bahasa                    | JavaScript ES Modules                          | .js untuk logika dan .jsx untuk React                             |
| Runtime                   | Node.js >=24.15.0, diuji 24.21.0               | Dev server, build, dan backend                                    |
| UI                        | React + React DOM                              | Komponen, form, dialog, halaman                                   |
| Routing                   | React Router                                   | Public/auth/protected routes                                      |
| Build                     | Vite                                           | Dev server/proxy dan build SPA                                    |
| Styling                   | CSS Modules + CSS custom properties            | Token design.md dan gaya lokal                                    |
| Motion                    | CSS keyframes/transitions + Web Animations API | Perpindahan pendek, reveal sekali, reduced motion                 |
| State                     | React Hooks/Context                            | Draf, dialog, sesi server, demo terpisah                          |
| HTTP client               | Native fetch                                   | Hanya akun/admin; credentials: include                            |
| HTTP server               | Express                                        | Better Auth handler, API admin, static SPA                        |
| Auth                      | Better Auth                                    | Password hash, verifikasi/reset, sesi cookie HttpOnly             |
| Database                  | PostgreSQL (pg) + Kysely                       | Schema privat akun/sesi/verifikasi/audit pada Supabase            |
| Email                     | Nodemailer SMTP; outbox privat untuk lokal     | Tidak ada token simulasi pada UI                                  |
| Header/rate limit         | Helmet + rate limit database atomik            | Same-origin mutation, header keamanan dan limit                   |
| Data jurnal               | Repository localStorage/memory                 | Validasi runtime, konfirmasi simpan dan koordinasi tab            |
| Koordinasi browser        | Web Locks / transaksi IndexedDB store kosong   | Tidak menyimpan draf atau credential pada IndexedDB               |
| Font/ikon                 | Manrope lokal + SVG lokal                      | Tidak memakai CDN dari ekspor Stitch                              |
| Unit/integrasi frontend   | Vitest + Testing Library + jsdom               | Perilaku form, data, dan client API                               |
| Backend test              | Node.js test runner + HTTP nyata               | RBAC, sesi, reset, consent, penghapusan                           |
| Browser                   | Playwright; axe-core                           | Chromium, smoke Firefox/WebKit mobile, aksesibilitas otomatis     |
| Kualitas                  | ESLint + Prettier + lockfile npm               | Versi kompatibel dikunci                                          |
| Deployment yang disiapkan | Vercel + PostgreSQL Supabase                   | Frontend/API satu origin, pooler PostgreSQL dan migrasi eksplisit |

Versi dependency aktual mengikuti package-lock.json masing-masing aplikasi. Gunakan npm ci. Kedua aplikasi memiliki package.json sendiri; belum diperlukan package workspace di root.

## 3. Struktur utama

```text
RUANGKISAH/
  frontend/
    public/
    src/
      app/
        App.jsx
        AppProviders.jsx
        RootLayout.jsx
        router.jsx
      assets/
        icons/
        illustrations/
      components/
        layout/
        reflection/
        ui/
      features/
        auth/
          AuthContext.js
          AuthProvider.jsx
          ProtectedRoute.jsx
          LoginPage.jsx
          RegisterPage.jsx
          ForgotPasswordPage.jsx
          ResetPasswordPage.jsx
          AccountPage.jsx
          UnauthorizedPage.jsx
          components/
        admin/
          AdminPanelPage.jsx
          components/
        self-reflection/
        feeling-journal/
        courage-goals/
        saved-records/
        help/
        privacy/
        demo/
          AppDataContext.js
          DemoProvider.jsx
          DemoBanner.jsx
          fixtures.js
      content/
      config/
      data/
        authStore.js
        schema.js
        validators.js
        recordsRepository.js
        localStorageAdapter.js
        memoryAdapter.js
        writeCoordinator.js
      hooks/
        usePresence.js
        useUnsavedDraftGuard.js
      styles/
      utils/
      main.jsx
    tests/
      unit/
      integration/
      e2e/
      setup.js
    package.json
    package-lock.json
    vite.config.js
    vitest.config.js
    playwright.config.js
    eslint.config.js
    .env.example
    .node-version
    README.md
  backend/
    src/
      app.js
      auth.js
      config.js
      mail.js
      server.js
    scripts/
      bootstrap-admin.js
      serve-local.js
      e2e-server.js
    tests/
      accounts.test.js
    package.json
    package-lock.json
    eslint.config.js
    .env.example
    .node-version
    README.md
  docs/
    design-references/
    deployment/
    evaluation/
    testing/
    DECISIONS.md
  .github/workflows/verify.yml
  Dockerfile
  compose.yaml
  .dockerignore
  .gitignore
  PRD.md
  design.md
  structure.md
  TASKLIST.md
  AUDIT.md
  README.md
```

Folder .data, node_modules, dist, laporan tes otomatis dan secret tidak dicommit. Ekspor Stitch dan PDF proposal yang sudah ada tetap menjadi sumber, tidak dimasukkan ke bundle produksi.

## 4. Tanggung jawab frontend

- app: komposisi provider, shell, routing, judul halaman/fokus.
- components/ui: kontrol generik tanpa akses langsung ke storage/API domain.
- components/layout: header/menu/footer dan container responsif.
- components/reflection: step indicator, rangkuman, daftar aman, dialog dan status penyimpanan.
- features: halaman dan alur domain; komponen khusus tetap dekat fitur terkait.
- content: pertanyaan/contoh/FAQ dan versi; tidak berisi jawaban siswa.
- config: konfigurasi publik dan kontak opsional.
- data: repository catatan tervalidasi, adapter, koordinasi tab, serta client API akun.
- styles: token/global/font; CSS Modules dekat komponen.
- hooks/utils: logika bersama kecil yang benar-benar dipakai ulang.

## 5. Route dan otorisasi

| Route                               | Akses / pemilik                                             |
| ----------------------------------- | ----------------------------------------------------------- |
| /                                   | Beranda publik                                              |
| /kenali-diriku                      | SelfReflectionPage; publik                                  |
| /jurnal-perasaan                    | FeelingJournalPage; publik                                  |
| /langkah-berani                     | CourageGoalsPage; publik                                    |
| /catatan-saya                       | SavedRecordsPage; catatan browser, tidak dikunci oleh login |
| /pusat-bantuan                      | HelpPage; publik lintas sekolah                             |
| /privasi                            | PrivacyPage; ketentuan dan kontrol data lokal               |
| /tentang                            | AboutPage                                                   |
| /masuk, /daftar                     | Login/Register                                              |
| /lupa-kata-sandi, /reset-kata-sandi | Pemulihan via email server                                  |
| /akun                               | Sesi terverifikasi                                          |
| /admin                              | Admin/Superadmin                                            |
| /superadmin                         | Superadmin                                                  |
| /tidak-diizinkan                    | Penjelasan akses                                            |
| \*                                  | Halaman tidak ditemukan                                     |

ProtectedRoute membantu navigasi UI; otorisasi nyata tetap dilakukan server. ID/isi catatan tidak berada di URL. Token reset dari email ditangkap di memori lalu dibersihkan dari address bar. Demo merupakan state terisolasi, bukan akun atau route siswa baru.

## 6. Alur data

```text
Refleksi -> draf memori -> validasi -> rangkuman -> konfirmasi
  -> repository -> koordinasi tab -> localStorage

Demo -> repository memory terpisah -> simulasi berlabel

Akun -> fetch same-origin -> Vercel/Express/Better Auth -> PostgreSQL Supabase
  -> cookie sesi HttpOnly -> UI profil/panel berdasarkan hasil server
```

Simpan/edit/hapus memakai satu jalur repository. Web Locks menyerialisasi operasi; fallback memakai transaksi IDB readwrite pada store kosong. Jika koordinasi tidak tersedia, operasi gagal tertutup dan draf dipertahankan.

Backend tidak menerima isi jurnal. Admin hanya melihat akun siswa; Superadmin dapat mengatur Admin dan membaca audit. Perubahan status/peran atau penghapusan mencabut sesi target. Akun Superadmin dilindungi. Tidak ada endpoint publik bootstrap atau pendaftaran role pengelola.

## 7. Konfigurasi dan script

- Vite dev 5173 meneruskan /api ke backend 4000; API_PROXY_TARGET dapat mengubah target.
- npm --prefix backend run start:local menyajikan build frontend dan API di localhost:4000.
- PUBLIC_URL produksi harus HTTPS; AUTH_SECRET unik, SMTP_URL, MAIL_FROM, dan disk persisten wajib.
- MAIL_MODE=file hanya lokal; backend/.data/mail tidak tersedia melalui HTTP.
- TRUST_PROXY_HOPS=1 hanya untuk satu reverse proxy tepercaya; port backend tidak dipublikasikan langsung.
- Script aktif dijelaskan pada README masing-masing aplikasi.
- E2E otomatis membuild UI, menjalankan fixture backend pada 4001, serta memakai database/outbox terisolasi. Fixture tidak boleh dipakai pada produksi.

## 8. Konvensi dan batas

PascalCase.jsx untuk komponen, useNamaHook.js untuk hook, kebab-case untuk folder fitur, CSS Modules dekat komponen. Validasi runtime tetap diperlukan untuk input dan data lokal. Font/ikon/artwork memiliki asal yang jelas.

Target aktif adalah Vercel + PostgreSQL Supabase; Docker/Compose hanya alternatif. Konfigurasi cloud/HTTPS/SMTP belum diverifikasi. SQLite hanya untuk pengembangan lokal. Sinkronisasi jurnal, konsultasi, chat, dan akses Guru BK ke jurnal tetap di luar cakupan aktif.

Dokumentasi primer: [React](https://react.dev/learn), [Vite](https://vite.dev/guide/), [Better Auth Express](https://better-auth.com/docs/integrations/express), [SQLite](https://better-auth.com/docs/adapters/sqlite), [Playwright](https://playwright.dev/docs/intro).

## Modul versi 1.2

- frontend/src/components/layout/PageHeader: header halaman bersama.
- frontend/src/hooks/useHeadingFocus dan useOpenDemo: orientasi state dan demo setelah login.
- frontend/src/config/motionConfig.js: motion dari token CSS.
- frontend/src/data/localStorageAdapter.js: factory adapter/key akun; migrateLegacyRecords.js: pemindahan terkonfirmasi.
- frontend/src/app/router.jsx: guard fitur dan modul halaman lazy; fallback pada RootLayout.
- frontend/tests/e2e/fixtures.js: sesi server uji; loginRequired.spec.js dan uiAuditFixes.spec.js: regresi akses/akun/UI.
- docs/ui/system.md dan docs/testing/2026-11-19-ui-login-verification.md: aturan UI dan bukti versi 1.2.

## Penambahan persetujuan akun — versi 1.4

- backend/src/auth.js: additional field approvalStatus non-editable dari client; hook sesi memeriksa persetujuan.
- backend/src/app.js: status efektif, guard sesi/pengelola dan endpoint approval dengan audit/transaksi.
- backend/src/schema.js: schema version 2 dan migrasi izin siswa/pengelola lama yang idempotent.
- frontend/src/features/admin: antrean dan dialog persetujuan; frontend/src/data/authStore.js serta AuthProvider: normalisasi dan gate akun disetujui.
- backend/tests/approval-migration.test.js dan frontend/tests/e2e/accountApproval.spec.js: regresi upgrade serta alur persetujuan desktop/mobile.
