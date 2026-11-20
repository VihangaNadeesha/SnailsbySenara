import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { demoProducts, placeholderSettings } from "@/lib/demo";

export const runtime = "nodejs";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ORDER_REFERENCE_PLACEHOLDER = "__ORDER_REFERENCE__";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const address = String(form.get("address") || "").trim();
    const notes = String(form.get("notes") || "").trim();
    const file = form.get("slip");
    const itemsRaw = String(form.get("items") || "[]");
    const idempotencyKey = String(form.get("idempotencyKey") || "");
    const resumeToken = String(form.get("resumeToken") || "");
    const messageTemplate = String(form.get("messageTemplate") || "");

    if (
      !UUID_PATTERN.test(idempotencyKey) ||
      !/^[0-9a-f]{64}$/i.test(resumeToken) ||
      messageTemplate.length < 20 ||
      messageTemplate.length > 8000 ||
      !messageTemplate.includes(ORDER_REFERENCE_PLACEHOLDER)
    ) {
      return NextResponse.json({ error: "Invalid order confirmation details." }, { status: 400 });
    }

    const tokenHash = createHash("sha256").update(resumeToken).digest("hex");

    // Validate delivery details
    if (name.length < 2 || phone.length < 5 || address.length < 5) {
      console.error("Delivery details validation failed:", { name: name.length, phone: phone.length, address: address.length });
      return NextResponse.json({ error: "Please complete your delivery details." }, { status: 400 });
    }

    // Validate file
    if (!(file instanceof File) || !ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      console.error("File validation failed:", { isFile: file instanceof File, type: file instanceof File ? file.type : "N/A", size: file instanceof File ? file.size : "N/A" });
      return NextResponse.json({ error: "Please upload a valid payment slip under 5 MB." }, { status: 400 });
    }

    // Parse and validate cart items
    let items: unknown;
    try {
      items = JSON.parse(itemsRaw);
    } catch (e) {
      console.error("Failed to parse items JSON:", itemsRaw);
      return NextResponse.json({ error: "Invalid cart data." }, { status: 400 });
    }

    if (!Array.isArray(items) || !items.length) {
      console.error("Cart validation failed: not array or empty");
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Validate each item
    const parsed = items.map((i) => {
      if (!i || typeof i !== "object") {
        console.error("Invalid item structure:", i);
        throw new Error("Invalid item");
      }
      const x = i as Record<string, unknown>;
      if (
        typeof x.product_id !== "string" ||
        !["XS", "S", "M", "L"].includes(String(x.selected_size)) ||
        !Number.isInteger(x.quantity) ||
        Number(x.quantity) < 1 ||
        Number(x.quantity) > 10
      ) {
        console.error("Item validation failed:", x);
        throw new Error("Invalid item data");
      }
      return {
        product_id: x.product_id,
        selected_size: String(x.selected_size),
        quantity: Number(x.quantity),
      };
    });

    // Get Supabase client
    const sb = supabaseServer();
    if (!sb) {
      return NextResponse.json(
        { error: "Order submission requires the Supabase server configuration.", code: "SUPABASE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const { data: existingOrder, error: existingOrderError } = await sb
      .from("orders")
      .select("order_number,status,whatsapp_confirmation_token_hash")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingOrderError) {
      console.error("Could not check order idempotency:", existingOrderError);
      if (existingOrderError.code === "42703" || existingOrderError.code === "PGRST204") {
        return NextResponse.json(
          { error: "Supabase is missing the WhatsApp order confirmation schema. Apply the latest order confirmation migration, then retry." },
          { status: 503 }
        );
      }
      throw new Error("Could not verify the order submission.");
    }

    if (existingOrder) {
      if (existingOrder.whatsapp_confirmation_token_hash !== tokenHash) {
        return NextResponse.json({ error: "This checkout attempt is no longer valid." }, { status: 409 });
      }
      if (!["PENDING_WHATSAPP", "SUBMITTED"].includes(existingOrder.status)) {
        return NextResponse.json({ error: "Your order is still being processed. Please retry shortly." }, { status: 409 });
      }
      return NextResponse.json({
        orderNumber: String(existingOrder.order_number),
        resumeToken,
      });
    }

    // Fetch product details - use columns that actually exist
    let { data: products, error: productsError } = await sb
      .from("products")
      .select("id,name,price")
      .in(
        "id",
        parsed.map((x) => x.product_id)
      );

    // If products not found in Supabase, check if they're demo product IDs
    if (productsError || !products || products.length !== parsed.length) {
      console.warn("Supabase product fetch failed or incomplete:", { productsError, productsCount: products?.length, expectedCount: parsed.length });
      
      // Try to use demo products as fallback
      products = parsed.map((item) => {
        const demoProduct = demoProducts.find((p) => p.id === item.product_id);
        if (!demoProduct) {
          throw new Error(`Product not found: ${item.product_id}`);
        }
        return { id: demoProduct.id, name: demoProduct.name, price: demoProduct.price };
      });
    }

    // Validate products exist
    if (!products || products.length !== parsed.length) {
      console.error("Product validation failed: not all products found");
      return NextResponse.json({ error: "One of these sets is no longer available." }, { status: 400 });
    }

    // Calculate totals
    const subtotal = parsed.reduce((sum, i) => {
      const p = products.find((x) => x.id === i.product_id)!;
      return sum + p.price * i.quantity;
    }, 0);
    
    const { data: businessSettings, error: settingsError } = await sb
      .from("business_settings")
      .select("delivery_fee")
      .limit(1)
      .maybeSingle();
    if (settingsError && !["PGRST205", "42P01"].includes(settingsError.code)) {
      console.error("Could not load delivery fee:", settingsError);
      return NextResponse.json(
        { error: "We couldn't calculate your order total. Please try again." },
        { status: 503 }
      );
    }
    if (settingsError || !businessSettings) {
      console.warn("Business settings unavailable; using the storefront's default delivery fee.");
    }
    const total = subtotal + Number(businessSettings?.delivery_fee ?? placeholderSettings.delivery_fee);

    // Create order using only columns that exist in the actual database
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log("Creating WhatsApp-pending order");
    const { data: order, error: orderError } = await sb
      .from("orders")
      .insert({
        order_number: orderNumber,
        total_amount: total,
        status: "CREATING",
        payment_method: "bank_transfer",
        payment_status: "unpaid",
        idempotency_key: idempotencyKey,
        whatsapp_confirmation_token_hash: tokenHash,
        whatsapp_message: messageTemplate.replaceAll(ORDER_REFERENCE_PLACEHOLDER, orderNumber),
      })
      .select("id,order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert failed:", orderError);
      throw new Error("Failed to create order");
    }

    console.log("Order created successfully:", { orderId: order.id, orderNumber: order.order_number });

    // Create order items using columns that exist
    // For demo products, we can't use product_id as FK, so we'll store just quantity and price
    const { error: itemError } = await sb.from("order_items").insert(
      parsed.map((i) => {
        const p = products.find((x) => x.id === i.product_id)!;
        // Check if this is a real UUID (product from DB) or demo ID
        const isRealProduct = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id);
        
        return {
          order_id: order.id,
          product_id: isRealProduct ? p.id : null,  // Use null for demo products to avoid FK constraint
          quantity: i.quantity,
          price: p.price,
        };
      })
    );

    if (itemError) {
      console.error("Order items insert failed:", itemError);
      await sb.from("orders").delete().eq("id", order.id);
      throw new Error("Failed to save order items");
    }

    // Upload payment slip
    const ext = (file as File).type.split("/")[1];
    const slipPath = `${order.id}/payment-slip.${ext}`;
    const { error: uploadError } = await sb.storage.from("payment_slips").upload(slipPath, file as File, {
      contentType: (file as File).type,
      upsert: false,
    });

    if (uploadError) {
      console.error("File upload failed:", uploadError);
      const { error: cleanupError } = await sb.from("orders").delete().eq("id", order.id);
      if (cleanupError) {
        console.error("Could not clean up order after slip upload failure:", cleanupError);
      }
      return NextResponse.json(
        { error: "We couldn't save your payment slip. Please retry your order." },
        { status: 503 }
      );
    }

    const { error: readyError } = await sb
      .from("orders")
      .update({ payment_slip_path: slipPath, status: "PENDING_WHATSAPP" })
      .eq("id", order.id);
    if (readyError) {
      console.error("Could not finalize order after slip upload:", readyError);
      const { error: fileCleanupError } = await sb.storage.from("payment_slips").remove([slipPath]);
      if (fileCleanupError) console.error("Could not clean up uploaded payment slip:", fileCleanupError);
      const { error: orderCleanupError } = await sb.from("orders").delete().eq("id", order.id);
      if (orderCleanupError) console.error("Could not clean up incomplete order:", orderCleanupError);
      throw new Error("Could not finalize the order.");
    }

    // Try to create a bank_payments record for tracking payment details
    // This will store the customer info and payment slip reference
    const { error: bankPaymentError } = await sb.from("bank_payments").insert({
      order_id: order.id,
      account_holder_name: name,
      bank_name: "Customer Bank Transfer",
      account_number: phone, // Using phone as a temporary reference
      amount: total,
      payment_status: "pending",
      receipt_url: slipPath,
      notes: address + (notes ? "\n" + notes : ""),
    }).select("id").single();

    if (bankPaymentError) {
      console.warn("Bank payment record creation failed (non-critical):", bankPaymentError);
    }

    console.log("Order submission complete:", { orderId: order.id, orderNumber: order.order_number, total });
    return NextResponse.json({ orderNumber: order.order_number, resumeToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unexpected error in POST /api/orders:", err);
    return NextResponse.json(
      { error: "We couldn't submit your order right now. Please try again." },
      { status: 500 }
    );
  }
}
