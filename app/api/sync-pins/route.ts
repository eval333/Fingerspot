import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FingerspotService } from "@/lib/fingerspot";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cloudId = searchParams.get("cloud_id");

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    let query = supabase.from("pins").select("*").order("pin");

    if (cloudId) {
      query = query.eq("device_sn", cloudId);
    }

    const { data, error } = await query.limit(500);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pins: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { cloud_id } = await request.json();

    if (!cloud_id) {
      return NextResponse.json({ error: "cloud_id is required" }, { status: 400 });
    }

    const result = await FingerspotService.getAllPin(cloud_id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to sync from device" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sync command sent. Results will arrive via webhook.",
      trans_id: result.trans_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
