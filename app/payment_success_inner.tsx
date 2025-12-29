"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// REMOVED: import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

export default function PaymentSuccessInner() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function verifyPayment() {
      try {
        const orderId = params.get("order_id");

        if (!orderId) {
          alert("Invalid callback");
          router.push("/");
          return;
        }

        // STEP 1: SERVER‑SIDE PAYMENT VERIFICATION
        const verifyRes = await fetch(`/api/cashfree/verify-payment?order_id=${orderId}`, {
          method: "GET",
        });

        let verifyJson;
        try {
          verifyJson = await verifyRes.json();
        } catch {
          alert("Payment verification failed! Please try again.");
          router.push("/");
          return;
        }

        console.log("verify result:", verifyJson);

        if (!verifyJson || !verifyJson.paid) {
          alert("Payment failed! Please try again.");
          router.push("/");
          return;
        }

        // REPLACED FIREBASE AUTH WITH LOCALSTORAGE
        const userId = localStorage.getItem("currentUser");

        if (!userId) {
          alert("User not logged in");
          router.push("/login"); // Redirect to login/home if no user ID
          return;
        }

        const db = getFirestore();

        // Fetch cart
        // PATH UPDATED: uses userId
        const cartRef = collection(db, "Customer", userId, "cart");
        const snap = await getDocs(cartRef);

        const items: any[] = [];
        snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

        if (items.length === 0) {
          alert("Cart empty");
          router.push("/");
          return;
        }

        // Load selected address from localStorage
        let savedAddress = null;
        try {
          const stored = localStorage.getItem("selectedAddress");
          if (stored) savedAddress = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to load saved address:", e);
        }

        // Create paid order
        // PATH UPDATED: uses userId
        const newOrderRef = collection(db, "Customer", userId, "current_order");
        await addDoc(newOrderRef, {
          userId: userId, // VALUE UPDATED: uses userId
          status: "grocerry_accepted",
          addressId: savedAddress?.id ?? null,
          address: savedAddress ?? {},
          paymentMethod: { brand: "ONLINE", label: "Online Payment" },
          createdAt: new Date(),
          items: items,
          paymentOrderId: orderId,
        });

        // Clear cart
        for (const d of snap.docs) await deleteDoc(d.ref);

        router.push("/order_tracking");
      } catch (error) {
        console.error("Sandbox error:", error);
        alert("Something went wrong! Please try again.");
        router.push("/");
      }
    }

    verifyPayment();
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center text-xl">
      Verifying payment...
    </div>
  );
}