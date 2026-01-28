import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID missing" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.cashfree.com/pg/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID || "",
          "x-client-secret": process.env.CASHFREE_SECRET_KEY || "",
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Cashfree verification failed",
          cashfree: data,
        },
        { status: 500 }
      );
    }

    const status = data.order_status;

    if (status === "PAID") {
      return NextResponse.json({
        success: true,
        paid: true,
        data,
      });
    }

    return NextResponse.json({
      success: true,
      paid: false,
      data,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        message: e.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID missing" },
        { status: 400 }
      );
    }

    // Call Cashfree order status API
    const response = await fetch(
      `https://api.cashfree.com/pg/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID || "",
          "x-client-secret": process.env.CASHFREE_SECRET_KEY || "",
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Cashfree verification failed",
          cashfree: data,
        },
        { status: 500 }
      );
    }

    // Check payment status
    const status = data.order_status;

    if (status === "PAID") {
      return NextResponse.json({
        success: true,
        paid: true,
        data,
      });
    }

    return NextResponse.json({
      success: true,
      paid: false,
      data,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        message: e.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}