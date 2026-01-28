"use client";

import { slugify, generateSlug } from "@/app/utils/generateSlug";
import { db } from "@/lib/firebase";
import ShimmerImage from "@/app/components/ShimmerImage";

import { onSnapshot } from "firebase/firestore";
import { useMemo, useState, useRef } from "react";


import {
  collection,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import Link from "next/link";
import { getAllProducts } from "@/lib/getAllProducts";
import React from "react";
import { useRouter } from "next/navigation";

import { useLocationData } from "@/app/LocationProvider";
import { haversineDistanceKm } from "@/app/utils/distance";
import { useGyroTilt } from "@/app/utils/useGyroTilt";
import { doc, setDoc } from "firebase/firestore";

type OrderType = {
  id: string;
  [key: string]: any;
};

export default function HomeClient() {
  const router = useRouter();
  // console.log("UID FROM LS =", localStorage.getItem("uid"));


  // LOCATION FROM CONTEXT
  const { coords, hasLocation, detectAndSetLocation } = useLocationData();   // ⭐ ADDRESS ADDED
  const userLat = coords?.lat;
  const userLng = coords?.lng;

  // SNACKBAR
  const [snack, setSnack] = React.useState("");

  // SCROLL TO RECOMMENDED SECTION
  const scrollToRecommended = () => {
    if (typeof window === "undefined") return;
    const element = document.getElementById('recommended-section');
    if (element) {
      const headerHeight = window.innerWidth >= 640 ? 110 : 165; // Desktop: 106px, Mobile: 120px (more generous)
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // LAZY LOADING STATES
  const [allItems, setAllItems] = React.useState<any[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<any[]>([]);
  const [visibleItems, setVisibleItems] = React.useState<any[]>([]);
  const [batch, setBatch] = React.useState(1);
  const ITEMS_PER_BATCH = 12;

  // CATEGORIES + SHOPS
  const [categories, setCategories] = React.useState<any[]>([]);
  const [shops, setShops] = React.useState<any[]>([]);

  const shopLookup = useMemo(() => {
    return shops.reduce((acc: Record<string, any>, shop: any) => {
      if (shop.id) acc[String(shop.id)] = shop;
      return acc;
    }, {});
  }, [shops]);


  const [currentOrder, setCurrentOrder] = useState<OrderType | null>(null);
const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const sortedVisibleItems = React.useMemo(() => {
    return [...visibleItems].sort((a, b) => {
      const aBlocked = getCardState(a).blocked ? 1 : 0;
      const bBlocked = getCardState(b).blocked ? 1 : 0;
      return aBlocked - bBlocked;
    });
  }, [visibleItems, shops, hasLocation, coords?.lat, coords?.lng]);


function OrderAlertUI() {
  const router = useRouter();

  return (
    <>
      {/* DESKTOP - Slim Fixed Card */}
      <div
        className="
          hidden sm:flex 
          fixed right-6 bottom-6 z-50
          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
          rounded-2xl shadow-xl
          p-3 w-[320px]
          items-center justify-between
          border border-gray-200 dark:border-gray-700
          animate-slide-up
        "
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-50 p-2 rounded-lg">
            <img 
              src="/img/delivery.png" 
              className="w-8 h-8 dark:invert" 
              alt="Delivery"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-sm font-semibold truncate">Arriving Soon!</h2>
            </div>
            <p className="text-xs text-gray-600 truncate">Ready to collect</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/order_tracking")}
          className="
            bg-green-600 text-white hover:bg-green-700 
            px-3 py-1.5 rounded-lg text-sm font-medium
            transition-colors duration-200
            whitespace-nowrap ml-2
          "
        >
          Track
        </button>
      </div>

      {/* MOBILE - Slim Bottom Bar */}
      <div
        className="
          sm:hidden
          fixed bottom-0 left-0 right-0
          bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700
          shadow-lg
          px-4 py-3 z-50
          animate-slide-up
        "
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-1.5 rounded-lg">
              <img 
                src="/img/delivery.png" 
                className="w-7 h-7 dark:invert" 
                alt="Delivery"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-sm font-semibold truncate">Arriving Soon</h2>
              </div>
              <p className="text-xs text-gray-600 truncate">Collect your order</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
   
            <button
              onClick={() => router.push("/order_tracking")}
              className="
                bg-green-600 text-white hover:bg-green-700 
                px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors duration-200
              "
            >
              Track
            </button>
          </div>
        </div>
        
        {/* Optional: Slim progress indicator */}

      </div>

    </>
  );
}

  // ------- Load all products (YOUR CODE SAME) -------
  React.useEffect(() => {
    async function load() {
      const fetched = await getAllProducts();
      if (!Array.isArray(fetched)) return;

      const mapped = fetched.map((p: any) => ({
        id: p.id,
        title: p.title ?? p.raw?.name ?? "Product",
        image: p.image ?? p.raw?.imageUrls?.[0] ?? "/placeholder.png",
        price: p.price ?? p.raw?.priceTiers?.[0]?.price ?? 0,
        mrp: p.mrp ?? p.raw?.priceTiers?.[0]?.mrp ?? "",
        quantity: p.quantity ?? p.raw?.priceTiers?.[0]?.quantity ?? "",
        unit: p.unit ?? p.raw?.priceTiers?.[0]?.unit ?? "",
        discount: p.discount ?? p.raw?.priceTiers?.[0]?.percentOff ?? 0,
        type: p.type ?? p.raw?.type ?? "",
        category: p.raw?.category ?? "",
        restaurentId: p.restaurentId ?? p.raw?.restaurentId ?? null,
        // quantityPerUnit should mirror the tier quantity (e.g. 200, 750)
        quantityPerUnit:
          p.quantityPerUnit ??
          p.raw?.priceTiers?.[0]?.quantity ??
          null,
        stockQty: p.stockQty ?? p.raw?.stockQty ?? null,
        raw: p.raw ?? null,
      }));

      setAllItems(mapped);
      setFilteredItems(mapped);     
      setVisibleItems(mapped.slice(0, ITEMS_PER_BATCH));
    }

    load();
  }, []);

React.useEffect(() => {
  const uid = localStorage.getItem("currentUser");  // ✅ FIXED
  if (!uid) return;

  const ref = collection(db, "Customer", uid, "current_order");

  const unsub = onSnapshot(ref, (snap) => {
    console.log("SNAPSHOT:", snap.docs.map(d => d.data()));

    if (!snap.empty) {
      setCurrentOrder({
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      });
    } else {
      setCurrentOrder(null);
    }
  });

  return () => unsub();
}, []);




  // ------- Load categories (same) -------
  React.useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(
        snap.docs.map((d) => {
          const data = d.data();
          const image = data.imageSlug 
            ? `/images/categories/${data.imageSlug}` 
            : (data.image || "");
            
          return { id: d.id, ...data, image };
        })
      );
    }
    loadCategories();
  }, []);

  // ------- Load shops (same) -------
  React.useEffect(() => {
    async function loadShops() {
      const snap = await getDocs(collection(db, "Restaurent_shop"));
      setShops(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            activeShop: data.activeShop ?? true,
            location: data.location ?? null,
            ...data,
          };
        })
      );
    }
    loadShops();
  }, []);

  // ------- Always show all items; paging only -------
  React.useEffect(() => {
    setFilteredItems(allItems);
    setVisibleItems(allItems.slice(0, ITEMS_PER_BATCH));
    setBatch(1);
  }, [allItems]);

  // ------- Lazy Loading (same) -------
  React.useEffect(() => {
    const nextCount = batch * ITEMS_PER_BATCH;
    setVisibleItems(filteredItems.slice(0, nextCount));
  }, [batch, filteredItems]);

  React.useEffect(() => {
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 600
      ) {
        setBatch((prev) => prev + 1);
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  // Compute per-card gating state (location + shop status) and update quantities
  async function changeQuantity(
    item: any,
    delta: number,
    e?: React.MouseEvent
  ) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // ⭐ AUTO-DETECT LOCATION IF MISSING
    if (!hasLocation) {
      detectAndSetLocation();
      return;
    }

    const currentQty = quantities[item.id] || 0;
    const newQty = Math.max(currentQty + delta, 0);
    if (newQty === currentQty) return;

    // Only gate when trying to increase quantity
    if (newQty > currentQty) {
      const { blocked, overlayText } = getCardState(item);
      if (blocked) {
        setSnack(overlayText || "Select location to order");
        setTimeout(() => setSnack(""), 2000);
        return;
      }
    }

    const userId = localStorage.getItem("currentUser");
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      const ref = doc(db, "Customer", userId, "cart", item.id);
      await setDoc(
        ref,
        {
          name: item.title || item.name || "Product",
          price: item.price || 0,
          mrp: item.mrp || 0,
          unit: item.unit || "",
          quantity: newQty,
          image: item.image || "/placeholder.png",
          addedAt: serverTimestamp(),
          restaurentId: item.restaurentId || null,
          quantityPerUnit: item.quantityPerUnit ?? null,
        },
        { merge: true }
      );

      setQuantities((prev) => ({ ...prev, [item.id]: newQty }));

      setSnack(newQty > currentQty ? "Added to cart" : "Updated cart");
      setTimeout(() => setSnack(""), 1500);
    } catch (err) {
      console.error("Cart update error:", err);
      setSnack("Failed to update cart");
      setTimeout(() => setSnack(""), 1500);
    }
  }

  function ProductCard({
    item,
    blocked,
    overlayText,
    shopClosed,
    isOutOfRange,
    isOutOfStock,
    qty,
    onIncrement,
    onDecrement,
    attachRef,
  }: any) {
  const tiltRef = useRef<HTMLDivElement | null>(null);
  useGyroTilt(tiltRef);
  
    const slug = generateSlug(item.title, item.id);
  
    return (
      <div className="relative" ref={attachRef}>
        {shopClosed && (
  <div
   className="absolute inset-0 z-20 bg-white/30 backdrop-blur-[1.5px] flex items-center justify-center rounded-xl"

    style={{ pointerEvents: "auto" }}
  >
    <div ref={tiltRef} className="w-24 sm:w-28">
      <img
        src="/img/shopclose.png"
        alt="Shop Closed"
        className="w-full object-contain dark:invert"
      />
    </div>
  </div>
)}

        <div className="border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition p-3 flex flex-col bg-white dark:bg-gray-800 relative h-full">

          <div className="flex flex-col items-start gap-2">
            <div className="relative w-full pb-3">
              <ShimmerImage
                src={item.image}
                className="w-full h-32 sm:h-36 object-contain bg-white rounded-lg"
              />
  
              {qty <= 0 ? (
               <button
  onClick={blocked ? undefined : onIncrement}
  disabled={blocked}
  className={`absolute right-0 bottom-[-10px] rounded-xl px-6 py-1.5 text-[10px] sm:text-xs font-semibold shadow-sm border ${
    blocked
      ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-white border-green-500 text-green-600"
  }`}
>
  ADD
</button>

              ) : (
                <div className="absolute right-0 bottom-[-10px] flex items-center rounded-xl bg-green-600 text-white text-xs font-semibold shadow-sm px-3 py-1.5">
                  <button onClick={onDecrement} className="px-2 text-lg">-</button>
                  <span className="px-3">{qty}</span>
                  <button onClick={onIncrement} className="px-2 text-lg">+</button>
                </div>
              )}
            </div>
  
            <p className="mt-2 font-semibold text-[11px] sm:text-xs line-clamp-2 h-[32px] text-gray-900 dark:text-gray-100">
            {item.title}
          </p>
  
            <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs -mt-1">
              {item.quantity} {item.unit}
            </p>
  
            <div className="flex items-center gap-1 -mt-1">
              <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">₹{item.price}</p>
              {item.mrp > 0 && (
                <p className="text-[10px] text-gray-400 line-through">
                  ₹{item.mrp}
                </p>
              )}
            </div>
  <p className="min-h-[14px] text-[11px] leading-tight -mt-1">
    {isOutOfStock ? (
      <span className="text-red-600 font-medium">Out of stock</span>
    ) : (
      isOutOfRange && (
        <span className="text-red-600 font-medium">
          This product not available in your area
        </span>
      )
    )}
  </p>
          </div>
        </div>


      </div>
    );
  }
  
function getCardState(item: any) {
  const shop = shopLookup[String(item.restaurentId)] || null;
  const hasShop = Boolean(shop);

  const hasUserLocation = Boolean(hasLocation && userLat && userLng);
  const shopHasLocation = Boolean(shop?.location?.lat && shop?.location?.lng);

  const shopClosed = hasShop && shop?.activeShop === false;

  let isOutOfRange = false;
  let isOutOfStock = false;
  let overlayText = "";

  if (hasUserLocation && shopHasLocation) {
    const dist = haversineDistanceKm(
      userLat as number,
      userLng as number,
      shop.location.lat,
      shop.location.lng
    );

    if (dist > 5) {
      isOutOfRange = true;
      overlayText = "Delivery is not available in your area";
    }
  }

  if (typeof item.stockQty === "number" && item.stockQty <= 2) {
    isOutOfStock = true;
    overlayText = "Out of stock";
  }

  if (shopClosed) {
    overlayText = "Shop is currently closed";
  }

  const blocked =
    shopClosed ||
    !hasShop ||
    // !hasUserLocation ||  // ❌ ALLOW BROWSING WITHOUT LOCATION
    !shopHasLocation ||
    isOutOfRange ||
    isOutOfStock;

  return { blocked, overlayText, isOutOfRange, isOutOfStock, shopClosed };
}





  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground w-full pb-16 overflow-x-hidden">
      {(currentOrder && Object.keys(currentOrder).length > 0) && <OrderAlertUI />}


      {/* CATEGORY STRIP */}
      <div className="px-2 sm:px-6 md:px-10 mt-12 sm:mt-6">
        <div className="relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200 dark:bg-gray-700 shadow-md rounded-full w-7 h-7 flex items-center justify-center"
            onClick={() => {
              const el = document.getElementById("cat-scroll");
              if (el) el.scrollBy({ left: -150, behavior: "smooth" });
            }}
          >
            <span className="text-black dark:text-white text-xs">←</span>
          </button>

          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200 dark:bg-gray-700 shadow-md rounded-full w-7 h-7 flex items-center justify-center"
            onClick={() => {
              const el = document.getElementById("cat-scroll");
              if (el) el.scrollBy({ left: 150, behavior: "smooth" });
            }}
          >
            <span className="text-black dark:text-white text-xs">→</span>
          </button>

          <div id="cat-scroll" className="overflow-x-scroll no-scrollbar">
            <div className="flex gap-6 sm:gap-10 py-2 min-w-max justify-center">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (!hasLocation) {
                      detectAndSetLocation();
                      return;
                    }
                    router.push(`/category/${slugify(cat.name)}`);
                  }}
                  className="text-center cursor-pointer flex flex-col items-center min-w-[80px] sm:min-w-[90px] md:min-w-[110px]"
                >
                  <img
                    src={cat.image}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-cover rounded-lg bg-gray-100"
                  />
                  <p className="mt-2 text-xs sm:text-sm font-semibold whitespace-normal text-center text-gray-900 dark:text-gray-100">
                    {cat.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="px-2 sm:px-6 md:px-10 mt-6 sm:mt-10">
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">

          <img
            src="/img/banner2.webp"
            className="w-full h-[160px] sm:h-[260px] md:h-[320px] lg:h-[430px] object-cover"
            alt="Banner"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-center text-white w-[90%] sm:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold drop-shadow-lg">
              QuickRun Delivery
            </h1>

            <p className="mt-1 sm:mt-2 text-sm sm:text-lg md:text-xl font-medium text-green-200 drop-shadow-md">
              Fresh Food & Groceries delivered{" "}
              <span className="text-yellow-300 font-bold">in Minutes.</span>
            </p>

            {visibleItems.length > 0 && (() => {
              const first = visibleItems[0];
              const { blocked, overlayText } = getCardState(first);
              const href = `/category/${slugify(first.category || first.type)}/${generateSlug(first.title, first.id)}`;

              if (blocked) {
                return (
                  <button
                    disabled
                    className="mt-3 sm:mt-5 px-5 sm:px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md cursor-not-allowed"
                  >
                    {overlayText || "Select location to order"}
                  </button>
                );
              }

              return (
                <button 
                  onClick={scrollToRecommended}
                  className="mt-3 sm:mt-5 px-5 sm:px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition shadow-md"
                >
                  Order Now →
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* SECTION TITLE */}
      <h2 id="recommended-section" className="text-lg sm:text-xl font-bold mt-10 sm:mt-12 mb-4 px-2 sm:px-6 md:px-10 text-gray-900 dark:text-gray-100">
        Recommended for you
      </h2>



      {/* PRODUCT GRID */}
      <div className="w-full max-w-7xl mx-auto">
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-6
            gap-2 sm:gap-3
            px-1 sm:px-4 md:px-6
          "
        >
{sortedVisibleItems.map((item: any, index: number) => {
  const { blocked, overlayText, isOutOfRange, isOutOfStock, shopClosed} = getCardState(item);
  const qty = quantities[item.id] || 0;
  const shouldAttachRef = index === sortedVisibleItems.length - 1;
  const slug = generateSlug(item.title, item.id);

  const card = (
    <ProductCard
      item={item}
      blocked={blocked}
      overlayText={overlayText}
      isOutOfRange={isOutOfRange}
      isOutOfStock={isOutOfStock}
       shopClosed={shopClosed}
      qty={qty}
      attachRef={shouldAttachRef ? null : undefined}
      onIncrement={(e: any) => changeQuantity(item, 1, e)}
      onDecrement={(e: any) => changeQuantity(item, -1, e)}
    />
  );

  if (blocked) {
    return (
      <div key={item.id}>
        {card}
      </div>
    );
  }

  return (
    <Link 
      key={item.id} 
      href={`/category/${slugify(item.category || item.type)}/${slug}`} 
      className="block"
      onClick={(e) => {
        if (!hasLocation) {
          e.preventDefault();
          detectAndSetLocation();
        }
      }}
    >
      {card}
    </Link>
  );
})}


        </div>
      </div>

    </div>
  );
}
