import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

const cf = new Cashfree(
  CFEnvironment.PRODUCTION,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, amount, address } = await req.json();

    const orderId = "ORD_" + Date.now();

    const order = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_phone: address?.phone,
        customer_email: address?.email,
      },
      order_meta: {
        return_url: `https://quickrunfast.com/payment_success?order_id=${orderId}`,
        notify_url: "https://quickrunfast.com/api/cashfree/payment-webhook"
      }
    };

    const result = await cf.PGCreateOrder(order);

    return NextResponse.json({
      success: true,
      orderId,
      paymentSessionId: result.data.payment_session_id,
    });
  } catch (e: any) {
    console.log("CF error: ", e);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}