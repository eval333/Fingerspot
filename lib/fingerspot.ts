const FINGERSPOT_API_BASE_URL =
  process.env.FINGERSPOT_API_BASE_URL || "https://developer.fingerspot.io/api";
const FINGERSPOT_API_KEY = process.env.FINGERSPOT_API_KEY || "";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  trans_id?: string;
}

async function request<T = unknown>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${FINGERSPOT_API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FINGERSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAttlog(
  cloudId: string,
  startDate: string,
  endDate: string,
  transId: string = "1"
) {
  return request("/get_attlog", {
    trans_id: transId,
    cloud_id: cloudId,
    start_date: startDate,
    end_date: endDate,
  });
}

export async function getDevice(cloudId: string, transId: string = "1") {
  return request("/get_device", {
    trans_id: transId,
    cloud_id: cloudId,
  });
}

export async function getUserInfo(
  cloudId: string,
  pin: string,
  transId: string = "1"
) {
  return request("/get_userinfo", {
    trans_id: transId,
    cloud_id: cloudId,
    pin,
  });
}

export async function setUserInfo(
  cloudId: string,
  pin: string,
  name: string,
  privilege: number = 0,
  card: string = "",
  password: string = "",
  finger: string = "",
  face: string = "",
  vein: string = "",
  template: string = "",
  transId: string = "1"
) {
  return request("/set_userinfo", {
    trans_id: transId,
    cloud_id: cloudId,
    pin,
    name,
    privilege: String(privilege),
    rfid: card,
    password,
    finger,
    face,
    vein,
    template,
  });
}

export async function deleteUserInfo(
  cloudId: string,
  pin: string,
  transId: string = "1"
) {
  return request("/delete_userinfo", {
    trans_id: transId,
    cloud_id: cloudId,
    pin,
  });
}

export async function setTime(cloudId: string, transId: string = "1") {
  return request("/set_time", {
    trans_id: transId,
    cloud_id: cloudId,
  });
}

export async function registerOnline(
  cloudId: string,
  pin: string,
  transId: string = "1"
) {
  return request("/reg_online", {
    trans_id: transId,
    cloud_id: cloudId,
    pin,
  });
}

export async function restartDevice(
  cloudId: string,
  transId: string = "1"
) {
  return request("/restart_device", {
    trans_id: transId,
    cloud_id: cloudId,
  });
}

export async function getAllPin(
  cloudId: string,
  transId: string = "1"
) {
  return request("/get_all_pin", {
    trans_id: transId,
    cloud_id: cloudId,
  });
}

export const FingerspotService = {
  getAttlog,
  getDevice,
  getUserInfo,
  setUserInfo,
  deleteUserInfo,
  setTime,
  registerOnline,
  restartDevice,
  getAllPin,
};

export const DEVICES = [
  {
    cloud_id: "C2696422DF2F3337",
    type: "Fingerprint",
    api_key: "NKBQCCI1SALC9947",
  },
  {
    cloud_id: "S129000358",
    type: "Face",
    api_key: "NKBQCCI1SALC9947",
  },
];

export const SCAN_TYPES: Record<number, string> = {
  0: "Tidak Terverifikasi",
  1: "Sidik Jari (Fingerprint)",
  2: "Password",
  3: "Kartu (RFID)",
  4: "Wajah (Face)",
  6: "Vein",
  7: "QR Code",
};

export const STATUS_SCAN: Record<number, string> = {
  0: "Scan In",
  1: "Scan Out",
  2: "Break In",
  3: "Break Out",
};

export const COMMANDS = [
  {
    command: "get_attlog",
    endpoint: "/get_attlog",
    type: "Sync",
    description: "Ambil log absensi dari server (max 2 hari, data 60 hari ke belakang)",
  },
  {
    command: "get_device",
    endpoint: "/get_device",
    type: "Sync",
    description: "Ambil informasi & status perangkat",
  },
  {
    command: "get_userinfo",
    endpoint: "/get_userinfo",
    type: "Async",
    description: "Ambil info user dari perangkat (via webhook callback)",
  },
  {
    command: "set_userinfo",
    endpoint: "/set_userinfo",
    type: "Async",
    description: "Kirim/buat user di perangkat (via webhook callback)",
  },
  {
    command: "delete_userinfo",
    endpoint: "/delete_userinfo",
    type: "Async",
    description: "Hapus user dari perangkat (via webhook callback)",
  },
  {
    command: "get_all_pin",
    endpoint: "/get_all_pin",
    type: "Async",
    description: "Ambil semua PIN terdaftar (via webhook callback)",
  },
  {
    command: "set_time",
    endpoint: "/set_time",
    type: "Async",
    description: "Atur zona waktu perangkat (via webhook callback)",
  },
  {
    command: "restart_device",
    endpoint: "/restart_device",
    type: "Async",
    description: "Restart perangkat (via webhook callback)",
  },
  {
    command: "reg_online",
    endpoint: "/reg_online",
    type: "Async",
    description: "Daftarkan enroll biometrik online (via webhook callback)",
  },
];

export const WEBHOOK_EVENTS = [
  { event: "attlog", description: "Event absensi real-time (pemindaian sidik jari/wajah/vein)" },
  { event: "get_userinfo", description: "Hasil query info user dari perangkat" },
  { event: "get_userid_list", description: "Hasil query daftar user ID terdaftar" },
  { event: "set_userinfo", description: "Konfirmasi update/tambah info user" },
  { event: "delete_userinfo", description: "Konfirmasi hapus user dari perangkat" },
  { event: "set_time", description: "Konfirmasi sinkronisasi waktu perangkat" },
  { event: "restart_device", description: "Konfirmasi restart perangkat" },
  { event: "register_online", description: "Konfirmasi enroll biometrik online" },
];
