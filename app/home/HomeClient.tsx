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
import { Droplets, Sparkles, Leaf, ShieldCheck, Pipette, User, Hand, SunMoon, Star, Camera, Video, Send, Loader2, MessageSquare, Plus, ChevronRight, Quote, X } from "lucide-react";

import { useLocationData } from "@/app/LocationProvider";
import { haversineDistanceKm } from "@/app/utils/distance";
import { useGyroTilt } from "@/app/utils/useGyroTilt";
import { doc, setDoc, addDoc, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

type OrderType = {
  id: string;
  [key: string]: any;
};

// Move OrderAlertUI outside HomeClient to prevent syntax errors!
function OrderAlertUI() {
  const router = useRouter();

  return (
    <>
      {/* DESKTOP - Slim Fixed Card */}
      <div
        className="
          hidden sm:flex 
          fixed left-6 bottom-6 z-50
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
          onClick={() => router.push("/delivery-tracking")}
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
              onClick={() => router.push("/delivery-tracking")}
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
  // const [categories, setCategories] = React.useState<any[]>([]);
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

  // ------- REVIEWS LOGIC -------
  const [reviews, setReviews] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    text: "",
    images: [] as string[],
    video: ""
  });

  // Fetch Reviews
  React.useEffect(() => {
    const q = query(collection(db, "SilkyGoldReviews"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) {
      setSnack("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "SilkyGoldReviews"), {
        ...newReview,
        createdAt: serverTimestamp(),
      });
      setNewReview({ name: "", rating: 5, text: "", images: [], video: "" });
      setShowReviewForm(false);
      setSnack("Thank you for your review!");
    } catch (err) {
      console.error("Error submitting review:", err);
      setSnack("Failed to submit review");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSnack(""), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload to Firebase Storage here.
    // For this demo, we'll use local object URLs to simulate the preview.
    const fileArray = Array.from(files);
    
    if (type === 'image') {
      const newImages = fileArray.map(f => URL.createObjectURL(f));
      setNewReview(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    } else {
      const videoUrl = URL.createObjectURL(fileArray[0]);
      setNewReview(prev => ({ ...prev, video: videoUrl }));
    }
  };




  // ------- Load categories (same) -------
  // React.useEffect(() => {
  //   async function loadCategories() {
  //     const snap = await getDocs(collection(db, "categories"));
  //     setCategories(
  //       snap.docs.map((d) => {
  //         const data = d.data();
  //         const image = data.imageSlug 
  //           ? `/images/categories/${data.imageSlug}` 
  //           : (data.image || "");
  //           
  //         return { id: d.id, ...data, image };
  //       })
  //     );
  //   }
  //   loadCategories();
  // }, []);

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

  // ------- Only show Silky Gold products -------
  React.useEffect(() => {
    const silkyGoldItems = allItems.filter((item: any) => {
      const title = (item.title || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const type = (item.type || "").toLowerCase();
      return title.includes("silky gold") || category.includes("silky gold") || type.includes("silky gold");
    });
    setFilteredItems(silkyGoldItems);
    setVisibleItems(silkyGoldItems.slice(0, ITEMS_PER_BATCH));
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
    ) : null}
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

  // if (hasUserLocation && shopHasLocation) {
  //   const dist = haversineDistanceKm(
  //     userLat as number,
  //     userLng as number,
  //     shop.location.lat,
  //     shop.location.lng
  //   );

  //   if (dist > 5) {
  //     isOutOfRange = true;
  //     overlayText = "Delivery is not available in your area";
  //   }
  // }

  if (typeof item.stockQty === "number" && item.stockQty <= 2) {
    isOutOfStock = true;
    overlayText = "Out of stock";
  }

  if (shopClosed) {
    overlayText = "Shop is currently closed";
  }

  const blocked =
    // shopClosed ||
    // !hasShop ||
    // !hasUserLocation ||  // ❌ ALLOW BROWSING WITHOUT LOCATION
    // !shopHasLocation ||
    // isOutOfRange ||
    isOutOfStock;

  return { blocked, overlayText, isOutOfRange, isOutOfStock, shopClosed };
}





  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground w-full pb-16 overflow-x-hidden">
      {currentOrder && <OrderAlertUI />}


      {/* CATEGORY STRIP */}
      {/* <div className="px-2 sm:px-6 md:px-10 mt-12 sm:mt-6">
        ...
      </div> */}

      {/* HERO BANNER */}
      <div className="w-full -mt-2"> {/* Negative margin to ensure no gap from header */}
        <div 
          className="hero-container relative overflow-hidden flex flex-col items-center w-full h-[120vh]"
          style={{ 
            backgroundImage: "url('/img/hero-background.png')",
            backgroundSize: '100% 100%',
            backgroundPosition: 'top left',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Mobile-specific background - use separate hero-mobile.png */}
          <style jsx>{`
            @media (max-width: 768px) {
              .hero-container {
                background-image: url('/img/hero-mobile.png') !important;
                background-size: 100% 100% !important;
                background-position: top left !important;
                background-repeat: no-repeat !important;
              }
            }
          `}</style>
          
          {/* Left-positioned text with center alignment within itself */}
          <div className="absolute left-[8%] sm:left-[12%] md:left-[15%] top-[20%] sm:top-1/2 -translate-y-0 sm:-translate-y-1/2 z-10 text-center">
            <p className="text-[#B59461] font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.3em] mb-2">SILKY GOLD</p>
            <h1 className="text-[#1D3C2F] font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2">ALOE VERA</h1>
            <h2 className="text-gray-900 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4">WHITE RICE</h2>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[1px] bg-[#B59461] w-12 md:w-16"></div>
              <span className="text-gray-900 font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.2em]">FACE SERUM</span>
              <div className="h-[1px] bg-[#B59461] w-12 md:w-16"></div>
            </div>
            
            <p className="text-[#1D3C2F] text-base sm:text-lg md:text-xl italic">Glow Naturally, Shine Confidently.</p>
            
            {/* Purchase Options */}
            <div className="mt-6 flex flex-col items-center">
              <p className="text-[#1D3C2F]/70 text-sm mb-3 font-medium">Also available on</p>
              
              <div className="flex flex-row items-center justify-center gap-2 mb-4">
                <a
                  href="https://www.flipkart.com/silky-gold-aloe-vera-white-rice-face-serum-vitamin-b5-niacinamide-aloevera-extract-rice-extract/p/itma2e7d081cabac?pid=KMTHNAA2ZJNX5KYA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                >
                  <img src="/img/flipkart.png" alt="Flipkart" className="w-4 h-4 object-contain" />
                  <span className="text-gray-800 font-medium text-xs">Flipkart</span>
                </a>
                
                <a
                  href="https://www.meesho.com/silky-gold-aloe-vera-white-rice-face-serum-vitamin-b5-niacinamide-aloevera-extract-rice-extract/p/f65gy9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                >
                  <img src="/img/meesho.avif" alt="Meesho" className="w-4 h-4 object-contain" />
                  <span className="text-gray-800 font-medium text-xs">Meesho</span>
                </a>
                
                <a
                  href="https://www.amazon.in/dp/B0H337DH18"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                >
                  <img src="/img/amazon.jpg" alt="Amazon" className="w-4 h-4 object-contain" />
                  <span className="text-gray-800 font-medium text-xs">Amazon</span>
                </a>
              </div>
              
              {/* Buy Now button - Main Website */}
              <button 
                onClick={() => router.push("/category/silky-gold-products")}
                className="px-12 py-3 md:px-16 md:py-4 bg-[#1D3C2F] text-white font-bold rounded-full hover:bg-[#2a5a46] transition-all duration-500 text-lg md:text-2xl shadow-[0_10px_30px_rgba(29,60,47,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group border border-white/10"
                style={{ backdropFilter: 'blur(10px)' }}
              >
                Buy from our website
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#B59461] animate-pulse group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BENEFITS SECTION */}
      <div className="w-full bg-[#F9F6F0] py-16 sm:py-24 px-4 sm:px-10 relative overflow-hidden">
        {/* Decorative Palm Leaves (Optional images if available, otherwise just space) */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none -rotate-12">
          <img src="/img/palm-leaf-left.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none rotate-12">
          <img src="/img/palm-leaf-right.png" alt="" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Section Heading */}
          <div className="flex flex-col items-center mb-16 sm:mb-20">
            <h2 className="text-[#1D3C2F] font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.2em] mb-4">
              BENEFITS
            </h2>
            <div className="flex items-center gap-4 w-64">
              <div className="h-[1px] bg-[#1D3C2F] flex-1 opacity-30"></div>
              <div className="w-2 h-2 rounded-full bg-[#1D3C2F] opacity-60"></div>
              <div className="h-[1px] bg-[#1D3C2F] flex-1 opacity-30"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 w-full">
            {/* Benefit 1 */}
            <div className="flex flex-col items-center text-center px-4 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/4 lg:after:h-1/2 lg:after:w-[1px] lg:after:bg-[#1D3C2F]/20 last:after:hidden">
              <div className="w-24 h-24 rounded-full border border-[#1D3C2F]/30 flex items-center justify-center mb-6 bg-white/40 shadow-sm">
                <Droplets className="w-10 h-10 text-[#1D3C2F] stroke-[1.2]" />
              </div>
              <h3 className="text-[#1D3C2F] text-lg sm:text-xl font-bold mb-3">Deep Hydration</h3>
              <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed max-w-[200px]">
                Moisturizes deeply and keeps skin soft and smooth.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col items-center text-center px-4 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/4 lg:after:h-1/2 lg:after:w-[1px] lg:after:bg-[#1D3C2F]/20 last:after:hidden">
              <div className="w-24 h-24 rounded-full border border-[#1D3C2F]/30 flex items-center justify-center mb-6 bg-white/40 shadow-sm">
                <Sparkles className="w-10 h-10 text-[#1D3C2F] stroke-[1.2]" />
              </div>
              <h3 className="text-[#1D3C2F] text-lg sm:text-xl font-bold mb-3">Skin Brightening</h3>
              <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed max-w-[200px]">
                Helps brighten skin tone and restore natural glow.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col items-center text-center px-4 relative lg:after:content-[''] lg:after:absolute lg:after:right-0 lg:after:top-1/4 lg:after:h-1/2 lg:after:w-[1px] lg:after:bg-[#1D3C2F]/20 last:after:hidden">
              <div className="w-24 h-24 rounded-full border border-[#1D3C2F]/30 flex items-center justify-center mb-6 bg-white/40 shadow-sm">
                <Leaf className="w-10 h-10 text-[#1D3C2F] stroke-[1.2]" />
              </div>
              <h3 className="text-[#1D3C2F] text-lg sm:text-xl font-bold mb-3">Soothing & Calming</h3>
              <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed max-w-[200px]">
                Aloe Vera helps calm irritated and sensitive skin.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-24 h-24 rounded-full border border-[#1D3C2F]/30 flex items-center justify-center mb-6 bg-white/40 shadow-sm">
                <ShieldCheck className="w-10 h-10 text-[#1D3C2F] stroke-[1.2]" />
              </div>
              <h3 className="text-[#1D3C2F] text-lg sm:text-xl font-bold mb-3">Nourishing Care</h3>
              <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed max-w-[200px]">
                Nourishes skin and supports a healthy, radiant complexion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HOW TO USE SECTION */}
      <div className="w-full bg-[#F9F6F0] py-16 sm:py-24 px-4 sm:px-10 relative overflow-hidden border-t border-[#1D3C2F]/5">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="flex flex-col items-center mb-16 sm:mb-20">
            <h2 className="text-[#1D3C2F] font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.2em] mb-4 text-center">
              HOW TO USE
            </h2>
            <div className="flex items-center gap-4 w-64">
              <div className="h-[1px] bg-[#1D3C2F] flex-1 opacity-30"></div>
              <div className="w-2 h-2 rounded-full bg-[#1D3C2F] opacity-60"></div>
              <div className="h-[1px] bg-[#1D3C2F] flex-1 opacity-30"></div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full">
            {/* Left Column: Usage Steps (2x2 Grid) */}
            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 order-2 lg:order-1">
              {/* Step 1 */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                <div className="w-20 h-20 rounded-2xl border border-[#1D3C2F]/20 flex items-center justify-center mb-6 bg-white shadow-sm transition-all duration-300 group-hover:bg-[#1D3C2F] group-hover:text-white">
                  <Pipette className="w-10 h-10 stroke-[1.2]" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#1D3C2F] text-white flex items-center justify-center font-bold text-sm">1</div>
                  <h3 className="text-[#1D3C2F] font-bold text-lg uppercase tracking-wider">Dispense</h3>
                </div>
                <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed">
                  Take 2-3 drops of serum onto your fingertips.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                <div className="w-20 h-20 rounded-2xl border border-[#1D3C2F]/20 flex items-center justify-center mb-6 bg-white shadow-sm transition-all duration-300 group-hover:bg-[#1D3C2F] group-hover:text-white">
                  <User className="w-10 h-10 stroke-[1.2]" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#1D3C2F] text-white flex items-center justify-center font-bold text-sm">2</div>
                  <h3 className="text-[#1D3C2F] font-bold text-lg uppercase tracking-wider">Apply</h3>
                </div>
                <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed">
                  Gently apply on clean face & neck using upward motions.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                <div className="w-20 h-20 rounded-2xl border border-[#1D3C2F]/20 flex items-center justify-center mb-6 bg-white shadow-sm transition-all duration-300 group-hover:bg-[#1D3C2F] group-hover:text-white">
                  <Hand className="w-10 h-10 stroke-[1.2]" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#1D3C2F] text-white flex items-center justify-center font-bold text-sm">3</div>
                  <h3 className="text-[#1D3C2F] font-bold text-lg uppercase tracking-wider">Massage</h3>
                </div>
                <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed">
                  Massage lightly until the serum is fully absorbed.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                <div className="w-20 h-20 rounded-2xl border border-[#1D3C2F]/20 flex items-center justify-center mb-6 bg-white shadow-sm transition-all duration-300 group-hover:bg-[#1D3C2F] group-hover:text-white">
                  <SunMoon className="w-10 h-10 stroke-[1.2]" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#1D3C2F] text-white flex items-center justify-center font-bold text-sm">4</div>
                  <h3 className="text-[#1D3C2F] font-bold text-lg uppercase tracking-wider">Routine</h3>
                </div>
                <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed">
                  Use morning & night consistently for the best results.
                </p>
              </div>
            </div>

            {/* Right Column: Video Demo */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end order-1 lg:order-2">
              <div className="mb-6 flex items-center gap-2">
                <span className="text-[#1D3C2F] font-serif text-xl sm:text-2xl italic">Watch How It Works ✨</span>
              </div>
              
              <div className="relative w-full max-w-[500px] aspect-[9/16] sm:aspect-video lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(29,60,47,0.15)] border-4 border-white/50 bg-white/30 backdrop-blur-md group transition-all duration-500 hover:scale-[1.02]">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/use.MP4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Decorative Elements */}
                <div className="absolute inset-0 border border-white/20 rounded-[2.5rem] pointer-events-none"></div>
                <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-widest uppercase">
                  Tutorial
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GALLERY SECTION */}
      <div className="w-full bg-white py-16 sm:py-24 px-4 sm:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Section Heading */}
          <div className="flex flex-col items-center mb-12 sm:mb-16">
            <h2 className="text-[#1D3C2F] font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.2em] mb-4">
              GALLERY
            </h2>
            <div className="flex items-center gap-4 w-64 mb-6">
              <div className="h-[1px] bg-[#1D3C2F] flex-1 opacity-30"></div>
              <div className="w-2 h-2 rounded-full bg-[#1D3C2F] opacity-60"></div>
              <div className="h-[1px] bg-[#1D3C2F] flex-1 opacity-30"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl text-base sm:text-lg leading-relaxed italic">
              "Witness the essence of pure luxury. Our Silky Gold collection is crafted for those who seek perfection in every drop, bringing the natural glow of health to your skin."
            </p>
          </div>

          {/* Main Gallery Image */}
          <div className="w-full relative group rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500 z-10"></div>
            <img 
              src="/img/gallery.jpeg" 
              alt="Silky Gold Collection Gallery" 
              className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Decorative Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 bg-gradient-to-t from-black/60 to-transparent z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-white/80 text-xs tracking-[0.4em] uppercase font-bold mb-2 block">Premium Experience</span>
              <h3 className="text-white text-2xl sm:text-3xl font-serif font-bold">The Gold Standard of Skincare</h3>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS & TESTIMONIALS SECTION */}
      <div className="w-full bg-[#F9F6F0] py-16 sm:py-24 px-4 sm:px-10 relative overflow-hidden border-t border-[#1D3C2F]/5">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading & Stats */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-[#1D3C2F] font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.1em] mb-4">
                Real Glow Stories
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex text-[#B59461]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < Math.floor(Number(averageRating)) ? "#B59461" : "none"} className={i < Math.floor(Number(averageRating)) ? "" : "text-gray-300"} />
                  ))}
                </div>
                <span className="text-[#1D3C2F] font-bold text-xl">{averageRating}</span>
                <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowReviewForm(true)}
              className="bg-[#1D3C2F] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#2a5a46] transition-all flex items-center gap-2 shadow-xl shadow-green-900/10 active:scale-95"
            >
              <Plus size={20} />
              Write a Review
            </button>
          </div>

          {/* Review Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {reviews.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-[#1D3C2F]/20">
                <MessageSquare className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 italic">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              reviews.map((review, idx) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="break-inside-avoid bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1D3C2F] to-[#2a5a46] flex items-center justify-center text-white font-bold text-lg">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-[#1D3C2F] font-bold">{review.name}</h4>
                        <div className="flex text-[#B59461]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "#B59461" : "none"} className={i < review.rating ? "" : "text-gray-200"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Quote className="text-[#1D3C2F]/10 w-8 h-8 rotate-180" />
                  </div>

                  <p className="text-[#1D3C2F]/80 text-sm sm:text-base leading-relaxed mb-6 italic">
                    "{review.text}"
                  </p>

                  {/* Media Display */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {review.images?.map((img: string, i: number) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {review.video && (
                      <div className="aspect-square rounded-xl overflow-hidden border border-gray-100 relative group/vid">
                        <video src={review.video} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Video className="text-white w-8 h-8" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                    {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* WRITE A REVIEW MODAL */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <button 
                onClick={() => setShowReviewForm(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-8 sm:p-12">
                <h3 className="text-[#1D3C2F] font-serif text-3xl font-bold mb-2">Share Your Glow</h3>
                <p className="text-gray-500 mb-8">Tell us about your experience with Silky Gold.</p>

                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-[#1D3C2F] uppercase tracking-widest mb-2">Your Name</label>
                    <input 
                      type="text" 
                      value={newReview.name}
                      onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#1D3C2F] outline-none transition-all"
                      placeholder="e.g. Sarah J."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1D3C2F] uppercase tracking-widest mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className="transition-transform active:scale-90"
                        >
                          <Star 
                            size={32} 
                            fill={star <= newReview.rating ? "#B59461" : "none"} 
                            className={star <= newReview.rating ? "text-[#B59461]" : "text-gray-200"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1D3C2F] uppercase tracking-widest mb-2">Review Content</label>
                    <textarea 
                      rows={4}
                      value={newReview.text}
                      onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#1D3C2F] outline-none transition-all resize-none"
                      placeholder="How does it feel on your skin?"
                      required
                    />
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-100 hover:border-[#1D3C2F]/30 bg-gray-50 cursor-pointer transition-all">
                      <Camera className="text-[#1D3C2F]/40 mb-2" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Add Photos</span>
                      <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-100 hover:border-[#1D3C2F]/30 bg-gray-50 cursor-pointer transition-all">
                      <Video className="text-[#1D3C2F]/40 mb-2" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Add Video</span>
                      <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
                    </label>
                  </div>

                  {/* Previews */}
                  {(newReview.images.length > 0 || newReview.video) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {newReview.images.map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 relative group">
                          <img src={img} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setNewReview(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {newReview.video && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 relative group">
                          <video src={newReview.video} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setNewReview(prev => ({ ...prev, video: "" }))}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-[#1D3C2F] text-white py-5 rounded-2xl font-bold tracking-widest uppercase flex items-center justify-center gap-3 shadow-xl shadow-green-900/10 hover:bg-[#2a5a46] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        Submit Review
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION TITLE */}
      {/* <h2 id="recommended-section" className="text-lg sm:text-xl font-bold mt-10 sm:mt-12 mb-4 px-2 sm:px-6 md:px-10 text-gray-900 dark:text-gray-100">
        Silky Gold Products
      </h2> */}


      {/* PRODUCT GRID */}
      {/* <div className="w-full max-w-7xl mx-auto">
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
      </div> */}

    </div>
  );
}
