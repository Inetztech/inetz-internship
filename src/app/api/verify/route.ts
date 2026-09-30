import crypto from "crypto";
import { NextResponse } from "next/server";
import { recordRazorpayPayment } from "@/lib/record-razorpay-payment";
import { connectToDatabase } from "@/lib/db";
import RazorpayOrder from "@/models/RazorpayOrder";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("Razorpay is not configured.");

    await connectToDatabase();
    const trackedOrder = await RazorpayOrder.findOne({ orderId: String(razorpay_order_id || "") }).select("orderId");
    if (!trackedOrder?.orderId) {
      return NextResponse.json({ success: false, error: "Unknown Razorpay order." }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${trackedOrder.orderId}|${razorpay_payment_id}`)
      .digest("hex");
    const received = String(razorpay_signature || "");
    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
    ) {
      return NextResponse.json({ success: false, error: "Invalid Razorpay payment signature." }, { status: 400 });
    }

    const result = await recordRazorpayPayment(trackedOrder.orderId, razorpay_payment_id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("VERIFY_ROUTE_EXCEPTION:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Payment verification failed." },
      { status: 500 }
    );
  }
}
