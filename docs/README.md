# Fingerspot Biometric Attendance Dashboard

## Dokumentasi Pendukung

Folder ini berisi dokumentasi pendukung untuk aplikasi Fingerspot Biometric Attendance Dashboard.

---

## Struktur Folder

```
docs/
├── database/
│   └── schema.sql              # File SQL untuk setup database
├── erd/
│   ├── ERD.html                # ERD dalam format HTML (buka di browser)
│   └── schema.mmd              # ERD dalam format Mermaid
├── screenshots/
│   └── README.md               # Panduan mengambil screenshot
├── API_WEBHOOK_DOCS.md         # Dokumentasi lengkap API & Webhook
├── SETUP_GUIDE.md              # Panduan setup & menjalankan aplikasi
└── README.md                   # File ini
```

---

## Dokumentasi Utama

### 1. [Setup Guide](SETUP_GUIDE.md)
Panduan lengkap menjalankan aplikasi:
- Prerequisites
- Clone repository
- Install dependencies
- Setup environment variables
- Setup database
- Deploy ke Vercel

### 2. [API & Webhook Documentation](API_WEBHOOK_DOCS.md)
Dokumentasi lengkap API:
- Fingerspot API endpoints
- Internal API routes
- Webhook events
- Flow diagrams

### 3. [Database Schema](database/schema.sql)
File SQL untuk membuat tabel:
- attlogs
- userinfos
- pins
- api_requests
- webhook_logs
- command_logs

### 4. [ERD Diagram](erd/ERD.html)
Entity Relationship Diagram dalam format HTML. Buka file di browser untuk melihat.

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/eval333/Fingerspot.git
cd fingerspot

# 2. Install dependencies
npm install

# 3. Setup .env.local (lihat SETUP_GUIDE.md)

# 4. Jalankan database migration
# Buka Supabase SQL Editor, paste isi database/schema.sql

# 5. Jalankan aplikasi
npm run dev
```

---

## Info Aplikasi

| Item | Value |
|------|-------|
| URL Production | https://fingerspot-eight.vercel.app |
| URL Webhook | https://fingerspot-eight.vercel.app/api/webhook |
| Email | admin@fingerspot.com |
| Password | fingerspot123 |

---

## Devices

| Cloud ID | Tipe |
|----------|------|
| C2696422DF2F3337 | Fingerprint |
| S129000853 | Face Recognition |
