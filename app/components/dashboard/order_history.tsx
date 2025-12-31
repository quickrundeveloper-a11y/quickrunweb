"use client";

import { useEffect, useState } from "react";
// 1. REMOVED 'auth' and 'onAuthStateChanged'
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { CheckCircle, Clock } from "lucide-react";

export default function OrdersComponent() {
  // 2. REPLACED 'user' state with 'userId'
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. REMOVED Firebase Auth useEffect (onAuthStateChanged)

  // 4. ADDED localStorage useEffect for userId
  useEffect(() => {
    setUserId(localStorage.getItem("currentUser"));
  }, []);

  // 5. Updated to depend on userId
  useEffect(() => {
    // Check for userId instead of user
    if (!userId) {
      setLoading(false); // Treat as loaded/unauthenticated
      setOrders([]);
      return;
    }

    // Updated path: user.uid -> userId
    const ref = collection(db, "Customer", userId, "OrderHistory");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(arr);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]); // Updated dependency array

  const getDate = (ts: any) => {
    if (!ts) return "";
    return ts.toDate
      ? ts.toDate().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "numeric",
        })
      : new Date(ts).toLocaleString();
  };

  const shortId = (id: any) => (id ? id.slice(-7).toUpperCase() : "");

  return (
    <div className="w-full h-full overflow-y-auto px-5 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-5">Orders</h1>

      {/* 6. UPDATED CONDITIONAL RENDERING: !user -> !userId */}
      {!userId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-900 dark:text-gray-100">Please login to view orders.</p>
        </div>
      )}

      {/* 7. UPDATED CONDITIONAL RENDERING: loading && user -> loading && userId */}
      {loading && userId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-900 dark:text-gray-100">Loading orders...</p>
        </div>
      )}

      {/* 8. UPDATED CONDITIONAL RENDERING: user -> userId */}
      {userId && !loading && orders.length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Orders</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start shopping to see your orders here.
          </p>
        </div>
      )}

      {/* 9. UPDATED CONDITIONAL RENDERING: user -> userId */}
      {userId && orders.length > 0 && (
        <div className="flex flex-col gap-4">

          {orders.map((order: any) => {
            const amount = order.items?.reduce(
              (sum: number, it: any) => sum + (it.price || 0),
              0
            );

            const itemNames = order.items
              ?.map((i: any) => i.name)
              .slice(0, 3)
              .join(", ");

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition p-4 flex items-start gap-4 border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={order.items?.[0]?.image || "/qr-logo.png"}
                  className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 object-cover"
                />

                <div className="flex-1">

                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100">
                      #{shortId(order.id)}
                    </p>

                    <p className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">
                      ₹ {amount}
                    </p>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 truncate">
                    {itemNames || "Items"}
                  </p>

                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mt-1">
                    <Clock className="w-3 h-3" />
                    {getDate(order.createdAt)}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="text-green-600 dark:text-green-500 w-4 h-4" />
                    <p className="text-sm font-semibold text-green-600 dark:text-green-500">
                      {order.status || "Delivered"}
                    </p>
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}