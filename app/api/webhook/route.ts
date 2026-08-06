import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const supabase = createAdminClient();

    const event = payload.type || "unknown";
    const cloudId = payload.cloud_id || null;
    const transId = payload.trans_id || null;

    await supabase.from("webhook_logs").insert({
      device_sn: cloudId,
      event,
      status: "processed",
      raw_payload: payload,
    });

    switch (event) {
      case "attlog": {
        const d = payload.data || {};
        await supabase.from("attlogs").insert({
          device_sn: cloudId,
          pin: d.pin,
          datetime: d.scan,
          verified: parseInt(d.verify) || 0,
          status_scan: parseInt(d.status_scan) || 0,
          status: "success",
          raw_payload: d,
        });
        break;
      }

      case "get_userinfo": {
        const d = payload.data || {};
        await supabase.from("userinfos").upsert(
          {
            device_sn: cloudId,
            pin: d.pin,
            name: d.name,
            card: d.rfid,
            password: d.password,
            finger: d.finger,
            face: d.face,
            vein: d.vein,
            template: d.template,
            privilege: parseInt(d.privilege) || 0,
            status: "active",
            raw_payload: d,
          },
          { onConflict: "device_sn,pin" }
        );
        break;
      }

      case "get_userid_list": {
        const d = payload.data || {};
        const pins = d.pin_arr || [];
        for (const pin of pins) {
          await supabase.from("pins").upsert(
            {
              device_sn: cloudId,
              pin,
              name: null,
              status: "active",
              raw_payload: { pin, total: d.total },
            },
            { onConflict: "device_sn,pin" }
          );
        }
        break;
      }

      case "set_userinfo":
      case "delete_userinfo":
      case "set_time":
      case "restart_device":
      case "register_online": {
        if (transId) {
          await supabase
            .from("command_logs")
            .update({ status: "success", updated_at: new Date().toISOString() })
            .eq("trans_id", String(transId))
            .eq("device_sn", cloudId);
        }
        break;
      }

      default:
        console.log("Unknown webhook event:", event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Fingerspot webhook endpoint is running",
  });
}
