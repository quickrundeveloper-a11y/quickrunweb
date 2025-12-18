"use client";

import { Share2 } from "lucide-react";

export default function ReferralComponent() {
  return (
    <div className="w-full px-6 py-10">

      {/* MAIN CARD */}
      <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

        {/* TOP GRADIENT HEADER */}
        <div className="bg-gradient-to-br from-[#00b85c] to-[#66e696] p-6 relative text-white rounded-t-3xl">
          <h1 className="text-2xl font-bold leading-snug">
            Get 25% OFF • Your Friends Get Pass @ ₹1!
          </h1>

          <img
            src="/referral-hand.png"
            alt=""
            className="absolute right-4 top-2 w-20 h-20 drop-shadow-md"
          />
        </div>

        {/* HOW IT WORKS */}
        <div className="p-6 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How it works</h2>

          <div className="space-y-4 text-gray-700">

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 flex items-center justify-center bg-[#e8fff0] text-[#00b85c] rounded-full">
                1
              </div>
              <p>
                Share your referral link with{" "}
                <span className="font-semibold">your friends</span>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 flex items-center justify-center bg-[#e8fff0] text-[#00b85c] rounded-full">
                2
              </div>
              <p>
                When they place their first order, you get{" "}
                <span className="font-semibold">25% OFF</span> up to{" "}
                <span className="font-semibold">₹200</span>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 flex items-center justify-center bg-[#e8fff0] text-[#00b85c] rounded-full">
                3
              </div>
              <p>
                After <span className="font-semibold">10 referrals</span>, you earn{" "}
                <span className="font-semibold">₹2000</span>.
              </p>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="mt-8 space-y-4">

            {/* WhatsApp */}
            <button className="w-full border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-3 text-lg font-medium hover:bg-gray-50 transition active:scale-[0.98]">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                className="w-6 h-6"
              />
              Invite via WhatsApp
            </button>

            {/* Share Link */}
            <button className="w-full border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-3 text-lg font-medium hover:bg-gray-50 transition active:scale-[0.98]">
              <Share2 size={22} className="text-gray-700" />
              Share Invite Link
            </button>

          </div>
        </div>

        {/* REFERRAL LIST HEADER */}
        <div className="border-t py-4 px-6 text-center bg-[#f9fbff]">
          <h3 className="text-lg font-semibold text-gray-800">Your Referrals</h3>
        </div>

        {/* EMPTY STATE */}
        <div className="px-6 py-10 text-center text-gray-500">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center text-2xl">
            👥
          </div>
          You haven't referred anyone yet.
        </div>

      </div>
    </div>
  );
}
