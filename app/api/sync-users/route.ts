import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FingerspotService } from "@/lib/fingerspot";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cloudId = searchParams.get("cloud_id");
    const pin = searchParams.get("pin");

    const supabase = await createClient();

    let query = supabase.from("userinfos").select("*").order("name");

    if (cloudId) {
      query = query.eq("device_sn", cloudId);
    }
    if (pin) {
      query = query.eq("pin", pin);
    }

    const { data, error } = await query.limit(500);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (pin && data && data.length === 1) {
      return NextResponse.json({ user: data[0] });
    }

    return NextResponse.json({ users: data || [] });
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
      message: result.success
        ? "Sync command sent. Results will arrive via webhook."
        : result.message,
      trans_id: result.trans_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { cloud_id, pin, name, card, password, privilege } = await request.json();

    if (!cloud_id || !pin || !name) {
      return NextResponse.json(
        { error: "cloud_id, pin, and name are required" },
        { status: 400 }
      );
    }

    const result = await FingerspotService.setUserInfo(
      cloud_id,
      pin,
      name,
      privilege || 0,
      card || "",
      password || ""
    );

    const admin = createAdminClient();

    await admin.from("userinfos").upsert(
      {
        device_sn: cloud_id,
        pin,
        name,
        card: card || null,
        password: password || null,
        privilege: privilege || 0,
        status: "active",
        raw_payload: result.data,
      },
      { onConflict: "device_sn,pin" }
    );

    return NextResponse.json({
      success: result.success,
      message: result.success ? "User command sent. Result will arrive via webhook." : result.message,
      trans_id: result.trans_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { cloud_id, pin } = await request.json();

    if (!cloud_id || !pin) {
      return NextResponse.json(
        { error: "cloud_id and pin are required" },
        { status: 400 }
      );
    }

    const result = await FingerspotService.deleteUserInfo(cloud_id, pin);

    const admin = createAdminClient();
    await admin
      .from("userinfos")
      .update({ status: "deleted" })
      .eq("device_sn", cloud_id)
      .eq("pin", pin);

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Delete command sent. Result will arrive via webhook." : result.message,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
