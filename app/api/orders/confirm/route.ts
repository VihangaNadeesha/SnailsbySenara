import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber : "";
    const resumeToken = typeof body.resumeToken === "string" ? body.resumeToken : "";

    if (!orderNumber || !/^[0-9a-f]{64}$/i.test(resumeToken)) {
      return NextResponse.json({ error: "Invalid order reference or resume code." }, { status: 400 });
    }

    const sb = supabaseServer();
    if (!sb) {
      return NextResponse.json({ error: "Order confirmation is temporarily unavailable." }, { status: 503 });
    }

    const tokenHash = createHash("sha256").update(resumeToken).digest("hex");
    const { data: updatedOrder, error: updateError } = await sb
      .from("orders")
      .update({ status: "SUBMITTED", customer_confirmed_at: new Date().toISOString() })
      .eq("order_number", orderNumber)
      .eq("whatsapp_confirmation_token_hash", tokenHash)
      .eq("status", "PENDING_WHATSAPP")
      .select("order_number")
      .maybeSingle();

    if (updateError) {
      console.error("Could not confirm WhatsApp order:", updateError);
      return NextResponse.json({ error: "Could not confirm this order right now." }, { status: 500 });
    }
    if (updatedOrder) {
      return NextResponse.json({ orderNumber: String(updatedOrder.order_number), status: "SUBMITTED" });
    }

    const { data: order, error: lookupError } = await sb
      .from("orders")
      .select("order_number,status")
      .eq("order_number", orderNumber)
      .eq("whatsapp_confirmation_token_hash", tokenHash)
      .maybeSingle();

    if (lookupError) {
      console.error("Could not verify order confirmation:", lookupError);
      return NextResponse.json({ error: "Could not confirm this order right now." }, { status: 500 });
    }
    if (order?.status === "SUBMITTED") {
      return NextResponse.json({ orderNumber: String(order.order_number), status: "SUBMITTED" });
    }
    if (!order) {
      return NextResponse.json({ error: "This pending order could not be found." }, { status: 404 });
    }

    return NextResponse.json({ error: "This order is not awaiting WhatsApp confirmation." }, { status: 409 });
  } catch (error) {
    console.error("Unexpected error confirming order:", error);
    return NextResponse.json({ error: "Could not confirm this order right now." }, { status: 500 });
  }
}
