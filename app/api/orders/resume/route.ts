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
      return NextResponse.json({ error: "Order resume is temporarily unavailable." }, { status: 503 });
    }

    const tokenHash = createHash("sha256").update(resumeToken).digest("hex");
    const { data: order, error } = await sb
      .from("orders")
      .select("order_number,status,whatsapp_message,payment_slip_path,whatsapp_confirmation_token_hash")
      .eq("order_number", orderNumber)
      .eq("whatsapp_confirmation_token_hash", tokenHash)
      .maybeSingle();

    if (error) {
      console.error("Could not resume order:", error);
      return NextResponse.json({ error: "Could not restore this order right now." }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ error: "This pending order could not be found." }, { status: 404 });
    }
    if (order.status === "SUBMITTED") {
      return NextResponse.json({ orderNumber: String(order.order_number), status: order.status });
    }
    if (order.status !== "PENDING_WHATSAPP" || !order.payment_slip_path || !order.whatsapp_message) {
      return NextResponse.json({ error: "This order is not ready to resume." }, { status: 409 });
    }

    const { data: signedSlip, error: signedUrlError } = await sb.storage
      .from("payment_slips")
      .createSignedUrl(order.payment_slip_path, 3600);

    if (signedUrlError || !signedSlip?.signedUrl) {
      console.error("Could not create payment slip download link:", signedUrlError);
      return NextResponse.json({ error: "Could not load the saved payment slip." }, { status: 500 });
    }

    return NextResponse.json({
      orderNumber: String(order.order_number),
      status: order.status,
      message: order.whatsapp_message,
      paymentSlipUrl: signedSlip.signedUrl,
    });
  } catch (error) {
    console.error("Unexpected error resuming order:", error);
    return NextResponse.json({ error: "Could not restore this order right now." }, { status: 500 });
  }
}
