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
import { Search, User, ShoppingCart } from "lucide-react";

import { getFirestore, doc, getDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import { app } from "@/lib/firebase"; 
import { useRouter } from "next/navigation";

import Cart from "./cart";

export default function Header() {
  const [openLocation, setOpenLocation] = useState(false);
  const [location, setLocation] = useState("Select location");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [fullAddress, setFullAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullSearch, setShowFullSearch] = useState(false);


  // ⭐ FIXED TYPE
// PRODUCT SEARCH


// LOCATION SEARCH
const [locationQuery, setLocationQuery] = useState("");

// PRODUCT RESULTS


// LOCATION RESULTS
const [searchResults, setSearchResults] = useState<any[]>([]);
const [searchLoading, setSearchLoading] = useState(false);

//location condition
const { setCoords, setAddress, hasLocation, setHasLocation } = useLocationData();


const pathname = usePathname();



  const [initial, setInitial] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);



  useEffect(() => {
  if (pathname === "/home") {
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
    setLoadingLocation(false);

    console.log("📌 Loaded saved location:", loc);
  }
  setLoadingLocation(false);
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

{/* TOP DOWNLOAD STRIP */}
<div className="fixed top-0 left-0 w-full bg-[#f5f5f5] text-gray-700 flex items-center justify-center gap-3 h-[26px] text-[11px] sm:text-xs z-[99999]">
  <span className="flex items-center">Download app on Playstore and Appstore</span>

  {/* Playstore */}
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

  {/* Appstore */}
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
</div>



     <header className={`${lexend.className} w-full bg-white fixed top-[24px] left-0 z-50`}>


        <div className="w-full px-3 py-2 flex sm:hidden items-center justify-between">

          {/* LEFT — LOGO + LOCATION */}
          <div className="flex items-center gap-4 flex-shrink-0">
<Link href="/home" className="relative z-[9999] inline-block" >
  <Image
    src="/logo.png"
    alt="logo"
    width={120}
    height={80}
    className="h-12 sm:h-20 w-auto object-contain cursor-pointer"
    priority
  />
</Link>

            <div className="h-14 sm:h-20 w-px bg-gray-300"></div>
            <div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-1 hover:text-black whitespace-nowrap"
              >
                {loadingLocation ? "Fetching..." : location} 
                <span className="text-[10px] sm:text-xs">▼</span>
              </button>
              <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] sm:max-w-none">
                {loadingLocation ? "" : fullAddress}
              </p>
            </div>
            {/* SEARCH ICON — MOBILE */}
            {/* (search button removed as per instructions) */}
          </div>

          {/* PROFILE ICON — right */}
          <div
            onClick={() => {
              if (loggedIn) router.push("/profile");
              else router.push("/login");
            }}
            className="h-10 w-10 rounded-full flex items-center justify-center text-lg bg-cover bg-center cursor-pointer ml-auto"
            style={{
              backgroundImage: `url("https://api.dicebear.com/9.x/glass/svg?seed=${initial || "A"}")`,
            }}
          >
            {loggedIn ? initial : <User size={18} className="text-gray-700" />}
          </div>

          {showFullSearch && (
            <div className="w-full flex sm:hidden mt-1 px-2">
              <div className="w-full flex items-center bg-white border border-gray-300 rounded-full px-5 py-4">
<input
  type="text"
  placeholder="Search for groceries, food..."
  className="w-full bg-transparent outline-none text-sm text-gray-700"
  value={searchQuery}

  // 👇 CLICK → open search page immediately
  onFocus={() => router.push("/search")}

  // 👇 live query broadcast for instant results
  onChange={(e) => {
    const value = e.target.value;
    setSearchQuery(value);
    window.dispatchEvent(new CustomEvent("search-update", { detail: value }));
  }}

  // 👇 Enter → update URL only once
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      router.replace(`/search?q=${searchQuery}`);
    }
  }}
/>







                <button onClick={() => setShowFullSearch(false)}>
                  <span className="text-gray-600 ml-3 text-lg">✖</span>
                </button>
              </div>
            </div>
          )}

          {/* DESKTOP SEARCH BAR */}
          <div className="hidden sm:flex flex-1 mx-8 lg:mx-20">
            <div className="w-full flex items-center bg-white border border-gray-300 rounded-full px-5 py-4">
<input
  type="text"
  placeholder="Search for groceries, food..."
  className="w-full bg-transparent outline-none text-sm text-gray-700"
  value={searchQuery}

  // 👇 CLICK → open search page immediately
  onFocus={() => router.push("/search")}

  // 👇 live query broadcast for instant results
  onChange={(e) => {
    const value = e.target.value;
    setSearchQuery(value);
    window.dispatchEvent(new CustomEvent("search-update", { detail: value }));
  }}

  // 👇 Enter → update URL only once
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      router.replace(`/search?q=${searchQuery}`);
    }
  }}
/>







              <Search size={20} className="text-gray-600 ml-3" />
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH BAR BELOW */}
        <div className="w-full sm:hidden px-3 mt-2">
          <div className="w-full flex items-center gap-3">

            <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-5 py-3">
<input
  type="text"
  placeholder="Search for groceries, food..."
  className="w-full bg-transparent outline-none text-sm text-gray-700"
  value={searchQuery}

  // 👇 CLICK → open search page immediately
  onFocus={() => router.push("/search")}

  // 👇 live query broadcast for instant results
  onChange={(e) => {
    const value = e.target.value;
    setSearchQuery(value);
    window.dispatchEvent(new CustomEvent("search-update", { detail: value }));
  }}

  // 👇 Enter → update URL only once
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      router.replace(`/search?q=${searchQuery}`);
    }
  }}
/>







              <Search size={20} className="text-gray-600 ml-3" />
            </div>

            <button
              onClick={() => setOpenCart(true)}
              className="bg-blue-400 px-4 py-3 rounded-lg flex items-center gap-2 text-white flex-shrink-0"
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              <span className="text-sm">{cartCount} items</span>
            </button>

          </div>
        </div>

        {/* DESKTOP HEADER */}
        <div className="hidden sm:flex w-full items-center justify-between">

          {/* LEFT SIDE — LOGO + LOCATION */}
          <div className="flex items-center gap-6">
           <Link href="/home" className="relative z-[9999] inline-block" >
  <Image
    src="/logo.png"
    alt="logo"
    width={120}
    height={80}
    className="h-12 sm:h-20 w-auto object-contain cursor-pointer"
    priority
  />
</Link>

            <div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="text-2xl font-semibold text-gray-900 flex items-center gap-1 hover:text-black whitespace-nowrap"
              >
                {loadingLocation ? "Fetching..." : location}
                <span className="text-xs">▼</span>
              </button>

              <p className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px]">
                {loadingLocation ? "" : fullAddress}
              </p>
            </div>
          </div>

          {/* CENTER — SEARCH BAR */}
          <div className="flex-1 mx-8 lg:mx-20">
            <div className="w-full flex items-center bg-white border border-gray-300 rounded-full px-5 py-4">
<input
  type="text"
  placeholder="Search for groceries, food..."
  className="w-full bg-transparent outline-none text-sm text-gray-700"
  value={searchQuery}

  // 👇 CLICK → open search page immediately
  onFocus={() => router.push("/search")}

  // 👇 live query broadcast for instant results
  onChange={(e) => {
    const value = e.target.value;
    setSearchQuery(value);
    window.dispatchEvent(new CustomEvent("search-update", { detail: value }));
  }}

  // 👇 Enter → update URL only once
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      router.replace(`/search?q=${searchQuery}`);
    }
  }}
/>







              <Search size={22} className="text-gray-600 ml-3" />
            </div>
          </div>

          {/* RIGHT SIDE — PROFILE */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => setOpenCart(true)}
              className="bg-blue-400 px-3 py-2 rounded-lg flex items-center gap-2 text-white cursor-pointer"
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              <div className="flex flex-col leading-tight">
                <span className="text-base">{cartCount} items</span>
              </div>
            </div>
            {/* PROFILE ICON */}
            <div
              onClick={() => {
                if (loggedIn) router.push("/profile");
                else router.push("/login");
              }}
              className="h-10 w-10 rounded-full flex items-center justify-center text-lg bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url("https://api.dicebear.com/9.x/glass/svg?seed=${initial || "A"}")`,
              }}
            >
              {loggedIn ? initial : <User size={18} className="text-gray-700" />}
            </div>
          </div>
        </div>
      </header>

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
          <div className={`${lexend.className} bg-white w-[540px] max-h-[90vh] p-5 overflow-y-auto shadow-xl`}>

            <div className={`${lexend.className} flex justify-between items-center mb-4`}>
              <h2 className="text-lg font-semibold">Change Location</h2>
              <button onClick={() => setShowAddressModal(false)} className="text-xl">✖</button>
            </div>

            <div className={`${lexend.className} flex items-center gap-3 mb-4`}>
              <button
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium"
                onClick={() => {
                  localStorage.removeItem("qr_saved_location");
                  setLoadingLocation(true);
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const { latitude, longitude } = pos.coords;

                        setCoords({ lat: latitude, lng: longitude });  // ⭐ ADD THIS
fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
  .then((res) => res.json())
  .then((data) => {
    const place =
      data?.address?.suburb ||
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.display_name ||
      "Unknown Location";

    const full = data?.display_name || "";

    // ⭐ SAVE to localStorage
    localStorage.setItem(
      "qr_saved_location",
      JSON.stringify({ lat: latitude, lng: longitude, short: place, full })
    );

    setLocation(place);
    setFullAddress(full);
    setHasLocation(true);

    setShowAddressModal(false);
    setLoadingLocation(false);
  })

                          .catch(() => {});
                      },
                      () => {
                        console.warn("Unable to fetch location");
                        setLoadingLocation(false);
                      }
                    );
                  }
                }}
              >
                Detect my location
              </button>

              <div className="text-gray-400 font-semibold">OR</div>

             <input
  type="text"
  placeholder="search delivery location"
  value={locationQuery}
  onChange={(e) => setLocationQuery(e.target.value)}
  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none"
/>

            </div>

            {(locationQuery.length >= 3) && (
              <p className="text-sm text-gray-600 mb-2 px-1">
                Searching locations for "<span className="font-semibold">{searchQuery}</span>"
              </p>
            )}

            {searchLoading && (
              <p className="text-sm text-gray-500 px-1 mb-2">Loading results…</p>
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



                    className="w-full text-left px-4 py-4 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <img src="/location.png" alt="loc" className="w-5 h-5 object-contain" />
                      <div>
                        <p className="font-medium text-base">
                          {loc.structured_formatting?.main_text}
                        </p>
                        <p className="text-sm text-gray-500">
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





      {/* CART SIDEBAR */}
      {openCart && (
        <div className="fixed inset-0 z-[300] flex justify-end">
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