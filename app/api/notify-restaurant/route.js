import { NextResponse } from "next/server"
import { adminDB, adminMessaging } from "@/lib/firebaseAdmin"

export async function POST(req) {
  try {
    const body = await req.json()
    const { customerId, orderId } = body || {}

    if (!customerId || !orderId) {
      return NextResponse.json(
        { error: "Missing params" },
        { status: 400 }
      )
    }

    // -------- FETCH ORDER ----------
    const orderRef = adminDB
      .collection("Customer")
      .doc(customerId)
      .collection("current_order")
      .doc(orderId)

    const orderSnap = await orderRef.get()

    if (!orderSnap.exists) {
      console.error("ORDER_NOT_FOUND", { customerId, orderId })
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const order = orderSnap.data() || {}
    const items = Array.isArray(order.items) ? order.items : []

    if (items.length === 0) {
      console.error("EMPTY_ITEMS", { orderId })
      return NextResponse.json(
        { error: "No items" },
        { status: 400 }
      )
    }

    // -------- GROUP ITEMS BY RESTAURANT ----------
    const restaurantMap = new Map()

    for (const item of items) {
      const restaurantId = item.restaurantId
      if (!restaurantId) continue

      if (!restaurantMap.has(restaurantId)) {
        restaurantMap.set(restaurantId, [])
      }
      restaurantMap.get(restaurantId).push(item)
    }

    // -------- SEND NOTIFICATION ----------
    for (const [restaurantId, restaurantItems] of restaurantMap.entries()) {
      try {
        const shopRef = adminDB
          .collection("Restaurent_shop")
          .doc(restaurantId)

        const shopSnap = await shopRef.get()

        if (!shopSnap.exists) {
          console.error("SHOP_NOT_FOUND", restaurantId)
          continue
        }

        const shop = shopSnap.data() || {}

        if (!shop.activeShop || !shop.fcmId) {
          console.error("SHOP_INACTIVE_OR_NO_FCM", restaurantId)
          continue
        }

        await adminMessaging.send({
          token: shop.fcmId,
          notification: {
            title: "New Order Received 🍽️",
            body: `${order.name || "Customer"} | ₹${order.totalAmount || 0} | ${order.paymentMethod?.label || ""}`,
          },
          data: {
            orderId: String(orderId),
            customerName: order.name || "",
            phone: order.phone || "",
            address: order.address?.address || "",
            payment: order.paymentMethod?.label || "",
            total: String(order.totalAmount || ""),
            items: JSON.stringify(
              restaurantItems.map((i) => ({
                name: i.name,
                price: i.price,
                qty: i.quantity,
              }))
            ),
          },
        })
      } catch (err) {
        console.error("NOTIFICATION_FAILED", restaurantId, err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API_CRASH", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
