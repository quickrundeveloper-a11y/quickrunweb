"use client";

import { Suspense } from "react";
import PaymentSuccessInner from "../payment_success_inner";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex justify-center items-center text-xl">
          Verifying payment...
        </div>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}