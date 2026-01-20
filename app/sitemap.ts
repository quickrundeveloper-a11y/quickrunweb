import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { generateSlug } from "@/app/utils/generateSlug";
import { getAllProducts } from "@/lib/getAllProducts";

export default async function sitemap() {
  const baseUrl = "https://www.quickrunfast.com";

  try {
    /** ------------------------
     * 1️⃣ Categories (FIXED – NO undefined)
     * ------------------------ */
    const catSnap = await getDocs(collection(db, "categories"));

    const categories = catSnap.docs.map((doc) => {
      const data = doc.data();

      const slug =
        data.slug ||
        String(data.name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");

      return {
        url: `${baseUrl}/category/${slug}`,
        lastModified: new Date(),
      };
    });

    /** ------------------------
     * 2️⃣ Products (UNCHANGED – CORRECT)
     * ------------------------ */
    const allProducts = await getAllProducts();

    const products = allProducts
      .map((p: any) => {
        const raw = p.raw || {};

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
          ts && typeof ts.toDate === "function"
            ? ts.toDate()
            : new Date();

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
      "/",
      "/blog",
      "/termsandcondition",
      "/shipping_policy",
      "/privacy",
      "/return_policy",
    ].map((p) => ({
      url: `${baseUrl}${p}`,
      lastModified: new Date(),
    }));

    /** ------------------------
     * 4️⃣ Blog Posts
     * ------------------------ */
    const blogRef = collection(db, "blog_posts");
    // Removed status check to include all posts (or filter by published if field exists)
    // For now, getting all posts to match website behavior
    const blogSnap = await getDocs(blogRef);

    const blogs = blogSnap.docs.map((doc) => {
      const data = doc.data();
      // Use updated_at or created_at, fallback to now
      const ts = data.updated_at || data.created_at;
      const lastModified = ts && typeof ts.toDate === "function" ? ts.toDate() : new Date();

      // Ensure slug exists, fallback to ID if missing
      const slug = data.slug || doc.id;

      return {
        url: `${baseUrl}/blog/${slug}`,
        lastModified,
      };
    });

    /** ------------------------
     * 5️⃣ Final Sitemap
     * ------------------------ */
    return [...staticUrls, ...categories, ...products, ...blogs];

  } catch (err) {
    console.error("🔥 SITEMAP ERROR:", err);
    return [];
  }
}



