"use client";

import React, { useState, useEffect } from "react";
import { X, Send } from "lucide-react";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const phoneNumber = "918920434756";
  const userMessage = encodeURIComponent("Hi! I want to buy Silky Gold Aloe Vera Face Serum.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${userMessage}`;

  const agentMessage = "Hello! 👋 Welcome to Silky Gold ✨ Ready to shop our premium skincare products? Let's help you place your order 😊";

  // Show a small notification bubble after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowNotification(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* CHAT WIDGET */}
      {isOpen && (
        <div className="w-[320px] sm:w-[380px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-500 animate-in fade-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="bg-[#1D3C2F] p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                ✨
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">Silky Gold</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-6 bg-[#F9F6F0] dark:bg-gray-800/50 min-h-[120px] flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 max-w-[90%]">
              <p className="text-[#1D3C2F] dark:text-gray-200 text-sm leading-relaxed">
                {agentMessage}
              </p>
              <span className="text-[10px] text-gray-400 mt-2 block text-right">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Footer / Call to Action */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/20"
            >
              <Send size={18} />
              Buy on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <div className="relative group">
        {/* Notification Bubble */}
        {showNotification && !isOpen && (
          <div className="absolute bottom-full right-0 mb-4 w-[240px] bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-br-none shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in slide-in-from-right-5">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              🛒 Buy on WhatsApp &amp; get exclusive offers!
            </p>
            <button 
              onClick={() => setShowNotification(false)}
              className="absolute -top-2 -left-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* Main Toggle Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowNotification(false);
          }}
          className={`${
            isOpen ? "bg-gray-100 dark:bg-gray-800 rotate-90" : "bg-[#25D366]"
          } p-4 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group relative`}
          aria-label="Chat on WhatsApp"
        >
          {isOpen ? (
            <X className="w-8 h-8 text-gray-600 dark:text-gray-300" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-white fill-current"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.049a11.823 11.823 0 001.59 5.911L0 24l6.182-1.622a11.777 11.777 0 005.864 1.554h.005c6.637 0 12.048-5.414 12.052-12.052a11.798 11.798 0 00-3.41-8.52z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
