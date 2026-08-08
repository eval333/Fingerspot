# Cara Menjalankan Aplikasi
## Fingerspot Biometric Attendance Dashboard

---

## Daftar Isi
1. [Prerequisites](#prerequisites)
2. [Clone Repository](#clone-repository)
3. [Install Dependencies](#install-dependencies)
4. [Environment Variables](#environment-variables)
5. [Setup Database](#setup-database)
6. [Jalankan Aplikasi](#jalankan-aplikasi)
7. [Deploy ke Vercel](#deploy-ke-vercel)
8. [Login](#login)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Pastikan sudah terinstall:
- **Node.js** v18 atau lebih baru
- **npm** atau **yarn**
- **Git**
- **Akun Supabase** (gratis)
- **Akun Vercel** (gratis)
- **Akun Fingerspot Developer** (untuk API key)

---

## Clone Repository

```bash
# Clone repository
git clone https://github.com/eval333/Fingerspot.git

# Masuk ke folder project
cd fingerspot
```

---

## Install Dependencies

```bash
# Install semua dependencies
npm install
```

---

## Environment Variables

Buat file `.env.local` di root folder:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://wnrkfonnwcbpzmvuenan.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Fingerspot API
FINGERSPOT_API_BASE_URL=https://developer.fingerspot.io/api
FINGERSPOT_API_KEY=your_api_key_here
```

### Cara Mendapatkan Values:

#### Supabase:
1. Login ke https://supabase.com
2. Pilih project `wnrkfonnwcbpzmvuenan`
3. Buka **Settings > API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

#### Fingerspot:
1. Login ke https://developer.fingerspot.io
2. Buka **Settings > API Key**
3. Copy API Key → `FINGERSPOT_API_KEY`

---

## Setup Database

### Option 1: Via Supabase Dashboard (Recommended)

1. Login ke Supabase Dashboard
2. Buka **SQL Editor**
3. Copy isi file `docs/database/schema.sql`
4. Paste dan klik **Run**

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref wnrkfonnwcbpzmvuenan

# Push database
supabase db push
```

### Buat User Admin

1. Buka Supabase Dashboard > **Authentication > Users**
2. Klik **Add User**
3. Masukkan:
   - Email: `admin@fingerspot.com`
   - Password: `fingerspot123`
4. Klik **Create User**

---

## Jalankan Aplikasi

```bash
# Jalankan development server
npm run dev
```

Buka browser dan akses:
- **http://localhost:3000** - Halaman utama
- **http://localhost:3000/login** - Halaman login

---

## Deploy ke Vercel

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: Via GitHub Integration

1. Push repository ke GitHub
2. Login ke https://vercel.com
3. Klik **New Project**
4. Import repository `eval333/Fingerspot`
5. Vercel akan otomatis detect Next.js
6. Klik **Deploy**

### Setup Environment Variables di Vercel

```bash
# Set environment variables
echo "your_supabase_url" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "your_anon_key" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "your_service_role_key" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "https://developer.fingerspot.io/api" | vercel env add FINGERSPOT_API_BASE_URL production
echo "your_api_key" | vercel env add FINGERSPOT_API_KEY production
```

### Setup Webhook di Fingerspot Portal

1. Login ke https://developer.fingerspot.io
2. Pilih Device > **Settings > Webhook**
3. Masukkan URL:
   ```
   https://fingerspot-eight.vercel.app/api/webhook
   ```
4. Save

---

## Login

1. Buka aplikasi di browser
2. Masukkan credentials:
   - **Email:** `admin@fingerspot.com`
   - **Password:** `fingerspot123`
3. Klik **Sign In**

---

## Troubleshooting

### Login Error "Missing Supabase environment variables"
- Pastikan environment variables sudah benar
- Redeploy setelah mengubah environment variables

### Tidak Ada Data Absen
1. Pastikan device sudah terhubung internet
2. Pastikan icon awan/cloud muncul di device
3. Pastikan webhook sudah terdaftar di Fingerspot Portal
4. Coba absen beberapa kali, lalu sync

### Webhook Tidak Menerima Data
1. Pastikan URL webhook benar
2. Cek logs di dashboard > Webhooks
3. Pastikan device online di Fingerspot Portal

### Build Error
```bash
# Clear cache
rm -rf node_modules .next
npm install
npm run build
```

---

## URL Aplikasi

| URL | Keterangan |
|-----|------------|
| `https://fingerspot-eight.vercel.app` | Dashboard (Production) |
| `https://fingerspot-eight.vercel.app/login` | Login Page |
| `https://fingerspot-eight.vercel.app/api/webhook` | Webhook Endpoint |

---

## Default Credentials

| Item | Value |
|------|-------|
| Email | `admin@fingerspot.com` |
| Password | `fingerspot123` |
| API Key | `NKBQCCI1SALC9947` |
| Cloud ID (Fingerprint) | `C2696422DF2F3337` |
| Cloud ID (Face) | `S129000853` |
