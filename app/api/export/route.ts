import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "attlogs";
    const cloudId = searchParams.get("cloud_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const supabase = await createClient();

    let query;
    let filename;

    switch (type) {
      case "attlogs":
        query = supabase.from("attlogs").select("*").order("datetime", { ascending: false });
        filename = "attendance_logs.csv";
        if (cloudId) query = query.eq("device_sn", cloudId);
        if (startDate) query = query.gte("datetime", startDate);
        if (endDate) query = query.lte("datetime", endDate + "T23:59:59");
        break;
      case "userinfos":
        query = supabase.from("userinfos").select("*").order("name");
        filename = "employees.csv";
        if (cloudId) query = query.eq("device_sn", cloudId);
        break;
      case "pins":
        query = supabase.from("pins").select("*").order("pin");
        filename = "pins.csv";
        if (cloudId) query = query.eq("device_sn", cloudId);
        break;
      case "command_logs":
        query = supabase.from("command_logs").select("*").order("created_at", { ascending: false });
        filename = "command_logs.csv";
        if (cloudId) query = query.eq("device_sn", cloudId);
        break;
      case "webhook_logs":
        query = supabase.from("webhook_logs").select("*").order("created_at", { ascending: false });
        filename = "webhook_logs.csv";
        if (cloudId) query = query.eq("device_sn", cloudId);
        break;
      case "api_requests":
        query = supabase.from("api_requests").select("*").order("created_at", { ascending: false });
        filename = "api_requests.csv";
        if (cloudId) query = query.eq("device_sn", cloudId);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const { data, error } = await query.limit(5000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return new NextResponse("No data available", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row: Record<string, unknown>) =>
        headers
          .map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return "";
            const str = typeof val === "object" ? JSON.stringify(val) : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
