 "use client";
import { useState } from "react";

export default function Footer() {
  const [expanded, setExpanded] = useState(false);
  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">

      {/* ============================
          🔹 TOP GRID SECTION
      ============================ */}
      <div
        className="
          max-w-7xl mx-auto 
          px-4 sm:px-6 py-12
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-4 
          gap-10
        "
      >
        {/* LEFT SECTION */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            QuickRun
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Got Question? Call us 24/7
          </p>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            sector 62, Noida, Greater Noida
          </p>
        </div>

        {/* SAFE PAYMENT */}
       





       

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Quick Links
          </h3>

          <ul className="space-y-2 text-gray-500 dark:text-gray-400 text-sm">
            <li>
              <a href="/termsandcondition" className="hover:text-gray-700 dark:hover:text-gray-300">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="/shipping_policy" className="hover:text-gray-700 dark:hover:text-gray-300">
                Shipping
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/return_policy" className="hover:text-gray-700 dark:hover:text-gray-300">
                Return Policy
              </a>
            </li>
          </ul>
        </div>

        {/* OUR STORES */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            About us
          </h3>

          <ul className="space-y-2 text-gray-500 dark:text-gray-400 text-sm">
            <li>
              <a href="/story" className="hover:text-gray-700 dark:hover:text-gray-300">
                Our Story
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-gray-700 dark:hover:text-gray-300">
                Blog
              </a>
            </li>
            <li>
              <a href="/franchise" className="hover:text-gray-700 dark:hover:text-gray-300">
                Retailer Franchise
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ============================
          🔹 BOTTOM FOOTER SECTION
      ============================ */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

          {/* COPYRIGHT TEXT */}
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            © Quick Run
          </p>

          {/* DOWNLOAD APP */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Download App</span>

            <a href="https://apps.apple.com/app/quickrun-instant-delivery/id6755721618" className="h-24">
              <img
                src="/appstore.png"
                alt="App Store"
                className="h-full w-auto"
              />
            </a>

            <a href="https://play.google.com/store/apps/details?id=com.quick.quick_run" className="h-35">
              <img
                src="/playstore.png"
                alt="Google Play"
                className="h-full w-auto"
              />
            </a>
          </div>

          {/* SOCIAL ICONS */}
          <div className="flex items-center gap-4">
        

            <a href="https://www.instagram.com/quickrunofficial/" target="_blank" className="w-10 h-10 rounded-full bg-black dark:bg-gray-700 flex items-center justify-center">
              <img src="/footer-icon/instagram.png" className="w-5" />
            </a>

            <a href="https://www.youtube.com/@QuickRunfast" target="_blank" className="w-10 h-10 rounded-full bg-black dark:bg-gray-700 flex items-center justify-center">
              <img src="/footer-icon/youtube.png" className="w-5 h-5 mt-2 object-contain mx-auto block" />
            </a>

            <a href="https://x.com/quickrunfast" target="_blank" className="w-10 h-10 rounded-full bg-black dark:bg-gray-700 flex items-center justify-center">
              <img src="/footer-icon/x.png" className="w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {!expanded ? (
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              <p>Welcome to QuickRun, where convenience meets speed.</p>
              <button
                onClick={() => setExpanded(true)}
                className="mt-2 text-green-700 dark:text-green-400 font-medium underline"
              >
                Read more
              </button>
            </div>
          ) : (
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-4">
              <p>
                Welcome to QuickRun, where convenience meets speed. In today’s fast-paced world, we understand that your time is precious. That’s why we have built a platform that brings the entire supermarket experience directly to your fingertips. Whether you are restocking your kitchen or need an emergency medicine, QuickRun ensures that everything you need is delivered to your doorstep in record time.
              </p>
              <p>
                Our extensive catalog is designed to cater to every aspect of your daily life. Dive into our Grocery &amp; Staples section, featuring premium quality pulses, grains, and the highly trusted range of Rajdhani Products. For your morning rituals, we provide farm-fresh Dairy, Bread, and Eggs, ensuring your breakfast is always healthy and delicious. Our Fruits &amp; Vegetables are handpicked and sourced daily to maintain peak freshness and nutritional value.
              </p>
              <p>
                Beyond the kitchen, QuickRun is your partner in health and hygiene. Our Wellness &amp; Pharma category provides quick access to essential healthcare needs, while our Skin Care and Health Care range features top-tier brands to keep you looking and feeling your best. Maintain a spotless home with our high-performance Cleaning Essentials, and elevate your meals with our diverse collection of Sauces and Spreads. If you're looking for a quick bite, explore our Bakery and Biscuits or dive into our world of crunchy, flavorful Snacks for every mood.
              </p>
              <p>
                At QuickRun, we are committed to quality, affordability, and unmatched delivery speed. Why settle for delays when you can have it now? Experience the future of smart shopping today with QuickRun—because you deserve the best, delivered fast. @3462129528862
              </p>
              <button
                onClick={() => setExpanded(false)}
                className="mt-2 text-green-700 dark:text-green-400 font-medium underline"
              >
                Read less
              </button>
            </div>
          )}
        </div>
      </div>

    </footer>
  );
}
