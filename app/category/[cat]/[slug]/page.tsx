import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Script from "next/script";
import ClientPage from "./client-page";

/* -------------------------------------------------
   Helper: Fetch product from multiple collections
--------------------------------------------------*/
async function fetchProduct(category: string, id: string) {
  const collections = ["grocery", "food"];
  if (category && !collections.includes(category)) {
    collections.push(category);
  }

  for (const col of collections) {
    try {
      const snap = await getDoc(doc(db, col, id));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.error(`Firestore error in ${col}`, err);
    }
  }
  return null;
}

/* -------------------------------------------------
   SEO METADATA
--------------------------------------------------*/
export async function generateMetadata({ params }: any) {
  const { cat: category, slug: rawSlug } = await params;
  if (!category || !rawSlug) return {};

  const slug = decodeURIComponent(rawSlug);
  const id = slug.split("-").pop();
  if (!id) return {};

  const data = await fetchProduct(category, id);
  if (!data) {
    return {
      title: "Product Not Found",
      description: "Product not available",
    };
  }

  const canonicalUrl = `https://www.quickrunfast.com/category/${category}/${slug}`;

  return {
    title: `${data.name} - Quick Run Fast`,
    description:
      data.keyInformation?.description ||
      data.description ||
      `Buy ${data.name} online from Quick Run Fast`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: data.name,
      description:
        data.keyInformation?.description ||
        data.description ||
        `Buy ${data.name} online`,
      images: data.imageUrls?.[0]
        ? [
            {
              url: data.imageUrls[0],
              width: 800,
              height: 600,
              alt: data.name,
            },
          ]
        : [],
      type: "website",
      siteName: "Quick Run Fast",
    },
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description:
        data.keyInformation?.description ||
        data.description ||
        `Buy ${data.name} online`,
      images: data.imageUrls?.[0] ? [data.imageUrls[0]] : [],
    },
  };
}

/* -------------------------------------------------
   PRODUCT PAGE (SSR + SCHEMA)
--------------------------------------------------*/
export default async function ProductPage({ params }: any) {
  const { cat: category, slug: rawSlug } = await params;
  if (!category || !rawSlug) return <ClientPage />;

  const slug = decodeURIComponent(rawSlug);
  const id = slug.split("-").pop();
  if (!id) return <ClientPage />;

  const data = await fetchProduct(category, id);
  if (!data) return <ClientPage />;

  const productUrl = `https://www.quickrunfast.com/category/${category}/${slug}`;

  const images = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter(
        (u: string) => typeof u === "string" && u.startsWith("http")
      )
    : [];

  /* ---------------- Product Schema ---------------- */
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.name,
    "image": images.length
      ? images
      : ["https://www.quickrunfast.com/logo.png"],
    "description":
      data.keyInformation?.description || data.description,
    "sku": id,
    "brand": {
      "@type": "Brand",
      "name": "Quick Run Fast",
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "INR",
      "price": data.priceTiers?.[0]?.price?.toString() || "0",
      "availability":
        data.inStock !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Quick Run Fast",
        "url": "https://www.quickrunfast.com",
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN",
        },
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn",
      },
    },
  };

  /* ---------------- Breadcrumb Schema ---------------- */
  const categoryLabel = category.replace(/-/g, " ");
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.quickrunfast.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryLabel,
        "item": `https://www.quickrunfast.com/category/${category}`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": data.name,
        "item": productUrl,
      },
    ],
  };

  const breadcrumbItems = [
    { label: categoryLabel, href: `/category/${category}` },
    { label: data.name, href: `/category/${category}/${slug}` },
  ];

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
        strategy="beforeInteractive"
      />

      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
        strategy="beforeInteractive"
      />

      <ClientPage breadcrumbItems={breadcrumbItems} />
    </>
  );
}
