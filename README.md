# Pusat Info

Aplikasi web full JavaScript untuk membagikan informasi kepada karyawan, mengirim notifikasi email, dan mencatat siapa yang sudah membaca serta memahami informasi. Frontend dan backend dipisah, dengan Vue + Vite, Express.js, Prisma ORM, MySQL, dan Docker untuk WSL.

## Fitur

- Role `ADMIN` dan `KARYAWAN`.
- Sign up, sign in, tampilkan kata sandi, lupa/reset kata sandi.
- Verifikasi dua faktor melalui kode OTP email (“It's you”).
- Admin menerbitkan informasi dan notifikasi dikirim ke email karyawan aktif.
- Kartu informasi dengan gambar/karakter, status pembaca dan pemahaman, serta nama karyawan.
- Password di-hash dengan bcrypt, JWT, Helmet, CORS, rate limit, validasi Zod.
- Data MySQL persisten melalui Docker volume.

## Struktur

```text
pusat-info/
├── backend/
│   ├── prisma/             # schema, migration, seed admin
│   ├── src/                # API Express
│   ├── .env.example
│   ├── .env.docker.example
│   └── Dockerfile
├── frontend/
│   ├── src/                # Vue SPA
│   ├── .env.example
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Prasyarat WSL

1. Aktifkan WSL 2 dan pasang distro Ubuntu.
2. Pasang Docker Desktop, aktifkan **Use the WSL 2 based engine**, lalu aktifkan integrasi untuk distro Ubuntu.
3. Verifikasi dari terminal WSL:

```bash
docker --version
docker compose version
```

Node lokal tidak diperlukan untuk mode Docker. Image sengaja dikunci ke `node:24.2-bookworm-slim` sesuai permintaan. Untuk pengembangan tanpa Docker, gunakan Node 24.2.x.

## Instalasi Docker (disarankan)

1. Ekstrak ZIP dan masuk ke folder:

```bash
unzip pusat-info.zip
cd pusat-info
```

2. Buat konfigurasi:

```bash
cp .env.example .env
cp backend/.env.docker.example backend/.env
```

3. Ubah kredensial di `.env` dan `backend/.env`. Nilai database harus konsisten. Buat JWT secret, contoh:

```bash
openssl rand -base64 48
```

4. Isi SMTP di `backend/.env`. Contoh Microsoft 365 biasanya memakai host `smtp.office365.com`, port `587`, dan `SMTP_SECURE=false`; kebijakan tenant dapat mensyaratkan SMTP AUTH atau metode relay lain. Jangan commit rahasia.

5. Build dan jalankan:

```bash
docker compose up -d --build
```

6. Periksa kondisi:

```bash
docker compose ps
docker compose logs -f backend
curl http://localhost:3000/api/health
```

7. Buka `http://localhost:8080`. Login admin memakai `ADMIN_EMAIL` dan `ADMIN_PASSWORD` dari `backend/.env`, lalu segera ubah nilai default sebelum deployment nyata.

## Instalasi lokal tanpa Docker

MySQL harus aktif dan database `pusat_info` tersedia.

```bash
# backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev

# terminal kedua
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`; API: `http://localhost:3000`.

## Urutan proses aplikasi

1. Pengguna membuka website.
2. Pengguna sign up atau sign in.
3. Setelah password benar, backend membuat OTP 6 digit dan mengirimkannya ke email.
4. Pengguna memasukkan OTP; backend menerbitkan JWT.
5. Beranda mengambil publikasi.
6. Karyawan menandai **Sudah dibaca** dan **Sudah dipahami**.
7. Admin melihat daftar nama pada setiap kartu dan dapat menerbitkan informasi baru.

## Pengujian manual

- Daftarkan akun karyawan, lalu login dan masukkan OTP dari email.
- Login admin, buat publikasi `PUBLISHED`, pastikan notifikasi masuk ke karyawan.
- Login karyawan, klik dua tombol status.
- Muat ulang sebagai admin dan pastikan nama muncul dalam rekap.
- Uji lupa password, ambil token dari email, masukkan token dan kata sandi baru pada formulir reset.

Jika SMTP belum diisi, email dicetak ke log backend untuk pengembangan:

```bash
docker compose logs -f backend
```

## Operasional

```bash
# berhenti
docker compose down

# berhenti dan hapus database (destruktif)
docker compose down -v

# rebuild setelah perubahan
docker compose up -d --build

# backup
docker compose exec mysql sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > backup.sql

# restore
cat backup.sql | docker compose exec -T mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
```

## Catatan produksi

- Gunakan reverse proxy HTTPS, domain resmi, secret manager, akun SMTP khusus, dan backup terjadwal.
- Jangan mengekspos port MySQL ke internet. Mapping `3307` ditujukan untuk pengembangan lokal dan dapat dihapus di produksi.
- Batasi CORS melalui `FRONTEND_URL`.
- Gunakan password admin kuat dan rotasi `JWT_SECRET` secara terkontrol.
- Untuk volume besar, pindahkan pengiriman email ke antrean seperti BullMQ/Redis dan tambahkan audit log.
- OTP dan reset token di database disimpan sebagai hash dan memiliki masa berlaku.

## API ringkas

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET/POST /api/publications`
- `PUT/DELETE /api/publications/:id`
- `POST /api/publications/:id/read`
- `POST /api/publications/:id/understood`
