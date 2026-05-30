"use client";

import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";

//condition location
import { useLocationData } from "@/app/LocationProvider";



import { Lexend } from "next/font/google";
const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

import { useState, useEffect } from "react";
import { openDB } from "idb";
import { Search, User, ShoppingCart, Menu, ShoppingBag, X } from "lucide-react";

import { getFirestore, doc, getDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import { app } from "@/lib/firebase"; 
import { useRouter } from "next/navigation";

import Cart from "./cart";
import MenuSheet from "./MenuSheet";

export default function Header() {
  const [openLocation, setOpenLocation] = useState(false);
  const [location, setLocation] = useState("Select location");
  // const [loadingLocation, setLoadingLocation] = useState(false); // Moved to context
  const [fullAddress, setFullAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullSearch, setShowFullSearch] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);


  // ⭐ FIXED TYPE
// PRODUCT SEARCH


// LOCATION SEARCH
const [locationQuery, setLocationQuery] = useState("");

// PRODUCT RESULTS


// LOCATION RESULTS
const [searchResults, setSearchResults] = useState<any[]>([]);
const [searchLoading, setSearchLoading] = useState(false);

//location condition
  const { setCoords, setAddress, hasLocation, setHasLocation, detectAndSetLocation, loadingLocation, address } = useLocationData();


  useEffect(() => {
    if (address?.short) {
      setLocation(address.short);
    }
    if (address?.full) {
      setFullAddress(address.full);
    }
  }, [address]);


const pathname = usePathname();



  const [initial, setInitial] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [openMenu, setOpenMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);


  // detectAndSetLocation moved to LocationProvider

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
  if (pathname === "/") {
    setSearchQuery("");

    // SearchPage ka liveQuery bhi reset hoga
    window.dispatchEvent(new CustomEvent("search-update", { detail: "" }));
  }
}, [pathname]);


  useEffect(() => {
    function updateLocalCartCount() {
      const saved = localStorage.getItem("cart_quantities");
      if (saved) {
        const obj = JSON.parse(saved);
        const total = Object.values(obj).reduce((sum: number, x: any) => sum + (x || 0), 0);
        setCartCount(total);
      }
    }

    updateLocalCartCount();
    window.addEventListener("storage", updateLocalCartCount);

    return () => window.removeEventListener("storage", updateLocalCartCount);
  }, []);

  const router = useRouter();

useEffect(() => {
  // 1️⃣ CHECK SAVED LOCATION FIRST
  const saved = localStorage.getItem("qr_saved_location");

  if (saved) {
    const loc = JSON.parse(saved);

    setCoords({ lat: loc.lat, lng: loc.lng });

    setLocation(loc.short);
    setFullAddress(loc.full);
    setAddress({ short: loc.short, full: loc.full });
    setHasLocation(Boolean(loc.lat && loc.lng));
    // setLoadingLocation(false); // Removed

    console.log("📌 Loaded saved location:", loc);
  } else {
    // detectAndSetLocation(); // ❌ REMOVED: Do not auto-detect on load
  }
}, []);


  useEffect(() => {
    const loadUserFromDB = async () => {
      const dbIndex = await openDB("QuickRunDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("user")) {
            db.createObjectStore("user");
          }
        },
      });

      const savedUid = await dbIndex.get("user", "uid");

      if (!savedUid) {
        setLoggedIn(false);
        return;
      }

      setLoggedIn(true);

      const db = getFirestore(app);
      const snap = await getDoc(doc(db, "Customer", savedUid));

      if (snap.exists()) {
        const data = snap.data();
        const name = data.name || "";
        const phone = data.phone || "";

        let first = "";

        if (name && name.trim().length > 0) {
          first = name.trim().charAt(0).toUpperCase();
        } else if (phone && phone.trim().length > 0) {
          first = phone.trim().charAt(0);
        } else {
          first = "U";
        }

        setInitial(first);
      }
    };

    loadUserFromDB();
  }, []);

  useEffect(() => {
    const setupListener = async () => {
      const dbIndex = await openDB("QuickRunDB", 1);
      const savedUid = await dbIndex.get("user", "uid");
      if (!savedUid) return;

      const db = getFirestore(app);
      const cartCollection = collection(db, "Customer", savedUid, "cart");

      const unsubscribe = onSnapshot(cartCollection, (snapshot) => {

        let total = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.quantity) total += data.quantity;
        });
        setCartCount(total);
      });

      return unsubscribe;
    };

    setupListener();
  }, []);

// LOCATION SEARCH
useEffect(() => {
  if (locationQuery.trim().length < 2) {
    setSearchResults([]);
    setSearchLoading(false);
    return;
  }

  setSearchLoading(true);

  const timer = setTimeout(() => {
    fetch(`/api/places?input=${encodeURIComponent(locationQuery)}`)
      .then((res) => res.json())
      .then((data) => setSearchResults(data?.predictions || []))
      .catch(() => {})
      .finally(() => setSearchLoading(false));
  }, 300);

  return () => clearTimeout(timer);
}, [locationQuery]);



//product search
// PRODUCT SEARCH








  return (
    <>
    {/* TOP DOWNLOAD STRIP */}
{/* <div className="fixed top-0 left-0 w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-3 h-[26px] text-[11px] sm:text-xs z-[99999]">
  <span className="flex items-center">Download app on Playstore and Appstore</span>

  <a
    href="https://play.google.com/store/apps/details?id=com.quick.quick_run"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center"
  >
    <img
      src="/img/playstore.png"
      alt="Playstore"
      className="h-4 w-auto object-contain"
    />
  </a>
  <span>and</span>

  <a
    href="https://apps.apple.com/app/quickrun-instant-delivery/id6755721618
"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center"
  >
    <img
      src="/img/appstore.png"
      alt="Appstore"
      className="h-4 w-auto object-contain"
    />
  </a>
</div> */}



     <header 
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-1" 
            : "bg-transparent py-2"
        }`}
        style={lexend.style}
      >
        {/* New Minimalist Header UI */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">
          {/* Left Section: Menu + Links */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button 
              onClick={() => setOpenMenu(true)} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            {/* <div className="hidden sm:flex items-center gap-6">
              <Link 
                href="/" 
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors tracking-wide"
              >
                Beauty
              </Link>
              <Link 
                href="/category/fruits-and-vegetables" 
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors tracking-wide"
              >
                Fruits & Vegetables
              </Link>
            </div> */}
          </div>

          {/* Center Section: Logo/Text */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link 
              href="/" 
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              QuickRun
            </Link>
          </div>

          {/* Right Section: Search + Cart + Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* {showSearchBar ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Search fruits & vegetables..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    window.dispatchEvent(new CustomEvent("search-update", { detail: val }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setShowSearchBar(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none text-sm"
                  autoFocus
                />
                <button 
                  onClick={() => setShowSearchBar(false)} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowSearchBar(true)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )} */}
            <button 
              onClick={() => setOpenCart(true)} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <div
              onClick={() => {
                if (loggedIn) router.push("/profile");
                else router.push("/login");
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs bg-cover bg-center cursor-pointer border border-gray-200 dark:border-gray-600"
              style={{
                backgroundImage: `url("https://api.dicebear.com/9.x/glass/svg?seed=${initial || "A"}")`,
              }}
            >
              {!loggedIn && <User size={16} className="text-gray-700 dark:text-gray-300" />}
              {loggedIn && initial && <span className="sr-only">{initial}</span>}
            </div>
          </div>
        </div>

        {/* OLD HEADER UI (COMMENTED OUT) */}
        {/* 
        <div className="w-full px-3 py-2 flex sm:hidden items-center justify-between">
          ... existing mobile code ...
        </div>
        ... and so on ...
        */}
      </header>

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
          <div className={`${lexend.className} bg-white dark:bg-gray-800 w-[540px] max-h-[90vh] p-5 overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg`}>

            <div className={`${lexend.className} flex justify-between items-center mb-4`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Location</h2>
              <button onClick={() => setShowAddressModal(false)} className="text-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">✖</button>
            </div>

            <div className={`${lexend.className} flex items-center gap-3 mb-4`}>
              <button
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium"
                onClick={() => {
                  localStorage.removeItem("qr_saved_location");
                  detectAndSetLocation();
                }}
              >
                Detect my location
              </button>

              <div className="text-gray-400 dark:text-gray-500 font-semibold">OR</div>

             <input
  type="text"
  placeholder="search delivery location"
  value={locationQuery}
  onChange={(e) => setLocationQuery(e.target.value)}
  className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg px-4 py-3 outline-none"
/>

            </div>

            {(locationQuery.length >= 3) && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 px-1">
                Searching locations for "<span className="font-semibold">{searchQuery}</span>"
              </p>
            )}

            {searchLoading && (
              <p className="text-sm text-gray-500 dark:text-gray-400 px-1 mb-2">Loading results…</p>
            )}

            {searchResults.length > 0 && (
              <div className={`${lexend.className} mb-2`}>
                {searchResults.map((loc: any) => (      // ⭐ FIXED TYPE
                  <button
                    key={loc.place_id}
onClick={async () => {
  const main = loc.structured_formatting?.main_text;
  const full = loc.description;

  // ⭐ Fetch lat/lng
  const res = await fetch(`/api/place-details?place_id=${loc.place_id}`);
  const data = await res.json();

  const lat = data?.lat;
  const lng = data?.lng;

  if (lat && lng) {
    setCoords({ lat, lng });
  }

  // ⭐ SAVE TO LOCAL STORAGE (VERY IMPORTANT)
  localStorage.setItem(
    "qr_saved_location",
    JSON.stringify({ lat, lng, short: main, full })
  );

  // ⭐ Update global UI
  setAddress({ short: main, full });
  setLocation(main);
  setFullAddress(full);
  setHasLocation(true);

  setShowAddressModal(false);
  setSearchResults([]);
  setLocationQuery("");
}}



                    className="w-full text-left px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <img src="/location.png" alt="loc" className="w-5 h-5 object-contain dark:invert" />
                      <div>
                        <p className="font-medium text-base text-gray-900 dark:text-gray-100">
                          {loc.structured_formatting?.main_text}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {loc.structured_formatting?.secondary_text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
      
      
      {/* Product search component*/}
{/* PRODUCT SEARCH BOTTOM SHEET */}





      {/* MENU SHEET */}
      <MenuSheet isOpen={openMenu} onClose={() => setOpenMenu(false)} />

      {/* CART SIDEBAR */}
      {openCart && (
        <div className="fixed inset-0 z-[100010] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenCart(false)}
          ></div>

          <Cart onClose={() => setOpenCart(false)} />
        </div>
      )}

      <style jsx global>{`
        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-left {
          animation: slideLeft 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
