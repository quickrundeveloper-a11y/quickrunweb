"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { CheckCircle, Clock, ArrowLeft, MapPin, Package, ShoppingBag, Truck } from "lucide-react";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getDisplayStatus = (s: string) => {
    const statusMap: Record<string, string> = {
      'order_placed': 'Order Placed',
      'grocerry_accepted': 'Order Placed',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[s.toLowerCase()] || s.charAt(0).toUpperCase() + s.slice(1);
  };

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

  const getCompletedDate = (ts: any) => {
    if (!ts) return "";
    if (ts.toDate) {
      return ts.toDate().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "numeric",
      });
    }
    // If it's a Date object
    return new Date(ts).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    });
  };

  useEffect(() => {
    setUserId(localStorage.getItem("currentUser"));
  }, []);

  useEffect(() => {
    if (!userId || !orderId) return;

    const fetchOrder = async () => {
      try {
        const db = getFirestore(app);
        
        // First try current_order
        let orderDoc = await getDoc(doc(db, "Customer", userId, "current_order", orderId));
        
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
          setLoading(false);
          return;
        }
        
        // If not found in current_order, search all OrderHistory documents
        const historyRef = collection(db, "Customer", userId, "OrderHistory");
        const historySnapshot = await getDocs(historyRef);
        
        for (const docSnap of historySnapshot.docs) {
          const data = docSnap.data();
          // Check if this document's id matches or if it has an id field that matches
          if (docSnap.id === orderId || data.id === orderId) {
            setOrder({ id: docSnap.id, ...data });
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [userId, orderId]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please log in to view order details.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          <span className="font-medium">Back to Orders</span>
        </button>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : !order ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400">This order doesn't exist or you don't have access to it.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between flex-wrap gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Order Details</h1>
                      <p className="text-gray-500 dark:text-gray-400">
                        Order <span className="font-semibold text-gray-900 dark:text-white">#{order.id.slice(-7).toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      (order.status || "Delivered").toLowerCase() === "cancelled"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        : (order.status || "Delivered").toLowerCase() === "completed" ||
                          (order.status || "Delivered").toLowerCase() === "delivered"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                    }`}>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold text-sm uppercase tracking-wide">{getDisplayStatus(order.status || "Delivered")}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Timeline */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ordered on</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{getDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
                {order.completedAt && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(order.status || "Delivered").toLowerCase() === "cancelled" 
                            ? "Cancelled on" 
                            : "Delivered on"}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">{getCompletedDate(order.completedAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items
                </h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <div className="flex gap-6">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image || "/qr-logo.png"}
                          className="w-32 h-32 rounded-xl bg-gray-100 dark:bg-gray-700 object-cover shadow-sm"
                          alt={item.name}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-2">{item.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} × {item.unit}
                          </p>
                        </div>
                        <div className="mt-4">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">₹ {item.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Total Amount</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₹ {order.totalAmount || order.items?.reduce((sum: number, it: any) => sum + ((it.price || 0) * (it.quantity || 1)), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            {order.address && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                        {order.address.name} • {order.address.phone}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {order.address.address}
                        {order.address.landmark && `, ${order.address.landmark}`}
                        {order.address.building && `, ${order.address.building}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
