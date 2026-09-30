import crypto from "crypto";
import { NextResponse } from "next/server";
import { recordRazorpayPayment } from "@/lib/record-razorpay-payment";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error("Razorpay webhook is not configured.");

    const rawBody = await req.text();
    const received = req.headers.get("x-razorpay-signature") || "";
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
    ) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature." }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== "payment.captured") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment?.id || !payment?.order_id) {
      return NextResponse.json({ success: false, error: "Invalid payment webhook payload." }, { status: 400 });
    }

    const result = await recordRazorpayPayment(payment.order_id, payment.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("RAZORPAY_WEBHOOK_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 500 }
    );
  }
}
