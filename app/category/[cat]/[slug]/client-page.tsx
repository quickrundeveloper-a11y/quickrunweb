"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  doc as firestoreDoc,
  getDoc,
  collection,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import React from "react";

import { useLocationData } from "@/app/LocationProvider";
import { haversineDistanceKm } from "@/app/utils/distance";
import Breadcrumbs, { BreadcrumbItem } from "@/app/components/Breadcrumbs";
import ShimmerImage from "@/app/components/ShimmerImage";

interface ClientPageProps {
  breadcrumbItems?: BreadcrumbItem[];
}

export default function ProductPage({ breadcrumbItems }: ClientPageProps) {
  const params = useParams();

  const category = Array.isArray(params?.cat) ? params.cat[0] : params?.cat;
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const id = slug?.split("-").pop();

  const [product, setProduct] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [qty, setQty] = useState(0);
  const [notFound, setNotFound] = useState(false);

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement | null>(null);

  const [openInfo, setOpenInfo] = useState(false);
  const [openKey, setOpenKey] = useState(false);

  // ⭐ SELLER INFO
  const [sellerName, setSellerName] = useState<string>("");
  const [sellerLoading, setSellerLoading] = useState<boolean>(false);

  // ⭐ USER LOCATION for range checking
  const { coords, hasLocation } = useLocationData();
  const userLat = coords?.lat;
  const userLng = coords?.lng;

  // ⭐ Snackbar
  const [snack, setSnack] = useState("");


  // LOAD CART QTY
  useEffect(() => {
    if (!id) return;

    (async () => {
      const userId = localStorage.getItem("currentUser");
      if (!userId) return;

      const cartRef = firestoreDoc(collection(db, "Customer", userId, "cart"), id);
      const snap = await getDoc(cartRef);

      if (snap.exists()) {
        setQty(snap.data().quantity || 0);
      } else {
        setQty(0);
      }
    })();
  }, [id]);

  // SHOP STATUS + RANGE
  const [shopClosed, setShopClosed] = useState(false);
  const [shopExists, setShopExists] = useState<boolean | null>(null);
  const [shopHasLocation, setShopHasLocation] = useState<boolean | null>(null);
  const [deliverable, setDeliverable] = useState<boolean | null>(null); // null = unknown/no location

  useEffect(() => {
    if (!id) return;

    (async function load() {
      try {
        // Try finding the product in likely collections
        const collectionsToCheck = ["grocery", "food"];
        if (category) collectionsToCheck.push(category);
        
        let foundData = null;
        let foundCollection = "";

        for (const colName of collectionsToCheck) {
          try {
            const ref = firestoreDoc(db, colName, id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              foundData = snap.data();
              foundCollection = colName;
              break; 
            }
          } catch (e) {
            // Ignore error for missing collections
          }
        }

        if (foundData) {
          setProduct(foundData);
          const image = foundData.imageSlug
            ? `/images/${foundCollection}/${foundData.imageSlug}`
            : (foundData.imageUrls?.[0] || "");
          setMainImage(image);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setNotFound(true);
      }
    })();
  }, [id, category]);

  useEffect(() => {
    if (!product?.restaurentId) {
      setShopExists(false);
      setShopHasLocation(false);
      setDeliverable(false);
      setSellerName("Quick Run Fast"); // Default seller name
      setSellerLoading(false);
      return;
    }

    setSellerLoading(true); // Start loading seller info

    (async function checkShop() {
      try {
        const shopRef = firestoreDoc(db, "Restaurent_shop", String(product.restaurentId));
        const shopSnap = await getDoc(shopRef);

        if (!shopSnap.exists()) {
          setShopExists(false);
          setShopHasLocation(false);
          setShopClosed(false);
          setDeliverable(false);
          setSellerName("Quick Run Fast"); // Default when shop not found
          setSellerLoading(false);
          return;
        }

        const shopData = shopSnap.data();
        const hasLoc = Boolean(shopData.location?.lat && shopData.location?.lng);

        setShopExists(true);
        setShopHasLocation(hasLoc);
        setShopClosed(shopData.activeShop === false);
        
        // ⭐ SET SELLER NAME from shop data
        setSellerName(shopData.name || shopData.shopName || "Quick Run Fast");
        setSellerLoading(false); // Stop loading

        if (
          hasLocation &&
          userLat &&
          userLng &&
          hasLoc
        ) {
          const dist = haversineDistanceKm(
            userLat,
            userLng,
            shopData.location.lat,
            shopData.location.lng
          );
          setDeliverable(dist <= 5);
        } else {
          // location not selected or shop location missing
          setDeliverable(hasLoc ? null : false);
        }
      } catch (err) {
        console.log(err);
        setShopExists(null);
        setShopHasLocation(null);
        setDeliverable(false);
        setSellerName("Quick Run Fast"); // Default on error
        setSellerLoading(false);
      }
    })();
  }, [product?.restaurentId, hasLocation, userLat, userLng]);

  // ⭐ REQUEST EXPANSION
  // Function removed as it was unused

  const overlayMessage = !hasLocation
    ? "Select location to order"
    : shopExists === false
    ? "Shop unavailable"
    : shopClosed
    ? "Shop Closed"
    : shopHasLocation === false
    ? "Shop location unavailable"
    : deliverable === false
    ? "Delivery is not available in your area"
    : "";

  const interactionBlocked = Boolean(overlayMessage);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Product Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find the product you're looking for. It might have been removed or the link is incorrect.
        </p>
        <a href="/" className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition">
          Go Home
        </a>
      </div>
    );
  }

  if (!product)
    return <div className="p-10 text-xl text-gray-900 dark:text-gray-100">Loading...</div>;


  function handleZoom(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setZoomPos({ x, y });
  }

  const tier = product.priceTiers?.[selectedTierIndex] ?? {};
  const price = tier.price ?? 0;
  const mrp = tier.mrp ?? null;
  const discount = tier.percentOff ?? null;

  return (
    <>
    <div className="min-h-screen bg-white dark:bg-gray-800 text-foreground pb-20 px-4 md:px-20">
      
      {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-30 mt-10">

        {/* LEFT IMAGES */}
        <div>
  <div
    ref={imgRef}
    onMouseMove={handleZoom}
    onMouseEnter={() => setZoomActive(true)}
    onMouseLeave={() => setZoomActive(false)}
    className="w-full aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden relative"
    style={{ cursor: "zoom-in" }}
  >
    <ShimmerImage src={mainImage || ""} className="w-full h-full object-contain" />
  </div>


  {zoomActive && (
    <div
      className="hidden md:block absolute right-5 top-20 w-[600px] h-[600px] rounded-xl z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      style={{
        backgroundImage: `url(${mainImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "200%", // Zoom power
        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
      }}
    />
  )}


          <div className="flex flex-wrap gap-4 mt-4">
            {product.imageUrls?.map((img: string, i: number) => (
              <ShimmerImage
                key={i}
                onClick={() => setMainImage(img)}
                src={img}
                className={
                  "w-20 h-20 rounded-lg cursor-pointer border " +
                  (mainImage === img ? "border-green-600 shadow" : "border-gray-300 dark:border-gray-600")
                }
              />
            ))}
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div>
          {interactionBlocked && (
            <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 px-4 py-3">
              {overlayMessage === "Shop Closed" ? (
                <span className="inline-flex items-center gap-2">
                  <img src="/img/store.png" alt="Shop Closed" className="w-6 h-6 object-contain dark:invert" />
                  Shop Closed
                </span>
              ) : (
                overlayMessage
              )}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            {product.name || product.keyInformation?.name || "Product"}
          </h1>

          <div className="relative mb-3">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">₹{price}</h2>
            {discount && (
              <span className="absolute right-0 top-0 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {discount.toFixed(0)}% OFF
              </span>
            )}
          </div>

          {mrp && <p className="text-gray-400 dark:text-gray-500 line-through text-sm">MRP ₹{mrp}</p>}

          {/* Tiers */}
          <h3 className="text-gray-500 dark:text-gray-400 my-3">Select Unit</h3>

          <div className="flex gap-4">
            {product.priceTiers?.map((pt: any, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedTierIndex(i)}
                className={`p-4 rounded-2xl w-40 cursor-pointer bg-green-50 dark:bg-green-900/20 border-2 ${
                  selectedTierIndex === i ? "border-green-600 shadow-lg" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {pt.quantity ? `${pt.quantity} ${pt.unit}` : pt.unit}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{pt.price}</p>
                <p className="line-through text-gray-400 dark:text-gray-500 text-sm">MRP ₹{pt.mrp}</p>
              </div>
            ))}
          </div>

          {/* ICONS */}
          <div className="grid grid-cols-3 mt-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center">
            <div>
              <div className="text-2xl mb-1">↩️</div>
              <p className="font-bold text-gray-900 dark:text-gray-100">No returns</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Check details</p>
            </div>
            <div>
              <div className="text-2xl mb-1">🚚</div>
              <p className="font-bold text-gray-900 dark:text-gray-100">Fast</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Delivery</p>
            </div>
            <div>
              <div className="text-2xl mb-1">🎧</div>
              <p className="font-bold text-gray-900 dark:text-gray-100">24/7</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Support</p>
            </div>
          </div>

          {/* ADD TO CART */}
          <div className="mt-6">
            {qty > 0 ? (
              <div className="flex items-center justify-between bg-[#00D12E] px-8 py-2.5 rounded-full w-full text-black font-semibold text-2xl select-none">
                <button
                  onClick={async () => {
                    if (interactionBlocked) {
                      setSnack(overlayMessage || "Unavailable");
                      return;
                    }
                    const userId = localStorage.getItem("currentUser");
                    if (!userId) return;

                    const newQty = qty - 1;
                    const cartRef = firestoreDoc(collection(db, "Customer", userId, "cart"), id!);

                    await setDoc(cartRef, { quantity: newQty }, { merge: true });
                    setQty(newQty);
                  }}
                  className="text-4xl"
                >
                  -
                </button>

                <span className="text-3xl">{qty}</span>

                <button
                  onClick={async () => {
                    if (interactionBlocked) {
                      setSnack(overlayMessage || "Unavailable");
                      return;
                    }
                    const userId = localStorage.getItem("currentUser");
                    if (!userId) return;

                    const cartRef = firestoreDoc(collection(db, "Customer", userId, "cart"), id!);

                    await setDoc(cartRef, { quantity: qty + 1 }, { merge: true });
                    setQty(qty + 1);
                  }}
                  className="text-3xl"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="bg-[#00D12E] text-black font-semibold px-8 py-4 rounded-full text-lg w-full"
                disabled={interactionBlocked}
                onClick={async () => {
                  if (interactionBlocked) {
                    setSnack(overlayMessage || "Unavailable");
                    return;
                  }
                  try {
                    const userId = localStorage.getItem("currentUser");
                    if (!userId) return alert("You must be logged in.");

                    const tier = product.priceTiers?.[selectedTierIndex] ?? {};

                    const cartRef = firestoreDoc(collection(db, "Customer", userId, "cart"), id!);

                    await setDoc(cartRef, {
                      name: product.name || "",
                      price: tier.price || 0,
                      mrp: tier.mrp || 0,
                      unit: tier.unit || "",
                      multiple: tier.multiple || "",
                      percentOff: tier.percentOff || null,
                      image:
                        product.imageUrls?.[0] || "",
                      quantity: 1,
                      addedAt: serverTimestamp(),
                      restaurentId: product.restaurentId,
                      isVeg: product.groceryVegType || null,
                      quantityPerUnit: tier.quantity ?? null,
                    });

                    setQty(1);
                  } catch (err) {
                    console.log("Add to Cart Error:", err);
                  }
                }}
              >
                Add to cart
              </button>
            )}
          </div>

          {/* INFO */}
          <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setOpenInfo(!openInfo)}
              className="w-full p-4 text-left font-semibold flex justify-between text-gray-900 dark:text-gray-100"
            >
              Info
              <span>{openInfo ? "▲" : "▼"}</span>
            </button>

            {openInfo && (
              <div className="p-4 space-y-3 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                <div><b>Seller:</b> {sellerLoading ? "Loading..." : (sellerName || "Quick Run Fast")}</div>
                <div><b>Return Policy:</b> {product.info?.returnPolicy}</div>
                <div><b>Customer Care:</b> {product.info?.customerCare}</div>
                <div><b>Shelf Life:</b> {product.info?.shelfLife}</div>
              </div>
            )}
          </div>

          {/* KEY INFORMATION */}
          <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setOpenKey(!openKey)}
              className="w-full p-4 text-left font-semibold flex justify-between text-gray-900 dark:text-gray-100"
            >
              Key Information
              <span>{openKey ? "▲" : "▼"}</span>
            </button>

            {openKey && (
              <div className="p-4 space-y-3 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                <div><b>Description:</b> {product.keyInformation?.description}</div>
                <div><b>Ingredients:</b> {product.keyInformation?.ingredients}</div>
                <div><b>Concern:</b> {product.keyInformation?.concern}</div>
                <div><b>Key ingredients:</b> {product.keyInformation?.keyIngredients}</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>

       {snack && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-50">
          {snack}
        </div>
      )}
    </>
  );
}
