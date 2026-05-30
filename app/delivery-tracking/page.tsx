"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/header";
import { Clock, CheckCircle2, Package, Truck, Home } from "lucide-react";
import { getFirestore, collection, onSnapshot, doc, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const statuses = [
  { id: 1, label: "Ordered", icon: Clock, color: "text-gray-400" },
  { id: 2, label: "Shipped", icon: Truck, color: "text-gray-400" },
  { id: 3, label: "Out for Delivery", icon: Truck, color: "text-gray-400" },
  { id: 4, label: "Delivered", icon: Home, color: "text-gray-400" },
];

export default function DeliveryTrackingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserId(localStorage.getItem("currentUser"));
  }, []);

  useEffect(() => {
    if (!userId) return;

    const db = getFirestore(app);
    const colRef = collection(db, "Customer", userId, "current_order");
    const selectedOrderId = localStorage.getItem("selectedTrackingOrderId");

    const unsubscribe = onSnapshot(colRef, async (snap) => {
      if (!snap.empty) {
        let selectedDoc = null;
        
        // Try to find the selected order first
        if (selectedOrderId) {
          selectedDoc = snap.docs.find(d => d.id === selectedOrderId);
        }
        
        // If not found, use the latest one
        if (!selectedDoc) {
          selectedDoc = snap.docs[snap.docs.length - 1];
          // Clear the invalid selection
          localStorage.removeItem("selectedTrackingOrderId");
        }
        
        const orderId = selectedDoc.id;
        const data = selectedDoc.data();
        setOrderId(orderId);
        setOrderData(data);

        // Determine status based on order status
        let status = 1;
        if (data.status === "order_placed") status = 1;
        if (data.status === "shipped") status = 2;
        if (data.status === "out_for_delivery") status = 3;
        if (data.status === "delivered") status = 4;
        setCurrentStatus(status);

        // Check if order is delivered/completed/cancelled and move to OrderHistory
        const orderStatus = (data.status || "").toLowerCase();
        if (
          orderStatus === "delivered" ||
          orderStatus === "completed" ||
          orderStatus === "cancelled"
        ) {
          try {
            // Add to OrderHistory
            const historyRef = collection(db, "Customer", userId, "OrderHistory");
            await addDoc(historyRef, {
              id: orderId,
              ...data,
              completedAt: new Date(),
            });

            // Delete from current_order
            await deleteDoc(doc(db, "Customer", userId, "current_order", orderId));
          } catch (error) {
            console.error("Error moving order to OrderHistory:", error);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please log in to track your order.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes growLine {
            0% { height: 0; }
            100% { height: 100%; }
          }
          @keyframes pulseLine {
            0% { transform: translateY(-100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `
      }} />
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Tracking</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                {orderId && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Order ID: {orderId}</p>
                )}
                {userId && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Customer ID: {userId}</p>
                )}
              </div>
            </div>
            <Link href="/" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              Back to Home
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          ) : !orderData ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Active Order</h2>
              <p className="text-gray-500 dark:text-gray-400">Place an order to track delivery status.</p>
            </div>
          ) : (
            <>
              {/* Order Status Timeline */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Status</h3>
                <div className="space-y-4">
                  {statuses.map((status, index) => {
                    const isCompleted = status.id <= currentStatus;
                    const isCurrent = status.id === currentStatus;
                    const Icon = status.icon;
                    
                    return (
                      <div key={status.id} className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? "bg-green-100 dark:bg-green-900/30" 
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Icon className={`w-5 h-5 ${isCurrent ? "text-green-600" : "text-gray-400"}`} />
                            )}
                          </div>
                          {index < statuses.length - 1 && (
                            <div className="absolute top-10 left-5 w-0.5 h-12 -translate-x-1/2 overflow-hidden bg-gray-200 dark:bg-gray-600">
                              {/* Green progress fill */}
                              <div 
                                className={`absolute left-0 top-0 w-full bg-green-500 transition-all duration-1000 ${
                                  status.id < currentStatus 
                                    ? "h-full" 
                                    : status.id === currentStatus 
                                      ? "h-0" 
                                      : "h-0"
                                }`}
                                style={status.id === currentStatus ? { animation: 'growLine 1.5s ease-out forwards' } : {}}
                              />
                              {/* Pulse animation on the current line */}
                              {status.id === currentStatus && (
                                <div className="absolute left-0 top-0 w-full h-full">
                                  <div className="absolute left-0 top-0 w-full h-2 bg-green-400" style={{ animation: 'pulseLine 1.5s ease-out forwards' }} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <p className={`font-medium ${
                            isCompleted 
                              ? "text-gray-900 dark:text-white" 
                              : "text-gray-400 dark:text-gray-500"
                          }`}>
                            {status.label}
                          </p>
                          {/* {isCurrent && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              In Progress
                            </p>
                          )} */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h3>
                
                {/* Items */}
                {orderData.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.unit} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{item.price}
                    </p>
                  </div>
                ))}

                {/* Total Amount */}
                <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{orderData.totalAmount || orderData.items?.reduce((sum: number, it: any) => sum + ((it.price || 0) * (it.quantity || 1)), 0)}
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Delivery Address</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {orderData.address?.name}, {orderData.address?.phone}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {orderData.address?.address}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
