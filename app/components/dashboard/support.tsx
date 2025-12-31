"use client";

import { useState } from "react";
import { MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";
import ChatWidget from "@/app/components/ChatWidget";

export default function SupportComponent() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="w-full px-6 py-10 relative">
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-br from-green-600 to-green-400 p-6 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold">Help & Customer Support</h1>
          </div>
          <p className="text-white/90 mt-2 text-sm">
            We're here to help you with anything you need.
          </p>
        </div>

        {/* BODY */}
        <div className="p-6">

          {/* CONTACT OPTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            {/* CALL US CARD */}
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition cursor-pointer">
              <Phone className="mx-auto h-7 w-7 text-green-600 dark:text-green-500" />
              <h3 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">+91 8920393457</p>
            </div>

            {/* EMAIL CARD */}
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition cursor-pointer">
              <Mail className="mx-auto h-7 w-7 text-blue-600 dark:text-blue-500" />
              <h3 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">Email</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">support@quickrunfast.com</p>
            </div>

            {/* LIVE CHAT CARD */}
            <div 
              onClick={() => setChatOpen(true)}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <MessageCircle className="mx-auto h-7 w-7 text-purple-600 dark:text-purple-500" />
              <h3 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">Live Chat</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Instant Support</p>
            </div>

          </div>

          {/* FAQ SECTION */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3 mb-10">

            <details className="group bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-green-600 dark:hover:border-green-500 transition cursor-pointer">
              <summary className="font-medium cursor-pointer flex justify-between items-center text-gray-900 dark:text-gray-100">
                How can I track my order?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Open "My Orders" → Select order → Track in real-time.
              </p>
            </details>

            <details className="group bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-green-600 dark:hover:border-green-500 transition cursor-pointer">
              <summary className="font-medium cursor-pointer flex justify-between items-center text-gray-900 dark:text-gray-100">
                What if my delivery is delayed?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Our delivery agent will update you soon or contact support.
              </p>
            </details>

            <details className="group bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-green-600 dark:hover:border-green-500 transition cursor-pointer">
              <summary className="font-medium cursor-pointer flex justify-between items-center text-gray-900 dark:text-gray-100">
                How do I request a refund?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Navigate to Help Center → Refund Request → Submit form.
              </p>
            </details>

          </div>

        </div>
      </div>

      {/* FLOATING CHAT BUTTON */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-10 right-10 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition flex items-center justify-center"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* CHAT WIDGET */}
      {chatOpen && (
        <div className="fixed bottom-10 right-10 z-50">
          <ChatWidget onClose={() => setChatOpen(false)} />
        </div>
      )}
    </div>
  );
}