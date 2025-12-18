"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-white">

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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            QuickRun
          </h2>

          <p className="text-gray-500 text-sm mb-1">
            Got Question? Call us 24/7
          </p>

          <p className="text-gray-600 text-sm mb-4">
            sector 62, Noida, Greater Noida
          </p>
        </div>

        {/* SAFE PAYMENT */}
       





       

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Quick Links
          </h3>

          <ul className="space-y-2 text-gray-500 text-sm">
            <li>
              <a href="/termsandcondition" className="hover:text-gray-700">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="/shipping_policy" className="hover:text-gray-700">
                Shipping
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-gray-700">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/return_policy" className="hover:text-gray-700">
                Return Policy
              </a>
            </li>
          </ul>
        </div>

        {/* OUR STORES */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            About us
          </h3>

          <ul className="space-y-2 text-gray-500 text-sm">
             <li>
              <a href="/story" className="hover:text-gray-700">
                Our Story
              </a>
            </li>
            <li>
              <a href="/official-franchise" className="hover:text-gray-700">
                Official Franchise
              </a>
            </li>
             <li>
              <a href="/franchise" className="hover:text-gray-700">
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
          <p className="text-gray-600 text-sm">
            © Quick Run
          </p>

          {/* DOWNLOAD APP */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm font-medium">Download App</span>

            <a href="https://apps.apple.com/app/quickrun-instant-delivery/id6755721618" className="h-10">
              <img
                src="/appstore.webp"
                alt="App Store"
                className="h-full w-auto"
              />
            </a>

            <a href="https://play.google.com/store/apps/details?id=com.quick.quick_run" className="h-35 w-35">
              <img
                src="/playstore.webp"
                alt="Google Play"
                className="h-full w-auto"
              />
            </a>
          </div>

          {/* SOCIAL ICONS */}
          <div className="flex items-center gap-4">
        

            <a href="https://www.instagram.com/quickrunofficial/" target="_blank" className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <img src="/footer-icon/instagram.png" className="w-5" />
            </a>

            <a href="https://www.youtube.com/@QuickRunfast" target="_blank" className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <img src="/footer-icon/youtube.png" className="w-5 h-5 mt-2 object-contain mx-auto block" />
            </a>

            <a href="https://x.com/quickrunfast" target="_blank" className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <img src="/footer-icon/x.png" className="w-5" />
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}
