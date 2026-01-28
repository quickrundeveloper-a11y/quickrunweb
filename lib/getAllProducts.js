// lib/getAllProducts.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetch products from grocery and food collections,
 * map to unified shape used by UI + seller location support.
 */
export async function getAllProducts() {
  try {
    const grocerySnap = await getDocs(collection(db, "grocery"));
    const foodSnap = await getDocs(collection(db, "food"));

    const grocery = grocerySnap.docs.map((doc) => {
      const data = doc.data();
      // Use SEO-friendly image URL if slug exists
      const image = data.imageSlug 
        ? `/images/grocery/${data.imageSlug}` 
        : (data.imageUrls?.[0] ?? "");

      return {
        id: doc.id,
        title: data.name || "",
        image: image,
        price: data.priceTiers?.[0]?.price ?? 0,
        unit: data.priceTiers?.[0]?.unit ?? "",
        discount: data.priceTiers?.[0]?.percentOff ?? 0,
        // quantityPerUnit is same as tier quantity (e.g. 200 g, 750 ml)
        quantityPerUnit: data.priceTiers?.[0]?.quantity ?? null,
        type: "grocery",

        // ⭐ MOST IMPORTANT: Add seller Id
        restaurentId: data.restaurentId || data.restaurantId || null,

        raw: data,
      };
    });

    const food = foodSnap.docs.map((doc) => {
      const data = doc.data();
      // Use SEO-friendly image URL if slug exists
      const image = data.imageSlug 
        ? `/images/food/${data.imageSlug}` 
        : (data.imageUrls?.[0] ?? "");

      return {
        id: doc.id,
        title: data.name || "",
        image: image,
        price: data.priceTiers?.[0]?.price ?? 0,
        // Keep quantity separate; unit should be only the unit label to avoid duplicates in UI
        unit: data.priceTiers?.[0]?.unit ?? "",
        discount: data.priceTiers?.[0]?.percentOff ?? 0,
        quantityPerUnit: data.priceTiers?.[0]?.quantity ?? null,
        type: "food",

        // ⭐ food me bhi seller Id
        restaurentId: data.restaurentId || data.restaurantId || null,

        raw: data,
      };
    });

    return [...grocery, ...food];
  } catch (err) {
    console.error("getAllProducts error:", err);
    return [];
  }
}
