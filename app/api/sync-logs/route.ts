import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FingerspotService } from "@/lib/fingerspot";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cloudId = searchParams.get("cloud_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const supabase = await createClient();

    let query = supabase
      .from("attlogs")
      .select("*")
      .order("datetime", { ascending: false });

    if (cloudId) {
      query = query.eq("device_sn", cloudId);
    }
    if (startDate) {
      query = query.gte("datetime", startDate);
    }
    if (endDate) {
      query = query.lte("datetime", endDate + "T23:59:59");
    }

    const { data, error } = await query.limit(500);

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

export async function POST(request: NextRequest) {
  try {
    const { cloud_id, start_date, end_date } = await request.json();

    if (!cloud_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: "cloud_id, start_date, and end_date are required" },
        { status: 400 }
      );
    }

    const result = await FingerspotService.getAttlog(cloud_id, start_date, end_date);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to sync from device" },
        { status: 500 }
      );
    }

    const admin = createAdminClient();
    const logs = Array.isArray(result.data) ? result.data : [result.data];

    for (const log of logs) {
      await admin.from("attlogs").insert({
        device_sn: cloud_id,
        pin: log.pin,
        datetime: log.scan,
        verified: parseInt(log.verify) || 0,
        status_scan: parseInt(log.status_scan) || 0,
        status: "success",
        raw_payload: log,
      });
    }

    await admin.from("api_requests").insert({
      device_sn: cloud_id,
      endpoint: "/get_attlog",
      method: "POST",
      request_payload: { cloud_id, start_date, end_date },
      response_payload: result,
      response_code: 200,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${logs.length} attendance records`,
      count: logs.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
