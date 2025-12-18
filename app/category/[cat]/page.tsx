import { Metadata } from "next";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import CategoryPageClient from "./CategoryPageClient";

async function getCategory(categorySlug: string) {
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, "categories"));

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");

  const target = normalize(categorySlug);

  let found: any = null;

  snap.forEach((doc) => {
    const d = doc.data();

    const nameNorm = normalize(d.name || "");
    const slugNorm = normalize(d.slug || "");

    if (nameNorm === target || slugNorm === target) {
      found = d;
    }
  });

  return found;
}


export async function generateMetadata(props: any) {
  const { params } = props;

  // ⭐ Next.js 15 FIX → params is async, unwrap it:
  const resolvedParams = await params;
  

  const catSlug = resolvedParams.cat;
  const data = await getCategory(catSlug);

  return {
    title: data?.title || `${catSlug.replace(/-/g, " ")} | QuickRun`,
    description: data?.description || "",
    keywords: data?.keywords || "",
  };
}



interface PageProps {
  params: Promise<{
    cat: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params; // ⭐ NEXT.JS FIX
  const { cat } = resolvedParams;

  return <CategoryPageClient catSlug={cat} />;
}