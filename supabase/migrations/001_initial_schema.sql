-- Fingerspot Database Migration
-- Run this in Supabase SQL Editor or via: supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- attlogs table
CREATE TABLE IF NOT EXISTS attlogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,
  pin TEXT,
  datetime TIMESTAMPTZ,
  verified INT,
  mode INT,
  status_scan INT,
  status TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- userinfos table
CREATE TABLE IF NOT EXISTS userinfos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,
  pin TEXT,
  name TEXT,
  card TEXT,
  password TEXT,
  finger TEXT,
  face TEXT,
  vein TEXT,
  template TEXT,
  privilege INT,
  department TEXT,
  status TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_sn, pin)
);

-- pins table
CREATE TABLE IF NOT EXISTS pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,
  pin TEXT,
  name TEXT,
  status TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_sn, pin)
);

-- api_requests table
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,
  endpoint TEXT,
  method TEXT,
  request_payload JSONB,
  response_payload JSONB,
  response_code INT,
  status TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,
  event TEXT,
  status TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- command_logs table
CREATE TABLE IF NOT EXISTS command_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_sn TEXT,
  trans_id TEXT,
  command TEXT,
  request_payload JSONB,
  response_payload JSONB,
  response_code INT,
  status TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE attlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE userinfos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (dashboard access)
CREATE POLICY "Allow authenticated read access on attlogs"
  ON attlogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read access on userinfos"
  ON userinfos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read access on pins"
  ON pins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read access on api_requests"
  ON api_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read access on webhook_logs"
  ON webhook_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read access on command_logs"
  ON command_logs FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
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
