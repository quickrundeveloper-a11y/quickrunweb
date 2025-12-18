export const runtime = "nodejs";

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", userId, address } = body || {};

    const numericAmount = Number(amount);
    const amountPaise = Math.round(numericAmount * 100);

    if (!numericAmount || Number.isNaN(numericAmount) || amountPaise <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid amount is required" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Debug: check env presence in server logs (Vercel / Node)
    console.log("Razorpay env present?", {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
    });

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, message: "Razorpay keys are not configured" },
        { status: 500 }
      );
    }

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/72c66c78-8d52-4cdc-a1b7-9b0c44f4ba07", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H1",
        location: "app/api/razorpay/create-order/route.ts:entry",
        message: "create-order entry",
        data: { amount, currency, userId, hasKeyId: Boolean(keyId), hasKeySecret: Boolean(keySecret) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountPaise, // convert to paise
      currency,
      receipt: `qr_${Date.now()}_${userId || "guest"}`,
      notes: {
        userId: userId || "",
        addressId: address?.id || "",
      },
    });

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/72c66c78-8d52-4cdc-a1b7-9b0c44f4ba07", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H2",
        location: "app/api/razorpay/create-order/route.ts:orderCreated",
        message: "order created",
        data: { orderId: order?.id, amount: order?.amount, currency: order?.currency },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error: any) {
    // Log the raw error object first so we can see exactly what is being thrown
    console.error("Razorpay create-order RAW error:", error);

    console.error("Razorpay create-order error (parsed):", {
      message: error?.message,
      stack: error?.stack,
      response: (error as any)?.response?.data,
    });

    return NextResponse.json(
      {
        success: false,
        // TEMP: expose more info while debugging, then remove:
        message:
          (error as any)?.response?.error?.description ||
          error?.message ||
          "Unable to create Razorpay order",
      },
      { status: 500 }
    );
  }
}
  
//   catch (error: any) {
//     console.error("Razorpay create-order error:", error);
//     return NextResponse.json(
//       { success: false, message: "Unable to create Razorpay order" },
//       { status: 500 }
//     );
//   }
// }
