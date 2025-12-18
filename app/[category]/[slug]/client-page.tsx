"use client";

import Script from "next/script";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  doc as firestoreDoc,
  getDoc,
  collection,
  setDoc,
  getDocs,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import React from "react";

import { useLocationData } from "@/app/LocationProvider";
import { haversineDistanceKm } from "@/app/utils/distance";

export default function ProductPage() {
  const params = useParams();

  const category = Array.isArray(params?.category) ? params.category[0] : params?.category;
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const id = slug?.split("-").pop();

  const [product, setProduct] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [qty, setQty] = useState(0);

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement | null>(null);

  const [openInfo, setOpenInfo] = useState(false);
  const [openKey, setOpenKey] = useState(false);

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
    if (!id || !category) return;

    (async function load() {
      const ref = firestoreDoc(db, category, id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProduct(data);
        setMainImage(data.imageUrls?.[0] || "");
      }
    })();
  }, [id, category]);

  useEffect(() => {
    if (!product?.restaurentId) {
      setShopExists(false);
      setShopHasLocation(false);
      setDeliverable(false);
      return;
    }

    (async function checkShop() {
      try {
        const shopRef = firestoreDoc(db, "Restaurent_shop", String(product.restaurentId));
        const shopSnap = await getDoc(shopRef);

        if (!shopSnap.exists()) {
          setShopExists(false);
          setShopHasLocation(false);
          setShopClosed(false);
          setDeliverable(false);
          return;
        }

        const shopData = shopSnap.data();
        const hasLoc = Boolean(shopData.location?.lat && shopData.location?.lng);

        setShopExists(true);
        setShopHasLocation(hasLoc);
        setShopClosed(shopData.activeShop === false);

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
      }
    })();
  }, [product?.restaurentId, hasLocation, userLat, userLng]);

  // ⭐ REQUEST EXPANSION
  async function sendRequest() {
    if (!userLat || !userLng) return;

    try {
      await addDoc(collection(db, "requestedLocations"), {
        address: `Product Page Request for ${product?.name || ""}`,
        lat: userLat,
        lng: userLng,
        timestamp: serverTimestamp(),
      });

      setSnack("Request Sent Successfully!");
      setTimeout(() => setSnack(""), 2500);
    } catch {
      setSnack("Failed To Send Request!");
      setTimeout(() => setSnack(""), 2500);
    }
  }

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

  if (!product)
    return <div className="p-10 text-xl">Loading...</div>;


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
  // quantityPerUnit mirrors the tier quantity (e.g. 200, 750)
  const quantityPerUnit = tier.quantity ?? null;

  return (
    <>

    <Script
  id="product-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",

      name: product.name,
      image: product.imageUrls, // array already perfect
      description: product.keyInformation?.description || product.name,
      sku: product.sku || product.id, // fallback

      brand: {
        "@type": "Brand",
        name: "QuickRun"
      },

      category: product.category, // e.g. vegetables

      keywords: product.keywords || "",

      additionalProperty: [
        { "@type": "PropertyValue", name: "Veg Type", value: product.groceryVegType },
        { "@type": "PropertyValue", name: "Edible Type", value: product.groceryEdible },
        { "@type": "PropertyValue", name: "Concern", value: product.keyInformation?.concern },
        { "@type": "PropertyValue", name: "Ingredients", value: product.keyIngredients },
      ],

      offers: {
        "@type": "Offer",
        url: `https://www.quickrunfast.com/product/${product.id}`,
        priceCurrency: "INR",

        price: product?.priceTiers?.[0]?.price || product.mrp,
        mrp: product?.priceTiers?.[0]?.mrp || product.mrp,

        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

        itemCondition: "https://schema.org/NewCondition",

        seller: {
          "@type": "Organization",
          name: "QuickRun"
        }
      }
    })
  }}
/>

    <div className="min-h-screen pb-20 px-4 md:px-20">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-30 mt-10">

        {/* LEFT IMAGES */}
        <div>
  <div
    ref={imgRef}
    onMouseMove={handleZoom}
    onMouseEnter={() => setZoomActive(true)}
    onMouseLeave={() => setZoomActive(false)}
    className="w-full aspect-square rounded-xl bg-gray-100 overflow-hidden relative"
    style={{ cursor: "zoom-in" }}
  >
    <img src={mainImage || ""} className="w-full h-full object-contain" />
  </div>


  {zoomActive && (
    <div
      className="hidden md:block absolute right-5 top-20 w-[600px] h-[600px] rounded-xl z-50 bg-white"
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
              <img
                key={i}
                onClick={() => setMainImage(img)}
                src={img}
                className={
                  "w-20 h-20 rounded-lg cursor-pointer border " +
                  (mainImage === img ? "border-green-600 shadow" : "border-gray-300")
                }
              />
            ))}
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div>
          {interactionBlocked && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 px-4 py-3">
              {overlayMessage === "Shop Closed" ? (
                <span className="inline-flex items-center gap-2">
                  <img src="/img/store.png" alt="Shop Closed" className="w-6 h-6 object-contain" />
                  Shop Closed
                </span>
              ) : (
                overlayMessage
              )}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {product.name || product.keyInformation?.name || "Product"}
          </h1>

          <div className="relative mb-3">
            <h2 className="text-4xl font-bold text-black">₹{price}</h2>
            {discount && (
              <span className="absolute right-0 top-0 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {discount.toFixed(0)}% OFF
              </span>
            )}
          </div>

          {mrp && <p className="text-gray-400 line-through text-sm">MRP ₹{mrp}</p>}

          {/* Tiers */}
          <h3 className="text-gray-500 my-3">Select Unit</h3>

          <div className="flex gap-4">
            {product.priceTiers?.map((pt: any, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedTierIndex(i)}
                className={`p-4 rounded-2xl w-40 cursor-pointer bg-[#eafdeb] border-2 ${
                  selectedTierIndex === i ? "border-green-600 shadow-lg" : "border-gray-300"
                }`}
              >
                <p className="font-semibold text-lg">
                  {pt.quantity ? `${pt.quantity} ${pt.unit}` : pt.unit}
                </p>
                <p className="text-xl font-bold">₹{pt.price}</p>
                <p className="line-through text-gray-400 text-sm">MRP ₹{pt.mrp}</p>
              </div>
            ))}
          </div>

          {/* ICONS */}
          <div className="grid grid-cols-3 mt-6 bg-gray-100 rounded-xl p-4 text-center">
            <div>
              <div className="text-2xl mb-1">↩️</div>
              <p className="font-bold">No returns</p>
              <p className="text-xs text-gray-500">Check details</p>
            </div>
            <div>
              <div className="text-2xl mb-1">🚚</div>
              <p className="font-bold">Fast</p>
              <p className="text-xs text-gray-500">Delivery</p>
            </div>
            <div>
              <div className="text-2xl mb-1">🎧</div>
              <p className="font-bold">24/7</p>
              <p className="text-xs text-gray-500">Support</p>
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
          <div className="mt-4 bg-gray-100 rounded-xl">
            <button
              onClick={() => setOpenInfo(!openInfo)}
              className="w-full p-4 text-left font-semibold flex justify-between"
            >
              Info
              <span>{openInfo ? "▲" : "▼"}</span>
            </button>

            {openInfo && (
              <div className="p-4 space-y-3 text-gray-700">
                <div><b>Seller:</b> {product.info?.seller}</div>
                <div><b>Return Policy:</b> {product.info?.returnPolicy}</div>
                <div><b>Customer Care:</b> {product.info?.customerCare}</div>
                <div><b>Shelf Life:</b> {product.info?.shelfLife}</div>
              </div>
            )}
          </div>

          {/* KEY INFORMATION */}
          <div className="mt-4 bg-gray-100 rounded-xl">
            <button
              onClick={() => setOpenKey(!openKey)}
              className="w-full p-4 text-left font-semibold flex justify-between"
            >
              Key Information
              <span>{openKey ? "▲" : "▼"}</span>
            </button>

            {openKey && (
              <div className="p-4 space-y-3 text-gray-700">
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
