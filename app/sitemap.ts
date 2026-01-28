import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { generateSlug, slugify } from "@/app/utils/generateSlug";
import { getAllProducts } from "@/lib/getAllProducts";
import { MetadataRoute } from "next";

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.quickrunfast.com";

  try {
    /** ------------------------
     * 1️⃣ Categories
     * ------------------------ */
    let categories: MetadataRoute.Sitemap = [];
    try {
      const { adminDB } = await import("@/lib/firebaseAdmin");
      const catSnapAdmin = await adminDB.collection("categories").get();
      categories = catSnapAdmin.docs.map((doc: any) => {
        const data = doc.data();
        const slug =
          data.slug ||
          String(data.name)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        const ts = data.updatedAt || data.createdAt;
        const lastModified = ts && typeof ts.toDate === "function" ? ts.toDate() : new Date();

        return {
          url: `${baseUrl}/category/${slug}`,
          lastModified,
          changeFrequency: "daily",
          priority: 0.8,
        };
      });
    } catch {
      const catSnap = await getDocs(collection(db, "categories"));
      categories = catSnap.docs.map((doc) => {
        const data = doc.data();
        const slug =
          data.slug ||
          String(data.name)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        const ts = data.updatedAt || data.createdAt;
        const lastModified = ts && typeof ts.toDate === "function" ? ts.toDate() : new Date();

        return {
          url: `${baseUrl}/category/${slug}`,
          lastModified,
          changeFrequency: "daily",
          priority: 0.8,
        };
      });
    }

    /** ------------------------
     * 2️⃣ Products
     * ------------------------ */
    const allProducts = await getAllProducts();

    const products: MetadataRoute.Sitemap = allProducts
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
        const category = (p.category || raw.category || type).toLowerCase();

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
          url: `${baseUrl}/category/${slugify(category)}/${slug}`,
          lastModified,
          changeFrequency: "daily",
          priority: 0.9,
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

    /** ------------------------
     * 3️⃣ Static Pages
     * ------------------------ */
    const staticRoutes = [
      { path: "", priority: 1.0, changeFrequency: "daily" as const },
      { path: "/", priority: 1.0, changeFrequency: "daily" as const },
      { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
      { path: "/termsandcondition", priority: 0.5, changeFrequency: "monthly" as const },
      { path: "/shipping_policy", priority: 0.5, changeFrequency: "monthly" as const },
      { path: "/privacy", priority: 0.5, changeFrequency: "monthly" as const },
      { path: "/return_policy", priority: 0.5, changeFrequency: "monthly" as const },
    ];

    const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }));

    /** ------------------------
     * 4️⃣ Blog Posts
     * ------------------------ */
    let blogs: MetadataRoute.Sitemap = [];
    try {
      const { adminDB } = await import("@/lib/firebaseAdmin");
      const blogSnapAdmin = await adminDB.collection("blog_posts").get();
      blogs = blogSnapAdmin.docs.map((doc: any) => {
        const data = doc.data();
        const ts = data.updated_at || data.created_at;
        const lastModified = ts && typeof ts.toDate === "function" ? ts.toDate() : new Date();
        const slug = data.slug || doc.id;

        return {
          url: `${baseUrl}/blog/${slug}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.7,
        };
      });
    } catch {
      const blogRef = collection(db, "blog_posts");
      const blogSnap = await getDocs(blogRef);
      blogs = blogSnap.docs.map((doc) => {
        const data = doc.data();
        const ts = data.updated_at || data.created_at;
        const lastModified = ts && typeof ts.toDate === "function" ? ts.toDate() : new Date();
        const slug = data.slug || doc.id;
        return {
          url: `${baseUrl}/blog/${slug}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.7,
        };
      });
    }

    /** ------------------------
     * 5️⃣ Final Sitemap
     * ------------------------ */
    return [...staticUrls, ...categories, ...products, ...blogs];

  } catch (err) {
    console.error("🔥 SITEMAP ERROR:", err);
    return [];
  }
}
