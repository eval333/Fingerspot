import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceSn = searchParams.get("device_sn");

    const admin = createAdminClient();

    let query = admin
      .from("webhook_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (deviceSn) {
      query = query.eq("device_sn", deviceSn);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
