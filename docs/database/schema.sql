-- ============================================
-- FINGERSPOT DATABASE SCHEMA
-- ============================================
-- Database: Supabase (PostgreSQL)
-- Project: wnrkfonnwcbpzmvuenan
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ATTLOGS - Tabel Log Absensi
-- ============================================
-- Menyimpan data log absensi dari device fingerprint/face
CREATE TABLE IF NOT EXISTS attlogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,                    -- Cloud ID device
  pin TEXT,                          -- PIN user yang absen
  datetime TIMESTAMPTZ,             -- Waktu absensi
  verified INT,                     -- Status verifikasi (1=verified)
  mode INT,                         -- Mode absensi
  status_scan INT,                  -- Status scan (0=fingerprint, 4=face)
  status TEXT,                      -- Status proses
  raw_payload JSONB,               -- Data raw dari webhook
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USERINFOS - Tabel Informasi User
-- ============================================
-- Menyimpan data user yang terdaftar di device
CREATE TABLE IF NOT EXISTS userinfos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,                    -- Cloud ID device
  pin TEXT,                          -- PIN user
  name TEXT,                         -- Nama user
  card TEXT,                         -- Nomor kartu RFID
  password TEXT,                     -- Password user
  finger TEXT,                       -- Status fingerprint
  face TEXT,                         -- Status face recognition
  vein TEXT,                         -- Status vein recognition
  template TEXT,                     -- Template biometric
  privilege INT,                     -- Level privilege (1=user, 2=admin)
  department TEXT,                   -- Departemen
  status TEXT,                       -- Status aktif/inaktif
  raw_payload JSONB,                -- Data raw dari API
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_sn, pin)
);

-- ============================================
-- 3. PINS - Tabel PIN List
-- ============================================
-- Menyimpan daftar PIN yang terdaftar di device
CREATE TABLE IF NOT EXISTS pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,                    -- Cloud ID device
  pin TEXT,                          -- PIN number
  name TEXT,                         -- Nama user
  status TEXT,                       -- Status PIN
  raw_payload JSONB,                -- Data raw dari webhook
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_sn, pin)
);

-- ============================================
-- 4. API_REQUESTS - Tabel Log API Request
-- ============================================
-- Menyimpan log semua request API ke Fingerspot
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,                    -- Cloud ID device
  endpoint TEXT,                     -- Endpoint yang dipanggil
  method TEXT,                       -- HTTP method (POST)
  request_payload JSONB,            -- Data request
  response_payload JSONB,           -- Data response
  response_code INT,                -- HTTP response code
  status TEXT,                       -- Status request (success/failed)
  raw_payload JSONB,                -- Data raw
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. WEBHOOK_LOGS - Tabel Log Webhook
-- ============================================
-- Menyimpan log semua webhook yang diterima dari device
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,                    -- Cloud ID device
  event TEXT,                        -- Jenis event (attlog, get_userid_list, dll)
  status TEXT,                       -- Status proses
  raw_payload JSONB,                -- Data raw webhook
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. COMMAND_LOGS - Tabel Log Command
-- ============================================
-- Menyimpan log semua command yang dikirim ke device
CREATE TABLE IF NOT EXISTS command_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,                    -- Cloud ID device
  trans_id TEXT,                     -- Transaction ID
  command TEXT,                      -- Jenis command
  request_payload JSONB,            -- Data request
  response_payload JSONB,           -- Data response
  response_code INT,                -- HTTP response code
  status TEXT,                       -- Status command
  raw_payload JSONB,                -- Data raw
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Mengaktifkan RLS pada semua tabel
ALTER TABLE attlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE userinfos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_logs ENABLE ROW LEVEL SECURITY;

-- Membuat policy untuk authenticated users (dashboard access)
CREATE POLICY "Allow authenticated read access on attlogs"
  ON attlogs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access on userinfos"
  ON userinfos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access on pins"
  ON pins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access on api_requests"
  ON api_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access on webhook_logs"
  ON webhook_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access on command_logs"
  ON command_logs FOR SELECT TO authenticated USING (true);

-- ============================================
-- INDEXES - Optimasi Performa
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attlogs_device_sn ON attlogs(device_sn);
CREATE INDEX IF NOT EXISTS idx_attlogs_pin ON attlogs(pin);
CREATE INDEX IF NOT EXISTS idx_attlogs_datetime ON attlogs(datetime);
CREATE INDEX IF NOT EXISTS idx_userinfos_device_sn ON userinfos(device_sn);
CREATE INDEX IF NOT EXISTS idx_userinfos_pin ON userinfos(pin);
CREATE INDEX IF NOT EXISTS idx_pins_device_sn ON pins(device_sn);
CREATE INDEX IF NOT EXISTS idx_api_requests_device_sn ON api_requests(device_sn);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_device_sn ON webhook_logs(device_sn);
CREATE INDEX IF NOT EXISTS idx_command_logs_device_sn ON command_logs(device_sn);
CREATE INDEX IF NOT EXISTS idx_command_logs_trans_id ON command_logs(trans_id);

-- ============================================
-- SEED DATA - Akun Admin
-- ============================================
-- Email: admin@fingerspot.com
-- Password: fingerspot123
-- Dibuat melalui Supabase Auth
