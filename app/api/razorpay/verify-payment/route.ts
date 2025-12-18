import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      amount,
      userId,
    } = body || {};

    const paymentId = razorpay_payment_id;
    const rzpOrderId = razorpay_order_id || orderId;

    if (!paymentId || !rzpOrderId || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing Razorpay payment details" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, message: "Razorpay secret not configured" },
        { status: 500 }
      );
    }

    const hmac = crypto
      .createHmac("sha256", keySecret)
      .update(`${rzpOrderId}|${paymentId}`)
      .digest("hex");

    const isValid = hmac === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Signature mismatch" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified",
      orderId: rzpOrderId,
      paymentId,
      amount,
      userId,
    });
  } catch (error: any) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify payment" },
      { status: 500 }
    );
  }
}

