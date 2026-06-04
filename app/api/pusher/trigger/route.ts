import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const { channel, event, data } = await req.json();

    if (!channel || !event) {
      return NextResponse.json({ error: "Missing channel or event" }, { status: 400 });
    }

    await pusherServer.trigger(channel, event, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher trigger error:", error);
    return NextResponse.json({ error: "Failed to trigger event" }, { status: 500 });
  }
}
