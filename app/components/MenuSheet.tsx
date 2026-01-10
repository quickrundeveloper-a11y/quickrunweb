"use client";

import React from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

interface MenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuSheet({ isOpen, onClose }: MenuSheetProps) {
  const aboutUsItems = [
    { label: 'Our Story', href: '/story' },
    { label: 'Official Franchise', href: '/franchise' },
  ];

  const quickLinksItems = [
    { label: 'Terms & Conditions', href: '/termsandcondition' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Return Policy', href: '/return_policy' },
    { label: 'Shipping Policy', href: '/shipping_policy' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[99999] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-80 bg-white dark:bg-gray-800 shadow-2xl z-[100000]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        min-h-screen
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* About Us Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
              About Us
            </h3>
            <nav className="space-y-2">
              {aboutUsItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={onClose}
                  className="block w-full text-left p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="font-medium text-base">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-4">
              Quick Links
            </h3>
            <nav className="space-y-2">
              {quickLinksItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={onClose}
                  className="block w-full text-left p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="font-medium text-base">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">QuickRun</p>
          </div>
        </div>
      </div>
    </>
  );
}