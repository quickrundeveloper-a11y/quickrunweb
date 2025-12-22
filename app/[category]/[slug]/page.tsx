import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function generateMetadata({ params }: any) {

  console.log("🔥 generateMetadata CALLED");

  // 🔥 Next.js 15/16 FIX → unwrap params because it's a Promise
  const resolvedParams = await params;
  console.log("👉 RESOLVED PARAMS:", resolvedParams);

  const { category, slug: rawSlug } = resolvedParams;

  if (!category || !rawSlug) {
    console.log("❌ PARAMS MISSING");
    return {
      title: "Product",
      description: "Product details",
    };
  }

  console.log("🟡 rawSlug:", rawSlug);

  // Decode safe slug
  const slug = decodeURIComponent(rawSlug);
  console.log("🟢 decodedSlug:", slug);

  const id = slug.split("-").pop();
  console.log("🟣 extracted ID:", id);

  if (!id) {
    return {
      title: "Invalid Slug",
      description: "No ID extracted",
    };
  }

  const ref = doc(db, category, id);
  const snap = await getDoc(ref);

  console.log("📘 Firestore exists?", snap.exists());

  if (!snap.exists()) {
    return {
      title: "Not Found",
      description: "Product not found",
    };
  }

  const data = snap.data();
  console.log("🎉 FINAL DATA:", data);

  return {
    title: `${data.name || "Product"} - Quick Run Fast | Fresh Grocery Delivery`,
    description: data.keyInformation?.description || data.description || `Buy fresh ${data.name} online from Quick Run Fast. Premium quality grocery products with same-day delivery. Order now!`,
    keywords: data.keywords || `${data.name}, grocery, fresh, delivery, Quick Run Fast, ${category}`,
    
    // Open Graph tags for social media
    openGraph: {
      title: `${data.name || "Product"} - Quick Run Fast`,
      description: data.keyInformation?.description || data.description || `Fresh ${data.name} delivered to your doorstep`,
      images: data.imageUrls ? [
        {
          url: data.imageUrls[0],
          width: 800,
          height: 600,
          alt: data.name || "Product Image"
        }
      ] : [],
      type: 'website',
      siteName: 'Quick Run Fast'
    },
    
    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title: `${data.name || "Product"} - Quick Run Fast`,
      description: data.keyInformation?.description || data.description || `Fresh ${data.name} delivered to your doorstep`,
      images: data.imageUrls ? [data.imageUrls[0]] : []
    },
    
    // Additional meta tags for rich snippets
    other: {
      'product:price:amount': data.priceTiers?.[0]?.price?.toString() || '0',
      'product:price:currency': 'INR',
      'product:availability': data.inStock !== false ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:brand': 'Quick Run Fast',
      'product:category': category || 'grocery'
    }
  };
}

export { default } from "./client-page";