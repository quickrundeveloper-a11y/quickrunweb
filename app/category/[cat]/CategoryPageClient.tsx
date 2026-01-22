"use client";

import { slugify, generateSlug } from "@/app/utils/generateSlug";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { app } from "@/lib/firebase";

import { useLocationData } from "@/app/LocationProvider";
import { useGyroTilt } from "@/app/utils/useGyroTilt";
import { haversineDistanceKm } from "@/app/utils/distance";

interface Props {
  catSlug: string;
}

export default function CategoryPageClient({ catSlug }: Props) {
  const categoryName = catSlug.replace(/-/g, " ");
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const shopLookup = useMemo(() => {
    return shops.reduce((acc: Record<string, any>, shop: any) => {
      if (shop.id) acc[String(shop.id)] = shop;
      return acc;
    }, {});
  }, [shops]);

  // ⭐ USER LOCATION - for checking 5 km range
  const { coords, hasLocation } = useLocationData();
  const userLat = coords?.lat;
  const userLng = coords?.lng;

  // ⭐ Snackbar Message
  const [snack, setSnack] = useState("");

const [visibleProducts, setVisibleProducts] = useState<any[]>([]);
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 12;

const loadMoreRef = useRef<HTMLDivElement | null>(null);



const loadMore = () => {
  setPage((prevPage) => {
    const nextPage = prevPage + 1;
    const start = (nextPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    const nextItems = products.slice(start, end);

    if (nextItems.length > 0) {
      setVisibleProducts((prev) => [...prev, ...nextItems]);
      return nextPage;
    }

    return prevPage;
  });
};



useEffect(() => {
  if (!loadMoreRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    }
  );

  observer.observe(loadMoreRef.current);

  return () => observer.disconnect();
}, [products.length, page]);






  // ------------------ REQUEST BUTTON FUNCTION ------------------
  async function sendRequest(fullAddress: string) {
    if (!userLat || !userLng) return;

    try {
      await addDoc(collection(getFirestore(app), "requestedLocations"), {
        address: fullAddress,
        lat: userLat,
        lng: userLng,
        timestamp: serverTimestamp(),
      });

      setSnack("Request Sent Successfully!");
      setTimeout(() => setSnack(""), 2500);
    } catch (err) {
      setSnack("Failed To Send Request!");
      setTimeout(() => setSnack(""), 2500);
    }
  }

  // ------------------ LOAD PRODUCTS ------------------

  useEffect(() => {
  if (products.length > 0) {
    setVisibleProducts(products.slice(0, ITEMS_PER_PAGE));
    setPage(1);
  }
}, [products]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const db = getFirestore(app);
        const FOOD = collection(db, "food");
        const GROCERY = collection(db, "grocery");
        const SHOPS = collection(db, "Restaurent_shop");

        const [foodSnap, grocerySnap, shopSnap] = await Promise.all([
          getDocs(FOOD),
          getDocs(GROCERY),
          getDocs(SHOPS),
        ]);

        // ⭐ Load shops for restaurant validation + range check
        const shops = shopSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            activeShop: d.activeShop ?? true,
            location: d.location ?? null,
          };
        });

        const tokenNorm = (s: string) =>
          (s || "").toLowerCase().replace(/[^\w\s]/g, " ").trim();

        const STOP_WORDS = ["and", "&", "or", "the", "of"];

const tokens = tokenNorm(categoryName)
  .split(/\s+/)
  .filter((t) => t && !STOP_WORDS.includes(t));


       const matchCat = (item: any) => {
  const itemCategory = tokenNorm(item.category);

  // category must match ALL tokens
  return tokens.every((t) => itemCategory.includes(t));
};


        const extract = (doc: any, type: string) => {
          const d = doc.data();
          const tier = Array.isArray(d.priceTiers) ? d.priceTiers[0] : null;

          return {
            id: doc.id,
            title: d.name || "Product",
            image: d.imageUrls?.[0] || "/placeholder.png",
            price: tier?.price ?? d.price ?? 0,
            mrp: tier?.mrp ?? 0,
            quantity: tier?.quantity ?? "",
            unit: tier?.unit ?? "",
            category: (d.category || "").toLowerCase(),
            type: d.type || type,
            restaurentId: d.restaurentId || null,
            // quantityPerUnit == tier quantity (e.g. 200 g)
            quantityPerUnit: tier?.quantity ?? null,
            stockQty: d.stockQty ?? null,
            name: (d.name || "").toLowerCase(),
          };
        };

        const rawProducts: any[] = [];

        foodSnap.forEach((d) => {
          const item = extract(d, "food");
          if (matchCat(item)) rawProducts.push(item);
        });

        grocerySnap.forEach((d) => {
          const item = extract(d, "grocery");
          if (matchCat(item)) rawProducts.push(item);
        });

        setShops(shops);
        setProducts(rawProducts);
      } catch (e) {
        console.log("ERR:", e);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [categoryName, userLat, userLng]);

  function CategoryProductCard({
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

    return (
      <div className="relative" ref={attachRef}>
        {/* 🔒 SHOP CLOSED OVERLAY */}
        {shopClosed && (
          <div className="absolute inset-0 z-20 bg-white/30 backdrop-blur-[1.5px] flex items-center justify-center rounded-xl">
            <div ref={tiltRef} className="w-24 sm:w-28">
              <img
                src="/img/shopclose.png"
                alt="Shop Closed"
                className="w-full object-contain"
              />
            </div>
          </div>
        )}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition cursor-pointer p-3 flex flex-col justify-between bg-white dark:bg-gray-800 relative">
          <div className="flex flex-col items-start gap-2">
            <div className="relative w-full pb-3">
              <img
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
                  <button onClick={onDecrement} className="px-2 text-lg">
                    -
                  </button>
                  <span className="px-3">{qty}</span>
                  <button onClick={onIncrement} className="px-2 text-lg">
                    +
                  </button>
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
                <p className="text-[10px] text-gray-400 dark:text-gray-500 line-through">
                  ₹{item.mrp}
                </p>
              )}
            </div>

            <p className="min-h-[14px] text-[11px] leading-tight -mt-1">
              {isOutOfStock ? (
                <span className="text-red-600 font-medium">
                  Out of stock
                </span>
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
  

  async function changeQuantity(
    item: any,
    delta: number,
    e?: React.MouseEvent
  ) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const currentQty = quantities[item.id] || 0;
    const newQty = Math.max(currentQty + delta, 0);
    if (newQty === currentQty) return;

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
      const ref = doc(getFirestore(app), "Customer", userId, "cart", item.id);
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

  function getCardState(item: any) {
    const shop = shopLookup[String(item.restaurentId)] || null;
    const hasShop = Boolean(shop);

    const hasUserLocation = Boolean(hasLocation && userLat && userLng);
    const shopHasLocation = Boolean(
      shop?.location?.lat && shop?.location?.lng
    );

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

    if (!overlayText) {
      if (!hasShop) overlayText = "Shop unavailable";
      else if (!hasUserLocation) overlayText = "Select location to order";
      else if (!shopHasLocation) overlayText = "Shop location unavailable";
    }

    const blocked =
      shopClosed ||
      !hasShop ||
      !hasUserLocation ||
      !shopHasLocation ||
      isOutOfRange ||
      isOutOfStock;

    return { blocked, overlayText, isOutOfRange, isOutOfStock, shopClosed };
  }

  const sortedVisibleProducts = useMemo(() => {
    return [...visibleProducts].sort((a, b) => {
      const aBlocked = getCardState(a).blocked ? 1 : 0;
      const bBlocked = getCardState(b).blocked ? 1 : 0;
      return aBlocked - bBlocked;
    });
  }, [visibleProducts, shops, hasLocation, userLat, userLng]);

  // ------------------ NORMAL PAGE UI ------------------
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground w-full pb-16 pt-6 flex justify-center">
      <div className="w-full max-w-7xl px-3 sm:px-6">

        <h2 className="text-xl sm:text-2xl font-bold mb-6 capitalize text-gray-900 dark:text-gray-100">
          {categoryName || "Category"}
        </h2>

        {loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">Loading…</p>
        )}

        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-6
            gap-3 sm:gap-4
          "
        >
          {sortedVisibleProducts.map((item, index) => {
            const { blocked, overlayText, isOutOfRange, isOutOfStock, shopClosed } =
              getCardState(item);
            const qty = quantities[item.id] || 0;
            
            const slug = generateSlug(item.title, item.id);

            const card = (
              <CategoryProductCard
                item={item}
                blocked={blocked}
                overlayText={overlayText}
                shopClosed={shopClosed}
                isOutOfRange={isOutOfRange}
                isOutOfStock={isOutOfStock}
                qty={qty}
                
                onIncrement={(e: any) => changeQuantity(item, 1, e)}
                onDecrement={(e: any) => changeQuantity(item, -1, e)}
              />
            );

            // If blocked, just show the card; otherwise make it clickable like Home product detail
            if (blocked) {
              return <div key={item.id}>{card}</div>;
            }

            return (
              <Link
                key={item.id}
                href={`/${item.type}/${slug}`}
                className="block"
              >
                {card}
              </Link>
            );
          })}
        </div>
        <div ref={loadMoreRef} className="h-10 w-full" />

        {snack && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-50">
            {snack}
          </div>
        )}
      </div>
    </div>
  );
}
