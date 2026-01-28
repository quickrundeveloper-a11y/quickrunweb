import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Script from "next/script";
import CategoryPageClient from "./CategoryPageClient";

async function getCategory(categorySlug: string) {
  try {
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, "categories"));

    // Normalize function to convert strings to URL-friendly format
    const normalize = (s: string) => {
      if (!s) return "";
      return s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // Remove special characters but keep spaces
        .replace(/\s+/g, "-") // Replace spaces with dashes
        .replace(/-+/g, "-") // Replace multiple dashes with single dash
        .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
    };

    const target = normalize(categorySlug);

    console.log("=== CATEGORY MATCHING DEBUG ===");
    console.log("Looking for slug:", categorySlug);
    console.log("Normalized target:", target);

    let exactNameMatch: any = null;
    let exactTypeMatch: any = null;
    let fuzzyMatch: any = null;

    // Collect all categories and find the best match
    snap.forEach((doc) => {
      const d = doc.data();
      const nameNorm = normalize(d.name || "");
      const typeNorm = normalize(d.type || "");

      console.log("Checking category:", {
        id: doc.id,
        name: d.name,
        type: d.type,
        nameNorm,
        typeNorm,
        target,
        nameMatch: nameNorm === target,
        typeMatch: typeNorm === target,
        hasMetadata: {
          title: !!d.title,
          description: !!d.description,
          keywords: !!d.keywords
        }
      });

      // Prioritize exact name match over type match
      if (nameNorm === target) {
        exactNameMatch = d;
        console.log("✅ EXACT NAME MATCH FOUND:", {
          name: d.name,
          type: d.type,
          title: d.title?.substring(0, 50) + "...",
          description: d.description?.substring(0, 50) + "..."
        });
      } else if (typeNorm === target && !exactNameMatch) {
        exactTypeMatch = d;
        console.log("✅ EXACT TYPE MATCH FOUND:", {
          name: d.name,
          type: d.type,
          title: d.title?.substring(0, 50) + "...",
          description: d.description?.substring(0, 50) + "..."
        });
      }
    });

    // Choose the best match: name match > type match > fuzzy match
    let found = exactNameMatch || exactTypeMatch;

    // If no exact match, try fuzzy matching
    if (!found) {
      console.log("No exact match, trying fuzzy matching...");
      
      const targetWords = target.split("-").filter(w => w.length > 2);

      if (targetWords.length > 0) {
        snap.forEach((doc) => {
          const d = doc.data();
          const nameNorm = normalize(d.name || "");
          
          const nameWords = nameNorm.split("-").filter(w => w.length > 2);
          
          // Count matching words
          const nameMatches = targetWords.filter(tw => 
            nameWords.some(nw => nw.includes(tw) || tw.includes(nw))
          ).length;
          
          // If more than half the words match, consider it a match
          if (nameMatches > 0 && nameMatches >= Math.ceil(targetWords.length / 2)) {
            fuzzyMatch = d;
            console.log("✅ FUZZY MATCH FOUND:", {
              name: d.name,
              type: d.type,
              nameMatches,
              targetWords: targetWords.length
            });
          }
        });
        
        found = fuzzyMatch;
      }
    }

    console.log("Final result:", found ? {
      name: found.name,
      type: found.type,
      hasTitle: !!found.title,
      hasDescription: !!found.description,
      hasKeywords: !!found.keywords,
      title: found.title,
      description: found.description?.substring(0, 100),
      keywords: found.keywords?.substring(0, 100)
    } : "NOT FOUND");

    return found;
  } catch (error) {
    console.error("Error in getCategory:", error);
    return null;
  }
}

export async function generateMetadata(props: any) {
  try {
    const { params } = props;

    // ⭐ Next.js 15 FIX → params is async, unwrap it:
    const resolvedParams = await params;
    
    const catSlug = resolvedParams.cat;
    const data = await getCategory(catSlug);

    console.log("=== GENERATE METADATA DEBUG ===");
    console.log("CAT SLUG:", catSlug);
    console.log("FOUND DATA:", data ? {
      name: data.name,
      type: data.type,
      hasTitle: !!data.title,
      hasDescription: !!data.description,
      hasKeywords: !!data.keywords
    } : "NULL");

    // Generate meaningful fallbacks
    const categoryDisplayName = catSlug.replace(/-/g, " ");
    const capitalizedName = categoryDisplayName
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const fallbackTitle = `${capitalizedName} Online | Fast Delivery - QuickRun`;
    const fallbackDescription = `Shop for ${categoryDisplayName} online with QuickRun. Get high-quality products delivered fast to your doorstep with guaranteed freshness and reliability.`;
    const fallbackKeywords = `${categoryDisplayName} online, buy ${categoryDisplayName}, ${categoryDisplayName} delivery, online ${categoryDisplayName} shopping, fast ${categoryDisplayName} delivery, QuickRun ${categoryDisplayName}`;

    // Determine image URL (SEO-friendly slug or direct URL or default)
    const imageUrl = data?.imageSlug 
      ? `https://www.quickrunfast.com/images/categories/${data.imageSlug}` 
      : (data?.image || "https://www.quickrunfast.com/logo.png");

    const metadata = {
      title: data?.title || fallbackTitle,
      description: data?.description || fallbackDescription,
      keywords: data?.keywords || fallbackKeywords,
      openGraph: {
        siteName: "QuickRun",
        title: data?.title || fallbackTitle,
        description: data?.description || fallbackDescription,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: data?.name || capitalizedName,
          },
        ],
      },
    };

    console.log("Final metadata:", metadata);
    console.log("Using database data:", !!data);
    
    return metadata;
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    
    // Emergency fallback
    const categoryName = props.params?.cat?.replace(/-/g, " ") || "Category";
    return {
      title: `${categoryName} | QuickRun`,
      description: `Shop for ${categoryName} online with QuickRun.`,
      keywords: `${categoryName}, online shopping, QuickRun`,
    };
  }
}

interface PageProps {
  params: Promise<{
    cat: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params; // ⭐ NEXT.JS FIX
  const { cat } = resolvedParams;

  const data = await getCategory(cat);
  
  const categoryName = data?.name || cat.replace(/-/g, " ");
  const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  const breadcrumbItems = [
     { label: formattedCategory, href: `/category/${cat}` }
  ];

  const breadcrumbSchemaJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://quickrunfast.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": formattedCategory,
        "item": `https://quickrunfast.com/category/${cat}`
      }
    ]
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaJson) }}
        strategy="beforeInteractive"
      />
      <CategoryPageClient catSlug={cat} breadcrumbItems={breadcrumbItems} />
    </>
  );
}