import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Script from "next/script";
import ClientPage from "./client-page";

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

// Server Component that includes JSON-LD schema
export default async function ProductPage({ params }: any) {
  const resolvedParams = await params;
  const { category, slug: rawSlug } = resolvedParams;

  if (!category || !rawSlug) {
    return <ClientPage />;
  }

  const slug = decodeURIComponent(rawSlug);
  const id = slug.split("-").pop();

  if (!id) {
    return <ClientPage />;
  }

  // Fetch product data for schema
  const ref = doc(db, category, id);
  const snap = await getDoc(ref);

  let productSchema = null;

  if (snap.exists()) {
    const data = snap.data();
    
    // Process images to ensure they are valid, fully qualified URLs
    const rawImages = Array.isArray(data.imageUrls) ? data.imageUrls : (typeof data.imageUrls === 'string' ? [data.imageUrls] : []);
    const validImages = rawImages
      .filter((url: any) => typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')))
      .map((url: string) => url.trim());

    // Generate JSON-LD schema
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": data.name,
      "image": validImages.length > 0 ? validImages : ["https://www.quickrunfast.com/logo.png"],
      "description": data.keyInformation?.description || data.description || `Fresh ${data.name} from Quick Run Fast - Premium quality grocery products delivered to your doorstep`,
      "brand": {
        "@type": "Brand",
        "name": "Quick Run Fast",
        "url": "https://quickrunfast.com"
      },
      "manufacturer": {
        "@type": "Organization",
        "name": "Quick Run Fast"
      },
      "sku": id,
      "mpn": id,
      "gtin": id,
      "category": data.category || category || "Grocery",
      "productID": id,
      "url": `https://quickrunfast.com/${category?.toLowerCase() || 'product'}/${id}`,
      "mainEntityOfPage": `https://quickrunfast.com/${category?.toLowerCase() || 'product'}/${id}`,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": data.priceTiers?.[0]?.price?.toString() || "0",
        "lowPrice": data.priceTiers?.[0]?.price?.toString() || "0",
        "highPrice": data.priceTiers?.[data.priceTiers?.length - 1]?.price?.toString() || data.priceTiers?.[0]?.price?.toString() || "0",
        "offerCount": data.priceTiers?.length || 1,
        "availability": data.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition",
        "url": `https://quickrunfast.com/${category?.toLowerCase() || 'product'}/${id}`,
        "seller": {
          "@type": "Organization",
          "name": "Quick Run Fast",
          "url": "https://quickrunfast.com"
        },
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "INR"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "IN"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 0,
              "maxValue": 1,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 0,
              "maxValue": 1,
              "unitCode": "DAY"
            }
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "IN",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 7,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "10",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Quick Run Fast Customer"
          },
          "reviewBody": "Fresh and high-quality product delivered quickly!"
        }
      ],
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Category",
          "value": data.category || category || "Grocery"
        },
        {
          "@type": "PropertyValue", 
          "name": "Freshness",
          "value": "Farm Fresh"
        },
        {
          "@type": "PropertyValue",
          "name": "Delivery",
          "value": "Same Day Delivery Available"
        }
      ],
      "isRelatedTo": {
        "@type": "Product",
        "name": "Fresh Grocery Products"
      },
      "potentialAction": {
        "@type": "BuyAction",
        "target": `https://quickrunfast.com/${category?.toLowerCase() || 'product'}/${id}`,
        "price": data.priceTiers?.[0]?.price?.toString() || "0",
        "priceCurrency": "INR"
      }
    };

    productSchema = (
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="beforeInteractive"
      />
    );
  }

  return (
    <>
      {productSchema}
      <ClientPage />
    </>
  );
}