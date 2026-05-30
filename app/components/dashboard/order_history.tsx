"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { CheckCircle, Clock, XCircle, RefreshCw, ArrowRightLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  actionType: "cancel" | "return" | "replace";
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, onConfirm, actionType }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const cancelReasons = [
    "Changed my mind",
    "Found a better price",
    "Delivery time is too long",
    "Ordered by mistake",
    "Other"
  ];

  const returnReasons = [
    "Product is damaged",
    "Wrong product delivered",
    "Product not as described",
    "Quality issue",
    "Changed my mind",
    "Other"
  ];

  const replaceReasons = [
    "Product is damaged",
    "Wrong product delivered",
    "Size issue",
    "Quality issue",
    "Other"
  ];

  const reasons = actionType === "cancel" 
    ? cancelReasons 
    : actionType === "return" 
    ? returnReasons 
    : replaceReasons;

  const actionTitle = actionType === "cancel" 
    ? "Cancel Order" 
    : actionType === "return" 
    ? "Return Order" 
    : "Replace Order";

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalReason = selectedReason === "Other" ? customReason : selectedReason;
    if (!finalReason) return;
    onConfirm(finalReason);
    setSelectedReason("");
    setCustomReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{actionTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please select a reason:</p>
          
          <div className="space-y-2">
            {reasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                  selectedReason === reason
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="w-4 h-4 text-green-600 mr-3"
                />
                <span className="text-gray-900 dark:text-gray-100">{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Other" && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Please specify..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === "Other" && !customReason)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OrdersComponent() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; actionType: "cancel" | "return" | "replace"; order: any } | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem("currentUser"));
  }, []);

  const getDisplayStatus = (s: string) => {
    const statusMap: Record<string, string> = {
      'order_placed': 'Order Placed',
      'grocerry_accepted': 'Order Placed',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'return_requested': 'Return Requested',
      'replace_requested': 'Replace Requested'
    };
    return statusMap[s.toLowerCase()] || s.charAt(0).toUpperCase() + s.slice(1);
  };

  const openModal = (actionType: "cancel" | "return" | "replace", order: any, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setModal({ isOpen: true, actionType, order });
  };

  const handleConfirmAction = async (reason: string) => {
    if (!modal || !userId) return;
    const { actionType, order } = modal;
    setProcessingOrderId(order.id);
    
    try {
      let orderRef;
      let newStatus;
      const timestamp = new Date();

      if (actionType === "cancel") {
        const currentOrderRef = doc(db, "Customer", userId, "current_order", order.id);
        const orderDoc = await getDoc(currentOrderRef);
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          
          // Move to OrderHistory
          const historyRef = doc(db, "Customer", userId, "OrderHistory", order.id);
          await setDoc(historyRef, {
            ...orderData,
            status: "cancelled",
            cancelledAt: timestamp,
            cancellationReason: reason
          });
          
          // Delete from current_order
          await deleteDoc(currentOrderRef);
        }
      } else if (actionType === "return") {
        orderRef = doc(db, "Customer", userId, "OrderHistory", order.id);
        newStatus = "return_requested";
        await updateDoc(orderRef, {
          status: newStatus,
          returnRequestedAt: timestamp,
          returnReason: reason
        });
      } else {
        orderRef = doc(db, "Customer", userId, "OrderHistory", order.id);
        newStatus = "replace_requested";
        await updateDoc(orderRef, {
          status: newStatus,
          replaceRequestedAt: timestamp,
          replaceReason: reason
        });
      }
      
      const actionText = actionType === "cancel" ? "cancelled" : actionType === "return" ? "return requested" : "replace requested";
      alert(`Order ${actionText} successfully!`);
    } catch (error) {
      console.error("Error processing action:", error);
      alert("Failed to process your request. Please try again.");
    } finally {
      setProcessingOrderId(null);
      setModal(null);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setOrders([]);
      setCurrentOrder(null);
      return;
    }

    // Set up real-time listeners for both collections
    const historyRef = collection(db, "Customer", userId, "OrderHistory");
    const currentRef = collection(db, "Customer", userId, "current_order");

    let historyOrders: any[] = [];
    let currentOrders: any[] = [];

    const updateOrders = () => {
      const allOrders = [...currentOrders, ...historyOrders].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
      setOrders(allOrders);
      
      if (currentOrders.length > 0) {
        setCurrentOrder(currentOrders[0]);
      } else {
        setCurrentOrder(null);
      }
      setLoading(false);
    };

    const unsubHistory = onSnapshot(historyRef, (snap) => {
      historyOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      updateOrders();
    });

    const unsubCurrent = onSnapshot(currentRef, (snap) => {
      currentOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      updateOrders();
    });

    return () => {
      unsubHistory();
      unsubCurrent();
    };
  }, [userId]);

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

  const ordersToShow = orders;

  return (
    <>
      {modal && (
        <ActionModal
          isOpen={modal.isOpen}
          actionType={modal.actionType}
          onClose={() => setModal(null)}
          onConfirm={handleConfirmAction}
        />
      )}
      
      <div className="w-full h-full overflow-y-auto px-5 py-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-5">Orders</h1>

        {!userId && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-900 dark:text-gray-100">Please login to view orders.</p>
          </div>
        )}

        {loading && userId && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-900 dark:text-gray-100">Loading orders...</p>
          </div>
        )}

        {userId && !loading && ordersToShow.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Orders</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start shopping to see your orders here.
            </p>
          </div>
        )}

        {userId && ordersToShow.length > 0 && (
          <div className="flex flex-col gap-4">
            {ordersToShow.map((order: any, index: number) => {
              const amount = order.totalAmount || order.items?.reduce(
                (sum: number, it: any) => sum + ((it.price || 0) * (it.quantity || 1)),
                0
              );

              const itemNames = order.items
                ?.map((i: any) => i.name)
                .slice(0, 3)
                .join(", ");

              const status = (order.status || "Delivered").toLowerCase();
              const statusColor = status === "cancelled" 
                ? "text-red-600 dark:text-red-400" 
                : status === "completed" || status === "delivered"
                ? "text-green-600 dark:text-green-500"
                : "text-yellow-600 dark:text-yellow-400";

              const orderStatus = (order.status || "Delivered").toLowerCase();
              const isOrderComplete = orderStatus === "delivered" || orderStatus === "completed" || orderStatus === "cancelled" || orderStatus === "return_requested" || orderStatus === "replace_requested";
              const isOrderCancellable = orderStatus === "order_placed" || orderStatus === "grocerry_accepted";
              const isOrderReturnable = orderStatus === "delivered" || orderStatus === "completed";
              
              const isProcessing = processingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    if (isOrderComplete) {
                      router.push(`/order-details/${order.id}`);
                    } else {
                      localStorage.setItem("selectedTrackingOrderId", order.id);
                      router.push("/delivery-tracking");
                    }
                  }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col gap-4 border border-gray-200 dark:border-gray-700 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
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
                        <CheckCircle className={`w-4 h-4 ${statusColor}`} />
                        <p className={`text-sm font-semibold ${statusColor}`}>
                          {getDisplayStatus(order.status || "Delivered")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {isOrderCancellable && (
                      <button
                        onClick={(e) => openModal("cancel", order, e)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {isProcessing ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                    
                    {isOrderReturnable && (
                      <>
                        <button
                          onClick={(e) => openModal("return", order, e)}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {isProcessing ? "Processing..." : "Return"}
                        </button>
                        
                        <button
                          onClick={(e) => openModal("replace", order, e)}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          {isProcessing ? "Processing..." : "Replace"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
