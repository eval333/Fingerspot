# API & Webhook Documentation
## Fingerspot Biometric Attendance Dashboard

---

## Daftar Isi
1. [Overview](#overview)
2. [API Endpoints (Fingerspot)](#api-endpoints-fingerspot)
3. [Internal API Routes](#internal-api-routes)
4. [Webhook](#webhook)
5. [Flow Diagrams](#flow-diagrams)

---

## Overview

Aplikasi ini mengintegrasikan:
- **Fingerspot Developer API** - Untuk berkomunikasi dengan device biometric
- **Webhook** - Untuk menerima data real-time dari device
- **Supabase** - Sebagai database dan autentikasi

### Devices
| Cloud ID | Tipe | Keterangan |
|----------|------|------------|
| `C2696422DF2F3337` | Fingerprint | Device utama |
| `S129000853` | Face Recognition | Device wajah |

### Base URL
- **Fingerspot API**: `https://developer.fingerspot.io/api`
- **Dashboard**: `https://fingerspot-eight.vercel.app`
- **Webhook URL**: `https://fingerspot-eight.vercel.app/api/webhook`

---

## API Endpoints (Fingerspot)

Semua request menggunakan method `POST` dengan header:
```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

### 1. get_attlog - Ambil Log Absensi
**Tipe: Sync** (data langsung dikembalikan)

```json
// Request
{
  "trans_id": 1,
  "cloud_id": "C2696422DF2F3337",
  "start_date": "2026-08-01",
  "end_date": "2026-08-08"
}

// Response
{
  "success": true,
  "trans_id": 1,
  "data": [
    {
      "pin": "90010",
      "scan": "2026-08-08 00:02:35",
      "verify": 1,
      "status_scan": 0
    }
  ]
}
```

**Keterangan:**
- `verify`: 1 = Terverifikasi, 0 = Tidak terverifikasi
- `status_scan`: 0 = Fingerprint, 4 = Face, 3 = Kartu RFID
- `trans_id`: 1-99 (harus pendek, maksimal 2 digit)

### 2. get_device - Info Device
**Tipe: Sync**

```json
// Request
{
  "trans_id": 1,
  "cloud_id": "C2696422DF2F3337"
}

// Response
{
  "success": true,
  "trans_id": 1,
  "data": {
    "cloud_id": "C2696422DF2F3337",
    "device_name": "PT XYZ",
    "webhook_url": "https://..."
  }
}
```

### 3. get_userinfo - Ambil Info User
**Tipe: Async** (data dikirim via webhook)

```json
// Request
{
  "trans_id": 50,
  "cloud_id": "C2696422DF2F3337",
  "pin": "90010"
}

// Response (langsung)
{
  "success": true,
  "trans_id": 50
}

// Data dikirim via webhook:
{
  "type": "get_userinfo",
  "cloud_id": "C2696422DF2F3337",
  "trans_id": 50,
  "data": {
    "pin": "90010",
    "name": "Test User",
    "finger": 1,
    "face": 0,
    "privilege": 1
  }
}
```

### 4. set_userinfo - Daftar User ke Device
**Tipe: Async**

```json
// Request
{
  "trans_id": 51,
  "cloud_id": "C2696422DF2F3337",
  "pin": "500001",
  "name": "User Baru",
  "rfid": 0,
  "password": 0,
  "finger": 1,
  "face": 0,
  "privilege": 1
}

// Response (langsung)
{
  "success": true,
  "trans_id": 51
}

// Hasil via webhook:
{
  "type": "set_userinfo",
  "cloud_id": "C2696422DF2F3337",
  "trans_id": 51,
  "data": {
    "msg": "Data user berhasil dikirim"
  }
}
```

### 5. delete_userinfo - Hapus User dari Device
**Tipe: Async**

```json
{
  "trans_id": 52,
  "cloud_id": "C2696422DF2F3337",
  "pin": "500001"
}
```

### 6. get_all_pin - Ambil Semua PIN
**Tipe: Async**

```json
// Request
{
  "trans_id": 1,
  "cloud_id": "C2696422DF2F3337"
}

// Response via webhook:
{
  "type": "get_userid_list",
  "cloud_id": "C2696422DF2F3337",
  "trans_id": 1,
  "data": {
    "total": 3,
    "pin_arr": ["90010", "2", "500006"]
  }
}
```

### 7. restart_device - Restart Device
**Tipe: Async**

```json
{
  "trans_id": 60,
  "cloud_id": "C2696422DF2F3337"
}
```

### 8. set_time - Update Waktu Device
**Tipe: Async**

```json
{
  "trans_id": 70,
  "cloud_id": "C2696422DF2F3337",
  "time": "2026-08-08 10:00:00"
}
```

### 9. reg_online - Registrasi Device ke Cloud
**Tipe: Async**

```json
{
  "trans_id": 80,
  "cloud_id": "C2696422DF2F3337"
}
```

---

## Internal API Routes

### POST /api/webhook
Menerima data webhook dari Fingerspot device.

**Payload:**
```json
{
  "type": "attlog",
  "cloud_id": "C2696422DF2F3337",
  "trans_id": 1,
  "data": {
    "pin": "90010",
    "scan": "2026-08-08 00:02:35",
    "verify": 1,
    "status_scan": 0
  }
}
```

**Supported Types:**
- `attlog` - Log absensi baru
- `get_userid_list` - Daftar PIN dari device
- `get_userinfo` - Info user dari device
- `set_userinfo` - Hasil set user
- `delete_userinfo` - Hasil hapus user

---

### POST /api/sync-logs
Sync log absensi dari device ke database.

**Request:**
```json
{
  "cloud_id": "C2696422DF2F3337",
  "start_date": "2026-08-01",
  "end_date": "2026-08-08"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Synced 10 attendance records",
  "count": 10
}
```

---

### POST /api/sync-users
Sync data user dari device ke database.

**Request:**
```json
{
  "cloud_id": "C2696422DF2F3337",
  "pins": ["90010", "2", "500006"]
}
```

---

### POST /api/sync-pins
Sync daftar PIN dari device ke database.

**Request:**
```json
{
  "cloud_id": "C2696422DF2F3337"
}
```

---

### POST /api/commands
Kirim command ke device.

**Request:**
```json
{
  "cloud_id": "C2696422DF2F3337",
  "command": "get_all_pin",
  "params": {}
}
```

**Available Commands:**
- `get_all_pin` - Ambil semua PIN
- `get_userinfo` - Ambil info user (butuh `pin`)
- `set_userinfo` - Daftar user (butuh `pin`, `name`, dll)
- `delete_userinfo` - Hapus user (butuh `pin`)
- `restart_device` - Restart device
- `set_time` - Update waktu (butuh `time`)
- `reg_online` - Registrasi ke cloud

---

### GET /api/sync-logs
Ambil log absensi dari database.

**Query Params:**
- `cloud_id` - Filter device
- `start_date` - Tanggal awal
- `end_date` - Tanggal akhir

---

### GET /api/attlogs/export
Export log absensi ke CSV.

**Query Params:**
- `cloud_id` - Filter device
- `start_date` - Tanggal awal
- `end_date` - Tanggal akhir

---

## Webhook

### Setup di Fingerspot Portal
1. Login ke Fingerspot Developer Portal
2. Pilih Device > Settings > Webhook
3. Masukkan URL: `https://fingerspot-eight.vercel.app/api/webhook`
4. Save

### Webhook Events

#### 1. attlog (Log Absensi)
Dikirim setiap kali user melakukan absensi.

```json
{
  "type": "attlog",
  "cloud_id": "C2696422DF2F3337",
  "data": {
    "pin": "90010",
    "scan": "2026-08-08 00:02:35",
    "verify": 1,
    "status_scan": 0
  }
}
```

**Processing:**
- Data disimpan ke tabel `attlogs`
- Log disimpan ke tabel `webhook_logs`

#### 2. get_userid_list (Daftar PIN)
Dikirim sebagai response dari command `get_all_pin`.

```json
{
  "type": "get_userid_list",
  "cloud_id": "C2696422DF2F3337",
  "trans_id": 1,
  "data": {
    "total": 3,
    "pin_arr": ["90010", "2", "500006"]
  }
}
```

#### 3. get_userinfo (Info User)
Dikirim sebagai response dari command `get_userinfo`.

```json
{
  "type": "get_userinfo",
  "cloud_id": "C2696422DF2F3337",
  "trans_id": 50,
  "data": {
    "pin": "90010",
    "name": "Test User",
    "finger": 1,
    "face": 0,
    "rfid": 0,
    "privilege": 1
  }
}
```

---

## Flow Diagrams

### Flow Sync Attendance
```
User Click "Sync" 
    ↓
POST /api/sync-logs
    ↓
FingerspotService.getAttlog()
    ↓
POST https://developer.fingerspot.io/api/get_attlog
    ↓
Response: { success: true, data: [...] }
    ↓
Simpan ke Supabase attlogs table
    ↓
Tampilkan di Dashboard
```

### Flow Webhook (Real-time)
```
User Absen di Device
    ↓
Device Kirim ke Fingerspot Cloud
    ↓
Fingerspot Cloud Kirim Webhook
    ↓
POST https://fingerspot-eight.vercel.app/api/webhook
    ↓
Parse Payload (type: attlog)
    ↓
Simpan ke Supabase attlogs table
    ↓
Tampil Real-time di Dashboard
```

### Flow Command Async
```
User Click Command (get_userinfo)
    ↓
POST /api/commands
    ↓
FingerspotService.getUserInfo()
    ↓
POST https://developer.fingerspot.io/api/get_userinfo
    ↓
Response: { success: true, trans_id: 50 }
    ↓
Device Proses Command
    ↓
Device Kirim Response via Webhook
    ↓
POST /api/webhook (type: get_userinfo)
    ↓
Simpan ke Supabase userinfos table
```

---

## Notes

1. **trans_id** harus pendek (1-99), jangan gunakan ID panjang
2. **Sync endpoints** (get_attlog, get_device) return data langsung
3. **Async endpoints** (get_userinfo, set_userinfo, dll) return data via webhook
4. **Range tanggal** untuk get_attlog maksimal 2 hari
5. **Webhook** harus terdaftar di Fingerspot Portal agar device mengirim data
