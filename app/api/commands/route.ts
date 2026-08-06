import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FingerspotService } from "@/lib/fingerspot";

export async function POST(request: NextRequest) {
  try {
    const { cloud_id, command, params } = await request.json();

    if (!cloud_id || !command) {
      return NextResponse.json(
        { error: "cloud_id and command are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const transId = String(Math.floor(Math.random() * 99) + 1);

    let result;
    switch (command) {
      case "get_attlog":
        result = await FingerspotService.getAttlog(
          cloud_id,
          params.start_date || new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
          params.end_date || new Date().toISOString().split("T")[0],
          transId
        );
        break;
      case "get_device":
        result = await FingerspotService.getDevice(cloud_id, transId);
        break;
      case "get_userinfo":
        result = await FingerspotService.getUserInfo(cloud_id, params.pin || "1", transId);
        break;
      case "set_userinfo":
        result = await FingerspotService.setUserInfo(
          cloud_id,
          params.pin,
          params.name,
          params.privilege || 0,
          params.rfid || params.card || "",
          params.password || "",
          params.finger || "",
          params.face || "",
          params.vein || "",
          params.template || "",
          transId
        );
        break;
      case "delete_userinfo":
        result = await FingerspotService.deleteUserInfo(cloud_id, params.pin, transId);
        break;
      case "get_all_pin":
        result = await FingerspotService.getAllPin(cloud_id, transId);
        break;
      case "set_time":
        result = await FingerspotService.setTime(cloud_id, transId);
        break;
      case "restart_device":
        result = await FingerspotService.restartDevice(cloud_id, transId);
        break;
      case "reg_online":
        result = await FingerspotService.registerOnline(cloud_id, params.pin || "1", transId);
        break;
      default:
        return NextResponse.json({ error: "Unknown command" }, { status: 400 });
    }

    const logEntry = {
      device_sn: cloud_id,
      command,
      trans_id: transId,
      request_payload: { trans_id: transId, cloud_id, command, ...params },
      response_payload: result,
      response_code: result.success ? 200 : 500,
      status: result.success ? "success" : "failed",
      raw_payload: result,
    };

    const { data: log } = await admin.from("command_logs").insert(logEntry).select().single();

    await admin.from("api_requests").insert({
      device_sn: cloud_id,
      endpoint: `/${command}`,
      method: "POST",
      request_payload: { trans_id: transId, cloud_id, ...params },
      response_payload: result,
      response_code: result.success ? 200 : 500,
      status: result.success ? "success" : "failed",
    });

    const { data: logs } = await admin
      .from("command_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ success: result.success, log, logs: logs || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("command_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

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
