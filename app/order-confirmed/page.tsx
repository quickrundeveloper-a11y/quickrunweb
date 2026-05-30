"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { CheckCircle, Package, MapPin, Clock, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

type OrderItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit?: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  address: any;
  createdAt: Date;
  paymentMethod: { brand: string; label: string };
};

export default function OrderConfirmedPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const userId = localStorage.getItem("currentUser");
        if (!userId) {
          router.push("/login");
          return;
        }

        const db = getFirestore();
        const orderRef = collection(db, "Customer", userId, "current_order");
        const snap = await getDocs(orderRef);

        if (!snap.empty) {
          const orderDoc = snap.docs[0];
          const orderData = orderDoc.data();
          
          let createdAtDate: Date;
          if (orderData.createdAt?.toDate) {
            createdAtDate = orderData.createdAt.toDate();
          } else if (orderData.createdAt) {
            createdAtDate = new Date(orderData.createdAt);
          } else {
            createdAtDate = new Date();
          }

          setOrder({
            id: orderDoc.id,
            items: orderData.items || [],
            totalAmount: orderData.totalAmount || 0,
            address: orderData.address || {},
            createdAt: createdAtDate,
            paymentMethod: orderData.paymentMethod || { brand: "ONLINE", label: "Online Payment" }
          });
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  const getDeliveryDateRange = () => {
    if (!order) return "";
    const orderDate = new Date(order.createdAt);
    const minDelivery = new Date(orderDate);
    minDelivery.setDate(orderDate.getDate() + 3);
    
    const maxDelivery = new Date(orderDate);
    maxDelivery.setDate(orderDate.getDate() + 5);

    const formatDate = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-IN', options);
    };

    return `${formatDate(minDelivery)} - ${formatDate(maxDelivery)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No order found</h2>
          <p className="text-gray-500 mb-4">Looks like there's no recent order</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-green-100">Thank you for your purchase</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Estimated Delivery</h3>
            </div>
            <p className="text-orange-700 font-bold text-lg">{getDeliveryDateRange()}</p>
            <p className="text-orange-600 text-sm mt-1">3-5 business days</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Order Details</h3>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain bg-white rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 line-clamp-2">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-semibold text-gray-800">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-xl font-bold text-gray-800">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Delivery Address</h3>
            </div>
            <div className="space-y-1 text-gray-700">
              <p className="font-medium">{order.address.name}</p>
              <p className="text-sm">{order.address.type}</p>
              <p className="text-sm">{order.address.address}, {order.address.building}</p>
              <p className="text-sm">{order.address.landmark}</p>
              <p className="text-sm font-medium">Phone: {order.address.phone}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
            <p className="text-gray-700">{order.paymentMethod.label}</p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => router.push("/order_tracking")}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              Track Order
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href="/"
              className="w-full py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-50 transition text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
