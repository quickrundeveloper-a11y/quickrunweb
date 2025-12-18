"use client";

import AddAddressPanel from "@/app/components/dashboard/AddAddressPanel";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
// 1. REMOVED: import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase"; // Ensure this path is correct for your project
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { useLocationData } from "@/app/LocationProvider";
import { haversineDistanceKm } from "@/app/utils/distance";

// --- Types ---
type CartItem = {
  id: string;
  name: string;
  image: string;
  unit: string;
  quantityPerUnit?: number;
  price: number;
  mrp?: number; // Optional if not always present
  quantity: number;
  restaurentId?: string;
  isVeg?: boolean;
};

type Address = {
  id: string;
  type: string;
  address: string;
  building: string;
  floor: string;
  tower: string;
  landmark: string;
  name: string;
  phone: string;
  whoOrdering: string;
  lat?: number;
  lng?: number;

};

export default function Cart({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const db = getFirestore(app);
  // 2. REMOVED: const auth = getAuth(app);

  // --- State ---
  // 3. REPLACED 'user' with 'userId'
  const [userId, setUserId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE");
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);

  const [openAddAddress, setOpenAddAddress] = useState(false);

  //location match logic
  const [deliverable, setDeliverable] = useState(true);
  const [deliverabilityReason, setDeliverabilityReason] = useState<string>("");
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  const { coords, hasLocation } = useLocationData();
  const userLat = coords?.lat;
  const userLng = coords?.lng;

  const [shopLookup, setShopLookup] = useState<Record<string, any>>({});
  const addressLat = selectedAddress?.lat;
const addressLng = selectedAddress?.lng;

const hasAddressLocation = Boolean(addressLat && addressLng);


  // --- Initialization ---
  // 4. ADDED useEffect to load userId from localStorage
  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUser");
    if (!currentUserId) {
      // 5. REDIRECT IF NOT LOGGED IN (No userId)
      router.push("/login");
      return;
    }
    setUserId(currentUserId);
    fetchData(currentUserId);
  }, []);

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (document.getElementById("razorpay-sdk")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });


  // 6. REMOVED the old onAuthStateChanged useEffect

  const fetchData = async (uid: string) => {
    try {
      setLoading(true);

      // 1. Fetch Cart
      // 7. UPDATED FIRESTORE PATH: uid
      const cartRef = collection(db, "Customer", uid, "cart");
      const cartSnap = await getDocs(cartRef);
      const items = cartSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as CartItem[];
      setCartItems(items);

      // 1b. Fetch shops referenced by cart items for validation
      const restaurantIds = Array.from(
        new Set(
          items
            .map((i) => i.restaurentId)
            .filter((id): id is string => Boolean(id))
        )
      );

      if (restaurantIds.length > 0) {
        const shopEntries = await Promise.all(
          restaurantIds.map(async (rid) => {
            const ref = doc(db, "Restaurent_shop", String(rid));
            const snap = await getDoc(ref);
            return {
              id: rid,
              data: snap.exists() ? snap.data() : null,
            };
          })
        );

        const lookup: Record<string, any> = {};
        shopEntries.forEach((entry) => {
          if (entry.data) {
            lookup[entry.id] = {
              ...entry.data,
              id: entry.id,
            };
          }
        });
        setShopLookup(lookup);
      } else {
        setShopLookup({});
      }

      // 2. Fetch Addresses
      // 8. UPDATED FIRESTORE PATH: uid
      const addrRef = collection(db, "Customer", uid, "addresses");
      const addrSnap = await getDocs(addrRef);
      const addrList = addrSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Address[];
      setAddresses(addrList);

      // Default to first address if available
      if (addrList.length > 0) {
        setSelectedAddress(addrList[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure shop map stays updated if cart changes (e.g., added elsewhere)
  useEffect(() => {
    const missingShopIds = Array.from(
      new Set(
        cartItems
          .map((i) => i.restaurentId)
          .filter(
            (id): id is string =>
              Boolean(id) && !shopLookup[String(id)]
          )
      )
    );

    if (missingShopIds.length === 0) return;

    (async () => {
      const entries = await Promise.all(
        missingShopIds.map(async (rid) => {
          const ref = doc(db, "Restaurent_shop", String(rid));
          const snap = await getDoc(ref);
          return {
            id: rid,
            data: snap.exists() ? snap.data() : null,
          };
        })
      );

      setShopLookup((prev) => {
        const next = { ...prev };
        entries.forEach((entry) => {
          if (entry.data) next[entry.id] = { ...entry.data, id: entry.id };
        });
        return next;
      });
    })();
  }, [cartItems, db, shopLookup]);

  // Allow cart interactions even without location; only warn at order time if address missing.
  useEffect(() => {
    if (cartItems.length === 0) {
      setDeliverable(true);
      setDeliverabilityReason("");
      return;
    }
  
    if (!selectedAddress) {
      setDeliverable(false);
      setDeliverabilityReason("Select delivery address");
      return;
    }
  
    if (!selectedAddress.lat || !selectedAddress.lng) {
      setDeliverable(false);
      setDeliverabilityReason("Address location not available");
      return;
    }
  
    for (const item of cartItems) {
      const shop = item.restaurentId
        ? shopLookup[String(item.restaurentId)]
        : null;
  
      if (!shop) {
        setDeliverable(false);
        setDeliverabilityReason("Shop unavailable");
        return;
      }
  
      if (shop.activeShop === false) {
        setDeliverable(false);
        setDeliverabilityReason("Shop Closed");
        return;
      }
  
      if (!shop.location?.lat || !shop.location?.lng) {
        setDeliverable(false);
        setDeliverabilityReason("Shop location unavailable");
        return;
      }
  
      const dist = haversineDistanceKm(
        selectedAddress.lat,
        selectedAddress.lng,
        shop.location.lat,
        shop.location.lng
      );
  
      if (dist > 5) {
        setDeliverable(false);
        setDeliverabilityReason("Delivery is not available in your area");
        return;
      }
    }
  
    setDeliverable(true);
    setDeliverabilityReason("");
  }, [cartItems, shopLookup, selectedAddress]);
  


  // --- Cart Logic ---
  const canInteract = !checkingDelivery && !processingOrder;

  const updateQuantity = async (item: CartItem, newQty: number) => {
    if (!canInteract) {
      alert(deliverabilityReason || "Select location to order");
      return;
    }
    // 9. CHECK userId instead of user
    if (!userId) return;
    // 10. UPDATED FIRESTORE PATH: user.uid -> userId
    const itemRef = doc(db, "Customer", userId, "cart", item.id);

    // Optimistic UI Update
    if (newQty < 1) {
      setCartItems((prev) => prev.filter((p) => p.id !== item.id));
      await deleteDoc(itemRef);
    } else {
      setCartItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, quantity: newQty } : p))
      );
      await updateDoc(itemRef, { quantity: newQty });
    }
  };

  // --- Calculations ---
  const itemTotal = cartItems.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const deliveryCharge = 0;
  const handlingCharge = 0;
  const grandTotal = itemTotal + deliveryCharge + handlingCharge;

  // --- Payment & Order Logic ---
  const handlePlaceOrder = async () => {
    // 11. CHECK userId instead of user
    if (!userId) {
      alert("User not logged in. Please refresh.");
      return;
    }
    if (!selectedAddress) {
      alert("Please select or add a delivery address to place the order.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setProcessingOrder(true);

    try {
      // Common Data Preparation
      const orderData = {
        // 12. USED userId instead of user.uid
        userId: userId,
        status: "grocerry_accepted",
        addressId: selectedAddress.id,
        address: selectedAddress,
        items: cartItems,
        totalAmount: grandTotal,
        createdAt: new Date(),
      };

if (paymentMethod === "COD") {
  const newOrderRef = collection(db, "Customer", userId, "current_order");

  await addDoc(newOrderRef, {
    ...orderData,
    paymentMethod: { brand: "COD", label: "Cash on Delivery" },
    paymentStatus: "Pending",
  });

  await clearCart(userId);

  // ⭐⭐ FIX START
  if (onClose) onClose();        // close the cart sheet instantly
  setProcessingOrder(false);     // remove “processing” state
  router.push("/order_tracking"); // redirect properly
  return;                         // IMPORTANT
  // ⭐⭐ FIX END
}
 else {
        // --- ONLINE FLOW (Razorpay) ---
        const response = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            amount: grandTotal,
            currency: "INR",
            address: selectedAddress,
            items: cartItems,
          }),
        });

        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/72c66c78-8d52-4cdc-a1b7-9b0c44f4ba07", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H5",
            location: "app/components/cart.tsx:createOrderResponse",
            message: "create-order response",
            data: { status: response.status },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        const res = await response.json();
        if (!response.ok || !res.success) {
          throw new Error(res.message || "Failed to create Razorpay order");
        }

        const sdkReady = await loadRazorpayScript();
        if (!sdkReady || !(window as any).Razorpay) {
          throw new Error("Failed to load Razorpay SDK");
        }

        const rzp = new (window as any).Razorpay({
          key: res.key,
          amount: res.amount,
          currency: res.currency || "INR",
          name: "QuickRun",
          description: "Order payment",
          order_id: res.orderId,
          prefill: {
            name: selectedAddress.name,
            contact: selectedAddress.phone,
          },
          notes: {
            userId,
            addressId: selectedAddress.id,
          },
          handler: async (paymentResponse: any) => {
            try {
              const verifyRes = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...paymentResponse,
                  orderId: res.orderId,
                  amount: grandTotal,
                  userId,
                  address: selectedAddress,
                  items: cartItems,
                }),
              });

              const verifyJson = await verifyRes.json();
              if (!verifyRes.ok || !verifyJson.success) {
                throw new Error(verifyJson.message || "Payment verification failed");
              }

              const newOrderRef = collection(db, "Customer", userId, "current_order");

              await addDoc(newOrderRef, {
                ...orderData,
                paymentMethod: { brand: "Razorpay", label: "Razorpay" },
                paymentStatus: "Paid",
                razorpay: paymentResponse,
              });

              await clearCart(userId);
              if (onClose) onClose();
              setProcessingOrder(false);
              router.push("/order_tracking");
            } catch (err: any) {
              console.error("Verification error:", err);
              alert(err.message || "Payment verification failed");
              setProcessingOrder(false);
            }
          },
          modal: {
            ondismiss: () => setProcessingOrder(false),
          },
          theme: {
            color: "#0aad0a",
          },
        });

        rzp.on("payment.failed", (err: any) => {
          console.error("Payment failed:", err?.error);
          alert(err?.error?.description || "Payment failed. Please try another method.");
          setProcessingOrder(false);
        });

        rzp.open();
      }
    } catch (error: any) {
      console.error("Order processing error:", error);
      alert("Something went wrong: " + error.message);
      setProcessingOrder(false);
    }
  };

  const clearCart = async (uid: string) => {
    // 16. FIRESTORE PATH uses uid (which is now userId)
    const cartRef = collection(db, "Customer", uid, "cart");
    const snapshot = await getDocs(cartRef);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  };

  // --- Render ---
  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
    
    // 17. Render logged-out state if not loading and userId is missing
    if (!userId) {
        return (
            <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
                <p className="text-red-500 font-semibold">
                    You must be logged in to access your cart.
                </p>
            </div>
        );
    }


  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998]"></div>
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-100 p-4 z-[9999] overflow-y-auto shadow-2xl border-l border-gray-200">
        <div className="w-full relative z-[10000]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <button
              onClick={() => {
                if (onClose) return onClose();
                router.back();
              }}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {(!deliverable || !selectedAddress) && (
  <div className="...">
    {deliverabilityReason || "Select delivery address"}
  </div>
)}


          <div className="flex flex-col gap-4 items-stretch">
            {/* LEFT COLUMN: Cart Details */}
            <div className="flex-1 space-y-4">
              {/* Cart Items */}
              <div className="rounded-xl bg-white p-4 shadow-sm">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Your cart is empty</div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="mb-6 flex items-start gap-4 last:mb-0"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.quantityPerUnit
                            ? `${item.quantityPerUnit} ${item.unit}`
                            : item.unit}
                        </p>
                        <div className="mt-1 font-semibold text-gray-900">
                          ₹{item.price}
                        </div>
                      </div>

                      {/* Quantity Control - Green Box */}
                      <div
                        className={`flex h-9 items-center rounded-lg text-white shadow-md ${
                          canInteract ? "bg-green-700" : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <button
                          disabled={!canInteract}
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="flex h-full w-8 items-center justify-center text-lg font-bold hover:bg-green-800 rounded-l-lg disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          disabled={!canInteract}
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="flex h-full w-8 items-center justify-center text-lg font-bold hover:bg-green-800 rounded-r-lg disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bill Details */}
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 font-bold text-gray-900">Bill Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span>₹{itemTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling Charge</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-base font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-sm mb-1">
                  Cancellation Policy
                </h4>
                <p className="text-xs text-gray-500">
                  Orders cannot be cancelled once packed for delivery. In case of
                  unexpected delays, a refund will be provided, if applicable.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Address & Payment */}
            <div className="w-full space-y-4">
              {/* Address Selection */}
              {showAddressList && (
                <div className="rounded-xl bg-white p-4 shadow-sm space-y-3 max-h-[70vh] overflow-y-auto">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Your saved address
                  </h3>

                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowAddressList(false);
                      }}
                      className={`cursor-pointer rounded-xl border p-4 ${
                        selectedAddress?.id === addr.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <MapPin className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">
                            {addr.type}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {addr.address}, {addr.building}, {addr.landmark}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                 {addresses.length === 0 && (
  <div
    onClick={() => setOpenAddAddress(true)}
    className="cursor-pointer rounded-xl border border-green-600 bg-green-50 p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition"
  >
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
        <MapPin className="h-5 w-5 text-green-700" />
      </div>
      <div>
        <h4 className="font-bold text-green-700">Add New Address</h4>
        <p className="text-xs text-gray-500">
          No saved address found. Tap to add one.
        </p>
      </div>
    </div>

    <button className="text-sm font-semibold text-green-700">
      + Add
    </button>
  </div>
)}

                </div>
              )}
<div className="flex justify-end">
  <button
    onClick={() => setOpenAddAddress(true)}
    className="text-sm font-semibold text-green-700 px-3 py-1 rounded hover:bg-green-50"
  >
    + Add Address
  </button>
</div>


              {/* Payment Method Selection */}
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 font-bold text-gray-900">Payment Method</h3>

                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      paymentMethod === "ONLINE"
                        ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block font-semibold text-gray-900">
                          Online Payment
                        </span>
                        <span className="block text-xs text-gray-500">
                          UPI, Cards, Netbanking
                        </span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="h-5 w-5 accent-green-600"
                    />
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      paymentMethod === "COD"
                        ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                        <Banknote className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block font-semibold text-gray-900">
                          Cash on Delivery
                        </span>
                        <span className="block text-xs text-gray-500">
                          Pay accurately with cash
                        </span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="h-5 w-5 accent-green-600"
                    />
                  </label>
                </div>
              </div>

              {/* Spacer to prevent content being hidden behind fixed pay button */}
              <div className="h-48"></div>
              {/* Selected Address Block (moved to bottom, above pay button) */}
{selectedAddress && !showAddressList && (
  <div
    className={`fixed right-0 w-full max-w-md bg-white p-4 shadow-sm border-t border-gray-200 z-[10002]
      ${deliverable ? "bottom-24" : "bottom-28"}`}
  >
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
        <MapPin className="h-4 w-4 text-gray-600" />
      </div>

      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{selectedAddress.type}</h4>
        <p className="text-xs text-gray-500 line-clamp-1">
          {selectedAddress.address}, {selectedAddress.building},{" "}
          {selectedAddress.landmark}
        </p>
      </div>

      <button
        onClick={() => setShowAddressList(true)}
        className="text-xs font-semibold text-green-700"
      >
        Change
      </button>
    </div>
  </div>
)}

              {/* Sticky/Fixed Pay Button (Mobile & Desktop) */}
              <div className="fixed bottom-0 right-0 w-full max-w-md bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] border-t border-gray-200 z-[10001]">

{(!deliverable || !hasLocation) && (
  <p className="text-red-600 text-sm font-semibold mb-2">
    {deliverabilityReason || "Select location to order"}
  </p>
)}

<button
  onClick={handlePlaceOrder}
  disabled={
    processingOrder ||
    cartItems.length === 0 ||
    checkingDelivery ||
    !deliverable ||
    !selectedAddress
  }
  
  className={`group relative flex w-full items-center justify-between rounded-xl px-6 py-4 text-white transition-transform active:scale-[0.98] 
    ${!deliverable || !hasLocation ? "bg-gray-400" : "bg-green-700"} 
    disabled:opacity-70 disabled:active:scale-100`}
>
  <div className="flex flex-col items-start">
    <span className="text-xs font-medium opacity-90">
      {paymentMethod === "ONLINE" ? "PAY ONLINE" : "PAY ON DELIVERY"}
    </span>
    <span className="text-lg font-bold">₹{grandTotal}</span>
  </div>

  <div className="flex items-center gap-2 font-semibold">
    {processingOrder ? (
      <>
        <span>Processing</span>
        <Loader2 className="h-5 w-5 animate-spin" />
      </>
    ) : (
      <>
        <span>{deliverable ? "Place Order" : "Undeliverable"}</span>
        <ChevronRight className="h-5 w-5" />
      </>
    )}
  </div>
</button>

              </div>
            </div>
          </div>
        </div>
      </div>
      {openAddAddress && (
  <AddAddressPanel
    onClose={async () => {
      setOpenAddAddress(false);
      if (userId) {
        await fetchData(userId); // Refresh addresses
        setShowAddressList(true); // Open list after adding new
      }
    }}
  />
)}

    </>
  );
}