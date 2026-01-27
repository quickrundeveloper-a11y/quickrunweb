"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getFirestore, collection, getDocs, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";

import { generateSlug, slugify } from "@/app/utils/generateSlug";
import { useLocationData } from "@/app/LocationProvider";
import { useGyroTilt } from "@/app/utils/useGyroTilt";
import { haversineDistanceKm } from "@/app/utils/distance";

import Link from "next/link";
import ShimmerImage from "@/app/components/ShimmerImage";

export default function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();

  const query = params?.get("q") || "";
  const [inputValue, setInputValue] = useState(query);
  const [liveQuery, setLiveQuery] = useState(query);

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const shopLookup = useMemo(() => {
    return shops.reduce((acc: Record<string, any>, shop: any) => {
      if (shop.id) acc[String(shop.id)] = shop;
      return acc;
    }, {});
  }, [shops]);

  // ⭐ Snackbar
  const [snack, setSnack] = useState("");

  // ⭐ User Location
  const { coords, hasLocation } = useLocationData();
  const userLat = coords?.lat;
  const userLng = coords?.lng;



  // -----------------------------------------------------

  const extractData = (doc: any, collectionName: string) => {
    const d = doc.data();
    const tier = Array.isArray(d.priceTiers) ? d.priceTiers[0] : null;

    const image = d.imageSlug
      ? `/images/${collectionName}/${d.imageSlug}`
      : d.imageUrls?.[0] || "";

    return {
      id: doc.id,
      name: d.name || "",
      image: image,
      price: tier?.price ?? d.price ?? 0,
      mrp: tier?.mrp ?? d.mrp ?? 0,
      quantity: tier?.quantity ?? "",
      unit: tier?.unit ?? "",
      type: (d.type || "").toLowerCase(),
      category: (d.category || "").toLowerCase(),
      keywords: (d.keywords || "").toLowerCase(),
      restaurentId: d.restaurentId || null,
      // quantityPerUnit == tier quantity (e.g. 200 g)
      quantityPerUnit: tier?.quantity ?? null,
      stockQty: d.stockQty ?? null,
    };
  };

  // LIVE search listener
  useEffect(() => {
    const handler = (e: any) => {
      setLiveQuery(e.detail);
    };
    window.addEventListener("search-update", handler);
    return () => window.removeEventListener("search-update", handler);
  }, []);

  useEffect(() => {
    if (!query) {
      setInputValue("");
      setResults([]);
      return;
    }
    setInputValue(query);
  }, [query]);

  // ------------------------------ SEARCH + LOCATION FILTER ------------------------------
  useEffect(() => {
    const text = (liveQuery || "").trim();
    if (text.length < 2) {
      setResults([]);
      return;
    }

    async function searchProducts() {
      setLoading(true);

      try {
        const db = getFirestore(app);

        const [foodSnap, grocerySnap, shopSnap] = await Promise.all([
          getDocs(collection(db, "food")),
          getDocs(collection(db, "grocery")),
          getDocs(collection(db, "Restaurent_shop")),
        ]);

        const q = text.toLowerCase();

        // ⭐ LOAD SHOPS
        const shops = shopSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            lat: data.location?.lat || null,
            lng: data.location?.lng || null,
            activeShop: data.activeShop ?? true,
            location: data.location ?? null,
          };
        });
        setShops(shops);

        // ⭐ Extract all products
        const rawProducts: any[] = [];

        foodSnap.forEach((doc) => rawProducts.push(extractData(doc, "food")));
        grocerySnap.forEach((doc) => rawProducts.push(extractData(doc, "grocery")));

        // ⭐ Search Filter
        const filtered = rawProducts.filter((item) => {
          const n = item.name.toLowerCase();
          const c = item.category.toLowerCase();
          const t = item.type.toLowerCase();
          const k = item.keywords.toLowerCase();

          return (
            n.startsWith(q) ||
            n.includes(q) ||
            c.includes(q) ||
            t.includes(q) ||
            k.includes(q)
          );
        });

        setResults(filtered);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [liveQuery, userLat, userLng]);

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
          name: item.name || item.title || "Product",
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

  // ------------------------------ PRODUCT CARD (Same as HomeClient) ------------------------------
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
  }: any) {
    const tiltRef = useRef<HTMLDivElement | null>(null);
    useGyroTilt(tiltRef);

    return (
      <div className="relative">
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
                className="w-full h-32 sm:h-36 object-contain bg-white dark:bg-gray-100 rounded-lg"
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

            <p className="mt-2 font-semibold text-[11px] sm:text-xs line-clamp-2 h-[32px] leading-tight text-gray-900 dark:text-gray-100">
              {item.name}
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

  // ------------------------------ CARD STATE (Same as HomeClient) ------------------------------
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

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      const aBlocked = getCardState(a).blocked ? 1 : 0;
      const bBlocked = getCardState(b).blocked ? 1 : 0;
      return aBlocked - bBlocked;
    });
  }, [results, shops, hasLocation, userLat, userLng]);

// ------------------------------ NO SELLERS UI ------------------------------
// ------------------------------ NO SELLERS UI ------------------------------
if (!loading && results.length === 0 && liveQuery.length > 1 && userLat && userLng) {

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground px-4">

      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-200 text-center">
        No Results Available in Your Location
      </h2>

      <p className="mt-2 text-gray-500 text-base sm:text-lg text-center">
        We’ll expand to your area soon
      </p>
    </div>
  );
}


  // ------------------------------ NORMAL SEARCH PAGE ------------------------------
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <main className="flex-grow flex justify-center mt-8">
        <div className="w-full max-w-[1100px] px-4">

          {query && results.length > 0 && (
            <p className="text-gray-800 dark:text-gray-200 text-xl mb-6">Showing results for "{query}"</p>
          )}

          {loading && (
            <p className="text-center text-gray-600 dark:text-gray-400 mt-10">Loading…</p>
          )}

          {/* Quick suggestions */}
          {results.length > 0 && (
            <div className="flex flex-col gap-3 mb-8">
              {results.slice(0, 4).map((item) => {
                const slug = generateSlug(item.name, item.id);
                const { blocked, overlayText } = getCardState(item);

                const content = (
                  <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-5 py-3 relative rounded-lg border border-gray-100 dark:border-gray-700">
                    <ShimmerImage src={item.image} className="w-8 h-8 object-contain" />
                    <span className="text-gray-900 dark:text-gray-100 text-[16px] font-medium">{item.name}</span>
                    <button
                      onClick={(e) => changeQuantity(item, 1, e)}
                      disabled={blocked}
                      className={`ml-auto rounded-lg px-3 py-1 text-xs font-semibold ${
                        blocked
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {blocked ? overlayText || "Unavailable" : "Add"}
                    </button>
                  </div>
                );

                if (blocked) {
                  return (
                    <div key={item.id} className="relative cursor-not-allowed">
                      {content}
                      <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-[1px] flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg">
                        {overlayText === "Shop Closed" ? (
                          <div className="flex flex-col items-center gap-2">
                            <img src="/img/store.png" alt="Shop Closed" className="w-10 h-10 object-contain dark:invert" />
                            <span>Shop Closed</span>
                          </div>
                        ) : (
                          overlayText || "Select location to order"
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link href={`/category/${slugify(item.category || item.type)}/${slug}`} key={item.id} className="block relative">
                    {content}
                  </Link>
                );
              })}
            </div>
          )}

          {/* PRODUCT GRID (Same layout/logic as HomeClient) */}
          <div
            className="
              grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
              lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4
            "
          >
            {sortedResults.map((item) => {
              const { blocked, overlayText, isOutOfRange, isOutOfStock, shopClosed } =
                getCardState(item);
              const qty = quantities[item.id] || 0;
              const slug = generateSlug(item.name, item.id);

              const card = (
                <ProductCard
                  item={item}
                  blocked={blocked}
                  overlayText={overlayText}
                  isOutOfRange={isOutOfRange}
                  isOutOfStock={isOutOfStock}
                  shopClosed={shopClosed}
                  qty={qty}
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
                >
                  {card}
                </Link>
              );
            })}
          </div>

          {snack && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-50">
              {snack}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
