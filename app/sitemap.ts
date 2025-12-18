import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { generateSlug } from "@/app/utils/generateSlug";
import { getAllProducts } from "@/lib/getAllProducts";

export default async function sitemap() {
  const baseUrl = "https://www.quickrunfast.com";

  try {
    /** ------------------------
     * 1️⃣ Fetch All Categories
     * ------------------------ */
    const catSnap = await getDocs(collection(db, "categories"));
    const categories = catSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/category?name=${encodeURIComponent(data.name)}`,
        lastModified: new Date(),
      };
    });

    /** ------------------------
     * 2️⃣ Fetch All Products using the SAME helper as the UI
     *     This guarantees sitemap coverage matches what users see.
     * ------------------------ */
    const allProducts = await getAllProducts();

    const products = allProducts
      .map((p: any) => {
        const raw = p.raw || {};

        // Prefer a persisted slug if present on the raw Firestore doc
        const persistedSlug: string | undefined = raw.slug;
        const nameSource =
          p.title ||
          raw.name ||
          raw.productName ||
          "";

        if (!nameSource && !persistedSlug) return null;

        const type = (p.type || raw.type || "grocery").toLowerCase();
        const slug =
          persistedSlug || generateSlug(String(nameSource), String(p.id));

        const ts: any =
          raw.updatedAt ||
          raw.modifiedAt ||
          raw.lastUpdated ||
          raw.createdAt;
        const lastModified =
          ts && typeof ts.toDate === "function" ? ts.toDate() : new Date();

        return {
          url: `${baseUrl}/${type}/${slug}`,
          lastModified,
        };
      })
      .filter(Boolean) as { url: string; lastModified: Date }[];

    /** ------------------------
     * 3️⃣ Static Pages
     * ------------------------ */
    const staticUrls = [
      "",
      "/termsandcondition",
      "/shipping_policy",
      "/privacy",
      "/return_policy",
    ].map((p) => ({
      url: `${baseUrl}${p}`,
      lastModified: new Date(),
    }));

    /** ------------------------
     * 4️⃣ Return Final Sitemap
     * ------------------------ */
    return [...staticUrls, ...categories, ...products];

  } catch (err) {
    console.error("🔥 SITEMAP ERROR:", err);
    return [];
  }
}