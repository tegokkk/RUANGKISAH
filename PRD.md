# PRD - RUANGKISAH.ID

> **Aturan aktif versi 1.4 — persetujuan pengelola:** setiap pendaftaran publik masuk status menunggu persetujuan. Email harus diverifikasi sendiri oleh pengguna, lalu Admin/Superadmin menyetujui akun sebelum login dan aktivitas diizinkan. Persetujuan tidak mengubah verifikasi email atau memberi akses jurnal. Akun siswa lama tanpa persetujuan juga menunggu tinjauan setelah migrasi schema 2; akun pengelola lama dipertahankan agar dapat memproses antrean.

> **Target produksi versi 1.3 — 19 November 2026:** Vercel untuk frontend/API dan PostgreSQL Supabase (ref veinqenogcvmxdbefhzm) untuk akun/sesi/audit. Autentikasi tetap Better Auth dan catatan tetap lokal per akun. SQLite hanya pengembangan lokal. Migrasi dan deploy cloud dilakukan manual mengikuti [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md); hasil tes lokal tidak menyatakan cloud telah aktif.

> **Ketentuan aktif versi 1.2 — 19 November 2026:** login dengan email terverifikasi diwajibkan sebelum menggunakan Kenali Diriku, Jurnal Perasaan, Langkah Berani, Catatan Saya, contoh fiktif, atau pengelolaan data lokal. Beranda, Bantuan, Tentang, Privasi dan halaman autentikasi tetap publik. Ketentuan ini menggantikan aturan akun opsional pada versi sebelumnya. Catatan tetap lokal, dipisahkan menurut akun; tidak diunggah ke server. Catatan lama dipindahkan hanya melalui konfirmasi di Privasi.

**Program:** Selfcare-BK (Self Awareness and Confidence Reflection)  
**Versi:** 1.1  
**Tanggal:** 19 November 2026  
**Status:** Rancangan kebutuhan produk untuk implementasi; belum merupakan hasil validasi ahli atau persetujuan sekolah.  
**Bahasa produk:** Bahasa Indonesia.  
**Rilis yang direncanakan:** Prototipe web fungsional untuk demonstrasi dan uji terbatas, dengan jalur pengembangan lanjutan yang terpisah.

## Perubahan kebutuhan aktif - 19 November 2026

Arahan pengguna terbaru berlaku untuk implementasi saat ini:

- Platform untuk siswa/siswi lintas sekolah; tidak terikat satu institusi dan tidak meminta sekolah saat mendaftar.
- Akun, verifikasi email, login, pemulihan, Admin dan Superadmin merupakan cakupan aktif; login wajib sebelum memakai fitur.
- Akun/sesi dikelola backend Express + Better Auth + SQLite. Simulasi akun localStorage dihentikan; tidak ada akun produksi dengan kata sandi bawaan.
- Jurnal, jawaban, dan target tetap lokal; tidak diunggah atau dapat dibaca pengelola platform.
- Email lokal memakai outbox privat server; produksi memerlukan SMTP. Tidak ada tombol verifikasi atau token reset simulasi di UI.
- Kontak satu sekolah bukan prasyarat platform umum. Pusat Bantuan memberi arahan universal; kontak platform hanya ditampilkan bila benar-benar tersedia.
- Animasi halus, reduced motion, dan filter metadata catatan termasuk penyempurnaan yang dikerjakan.
- Bagian yang membahas batas UTS/proposal SMA merupakan konteks sumber historis. Ketentuan lama yang menunda akun/backend digantikan oleh perubahan aktif ini.
- Telaah materi, uji manusia/perangkat fisik, SMTP nyata, dan publikasi hosting tidak dianggap selesai tanpa bukti. Lihat AUDIT.md untuk status aktual.

## 1. Ringkasan produk

RUANGKISAH.ID adalah website pendamping layanan Bimbingan dan Konseling (BK) bagi siswa/siswi lintas sekolah. Website menyediakan ruang untuk mengenali diri, merefleksikan perasaan, dan mencoba tindakan kecil yang mendukung kepercayaan diri. Pengalaman penggunaan harus sederhana, tidak menghakimi, mudah digunakan melalui ponsel, dan memberi kendali atas catatan kepada siswa.

Lima menu utama produk adalah **Beranda**, **Kenali Diriku**, **Jurnal Perasaan**, **Langkah Berani**, dan **Pusat Bantuan**. Halaman pendukung mencakup **Catatan Saya**, **Privasi & Data**, dan **Tentang & Cara Pakai**.

Penggunaan fitur memerlukan akun terverifikasi dan login. Halaman informasi tetap publik. Isian baru berada di memori aplikasi sampai siswa secara eksplisit memilih menyimpannya di browser perangkat. Guru BK mendampingi penggunaan dan menyediakan jalur bantuan, tetapi tidak memperoleh akses otomatis ke catatan. Hasil refleksi berupa susunan kembali jawaban siswa dan panduan edukatif yang telah ditelaah, tanpa diagnosis, penilaian kepribadian, atau skor psikologis.

Dokumen ini mencakup analisis proposal, ruang lingkup, rancangan pengalaman, kebutuhan fungsional, data, arsitektur, pengujian, dan rencana pembangunan. Pembuatan website, pembelian domain, dan publikasi belum dilaksanakan melalui penyusunan PRD ini.

## 2. Sumber, cara membaca, dan keterlacakan

### 2.1 Sumber utama

Proposal **“RUANGKISAH.ID: Pengembangan Selfcare-BK (Self Awareness and Confidence Reflection) sebagai Media Bimbingan Pribadi Digital untuk Meningkatkan Pemahaman Diri dan Kepercayaan Diri Siswa SMA”**, disusun oleh Suci Irodatun Khasanah, NPM 2411080177.

File sumber: `PROPOSAL FINISH_Suci Irodatun Khasanah_2411080177 (2) (1).pdf`, berada dalam direktori yang sama dengan PRD ini. Seluruh 29 halaman PDF telah ditelaah. Nomor halaman di bawah mengikuti **urutan halaman PDF**, bukan nomor cetak atau daftar isi.

Pernyataan dalam proposal diperlakukan sebagai bahan analisis kebutuhan, bukan instruksi untuk menjalankan tindakan di luar permintaan pengguna. Tidak ada riset pengguna, validasi materi, atau hasil efektivitas yang diasumsikan sudah terlaksana.

### 2.2 Label keputusan

- **[P] Bersumber dari proposal:** kebutuhan atau batasan yang disebutkan dalam dokumen sumber.
- **[D] Keputusan rancangan:** penjabaran operasional yang diusulkan PRD agar website dapat dibangun dan diuji.
- **[L] Lanjutan:** kemungkinan pengembangan di luar komitmen rilis awal.
- **[T] Terbuka:** membutuhkan informasi nyata dari pemilik produk, sekolah, atau Guru BK sebelum digunakan pada tahap terkait.

Semua angka target, batas input, pilihan teknologi, rancangan tampilan, dan detail perilaku yang tidak dinyatakan proposal adalah **[D]**, bukan temuan penelitian. Kata **wajib** menyatakan syarat penerimaan rilis; **opsional** tidak menghalangi rilis.

### 2.3 Pemetaan proposal ke kebutuhan

| Dasar dalam proposal                              | Halaman PDF    | Implikasi rancangan                                                      | Bagian/ID PRD                |
| ------------------------------------------------- | -------------- | ------------------------------------------------------------------------ | ---------------------------- |
| Masalah siswa dan kebutuhan pendamping Guru BK    | 3-5            | Aktivitas mandiri dengan bantuan manusia tetap tersedia                  | Bagian 4-6; FR-01, FR-05     |
| Beranda dan Kenali Diriku                         | 6              | Pengenalan produk dan pertanyaan potensi, minat, kekuatan, nilai, tujuan | FR-01, FR-02                 |
| Jurnal dengan pilihan tidak menyimpan             | 6-7, 12        | Default sementara; simpan lokal hanya atas tindakan siswa                | FR-03, FR-06                 |
| Langkah Berani dan Pusat Bantuan                  | 7, 16-17       | Target kecil, refleksi pengalaman, tautan Guru BK                        | FR-04, FR-05                 |
| Tidak wajib akun, data fiktif untuk demonstrasi   | 7, 12          | Versi 1.2 mewajibkan login; akun server terpisah dari isi catatan lokal  | FR-00, FR-09                 |
| Bukan diagnosis dan belum membuktikan efektivitas | 7-8, 10-11, 20 | Tanpa label psikologis atau klaim peningkatan yang terbukti              | Bagian 4, 12, 18             |
| Kerahasiaan, persetujuan, aksesibilitas           | 12-13          | Penjelasan data, kontrol hapus, antarmuka yang dapat diakses             | FR-06, FR-08; NFR-01, NFR-03 |
| Model ADDIE dan tahapan pengembangan              | 14-15          | Analisis, desain, pembangunan, uji, revisi                               | Bagian 20                    |
| Rangkuman, simpan lokal, hapus                    | 16             | Rangkuman berbasis jawaban dan pengelolaan catatan                       | FR-02 sampai FR-07           |
| Uji fungsi dan evaluasi terbatas                  | 17-19          | Skenario penerimaan, observasi, evaluasi deskriptif                      | Bagian 18-19                 |
| Angket kebutuhan, checklist, tanggapan siswa      | 23-28          | Instrumen evaluasi terpisah dari jurnal pribadi                          | Bagian 18                    |
| Contoh tampilan pada tablet dan ponsel            | 29             | Arah responsif; bukan wireframe final RUANGKISAH                         | Bagian 11                    |

## 3. Analisis proposal dan keputusan penyelarasan

### 3.1 Kekuatan rancangan awal

1. **Masalah dan sasaran jelas.** Proposal menghubungkan kebutuhan mengenali potensi, merefleksikan pengalaman, dan mencoba tindakan dengan situasi sehari-hari siswa.
2. **Fitur inti saling melengkapi.** Kenali Diriku berfokus pada pemahaman diri; Jurnal Perasaan pada pengalaman emosional; Langkah Berani pada tindakan bertahap.
3. **Batas layanan dijelaskan.** Produk mendampingi Guru BK dan tidak dimaksudkan menggantikan konseling atau melakukan diagnosis.
4. **Privasi menjadi bagian kebutuhan.** Tidak mewajibkan identitas, memungkinkan penggunaan tanpa menyimpan, dan mengarahkan demonstrasi memakai data fiktif.
5. **Evaluasi awal realistis.** Proposal memprioritaskan fungsi, keterbacaan, materi, dan kemudahan penggunaan sebelum klaim efektivitas.

### 3.2 Ketidakselarasan dan cara menanganinya

| Temuan                                                                                                          | Analisis                                                                                                | Keputusan PRD                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Konsultasi anonim disebut di latar belakang, tetapi spesifikasi rinci hanya memberi rujukan Guru BK             | Belum ada alur pesan, penanggung jawab, waktu respons, atau prosedur layanan                            | **[D]** Rilis awal memakai Pusat Bantuan dan tautan kontak. Konsultasi dalam aplikasi menjadi **[L]**                               |
| Tujuan menyebut integrasi pemantauan Guru BK; batas prototipe menyebut tanpa login server dan penyimpanan lokal | Pemantauan individual otomatis tidak konsisten dengan batas data awal                                   | **[D]** Pendampingan dilakukan di luar sistem; tidak ada dashboard siswa bagi Guru BK pada rilis awal                               |
| Istilah asesmen tingkat pemahaman diri muncul di awal; bagian berikutnya menolak skor diagnostik                | Instrumen terstandardisasi, skoring, dan interpretasi belum disediakan                                  | **[D]** Kenali Diriku menjadi refleksi terstruktur; tidak membuat skor, kategori rendah/tinggi, atau kesimpulan psikologis          |
| Checklist menyebut jurnal tersimpan di Local Storage, sedangkan spesifikasi mengizinkan tidak menyimpan         | Penyimpanan tidak boleh terjadi otomatis                                                                | **[D]** Kedua skenario harus lulus uji: tidak menyimpan dan menyimpan atas pilihan eksplisit                                        |
| Proposal tahap UTS berupa rancangan dan persiapan prototipe                                                     | Pengguna kini memerlukan landasan membangun website                                                     | **[D]** PRD memperluas detail menjadi prototipe fungsional yang dapat diuji; tidak mengubahnya menjadi sistem konseling penuh       |
| Makna anonim belum dijabarkan                                                                                   | Tanpa akun di website tidak menjamin anonim saat membuka WhatsApp/email                                 | **[D]** Login wajib untuk aktivitas; jangan menjanjikan anonimitas kanal luar; tampilkan pemberitahuan sebelum meninggalkan website |
| Mockup halaman 29 menampilkan antarmuka bermerek Clymb dan menu berbahasa Inggris                               | Belum merupakan desain layar spesifik RUANGKISAH                                                        | **[D]** Ambil arah tata letak responsif sebagai inspirasi; buat identitas, naskah, dan aset sendiri                                 |
| Penomoran bagian/daftar isi dan daftar pustaka belum rapi; halaman daftar isi tidak seluruhnya cocok dengan PDF | Pelacakan harus menghindari nomor halaman yang menyesatkan; kajian sumber belum diverifikasi independen | **[D]** Gunakan urutan PDF sebagai rujukan; validasi ilmiah terpisah dari implementasi                                              |

### 3.3 Informasi yang belum tersedia

Proposal belum menetapkan naskah pertanyaan final, identitas sekolah pilot, kontak/jam layanan Guru BK, jumlah peserta uji, ambang kelayakan final, domain yang sudah dimiliki, biaya hosting, penanggung jawab pemeliharaan, dan kebijakan penyimpanan operasional. PRD memberi default teknis untuk prototipe; informasi institusional tetap dicatat sebagai **[T]**, bukan diisi dengan fakta rekaan.

## 4. Tujuan, hasil yang diharapkan, dan batas produk

### 4.1 Tujuan rilis awal

| ID   | Tujuan                                                              | Bukti penerimaan                                                                        |
| ---- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| G-01 | Siswa dapat mengakses tiga aktivitas inti dari ponsel setelah login | Alur inti memerlukan login terverifikasi; NISN, sekolah dan nomor telepon tidak diminta |
| G-02 | Siswa memahami petunjuk dan dapat melihat rangkuman                 | Rangkuman mencerminkan isian sendiri; pertanyaan boleh dilewati                         |
| G-03 | Siswa mengendalikan penyimpanan dan penghapusan                     | Tidak ada isian tersimpan permanen sebelum tindakan simpan; hapus teruji                |
| G-04 | Siswa dapat menemukan cara meminta bantuan                          | Pusat Bantuan tersedia dari seluruh halaman utama                                       |
| G-05 | Prototipe dapat dievaluasi secara terbatas                          | Checklist, skenario tugas, catatan masalah, dan hasil revisi tersedia                   |

### 4.2 Hasil yang diharapkan dan batas klaim

**[P]** Manfaat yang diharapkan adalah kesempatan memahami diri dan melatih kepercayaan diri. Keberhasilan rilis awal dinilai dari fungsi dan kelayakan penggunaan, bukan perubahan psikologis yang sudah terbukti.

Website tidak boleh menyebut “terbukti meningkatkan kepercayaan diri”, “mendeteksi gangguan”, atau “menjamin kerahasiaan mutlak”. Hasil uji kecil tidak dapat digunakan untuk menyimpulkan efektivitas intervensi. Evaluasi efektivitas memerlukan rancangan penelitian tersendiri.

### 4.3 Di luar ruang lingkup rilis awal

- Diagnosis, tes klinis, skoring psikologis, rekomendasi terapi, atau prediksi kondisi siswa.
- Konseling/chat langsung, chatbot AI, analisis otomatis isi jurnal, dan deteksi risiko otomatis.
- Sinkronisasi jurnal antarperangkat, database isi refleksi di server, dan dashboard pemantauan jurnal individual.
- Unggah foto/audio/video, komunitas publik, komentar, dan berbagi jurnal otomatis.
- Peringkat, kompetisi, streak yang menghukum, notifikasi push, dan pembayaran.
- Form survei yang mengirim jawaban siswa ke server, integrasi LMS, PWA offline penuh, dan ekspor/impor catatan.

Fitur di atas tidak dibuat sebagai tombol kosong yang seolah sudah berfungsi. Jika dijelaskan dalam dokumentasi roadmap, tandai sebagai rencana.

## 5. Pengguna dan tanggung jawab

Persona berikut adalah **[D] hipotesis desain**, bukan hasil wawancara.

| Pengguna/pihak                      | Kebutuhan                                                                                             | Kewenangan pada rilis awal                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Siswa/siswi lintas sekolah          | Mulai tanpa rasa dihakimi; mengisi atau melewati pertanyaan; mengendalikan catatan                    | Membuat, membaca, memperbarui, dan menghapus data pada browser yang dipakai    |
| Guru BK                             | Memberi arahan, memeriksa kesesuaian materi, menerima permintaan bantuan melalui kanal yang disetujui | Menelaah materi dan mendampingi di luar sistem; tidak otomatis membaca jurnal  |
| Pemilik produk/mahasiswa pengembang | Menerjemahkan proposal menjadi produk dan dokumentasi                                                 | Mengelola backlog, konten, dan proses pengembangan                             |
| Ahli materi BK                      | Menilai relevansi, keterbacaan, dan batas layanan                                                     | Menelaah materi dan mencatat revisi di luar aplikasi                           |
| Ahli media/penguji                  | Memeriksa fungsi, aksesibilitas, dan pengalaman                                                       | Menguji dengan data fiktif; tidak mengakses catatan siswa untuk debugging      |
| Sekolah/pengelola pilot             | Menentukan izin, kontak layanan, dan tata cara uji                                                    | Menentukan penggunaan operasional; tidak memperoleh akses data melalui hosting |

Akun memiliki peran Siswa, Admin, dan Superadmin yang diverifikasi server; hak mengelola akun tidak memberi akses jurnal. Orang lain yang memakai profil browser yang sama mungkin dapat membuka catatan lokal; hal ini wajib dijelaskan sebelum penyimpanan.

## 6. Ruang lingkup dan prioritas

**P0:** wajib agar rilis dapat diterima. **P1:** penyempurnaan setelah P0, dapat ditunda. **P2:** rilis lanjutan, tidak masuk estimasi lima minggu.

| ID     | Kebutuhan                                                 | Prioritas | Asal                      |
| ------ | --------------------------------------------------------- | --------- | ------------------------- |
| FR-00  | Login wajib dan pemberitahuan awal                        | P0        | [P]/[D]                   |
| FR-01  | Beranda dan navigasi responsif                            | P0        | [P]                       |
| FR-02  | Kenali Diriku dan rangkuman                               | P0        | [P]/[D]                   |
| FR-03  | Jurnal Perasaan                                           | P0        | [P]/[D]                   |
| FR-04  | Langkah Berani beserta perkembangan target                | P0        | [P]/[D]                   |
| FR-05  | Pusat Bantuan dan kontak terkonfigurasi                   | P0        | [P]/[D]                   |
| FR-06  | Pilihan simpan lokal, penjelasan data, dan hapus          | P0        | [P]/[D]                   |
| FR-07  | Catatan Saya untuk membuka/memperbarui catatan            | P0        | [D] pendukung penyimpanan |
| FR-08  | Tentang, cara pakai, privasi, dan batas layanan           | P0        | [P]/[D]                   |
| FR-09  | Mode demonstrasi dengan data fiktif                       | P0        | [P]/[D]                   |
| ENH-01 | Filter catatan berdasarkan jenis dan tanggal              | P1        | [D]                       |
| ENH-02 | Materi tambahan pendek yang ditelaah Guru BK              | P1        | [D]                       |
| FUT-01 | Konsultasi dalam aplikasi dengan tata kelola layanan      | P2        | [L]                       |
| FUT-02 | Akun, penyimpanan server, dan sinkronisasi                | P2        | [L]                       |
| FUT-03 | Fasilitas Guru BK berbasis izin dan kebutuhan tervalidasi | P2        | [L]                       |

## 7. Arsitektur informasi dan rancangan halaman

URL berikut merupakan **[D]** kontrak navigasi; seluruh halaman dapat dibuka langsung dan di-refresh.

| Halaman/route           | Isi dan komponen utama                                                                          | Aksi utama                               |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `/`                     | Identitas produk, manfaat, tiga kartu aktivitas, cara pakai ringkas, ringkasan privasi, bantuan | Mulai refleksi; pilih aktivitas          |
| `/kenali-diriku`        | Tujuan, estimasi waktu, pertanyaan bertahap, indikator langkah                                  | Isi/lewati; lihat rangkuman              |
| `/jurnal-perasaan`      | Pilihan perasaan berlabel, tanggal, pertanyaan terbimbing, catatan                              | Lihat rangkuman; simpan atau akhiri      |
| `/langkah-berani`       | Penjelasan target kecil, contoh latihan, target baru, daftar target lokal                       | Buat target; perbarui status             |
| `/catatan-saya`         | Penjelasan lokasi data, daftar ringkas, keadaan kosong, tautan kelola data                      | Buka; ubah; hapus catatan                |
| `/pusat-bantuan`        | Cara pakai, batas layanan, kontak/jam Guru BK, pilihan bantuan langsung                         | Lihat detail; lanjutkan ke kanal luar    |
| `/privasi`              | Data yang dipakai, mode sementara/lokal, risiko perangkat bersama, kontrol hapus                | Hapus semua; kembali tanpa mengubah data |
| `/tentang`              | Tujuan Selfcare-BK, sasaran pengguna, cara penggunaan, peran Guru BK                            | Mulai aktivitas; cari bantuan            |
| Halaman tidak ditemukan | Pesan singkat dan tautan aman                                                                   | Kembali ke Beranda                       |

Rangkuman dan detail catatan ditampilkan sebagai state di halaman modul atau Catatan Saya. ID lokal yang acak boleh dipakai untuk navigasi, tetapi isi jawaban, perasaan, tanggal pribadi, dan target tidak boleh masuk URL atau judul tab. Judul dokumen cukup menyebut nama halaman dan RUANGKISAH.

Pada desktop, navigasi utama tampil di header; Catatan Saya menjadi tautan utilitas. Pada ponsel, sediakan menu ringkas dengan label teks untuk lima halaman utama, tautan Catatan Saya, dan akses bantuan yang terlihat. Jika memakai bilah bawah, tinggi bilah harus diperhitungkan agar tidak menutup form, tombol, atau fokus keyboard.

## 8. Alur pengguna

### 8.1 Penggunaan pertama dan mode sementara

1. Siswa membuka Beranda dan melihat pengenalan serta pemberitahuan: login wajib untuk fitur; catatan belum disimpan; perangkat bersama memiliki risiko jika memilih simpan.
2. Siswa memilih satu aktivitas; tidak ada persetujuan pengumpulan data server karena fitur tersebut tidak tersedia.
3. Petunjuk menjelaskan bahwa pertanyaan boleh dilewati dan aktivitas bisa dihentikan.
4. Siswa mengisi, meninjau, lalu melihat rangkuman pada perangkat.
5. Siswa dapat kembali mengubah jawaban, memilih **Simpan di perangkat ini**, atau **Akhiri tanpa menyimpan**.
6. Akhiri tanpa menyimpan membersihkan state isian sementara dan menampilkan konfirmasi yang jujur. Refresh meniadakan draf sementara.

### 8.2 Simpan dan buka kembali

1. Dari rangkuman/target, siswa menekan **Simpan di perangkat ini**.
2. Dialog menjelaskan lokasi, siapa yang mungkin bisa membuka, lama simpan, dan cara hapus. Dialog tidak tercentang otomatis.
3. Jika setuju dan penyimpanan berhasil, tampilkan **Tersimpan di browser perangkat ini** serta tautan Catatan Saya.
4. Jika batal atau gagal, data tetap sementara; tidak ada pesan berhasil.
5. Saat membuka kembali, daftar tidak menampilkan isi jurnal. Pengguna memilih catatan untuk melihat detail.
6. Setiap perubahan catatan lama hanya dipersistenkan saat menekan **Simpan perubahan**. Tidak ada autosave.

### 8.3 Latihan keberanian bertahap

1. Siswa membaca contoh lalu memilih atau menulis target kecil sendiri.
2. Siswa mengisi tindakan pertama dan, jika diinginkan, tanggal serta dukungan yang diperlukan.
3. Target bisa dicoba sementara atau disimpan untuk dibuka lagi pada perangkat yang sama.
4. Siswa memperbarui status menjadi **Sedang dicoba**, **Selesai dicoba**, atau **Ditunda**, kemudian memilih menyimpan perubahan.
5. Setelah mencoba, siswa dapat menulis pengalaman dan menentukan langkah berikutnya. Penundaan tidak menghasilkan hukuman atau label gagal.

### 8.4 Meminta bantuan

1. Dari halaman mana pun siswa membuka **Butuh Bantuan?**.
2. Pusat Bantuan menampilkan peran Guru BK, jam layanan, dan kontak yang sudah disetujui sekolah.
3. Sebelum membuka WhatsApp/email, tampilkan pemberitahuan bahwa kanal luar bisa memperlihatkan nomor telepon/email pengguna dan memiliki kebijakan sendiri.
4. Aksi hanya membuka kanal luar, tanpa otomatis mengirim pesan atau melampirkan jurnal.
5. Siswa memutuskan sendiri informasi yang akan disampaikan.

### 8.5 Menghapus catatan

1. Siswa memilih satu catatan atau **Hapus semua data RUANGKISAH di browser ini**.
2. Dialog menjelaskan objek yang akan dihapus dan bahwa tindakan tidak dapat dibatalkan.
3. Setelah konfirmasi, aplikasi menghapus key miliknya dan state terkait; status berhasil hanya muncul setelah operasi berhasil.
4. Daftar diperbarui, detail tertutup, dan tab aplikasi lain menerima perubahan. Hapus tidak menjanjikan penghapusan salinan di luar aplikasi atau pesan yang pernah dibuat pengguna di kanal lain.

## 9. Kebutuhan fungsional dan kriteria penerimaan

### FR-00 - Akses fitur setelah login dan pemberitahuan awal

- **[P]** Semua fitur inti memerlukan sesi valid dari akun terverifikasi. Pendaftaran hanya meminta nama tampilan, email, kata sandi dan persetujuan; tanpa sekolah/NISN/telepon.
- **[D]** Pemberitahuan singkat tampil pada kunjungan baru dalam sesi, tidak memblokir akses Pusat Bantuan.
- **[D]** Pilihan menyimpan tidak digabungkan dengan tombol Mulai; menekan Mulai tidak membuat persetujuan penyimpanan.
- **Penerimaan:** Pada profil browser baru, pengguna dapat menyelesaikan aktivitas tanpa key catatan, cookie aplikasi, atau request pengiriman isian. Aset situs dan log teknis hosting dibahas terpisah pada bagian 13.

### FR-01 - Beranda dan navigasi

- Menampilkan nama RUANGKISAH.ID, program Selfcare-BK, penjelasan singkat, dan kartu menuju tiga aktivitas.
- Memuat langkah sederhana: pilih aktivitas, refleksikan, tinjau, lalu pilih simpan atau hapus.
- Bantuan dan Privasi dapat ditemukan dari setiap halaman utama; halaman aktif ditandai dengan teks/semantik yang dapat diakses.
- **Penerimaan:** Semua tautan menuju halaman benar; tombol kembali bekerja; URL langsung dan refresh tidak menghasilkan 404 aplikasi; layout tidak bergeser horizontal pada lebar uji.

### FR-02 - Kenali Diriku

- **[P]** Memuat potensi/kekuatan, minat, nilai pribadi, dan tujuan pengembangan diri.
- **[D]** Paket awal terdiri atas enam pertanyaan terbimbing, satu layar per langkah atau kelompok kecil; estimasi 5-10 menit merupakan perkiraan desain yang perlu diuji.
- Jawaban berupa teks biasa. Semua pertanyaan bisa dilewati; maksimal 1.000 karakter per jawaban.
- Navigasi Sebelumnya/Berikutnya tidak menghilangkan jawaban selama modul masih aktif.
- **Lihat rangkuman** aktif jika minimal satu jawaban berisi karakter selain spasi. Jika seluruhnya kosong, tawarkan isi satu jawaban atau akhiri tanpa hasil.
- Rangkuman menampilkan jawaban per tema dan kalimat pendamping yang sudah disusun; jawaban kosong ditandai **Belum diisi**, tanpa menebak informasi.
- Tidak ada skor, profil otomatis, AI, atau kategori “percaya diri rendah”.
- **Penerimaan:** Rangkuman sesuai input, dapat diedit sebelum simpan, dan tidak pernah menulis data sebelum pilihan simpan diselesaikan.

### FR-03 - Jurnal Perasaan

- **[P]** Menyediakan tempat mencatat pengalaman dan merefleksikan perasaan.
- **[D]** Input: tanggal lokal perangkat, satu/lebih pilihan perasaan, situasi yang dialami, tanggapan diri, kebutuhan saat ini, dan satu tindakan baik untuk diri.
- Pilihan awal: Senang, Sedih, Cemas, Marah, Tenang, Bingung, dan Lainnya. Pilihan tidak diberi nilai baik/buruk; ikon selalu disertai label.
- Semua kolom opsional, tetapi minimal satu perasaan atau satu teks nonkosong diperlukan untuk membuat rangkuman. Tanggal di masa depan ditolak dengan pesan jelas; tanggal refleksi boleh diubah ke masa lalu.
- Batas total teks jurnal 5.000 karakter; tampilkan penghitung dan error tanpa memotong teks diam-diam.
- Rangkuman menampilkan isi yang dipilih/ditulis; tidak mengubahnya menjadi kesimpulan kondisi psikologis.
- Tidak menyimpan otomatis, tidak mengirim ke Guru BK, tidak melakukan pemindaian emosi/risiko.
- **Penerimaan:** Pengguna dapat menulis dan mengakhiri tanpa data tersisa di penyimpanan aplikasi; pilihan simpan dan hapus bekerja sesuai FR-06.

### FR-04 - Langkah Berani

- **[P]** Membantu siswa menetapkan target kecil dan mencoba tindakan sesuai kemampuan.
- **[D]** Koleksi awal berisi minimal enam contoh latihan yang telah ditelaah; pengguna juga dapat membuat target sendiri.
- Field: judul target (wajib, 1-120 karakter nonkosong), langkah pertama (wajib, maksimal 500 karakter), alasan pribadi (opsional, 500), tanggal target (opsional), dukungan yang dibutuhkan (opsional, 500), refleksi setelah mencoba (opsional, 1.000).
- Status: **Direncanakan**, **Sedang dicoba**, **Selesai dicoba**, **Ditunda**. Transisi ditentukan pengguna; tanggal lewat tidak otomatis mengubah status.
- Target boleh diubah, dijadwalkan ulang, atau dihapus. Status selesai dapat dikoreksi; tidak ada leaderboard, pengurangan poin, atau perbandingan antarsiswa.
- Penyimpanan target memakai mekanisme eksplisit yang sama dengan jurnal. Tanpa penyimpanan, target tidak dapat dilanjutkan setelah refresh.
- **Penerimaan:** Target tersimpan dapat dibuka pada browser sama, diperbarui tanpa membuat duplikat, dan dihapus. Pesan **Kamu sudah mencoba satu langkah** hanya mengikuti status yang dipilih pengguna.

### FR-05 - Pusat Bantuan

- Menjelaskan tujuan media, batas layanan, cara menggunakannya, dan cara menghubungi Guru BK.
- Konfigurasi kontak minimal mencakup nama tampilan/peran, sekolah, kanal yang disetujui, alamat kontak, jam layanan beserta zona waktu, dan tanggal pemeriksaan kontak.
- Produksi/pilot hanya menampilkan kanal terverifikasi. Jika konfigurasi kosong, tampilkan **Kontak sekolah belum tersedia. Kamu dapat menemui Guru BK secara langsung di sekolah**; jangan menampilkan nomor contoh sebagai kontak nyata.
- Sebelum pindah ke kanal luar, jelaskan pengungkapan identitas kanal; tidak menyatakan WhatsApp/email sebagai konsultasi anonim.
- Jangan memasukkan isi jurnal, ID catatan, perasaan, atau nama siswa ke URL atau pesan otomatis. Jika memakai teks pembuka, hanya pesan umum yang dapat diedit, misalnya **Saya ingin mengetahui cara menghubungi Guru BK**.
- Tautan tidak menjanjikan layanan 24 jam, respons langsung, atau pemantauan otomatis. FAQ menjawab **Apakah Guru BK membaca jurnal saya?** dengan **Tidak melalui website ini pada rilis awal**.
- Konten bantuan boleh mengajak siswa menemui Guru BK atau orang dewasa tepercaya saat membutuhkan pendampingan. Naskah final ditelaah Guru BK; tidak ada nomor bantuan rekaan.
- **Penerimaan:** Kanal nyata diuji manual sebelum pilot; saat batal pada dialog tidak ada navigasi; saat lanjut tidak ada pesan terkirim otomatis.

### FR-06 - Simpan, privasi, dan hapus

- **Mode sementara adalah default:** input berada pada memori aplikasi, tanpa localStorage, sessionStorage, IndexedDB, URL, atau layanan pihak ketiga sebagai draf.
- **Simpan lokal adalah pilihan per catatan/target:** dialog menerangkan isi yang disimpan; lokasi pada browser/perangkat yang sama; risiko perangkat bersama; tidak ada sinkronisasi; tidak ada kedaluwarsa otomatis; serta cara hapus.
- Setiap aksi simpan awal dan simpan perubahan memerlukan konfirmasi yang jelas. Persetujuan lama tidak mengaktifkan autosave untuk aktivitas baru.
- Sampai operasi tulis berhasil, catatan harus tetap berstatus belum tersimpan. Menekan dua kali tidak membuat dua item.
- Pengguna dapat menghapus satu item dari detail atau semua data aplikasi dari Privasi & Data. Jangan menggunakan penghapusan seluruh penyimpanan origin jika ada data aplikasi lain.
- **[D] Retensi prototipe:** tersimpan sampai dihapus pengguna atau dibersihkan browser; tidak ada janji kedaluwarsa otomatis. Anjurkan penggunaan sementara pada perangkat bersama. Kebijakan retensi berbeda memerlukan revisi PRD dan implementasi.
- **Penerimaan:** Mode sementara tidak meninggalkan jawaban setelah refresh; mode lokal bertahan pada reload normal; hapus menghilangkan item dari penyimpanan dan UI; error storage tidak menghasilkan keberhasilan palsu.

### FR-07 - Catatan Saya

- Daftar menggabungkan hasil Kenali Diriku, jurnal, dan target yang sengaja disimpan, urut terbaru berdasarkan waktu perubahan.
- Daftar cukup menampilkan jenis dan tanggal; isi jurnal dan judul target pribadi baru muncul setelah membuka detail. Pesan awal mengingatkan agar memperhatikan orang di sekitar.
- Detail dapat dibaca, diubah, disimpan ulang, atau dihapus. Membatalkan edit mengembalikan versi tersimpan.
- Rangkuman berasal dari data sumber, bukan data rangkuman terpisah yang bisa tidak sinkron.
- Saat kosong tampilkan **Belum ada catatan tersimpan di browser ini** dan tautan aktivitas; jangan membuat catatan contoh dalam daftar pribadi.
- Data dari browser/profil/perangkat lain tidak ditampilkan; tidak menjanjikan pemulihan setelah browser dibersihkan.
- **Penerimaan:** Edit memakai ID sama; batal tidak mengubah data; daftar kosong tidak error; data demonstrasi tidak bercampur.

### FR-08 - Informasi produk, petunjuk, dan privasi

- Tentang menjelaskan sasaran, tiga modul, program Selfcare-BK, dan posisi sebagai pendamping Guru BK.
- Petunjuk setiap modul mencakup tujuan, cara menjawab/melewati, dan pilihan akhir.
- Privasi menjelaskan data yang disimpan/tidak dikirim, keterbatasan perangkat bersama, log teknis hosting, penghapusan, serta perubahan saat memakai kanal luar.
- **Penerimaan:** Bahasa dapat dipahami siswa; informasi penyimpanan konsisten dengan perilaku nyata; link Privasi tersedia sebelum konfirmasi simpan.

### FR-09 - Demonstrasi

- **[P]** Demonstrasi kelas memakai data fiktif.
- **[D]** Mode demo diberi banner **Contoh fiktif - bukan data siswa** dan memakai state di memori, terpisah dari repository catatan pribadi.
- Contoh diambil dari fixture statis; tidak mengisi localStorage pribadi, tidak membuka kontak contoh, dan tidak membaca catatan lokal yang sudah ada.
- Keluar dari demo membersihkan state demo. Data pribadi baru dapat diakses kembali melalui aksi eksplisit membuka Catatan Saya.
- **Penerimaan:** Masuk/keluar demo tidak menambah, mengubah, menampilkan, atau menghapus catatan pribadi; isi demo tidak ditulis permanen.

## 10. State antarmuka dan penanganan kegagalan

| Kondisi                                           | Perilaku wajib                                                                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input belum lengkap                               | Pesan dekat field dan fokus pada masalah; tidak menampilkan rangkuman rekaan                                                                               |
| Batas karakter terlampaui                         | Informasikan batas; pertahankan input agar dapat diperbaiki; blokir simpan sampai valid                                                                    |
| Draf sementara ditinggalkan melalui menu internal | Dialog: tetap mengisi atau tinggalkan dan buang draf; tidak memaksa menyimpan                                                                              |
| Refresh/tutup tab                                 | Beri peringatan best effort jika draf berubah; UI tetap menjelaskan draf sementara hilang saat refresh, tanpa menjamin dialog browser selalu muncul        |
| Kembali dari browser cache riwayat                | Bersihkan draf yang telah diakhiri; jangan memunculkan ulang isi setelah hapus/akhiri karena state halaman lama                                            |
| Storage diblokir/penuh                            | Pertahankan input di memori; pesan **Belum tersimpan. Penyimpanan browser tidak tersedia/penuh**; sediakan coba lagi atau akhiri sementara                 |
| JSON rusak/versi tidak didukung                   | Jangan crash atau menimpa data diam-diam; hentikan operasi tulis, jelaskan masalah, sediakan reset data aplikasi dengan konfirmasi                         |
| Dua tab mengubah data                             | Deteksi perubahan melalui event storage; sebelum tulis cocokkan revisi. Bila konflik, minta muat versi terbaru atau batalkan edit, tanpa menimpa diam-diam |
| Hapus dari tab lain                               | Hilangkan item dari daftar dan bersihkan detail/draf item tersebut; jangan menyimpan kembali data terhapus otomatis                                        |
| Kontak belum dikonfigurasi                        | Tampilkan petunjuk menemui Guru BK dan keadaan belum tersedia, tanpa tautan palsu                                                                          |
| Kanal luar tidak terpasang                        | Alamat kontak tetap dapat dibaca/disalin secara manual; jangan mengaku pesan berhasil terkirim                                                             |
| Jaringan putus setelah aplikasi termuat           | Form yang telah termuat tetap bekerja sejauh aset tersedia; kontak luar perlu jaringan. Jangan menjanjikan offline penuh                                   |
| JavaScript gagal/tidak aktif                      | Tampilkan informasi statis singkat tentang produk dan arahan mencari Guru BK; jangan menampilkan form yang terlihat berfungsi                              |

## 11. Rancangan UI/UX dan aksesibilitas

### 11.1 Arah visual [D]

- Nuansa hangat, tenang, dan sesuai remaja SMA; hindari tampilan yang terlalu kekanak-kanakan atau menyerupai hasil pemeriksaan klinis.
- Latar terang, permukaan putih, aksen hijau/teal, dan teks gelap. Warna final harus diuji kontras; tidak ada kode warna yang wajib sebelum desain.
- Gunakan font sistem atau font yang di-host sendiri; body awal 16 px, line-height sekitar 1,5; lebar teks refleksi dibatasi agar mudah dibaca.
- Kartu aktivitas berisi satu judul, penjelasan singkat, perkiraan waktu, dan satu aksi utama. Form memisahkan instruksi dari contoh jawaban.
- Ruang kosong cukup, label persisten, penekanan pada satu aksi utama per langkah. Tombol hapus terpisah dari simpan untuk mengurangi salah tekan.
- Ilustrasi dan ikon adalah aset asli atau berlisensi jelas. Tidak menyalin merek, screenshot, atau aset Clymb dari lampiran sebagai identitas produk.

### 11.2 Spesifikasi responsif [D]

| Layar uji           | Rancangan                                                                              |
| ------------------- | -------------------------------------------------------------------------------------- |
| 320-767 CSS px      | Satu kolom; navigasi ringkas; input dan CTA lebar; tidak ada scroll horizontal         |
| 768-1023 CSS px     | Dua kolom untuk kartu jika muat; form tetap satu kolom                                 |
| 1024 CSS px ke atas | Kontainer sekitar maksimal 1.120 px; kartu dapat tiga kolom; form berlebar baca nyaman |

Batas di atas adalah panduan, bukan alasan membiarkan ukuran antaranya rusak. Uji juga orientasi lanskap, keyboard virtual, teks panjang, dan pembesaran tampilan.

### 11.3 Persyaratan aksesibilitas

**[D] Target:** WCAG 2.2 tingkat AA untuk antarmuka yang dibangun, dengan evaluasi otomatis dan pemeriksaan manual. Ini target desain, bukan klaim sertifikasi. Dasar kriteria: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

- Semua fungsi dapat dipakai dengan keyboard; fokus terlihat, urut logis, dan tidak tertutup header/bilah bawah.
- Gunakan HTML semantik, satu judul utama, hierarchy heading berurutan, landmark, dan skip link.
- Input punya label; pilihan perasaan diimplementasikan sebagai kontrol berlabel, bukan gambar yang hanya dapat diklik.
- Error terhubung ke input dan tidak disampaikan melalui warna saja; notifikasi simpan/hapus dibaca screen reader tanpa memindahkan fokus sembarangan.
- Dialog mengelola fokus, dapat dibatalkan, dan mengembalikan fokus ke pemicu saat ditutup.
- Teks normal memiliki kontras minimal 4,5:1; teks besar minimal 3:1. Lihat [panduan kontras W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Target kontrol utama dirancang minimal 44 x 44 CSS px sebagai keputusan produk. WCAG 2.2 AA menetapkan minimum 24 x 24 CSS px dengan pengecualian tertentu; lihat [panduan ukuran target W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Dapat dibaca pada zoom 200%, serta reflow pada lebar 320 CSS px; tidak mengunci orientasi atau menonaktifkan zoom.
- Animasi ringan dan menghormati reduced motion; tidak ada audio otomatis, timer penilaian, atau aktivitas yang mewajibkan drag.

## 12. Konten awal dan standar editorial

Seluruh contoh di bawah adalah **[D] draf konten**, bukan instrumen psikologis tervalidasi. Ahli materi BK perlu menelaah sebelum uji dengan siswa. Pengembang tidak mengubah makna materi yang telah disetujui tanpa penelaahan ulang.

### 12.1 Draf pertanyaan Kenali Diriku

| Tema                | Pertanyaan awal                                                                |
| ------------------- | ------------------------------------------------------------------------------ |
| Pengalaman berhasil | Ceritakan satu hal kecil yang pernah kamu lakukan dan membuatmu merasa bangga. |
| Kekuatan            | Kekuatan apa yang membantumu dalam pengalaman itu?                             |
| Minat               | Kegiatan apa yang kamu sukai dan ingin kamu pelajari lebih jauh?               |
| Nilai pribadi       | Hal apa yang penting bagimu saat berteman atau mengambil keputusan?            |
| Area berkembang     | Hal apa yang ingin kamu latih dengan dukungan yang tepat?                      |
| Tujuan              | Satu langkah kecil apa yang ingin kamu coba minggu ini?                        |

### 12.2 Draf panduan Jurnal Perasaan

1. Perasaan apa yang paling dekat dengan pengalamanmu sekarang? Kamu boleh memilih lebih dari satu atau melewati.
2. Apa yang terjadi sebelum kamu merasakan hal itu?
3. Bagaimana kamu menanggapi situasinya?
4. Apa yang kamu butuhkan saat ini?
5. Satu hal baik apa yang dapat kamu lakukan untuk dirimu?

### 12.3 Contoh Langkah Berani

- Menulis satu pertanyaan sebelum pelajaran, lalu mencoba menanyakannya ketika siap.
- Menyampaikan satu pendapat dalam diskusi kelompok kecil.
- Menyapa satu teman yang sudah dikenal.
- Meminta bantuan ketika belum memahami tugas.
- Mencoba satu kegiatan sekolah yang diminati dengan dukungan yang sesuai.
- Mengakui satu usaha diri sendiri setelah menyelesaikan tugas.

Siswa boleh menyesuaikan contoh atau memilih tindakan lain. Contoh tidak boleh mendorong pengungkapan masalah pribadi di depan umum, tindakan berbahaya, atau aktivitas di luar kesiapan siswa.

### 12.4 Naskah antarmuka

| Konteks            | Contoh naskah                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Pengenalan         | Ruang untuk mengenali diri, memahami perasaan, dan mencoba langkah kecil.                                                  |
| Petunjuk           | Tidak ada jawaban benar atau salah. Kamu boleh melewati pertanyaan yang belum ingin dijawab.                               |
| Privasi awal       | Isianmu belum disimpan. Kamu dapat mengakhiri aktivitas tanpa menyimpan.                                                   |
| Pilihan lokal      | Simpan di perangkat ini hanya jika kamu nyaman. Orang lain yang memakai browser yang sama mungkin dapat membuka catatanmu. |
| Berhasil menyimpan | Tersimpan di browser perangkat ini. Catatan tidak disinkronkan ke perangkat lain.                                          |
| Akhiri sementara   | Isian sementara telah dibersihkan dari aplikasi.                                                                           |
| Refleksi target    | Kamu boleh menyesuaikan target dan mencoba lagi sesuai kesiapanmu.                                                         |
| Batas layanan      | RUANGKISAH mendampingi kegiatan refleksi dan tidak menggantikan layanan Guru BK atau konseling profesional.                |

### 12.5 Tata kelola konten

- Setiap paket materi menyimpan ID, versi, penulis, status review, reviewer, dan tanggal review; tidak perlu dipublikasikan seluruhnya kepada siswa.
- Perubahan materi diperiksa untuk relevansi siswa kelas X-XI, keterbacaan, nada tidak menghakimi, dan kesesuaian batas layanan.
- Halaman bantuan juga memuat tanggal terakhir informasi kontak diperiksa. Perubahan kontak dilakukan melalui konfigurasi dan rilis ulang.
- Referensi ilmiah proposal belum diaudit independen dalam pekerjaan ini. Klaim penelitian tidak boleh ditambahkan hanya dari judul referensi yang tercantum.

## 13. Data, privasi, dan keamanan

### 13.1 Matriks pengumpulan data

| Data                                | Lokasi dan tujuan                                                 | Ketentuan                                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Jawaban refleksi/jurnal/target baru | Memori tab untuk menjalankan aktivitas                            | Dibersihkan ketika diakhiri; tidak dipakai untuk analitik                                                    |
| Catatan yang dipilih untuk disimpan | localStorage origin situs pada browser/perangkat                  | Hanya setelah konfirmasi; tidak terenkripsi secara khusus oleh aplikasi; tidak disinkronkan                  |
| Metadata catatan                    | ID acak, versi, waktu buat/ubah, revisi, versi persetujuan simpan | Lokal bersama catatan; tidak memuat identitas siswa                                                          |
| Konten dan kontak Guru BK           | File statis yang ikut dipublikasikan                              | Hanya informasi yang disetujui untuk publik; bukan rahasia/server credential                                 |
| Data contoh                         | Fixture statis dan memori demo                                    | Fiktif, diberi label, tidak bercampur dengan catatan                                                         |
| Identitas siswa                     | Tidak dikumpulkan secara terstruktur oleh aplikasi                | Tidak ada field wajib nama/NISN/email/telepon; anjurkan menghindari identitas dalam teks bebas               |
| Log teknis hosting                  | Mungkin mencakup IP, waktu, dan route sesuai penyedia             | Tidak berisi isian karena isian tidak dikirim; kebijakan akses/retensi hosting harus diperiksa sebelum pilot |
| Jawaban angket uji                  | Dokumen evaluasi terpisah yang dikelola peneliti                  | Tidak digabungkan dengan catatan pribadi atau disisipkan sebagai fitur pengumpulan tersembunyi               |

Penggunaan localStorage mengikuti sifat penyimpanan browser: melekat pada origin, dapat bertahan antar sesi, dan tidak memiliki kedaluwarsa bawaan. Browser juga dapat menolak akses penyimpanan; mode privat memiliki keterbatasan keberlangsungan. Karena itu, fungsi simpan wajib mengatasi kegagalan dan tidak dipromosikan sebagai backup. Dasar teknis: [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

### 13.2 Aturan minimum

1. Jangan mengirim isi input ke API, analitik, error tracker, log konsol produksi, formulir eksternal, atau model AI.
2. Jangan meletakkan isi catatan dalam URL, parameter query, hash, metadata halaman, atau nama file aset.
3. Render input sebagai teks; jangan menjalankan HTML/skrip dari jawaban. Hindari injeksi HTML mentah.
4. Gunakan HTTPS untuk situs publik, validasi skema data lokal, dan batasi panjang/jumlah catatan untuk menghindari penulisan tak terkendali.
5. Hindari skrip pihak ketiga, iklan, session replay, dan font eksternal. Kontrol dependency karena skrip origin yang sama dapat mengakses penyimpanan aplikasi.
6. Jangan menjanjikan bahwa “hanya kamu yang dapat melihat” pada perangkat bersama. Login membatasi akses fitur dan memisahkan catatan per akun; catatan tetap lokal, tidak terenkripsi oleh login atau tersinkronkan.
7. Login tidak menghilangkan jejak teknis: hosting dan kanal luar memiliki pemrosesan masing-masing.
8. Hapus hanya key aplikasi, bersihkan state memori terkait, dan sinkronkan invalidasi antar tab. Tidak menyediakan tombol salin otomatis/ekspor jurnal pada rilis awal.
9. Atur kebijakan keamanan konten, pembatasan framing, dan referrer pada hosting sesuai kebutuhan aset yang benar-benar digunakan; pengujian memastikan tidak merusak aplikasi.
10. Jika penghapusan gagal, nyatakan gagal dan berikan cara mencoba ulang/membersihkan data situs dari browser. Jangan memberi konfirmasi palsu.

### 13.3 Batas operasional

- Versi prototipe bukan repositori catatan rahasia dengan perlindungan akun. Demonstrasi dan pengujian teknis menggunakan data fiktif.
- Sebelum uji siswa, jelaskan data yang benar-benar diperlukan, cara penggunaan perangkat, persetujuan peserta, izin sekolah, dan kebutuhan persetujuan wali yang ditentukan oleh pihak berwenang. PRD tidak menyimpulkan kepatuhan hukum atau menggantikan penelaahan institusi.
- Tidak ada pembacaan jurnal otomatis oleh Guru BK, sehingga website tidak boleh menyatakan sedang memantau keselamatan pengguna.
- Jika terjadi dugaan kebocoran teknis, hentikan sesi uji terkait, catat penyebab tanpa menyalin isian siswa, perbaiki, dan lakukan uji ulang sebelum melanjutkan.

## 14. Model data rilis awal [D]

Model berikut adalah **skema penyimpanan lokal**, bukan tabel database server. Seluruh data pribadi berada dalam satu dokumen ber-versi agar pembaruan lebih mudah divalidasi.

### 14.1 Entitas

| Entitas             | Field utama                                                                                                   | Aturan                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `LocalDocument`     | `schemaVersion`, `documentRevision`, `reflections[]`, `journals[]`, `goals[]`                                 | Key aktif per akun `ruangkisah:account:<id>:data:v1`; key lama hanya untuk migrasi terkonfirmasi; semua perubahan memakai validasi dan revisi |
| `SavedRecordBase`   | `id`, `createdAt`, `updatedAt`, `revision`, `contentVersion`, `storageAcknowledgedAt`, `privacyNoticeVersion` | ID acak lokal; waktu ISO; metadata persetujuan berlaku untuk salinan lokal, bukan bukti persetujuan penelitian                                |
| `SelfReflection`    | metadata dasar, `answers[{questionId, answer}]`                                                               | Pertanyaan diidentifikasi ID stabil; rangkuman diturunkan dari jawaban                                                                        |
| `FeelingJournal`    | metadata dasar, `entryDate`, `feelings[]`, `situation`, `response`, `needs`, `smallAction`                    | `entryDate` berbentuk tanggal lokal `YYYY-MM-DD`; teks/emosi tidak diubah menjadi skor                                                        |
| `CourageGoal`       | metadata dasar, `title`, `firstStep`, `reason?`, `targetDate?`, `support?`, `status`, `afterReflection?`      | `status`: `planned`, `trying`, `tried`, `postponed`; pemetaan label Indonesia pada UI                                                         |
| `ContentPackage`    | `id`, `version`, `questions`, `examples`, `reviewStatus`                                                      | Statis dan terpisah dari data siswa                                                                                                           |
| `HelpConfiguration` | `schoolLabel`, `contactLabel`, `channels[]`, `serviceHours`, `timeZone`, `verifiedAt`, `isDemo`               | Hanya kanal valid yang boleh diaktifkan; versi demo tidak mengarah ke nomor rekaan                                                            |

### 14.2 Aturan penyimpanan

- Draf tidak memiliki key persisten. Komponen formulir mengelola state sementara; repository hanya dipanggil setelah pilihan simpan.
- Setiap perubahan yang valid memperbarui `updatedAt`, revisi record, dan revisi dokumen; pembaruan memakai ID lama, bukan menambah duplikat.
- Semua array, enum, tanggal, dan panjang teks divalidasi saat dibaca maupun ditulis; field tak dikenal tidak dieksekusi sebagai kode.
- **Batas desain:** maksimal 50 item per jenis dan 1 MiB hasil serialisasi per dokumen. Jika terlampaui, minta pengguna menghapus item; jangan menghapus catatan lama otomatis. Ini batas aplikasi, bukan klaim kapasitas pasti browser.
- Dokumen versi tak dikenal tidak ditimpa otomatis. Migrasi versi berikutnya memerlukan fungsi migrasi, uji data contoh, dan penjelasan perubahan.
- Saat membaca catatan lama, gunakan versi pertanyaan yang cocok atau pertahankan label pertanyaan lama agar konteks jawaban tidak berubah.
- Hapus semua menghapus key aplikasi beserta preferensi persisten milik aplikasi jika kemudian ditambahkan; tidak menghapus data situs lain. Pada rilis awal tidak diperlukan cookie atau key preferensi tambahan.
- Data demo menggunakan model yang sama melalui repository memori, tanpa akses repository pribadi.

## 15. Arsitektur teknis yang diusulkan [D]

### 15.1 Pilihan dasar

| Lapisan          | Rancangan                                              | Alasan                                                                                                                             |
| ---------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Frontend         | React + JavaScript dengan Vite                         | Mendukung komponen berulang, state formulir, dan lint JavaScript/JSX; merupakan pilihan implementasi PRD, bukan ketentuan proposal |
| Styling          | CSS dengan token warna, jarak, tipografi, dan komponen | Menjaga konsistensi tanpa mengharuskan UI kit besar                                                                                |
| State            | State komponen/modul dan layanan repository lokal      | Memisahkan draf sementara, data tersimpan, dan fixture demo                                                                        |
| Konten           | File terstruktur dengan ID dan versi                   | Dapat ditelaah/diperbarui tanpa membangun CMS pada rilis awal                                                                      |
| Penyimpanan      | localStorage melalui satu adapter tervalidasi          | Sesuai demonstrasi penyimpanan lokal pada proposal                                                                                 |
| Backend/database | Express + Better Auth + PostgreSQL Supabase untuk akun | Akun/sesi dikelola server; isi catatan tetap lokal                                                                                 |
| Hosting          | Hosting aset statis melalui HTTPS                      | Cukup untuk cakupan prototipe; penyedia/domain belum dipilih                                                                       |
| Pengujian        | Tes logika penyimpanan dan tes browser untuk alur inti | Memastikan perilaku data dan pengalaman nyata, bukan sekadar komponen dapat dirender                                               |

Template React berbasis JavaScript tersedia dalam [panduan Vite](https://vite.dev/guide/). Hasil build statis dapat dipublikasikan melalui hosting statis; lihat [panduan deployment Vite](https://vite.dev/guide/static-deploy.html). Pilihan versi dependency ditetapkan saat implementasi, diverifikasi kompatibilitasnya, lalu dikunci dalam lockfile. Jangan menganggap versi di mesin saat ini sebagai versi yang otomatis dipakai.

### 15.2 Aliran data

```text
Konten statis yang ditelaah --> Halaman aktivitas
                                      |
                                      v
                               Draf dalam memori
                                      |
                                      v
                         Validasi + rangkuman di browser
                           /                     \
             Akhiri tanpa simpan           Simpan + konfirmasi
                       |                          |
                       v                          v
                Bersihkan state         Repository lokal tervalidasi
                                                   |
                                                   v
                                      localStorage browser perangkat
                                                   |
                                                   v
                                        Catatan Saya / ubah / hapus

Pusat Bantuan --> Pemberitahuan kanal luar --> WhatsApp/email/rujukan langsung
                 (tanpa melampirkan isi aktivitas)
```

Tidak ada endpoint API untuk jawaban/refleksi pada rilis awal. “CRUD catatan” berarti operasi lokal. Kemampuan membangun akun atau dashboard di masa depan bukan alasan membuat endpoint pengumpulan data yang belum diperlukan sekarang.

### 15.3 Pembagian modul proyek

```text
src/
  app/                 routing, layout, boundary error
  components/          tombol, input, dialog, navigasi, notifikasi
  features/
    self-reflection/   Kenali Diriku dan rangkuman
    feeling-journal/   Jurnal Perasaan
    courage-goals/     Langkah Berani
    saved-records/     Catatan Saya
    help/              Pusat Bantuan dan konfirmasi kanal luar
    privacy/           informasi data dan penghapusan
    demo/              fixture dan repository memori
  content/             pertanyaan, contoh, FAQ, versi materi
  config/              kontak Guru BK dan mode demonstrasi
  data/                schema, validasi, adapter localStorage, konflik revisi
  styles/              token dan CSS bersama
tests/                  pengujian perilaku data dan alur browser
docs/                   review konten, hasil uji, catatan rilis
```

Struktur ini adalah panduan implementasi, bukan file yang sudah dibuat. Pemilihan pustaka router dan test runner boleh mengikuti kebiasaan tim selama kebutuhan terpenuhi dan dependensi tetap wajar.

## 16. Kebutuhan nonfungsional

| ID     | Aspek              | Target penerimaan [D]                                                                                                                                                         |
| ------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | Aksesibilitas      | Persyaratan bagian 11 lulus pada alur inti; temuan otomatis dilengkapi uji keyboard dan screen reader                                                                         |
| NFR-02 | Responsif          | Lulus lebar 320, 375, 768, 1024, 1440 CSS px; keyboard virtual tidak menutup aksi penting                                                                                     |
| NFR-03 | Privasi            | Tidak ada request jaringan berisi jawaban refleksi/ID catatan; tanpa penyimpanan draf otomatis; hapus terverifikasi                                                           |
| NFR-04 | Reliabilitas       | Gagal storage/JSON rusak/dua tab tidak menyebabkan crash atau overwrite diam-diam                                                                                             |
| NFR-05 | Performa           | Target awal LCP <= 2,5 detik dan CLS <= 0,1 pada build produksi, pengujian mobile dengan profil jaringan/perangkat dicatat; ini target lab awal, bukan bukti kinerja lapangan |
| NFR-06 | Respons interaksi  | Target umpan balik UI normal <= 200 ms pada perangkat uji; operasi simpan memiliki status yang jelas                                                                          |
| NFR-07 | Kompatibilitas     | Uji Chrome Android, Safari iOS, dan Chrome/Edge desktop versi yang tersedia saat uji; catat versi nyata. Emulasi tidak diklaim sebagai pengujian perangkat fisik              |
| NFR-08 | Keamanan rendering | Input HTML/skrip ditampilkan sebagai teks dan tidak dieksekusi; tidak ada rahasia dalam bundle/config                                                                         |
| NFR-09 | Pemeliharaan       | Lint JavaScript/JSX, build, dan pengujian kritis lulus; konfigurasi kontak/konten tidak tersebar di banyak komponen                                                           |
| NFR-10 | Kejujuran produk   | Tidak ada klaim diagnosis, anonim lintas kanal, sinkronisasi, backup, pemantauan, atau efektivitas yang tidak didukung                                                        |

Performa diukur pada minimal tiga pemuatan dan dicatat median beserta profil uji. Jika perangkat pilot sangat terbatas, profil tersebut harus masuk evaluasi; optimasi tidak hanya mengejar angka desktop.

## 17. Operasional, publikasi, dan pemeliharaan

### 17.1 Lingkungan

- **Pengembangan lokal:** data fiktif, kontak demo tidak aktif, served melalui HTTP localhost; tidak membuka file HTML langsung sebagai cara menguji penyimpanan.
- **Preview:** build yang dapat ditinjau, tetap menggunakan data fiktif; diberi label demonstrasi dan disarankan tidak diindeks.
- **Pilot:** hanya setelah materi, izin penggunaan, konfigurasi Guru BK, privasi hosting, dan alur penghapusan diperiksa.

Nama RUANGKISAH.ID adalah identitas proposal. Ketersediaan, kepemilikan, dan konfigurasi domain belum diperiksa; PRD tidak mengasumsikan domain sudah dimiliki.

### 17.2 Pipeline rilis

1. Review perubahan materi dan kode sesuai bagian yang berubah.
2. Jalankan lint JavaScript/JSX, build produksi, serta tes perilaku kritis.
3. Periksa build pada browser, perangkat kecil, mode tanpa simpan, mode simpan, dan penghapusan.
4. Pastikan route langsung/refresh bekerja, HTTPS aktif pada hosting, kontak benar, dan tidak ada data fiktif yang disajikan sebagai kontak nyata.
5. Periksa request jaringan dengan teks uji unik untuk memastikan isi input tidak keluar.
6. Publikasikan build yang disetujui; catat versi aplikasi, materi, skema, kontak, dan hasil pemeriksaan.
7. Jika regresi, kembali ke build sebelumnya yang kompatibel dengan skema data; jangan menurunkan versi skema dengan menghapus data pengguna otomatis.

### 17.3 Pemeliharaan

Pemilik produk menunjuk penanggung jawab pemeriksaan kontak, perubahan materi, bug, dan hosting. **[D]** Kontak diperiksa sebelum setiap pilot dan sekurangnya tiap semester jika situs terus digunakan. Tidak ada akses admin untuk membuka catatan browser siswa. Backup kode/konten dilakukan melalui version control; ini tidak membackup jurnal siswa.

Biaya yang perlu diputuskan meliputi domain jika dibeli, hosting jika berbayar, pemeliharaan, dan akses perangkat uji. Tidak ada estimasi harga yang diasumsikan tanpa pemilihan penyedia dan kebutuhan nyata.

## 18. Evaluasi pengguna dan ukuran keberhasilan

### 18.1 Rancangan evaluasi sesuai proposal

1. **Analisis kebutuhan:** gunakan lima butir angket kebutuhan pada PDF halaman 23-24 dan wawancara Guru BK sebagai bahan penentuan prioritas. Jangan menganggap jawaban sudah terkumpul.
2. **Validasi ahli materi:** periksa kesesuaian tema, perkembangan siswa, bahasa, tidak adanya label/diagnosis, dan kejelasan batas layanan.
3. **Validasi ahli media:** periksa struktur menu, fungsi, aksesibilitas, responsif, serta transparansi penyimpanan.
4. **Uji pengguna terbatas:** dilakukan setelah izin/persetujuan yang sesuai; gunakan skenario singkat, data fiktif, dan pencatatan pengamatan tanpa mengambil isi jurnal pribadi.
5. **Tanggapan siswa:** gunakan lima aspek pada PDF halaman 27-28, skala 1-4; jawaban menyatakan persepsi pengguna, bukan hasil pengukuran perubahan psikologis.
6. **Revisi dan uji ulang:** urutkan masalah berdasarkan dampak, tetapkan penanggung jawab, lalu verifikasi perbaikannya.

### 18.2 Tugas uji terbatas

- Temukan Kenali Diriku dari Beranda dan isi satu jawaban fiktif.
- Lewati satu pertanyaan, lihat rangkuman, lalu akhiri tanpa menyimpan.
- Buat jurnal fiktif, simpan di perangkat uji, refresh, buka kembali, dan hapus.
- Buat target kecil, ubah menjadi Selesai dicoba, simpan perubahan, dan buka kembali.
- Temukan Pusat Bantuan dan jelaskan informasi apa yang terlihat jika membuka kanal luar.
- Jelaskan dengan kata sendiri perbedaan isian sementara dan simpan lokal.

Skenario bantuan boleh berhenti sebelum menghubungi orang nyata. Uji tidak mengirim pesan ke Guru BK tanpa kebutuhan dan persetujuan yang jelas.

### 18.3 Target evaluasi yang diusulkan

| Metrik                     | Definisi                                                                                              | Target [D]                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Kelulusan fungsi P0        | Kasus penerimaan P0 yang lulus / seluruh kasus P0 x 100%                                              | 100% sebelum rilis; tidak menutup bug kritis dengan rata-rata             |
| Keberhasilan tugas mandiri | Peserta menyelesaikan tugas tanpa bantuan fasilitator / peserta yang mencoba tugas x 100%             | Minimal 80% per tugas inti                                                |
| Pemahaman privasi          | Peserta dapat menjelaskan mode sementara, lokasi simpan, dan cara hapus / peserta yang ditanya x 100% | Minimal 80% menjawab ketiganya                                            |
| Waktu menemukan bantuan    | Waktu sejak tugas diberikan sampai halaman bantuan ditemukan                                          | Target median <= 30 detik; tidak membatasi pengguna saat penggunaan biasa |
| Tanggapan antarmuka        | Rerata per butir skala 1-4 disertai sebaran respons                                                   | Target awal >= 3,0 untuk kemudahan, bahasa, dan kenyamanan                |
| Masalah data kritis        | Pengiriman isian tanpa dasar, simpan tanpa pilihan, hapus palsu, atau overwrite data tak terduga      | 0 kasus terbuka                                                           |

Ambang di atas adalah usulan PRD. Sesuai proposal, ambang evaluasi dan jumlah peserta final harus ditetapkan bersama dosen/Guru BK **sebelum** uji, bukan diganti setelah melihat hasil. Jumlah peserta belum ditentukan; laporkan jumlah aktual, hasil berupa `n/N`, persentase, dan keterbatasan sampel.

Analisis angket menggunakan frekuensi tiap respons, persentase dari jawaban valid, dan rerata bila diperlukan. Jawaban kosong tidak diberi skor nol; tampilkan jumlah respons valid. Komentar terbuka dikelompokkan menurut tema dan disunting dari identitas. Tidak menggabungkan SS/S/TS/STS pada angket kebutuhan dengan skor kepercayaan diri atau diagnosis.

Tidak ada analitik pengguna terpasang pada rilis awal. Metrik dikumpulkan secara manual saat uji terjadwal. Form pengumpulan server memerlukan kebutuhan dan rancangan persetujuan tersendiri.

## 19. Rencana pengujian dan Definition of Done

### 19.1 Kasus penerimaan kritis

| ID uji | Kebutuhan    | Skenario dan hasil yang wajib                                                                                         |
| ------ | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| AT-01  | FR-00/01     | Pengunjung diarahkan ke Masuk untuk membuka modul; setelah login kembali ke tujuan semula                             |
| AT-02  | FR-02        | Isi sebagian/lewati pertanyaan; rangkuman hanya memuat jawaban yang ada; seluruhnya kosong tidak menghasilkan profil  |
| AT-03  | FR-03/06     | Tulis marker fiktif unik tanpa simpan; tidak muncul di storage/request jaringan; akhiri/refresh membersihkan          |
| AT-04  | FR-06/07     | Simpan dengan konfirmasi; reload normal menampilkan satu item yang sama dan isi cocok                                 |
| AT-05  | FR-06        | Batal dialog simpan tidak menulis data; klik simpan berulang tidak menggandakan item                                  |
| AT-06  | FR-04/07     | Target dibuat, dibuka, diubah status, ditunda, diedit, dan disimpan memakai ID yang sama                              |
| AT-07  | FR-06        | Hapus satu item lalu reload; hanya item tersebut hilang; hapus semua menghilangkan semua key aplikasi                 |
| AT-08  | FR-06/NFR-04 | Simulasikan storage ditolak/penuh; draf tetap tersedia, tidak ada konfirmasi palsu, retry bekerja jika tersedia       |
| AT-09  | NFR-04       | JSON rusak/versi asing tidak crash atau tertimpa; reset membutuhkan konfirmasi                                        |
| AT-10  | FR-05        | Kontak kosong menampilkan fallback; kontak demo tidak aktif; kanal nyata membuka alamat yang benar setelah konfirmasi |
| AT-11  | FR-05/NFR-03 | Tidak ada jawaban/ID catatan di URL/pesan luar; tidak ada pengiriman pesan otomatis                                   |
| AT-12  | NFR-01/02    | Semua aksi utama bisa dengan keyboard; dialog/fokus/label/kontras dan lebar uji diperiksa                             |
| AT-13  | NFR-08       | Input seperti tag HTML, tanda kutip, dan skrip muncul sebagai teks dan tidak dieksekusi                               |
| AT-14  | FR-09        | Demo tidak mengakses/mencampur catatan lokal; keluar demo tidak mengubah data pribadi                                 |
| AT-15  | FR-06/NFR-04 | Dua tab: konflik edit ditangani; hapus pada satu tab menghilangkan detail terkait pada tab lain                       |
| AT-16  | FR-01        | URL langsung dan refresh tiap route bekerja pada hosting target                                                       |
| AT-17  | FR-02/03/04  | Pindah halaman dengan draf memunculkan pilihan; batal menjaga draf; akhiri membuang draf                              |
| AT-18  | FR-06        | Setelah hapus/akhiri, browser back/forward tidak memunculkan data melalui state halaman yang sudah tidak valid        |
| AT-19  | NFR-05/06    | Ukur performa build produksi pada profil uji tercatat, lalu periksa kendala pada perangkat pilot                      |
| AT-20  | FR-02/03/04  | Batas input, spasi kosong, tanggal, batas jumlah item, dan ukuran dokumen ditangani tanpa kehilangan data diam-diam   |

Tes otomatis difokuskan pada validasi, operasi simpan/edit/hapus, mode sementara, konflik revisi, isolasi demo, dan alur browser penting. Pemeriksaan materi, kenyamanan, kontak nyata, serta screen reader tetap memerlukan review manusia. Tidak perlu menguji ulang seluruh aplikasi setelah perubahan kecil jika pemeriksaan yang relevan sudah memadai; regresi data inti tetap wajib sebelum rilis.

### 19.2 Definition of Done rilis awal

- [ ] Seluruh FR prioritas P0 dan kasus AT yang relevan lulus; tidak ada bug kritis/tinggi yang terbuka.
- [ ] Semua materi pilot ditelaah ahli materi BK dan revisinya terdokumentasi.
- [ ] Semua halaman tersedia, route langsung dapat dipakai, dan tidak ada tombol inti palsu.
- [ ] Mode sementara, simpan, edit, hapus satu, dan hapus semua sesuai janji UI.
- [ ] Tidak ada isian keluar melalui jaringan atau telemetry; log produksi tidak memuat catatan.
- [ ] Pengujian ponsel, keyboard, screen reader, kontras, dan layout dilakukan dengan bukti hasil.
- [ ] Konfigurasi Guru BK benar untuk pilot; demo diberi label dan tidak memakai kontak rekaan yang aktif.
- [ ] Izin dan persetujuan uji yang ditentukan sekolah sudah dipenuhi sebelum melibatkan peserta.
- [ ] Hasil observasi/angket dilaporkan deskriptif; tidak ada klaim efektivitas yang melampaui data.
- [ ] README, konfigurasi, petunjuk penggunaan, checklist uji, catatan rilis, dan daftar keterbatasan tersedia.
- [ ] Penanggung jawab konten, kontak, dan pemeliharaan ditetapkan.

## 20. Rencana pembangunan lima minggu

Rencana ini mengikuti rentang lima minggu dalam proposal, dengan detail pembangunan ditambahkan sebagai **[D]**. Minggu adalah relatif terhadap dimulainya proyek; bukan tanggal yang sudah disepakati. Ketersediaan reviewer dan proses izin adalah ketergantungan utama. Jika izin terlambat, pengembangan dan demonstrasi fiktif dapat berlanjut; uji siswa menunggu prasyaratnya.

| Minggu / ADDIE                | Pekerjaan                                                                                                                                          | Luaran dan syarat lanjut                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1 / Analysis                  | Tinjau PRD, tetapkan sekolah/reviewer, siapkan izin dan instrumen, petakan kebutuhan siswa/Guru BK, finalkan batas layanan/data                    | Backlog P0, daftar keputusan, instrumen, draf materi; tidak menganggap angket sudah dilaksanakan                            |
| 2 / Analysis-Design           | Analisis kebutuhan yang tersedia, telaah pertanyaan/contoh, susun arsitektur informasi, wireframe ponsel/desktop, dialog simpan/hapus, data schema | Naskah siap ditelaah, wireframe seluruh state penting, kontrak data dan kontak; materi yang belum lolos tetap berlabel draf |
| 3 / Development               | Bangun shell navigasi, tiga modul, rangkuman, repository lokal, Catatan Saya, bantuan, privasi, demo, dan error states                             | Prototipe fungsional P0 dengan data fiktif; build dan tes data inti lulus                                                   |
| 4 / Implementation-Evaluation | Uji fungsi/aksesibilitas/ponsel, review ahli, pilot terbatas jika prasyarat terpenuhi, kumpulkan tanggapan                                         | Checklist hasil, catatan `n/N`, tema masalah, backlog revisi berprioritas                                                   |
| 5 / Evaluation-Revision       | Perbaiki temuan, uji ulang yang terdampak, periksa privasi/kontak, siapkan dokumentasi dan laporan                                                 | Prototipe revisi, hasil verifikasi, panduan, laporan batasan, dan keputusan kelayakan rilis                                 |

### 20.1 Urutan dependensi implementasi

1. Materi dan kontrak privasi menjadi dasar desain input serta rangkuman.
2. Layout/navigasi dan komponen form/dialog dibuat sebelum tiga modul memakai pola yang sama.
3. Schema/adapter/tes penyimpanan diselesaikan sebelum menghubungkan tombol simpan ke data pribadi lokal.
4. Modul dan Catatan Saya diintegrasikan, lalu demo memakai repository terpisah.
5. Konfigurasi bantuan diverifikasi sebelum kanal luar diaktifkan pada pilot.
6. Uji data, aksesibilitas, dan materi diselesaikan sebelum observasi siswa.
7. P1 hanya diambil jika P0 dan perbaikan hasil uji telah selesai.

### 20.2 Pembagian tanggung jawab yang perlu ditetapkan

Satu orang dapat merangkap beberapa peran untuk proyek mahasiswa, tetapi fungsi penelaahan materi harus jelas.

| Peran                          | Tanggung jawab                                              |
| ------------------------------ | ----------------------------------------------------------- |
| Pemilik produk                 | Menetapkan ruang lingkup, keputusan terbuka, dan prioritas  |
| Pengembang/desainer            | Membuat UI, implementasi, pengujian teknis, dan dokumentasi |
| Guru BK/ahli materi            | Menelaah konten, batas layanan, dan jalur bantuan           |
| Ahli media/penguji             | Mengevaluasi fungsi, keterbacaan, dan aksesibilitas         |
| Penghubung sekolah/fasilitator | Mengurus izin, peserta, jadwal, dan prosedur observasi      |

## 21. Risiko dan mitigasi

| Risiko                                          | Dampak                                     | Mitigasi / penanggung jawab                                                                    |
| ----------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Catatan dilihat orang lain di perangkat bersama | Kerahasiaan siswa terganggu                | Default sementara, penjelasan sebelum simpan, daftar tanpa isi, hapus mudah; desain/pengembang |
| localStorage dibersihkan/rusak                  | Catatan hilang atau tak terbaca            | Tidak menjanjikan backup, handle error, validasi skema; pengembang                             |
| Instrumen dipersepsikan sebagai tes psikologis  | Label dan interpretasi berlebihan          | Gunakan refleksi, tanpa skor; review ahli materi                                               |
| Bantuan dikira layanan instan                   | Ekspektasi respons tidak terpenuhi         | Jam layanan, batas kanal, tanpa klaim pemantauan; Guru BK/pemilik produk                       |
| Janji anonim pada WhatsApp/email                | Pengungkapan identitas yang tidak dipahami | Pemberitahuan kanal luar dan tanpa lampiran otomatis; desain                                   |
| Kontak salah atau kedaluwarsa                   | Siswa gagal mencari bantuan                | Verifikasi sebelum pilot, tanggal pemeriksaan, fallback; pengelola sekolah                     |
| Scope melebar menjadi aplikasi konseling penuh  | Jadwal dan tata kelola tidak memadai       | Bekukan P0, pisahkan P2, evaluasi kebutuhan sebelum perubahan; pemilik produk                  |
| Materi/izin terlambat                           | Pilot tertunda                             | Teruskan teknis dengan data fiktif; jadwalkan ulang pilot; fasilitator                         |
| Aset atau skrip pihak ketiga                    | Risiko lisensi, privasi, dan performa      | Aset asli/berlisensi, minim skrip, review dependency; pengembang                               |
| Kesimpulan efektivitas dari uji kecil           | Laporan menyesatkan                        | Laporkan kelayakan/deskriptif dan keterbatasan; peneliti                                       |
| Dua tab atau update versi                       | Data tertimpa atau tak kompatibel          | Revisi dokumen, deteksi konflik, migrasi eksplisit; pengembang                                 |

## 22. Roadmap setelah rilis awal [L]

### Tahap A - Penyempurnaan berdasarkan uji

Prioritaskan perbaikan yang terbukti diperlukan: bahasa, keterbacaan, kejelasan simpan/hapus, navigasi, dan relevansi contoh. Filter catatan atau materi tambahan dapat dipertimbangkan setelah data inti andal. Ekspor/impor atau offline penuh memerlukan kebutuhan nyata dan evaluasi risiko salinan/cache.

### Tahap B - Kajian layanan Guru BK

Sebelum membuat konsultasi atau dashboard, tetapkan masalah yang ingin diselesaikan, siapa pendampingnya, jam/waktu respons, batas kerahasiaan, pengelolaan siswa usia sekolah, cara rujukan, akses minimal, dan proses penanganan permintaan. Pengguna perlu memahami siapa yang dapat membaca apa.

### Tahap C - Sistem terhubung jika dibutuhkan

Jika akun/server disetujui, buat revisi PRD khusus yang mencakup autentikasi, otorisasi siswa/Guru BK, pemisahan sekolah, persetujuan berbagi per item, kebijakan retensi, penghapusan akun/data, audit akses, pemulihan, dan operasi layanan. Contoh entitas yang mungkin diperlukan: sekolah, keanggotaan, pengguna, persetujuan, permintaan bantuan, pesan, pemberian akses, dan audit. Ini belum menjadi skema atau kewajiban implementasi rilis awal.

Data lokal tidak boleh diunggah otomatis saat fitur server ditambahkan. Setiap pemindahan catatan memerlukan penjelasan, pilihan eksplisit, dan desain migrasi tersendiri. Guru BK tidak otomatis memperoleh semua jurnal setelah siswa membuat akun.

## 23. Keputusan terbuka dan default kerja

| ID   | Keputusan yang diperlukan                                       | Default selama pembangunan                                                 | Harus diputuskan sebelum   |
| ---- | --------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------- |
| Q-01 | Sekolah dan peserta pilot                                       | Tidak mencantumkan sekolah nyata; demonstrasi fiktif                       | Rekrutmen/uji siswa        |
| Q-02 | Kontak, kanal, jam layanan Guru BK                              | Kontak nonaktif dengan petunjuk menemui Guru BK                            | Kanal bantuan aktif/pilot  |
| Q-03 | Naskah materi dan reviewer                                      | Draf pada bagian 12 diberi label belum divalidasi                          | Uji materi dengan siswa    |
| Q-04 | Izin sekolah/peserta dan kebutuhan wali                         | Tidak merekrut siswa atau meminta jurnal pribadi                           | Pelibatan peserta          |
| Q-05 | Jumlah peserta dan ambang kelayakan                             | Gunakan usulan metrik untuk perencanaan; tidak membuat jumlah hasil rekaan | Pengambilan data evaluasi  |
| Q-06 | Domain, hosting, biaya, dan pemilik akun                        | Lokal/preview HTTPS bila tersedia; kepemilikan domain tidak diasumsikan    | Publikasi pilot            |
| Q-07 | Log teknis hosting dan pemberitahuan privasi final              | Tidak memasang analitik; jelaskan kemungkinan log hosting                  | Situs pilot dipublikasikan |
| Q-08 | Penanggung jawab konten/kontak/pemeliharaan                     | Dicatat sebagai peran tanpa mengarang nama                                 | Rilis pilot                |
| Q-09 | Perangkat/browser nyata sasaran uji                             | Gunakan matriks bagian 16; catat keterbatasan akses perangkat              | Finalisasi rencana uji     |
| Q-10 | Apakah pemantauan Guru BK/konsultasi wajib di rilis selanjutnya | Ditunda sebagai P2 sesuai batas prototipe                                  | Perluasan scope/backend    |

Keputusan terbuka ini tidak menghalangi wireframe dan pembangunan P0 dengan data fiktif. Keputusan yang berhubungan dengan kontak nyata, peserta, dan publikasi diselesaikan sebelum tindakan tersebut dilakukan.

## 24. Paket hasil pembangunan yang diharapkan

1. Source code website responsif dan konfigurasi dependency terkunci.
2. Lima halaman utama dan tiga halaman pendukung beserta state kosong/error/konfirmasi.
3. Tiga modul fungsional, rangkuman, Catatan Saya, serta simpan/edit/hapus lokal.
4. Mode demonstrasi terpisah dengan contoh fiktif.
5. Paket materi dan daftar versi/review.
6. Konfigurasi bantuan yang dapat diperbarui dan panduan verifikasinya.
7. README berisi menjalankan proyek, build, konfigurasi kontak, batas penyimpanan, dan cara merilis.
8. Checklist uji, bukti hasil pengujian, catatan revisi, dan laporan evaluasi terbatas.
9. Petunjuk singkat bagi siswa dan pendamping Guru BK, termasuk peringatan perangkat bersama.
10. Daftar keterbatasan dan roadmap lanjutan tanpa klaim fitur yang belum dibangun.

**Batas komitmen versi 1.0:** website refleksi mandiri yang berfungsi, dapat dievaluasi, dan konsisten dengan pilihan privasi siswa. Fitur layanan konseling terhubung hanya dibangun melalui keputusan kebutuhan dan tata kelola berikutnya.

## 25. Kebutuhan akun dan platform publik - versi 1.1

| ID     | Kebutuhan aktif                 | Kriteria penerimaan                                                                                                                 |
| ------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| FR-10  | Registrasi siswa lintas sekolah | Nama tampilan 2-60 karakter, email, kata sandi 10-128 karakter, consent; role publik selalu siswa; tanpa field sekolah/NISN/telepon |
| FR-11  | Login, sesi, dan pemulihan      | Better Auth di server; cookie HttpOnly; sesi 24 jam; email wajib diverifikasi; reset sekali pakai dan mencabut sesi lama            |
| FR-12  | Admin akun siswa                | List/detail, pencarian/filter/pagination, aktif/nonaktif, hapus siswa; admin tidak dapat mengelola admin/superadmin                 |
| FR-13  | Superadmin                      | Mengelola admin/peran, melihat audit, perlindungan akun superadmin; semua pemeriksaan dilakukan server                              |
| FR-14  | Motion dan aksesibilitas        | Transisi pendek, fokus terjaga, reduced motion, tanpa animasi yang mengubah keberhasilan operasi                                    |
| ENH-01 | Filter metadata catatan         | Jenis dan tanggal; isi/judul target/perasaan tidak muncul pada daftar                                                               |

### Data dan penghapusan akun

Server menyimpan user, account, session, verification, dan audit_log. Tidak ada tabel/endpoint jurnal. Password di-hash oleh Better Auth; token sesi tidak disimpan di localStorage. Akun disimpan sampai dihapus. Hapus/disable/perubahan peran mencabut sesi target. Identitas pada audit dapat bertahan 180 hari untuk pertanggungjawaban; cleanup berjalan saat startup/permintaan API. Login memisahkan akses catatan lokal menurut akun, tanpa enkripsi atau sinkronisasi cloud. Menghapus akun tidak menghapus catatan perangkat dari jarak jauh.

### Batas operasi dan verifikasi

Refleksi digunakan setelah login oleh siswa/siswi dari berbagai sekolah. Materi awal bersumber dari proposal dengan sasaran SMA; kesesuaian materi lintas usia memerlukan review manusia dan tidak diasumsikan tervalidasi.

Mode pengembangan menyimpan email pada backend/.data/mail yang tidak tersedia lewat HTTP. Produksi wajib memakai PUBLIC_URL HTTPS, AUTH_SECRET, SMTP_URL, MAIL_FROM, volume database persisten, dan pengelola yang ditetapkan. Superadmin pertama dibuat lewat CLI dengan credential milik pengelola; tidak tersedia bootstrap publik.

Hosting publik/SMTP/perangkat fisik/review ahli tidak digantikan oleh tes lokal. Kontak Guru BK satu sekolah tidak diperlukan untuk platform publik; kontak platform tambahan bersifat opsional dan harus terverifikasi.

## 26. Penerimaan versi 1.2

| ID    | Kebutuhan              | Bukti penerimaan                                                                                                                        |
| ----- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| FR-15 | Login wajib            | Guest di empat URL aktivitas diarahkan ke Masuk; sesi diperiksa server; setelah login kembali ke tujuan; demo juga memerlukan login     |
| FR-16 | Catatan lokal per akun | Akun A/B pada browser sama tidak saling menampilkan catatan; logout membersihkan draf; pemindahan data lama eksplisit dan tidak menimpa |
| FR-17 | Penyelarasan UI        | Riwayat mobile tampil; rangkuman fokus ke judul; token judul/kontrol/motion dan keluarga empty state konsisten                          |

## 27. Persetujuan pendaftaran — versi 1.4

- FR-18: approvalStatus server bernilai pending/approved; pendaftaran publik selalu siswa/pending dan tidak menerima approvalStatus dari client.
- FR-19: persetujuan wajib terpisah dari emailVerified dan status active/disabled. Email terverifikasi, password reset, aktivasi ulang atau promosi role tidak otomatis menyetujui akun. Sesi dan API hanya menerima akun aktif/terverifikasi/disetujui.
- FR-20: Admin dapat menyetujui siswa; Superadmin juga dapat menyetujui akun sesuai kewenangannya. Endpoint PATCH /api/admin/accounts/:id/approval menerima approved, memeriksa ulang pengelola/sasaran dalam transaksi, menolak email belum terverifikasi, akun disabled dan pengulangan keputusan, lalu mencatat audit.
- FR-21: panel Persetujuan Akun menyediakan jumlah antrean, pencarian, pagination, detail identitas dasar, refresh, tombol setujui dengan dialog dan hapus melalui dialog yang sudah ada. Akun belum verifikasi tidak dapat disetujui.
- FR-22: migrasi schema 2 mempertahankan akses pengelola lama, memerlukan persetujuan untuk siswa lama yang belum memilikinya dan mencabut sesinya. Migrasi ulang tidak menyetujui pendaftaran baru. Catatan lokal/ID akun tidak dihapus.

AT-21: email terverifikasi saja belum dapat login; siswa tidak dapat menyetujui diri; Admin menyetujui siswa lewat UI lalu pengguna dapat login ke fitur tujuan. Pembatalan dialog tidak menyimpan keputusan, dua persetujuan serentak menghasilkan satu keputusan/audit. Reset sandi/aktivasi/promosi tidak melewati persetujuan. Antrean mobile/desktop tanpa overflow dan lulus pemindaian axe.
