import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cloudId = searchParams.get("cloud_id");

    const admin = createAdminClient();

    let query = admin
      .from("api_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (cloudId) {
      query = query.eq("device_sn", cloudId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
