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
    title: data.name || "Product",
    description: data.keyInformation?.description || data.description || "",
    keywords: data.keywords || "",
  };
}

export { default } from "./client-page";