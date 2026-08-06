export interface Database {
  public: {
    Tables: {
      attlogs: {
        Row: {
          id: string;
          device_sn: string | null;
          pin: string | null;
          datetime: string | null;
          verified: number | null;
          mode: number | null;
          status_scan: number | null;
          status: string | null;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_sn?: string | null;
          pin?: string | null;
          datetime?: string | null;
          verified?: number | null;
          mode?: number | null;
          status_scan?: number | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_sn?: string | null;
          pin?: string | null;
          datetime?: string | null;
          verified?: number | null;
          mode?: number | null;
          status_scan?: number | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      userinfos: {
        Row: {
          id: string;
          device_sn: string | null;
          pin: string | null;
          name: string | null;
          card: string | null;
          password: string | null;
          finger: string | null;
          face: string | null;
          vein: string | null;
          template: string | null;
          privilege: number | null;
          department: string | null;
          status: string | null;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_sn?: string | null;
          pin?: string | null;
          name?: string | null;
          card?: string | null;
          password?: string | null;
          finger?: string | null;
          face?: string | null;
          vein?: string | null;
          template?: string | null;
          privilege?: number | null;
          department?: string | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_sn?: string | null;
          pin?: string | null;
          name?: string | null;
          card?: string | null;
          password?: string | null;
          finger?: string | null;
          face?: string | null;
          vein?: string | null;
          template?: string | null;
          privilege?: number | null;
          department?: string | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pins: {
        Row: {
          id: string;
          device_sn: string | null;
          pin: string | null;
          name: string | null;
          status: string | null;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_sn?: string | null;
          pin?: string | null;
          name?: string | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_sn?: string | null;
          pin?: string | null;
          name?: string | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_requests: {
        Row: {
          id: string;
          device_sn: string | null;
          endpoint: string | null;
          method: string | null;
          request_payload: Record<string, unknown> | null;
          response_payload: Record<string, unknown> | null;
          response_code: number | null;
          status: string | null;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_sn?: string | null;
          endpoint?: string | null;
          method?: string | null;
          request_payload?: Record<string, unknown> | null;
          response_payload?: Record<string, unknown> | null;
          response_code?: number | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_sn?: string | null;
          endpoint?: string | null;
          method?: string | null;
          request_payload?: Record<string, unknown> | null;
          response_payload?: Record<string, unknown> | null;
          response_code?: number | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      webhook_logs: {
        Row: {
          id: string;
          device_sn: string | null;
          event: string | null;
          status: string | null;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_sn?: string | null;
          event?: string | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_sn?: string | null;
          event?: string | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      command_logs: {
        Row: {
          id: string;
          device_sn: string | null;
          trans_id: string | null;
          command: string | null;
          request_payload: Record<string, unknown> | null;
          response_payload: Record<string, unknown> | null;
          response_code: number | null;
          status: string | null;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_sn?: string | null;
          trans_id?: string | null;
          command?: string | null;
          request_payload?: Record<string, unknown> | null;
          response_payload?: Record<string, unknown> | null;
          response_code?: number | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_sn?: string | null;
          trans_id?: string | null;
          command?: string | null;
          request_payload?: Record<string, unknown> | null;
          response_payload?: Record<string, unknown> | null;
          response_code?: number | null;
          status?: string | null;
          raw_payload?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
