"use client";

import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Smartphone, Download, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds for faster verification
    const timer = setTimeout(() => {
      // For now, we'll ignore sessionStorage during development/testing 
      // to make sure it's visible to the user.
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    // Remember that user saw the popup in this session
    sessionStorage.setItem("hasSeenPromoPopup", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop with heavy blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Luxury Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white/95 dark:bg-gray-900/95 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
            style={{ backdropFilter: "blur(20px)" }}
          >
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Top Decorative Section with Gold Gradient */}
            <div className="relative h-40 bg-gradient-to-br from-[#1D3C2F] to-[#2a5a46] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-[#B59461]/20 rounded-full blur-[80px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-[#B59461]/10 rounded-full blur-[80px] animate-pulse delay-700"></div>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="text-[#B59461] w-4 h-4" />
                  <span className="text-[#B59461] text-xs tracking-[0.4em] uppercase font-bold">Exclusive Offer</span>
                  <Sparkles className="text-[#B59461] w-4 h-4" />
                </div>
                <h2 className="text-white text-4xl font-serif font-bold tracking-tight">Silky Gold</h2>
              </motion.div>
            </div>

            {/* Content Section */}
            <div className="p-8 sm:p-12 text-center flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#F9F6F0] to-[#EBE3D5] rounded-full mb-8 shadow-inner"
              >
                <ShoppingBag className="text-[#1D3C2F] w-10 h-10" />
              </motion.div>

              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-[#1D3C2F] dark:text-white text-3xl sm:text-4xl font-bold mb-4 leading-tight"
              >
                🎉 Get 15% OFF – Shop Now
              </motion.h3>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl mb-10 leading-relaxed max-w-sm"
              >
                <p>Experience the glow of luxury skincare.</p>
                <div className="mt-4 font-semibold text-[#B59461] flex items-center justify-center gap-2 bg-[#B59461]/5 py-2 px-4 rounded-full border border-[#B59461]/10">
                  <Smartphone size={20} />
                  <span>📱 Extra 5% OFF on purchases through our app</span>
                </div>
              </motion.div>

              {/* App Download Section */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full bg-[#F9F6F0]/50 dark:bg-white/5 rounded-[2rem] p-8 mb-10 border border-[#B59461]/20 relative group"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 px-6 py-1 rounded-full border border-[#B59461]/30 shadow-sm">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1D3C2F] dark:text-[#B59461]">Download App</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 mt-2">
                  {/* Play Store */}
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.quick.quick_run" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn flex items-center gap-3 bg-[#1D3C2F] hover:bg-[#152e24] text-white px-6 py-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-green-900/20 border border-white/10"
                  >
                    <img src="/img/playstore.png" alt="" className="w-6 h-6 object-contain invert" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <div className="text-left">
                      <p className="text-[10px] opacity-60 leading-none tracking-wider uppercase">Get it on</p>
                      <p className="text-sm font-bold leading-none mt-1.5">Google Play</p>
                    </div>
                  </a>

                  {/* App Store */}
                  <a 
                    href="https://apps.apple.com/app/quickrun-instant-delivery/id6755721618" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20 border border-white/10"
                  >
                    <img src="/img/appstore.png" alt="" className="w-6 h-6 object-contain invert" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <div className="text-left">
                      <p className="text-[10px] opacity-60 leading-none tracking-wider uppercase">Download on the</p>
                      <p className="text-sm font-bold leading-none mt-1.5">App Store</p>
                    </div>
                  </a>
                </div>
              </motion.div>

              {/* Primary CTA */}
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={closePopup}
                className="w-full bg-gradient-to-r from-[#B59461] via-[#d4b483] to-[#B59461] bg-[length:200%_auto] hover:bg-[100%_0] text-white py-5 rounded-2xl font-bold text-lg tracking-[0.15em] uppercase transition-all duration-500 shadow-[0_10px_30px_rgba(181,148,97,0.3)] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Shop Now
                <Download size={20} className="animate-bounce" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

