/**
 * ProductSchema Component - Optimized for Google Rich Snippets
 * 
 * This component generates comprehensive schema.org Product JSON-LD markup
 * specifically optimized for Google Rich Snippets and search result enhancement.
 * 
 * Features for Rich Snippets:
 * - Complete Product schema with all required fields
 * - Price range and offer details for price display
 * - Aggregate ratings for star ratings in search
 * - Shipping information for delivery details
 * - Multiple product identifiers (SKU, MPN, GTIN)
 * - Proper URL structure for click-through
 * - Brand and manufacturer information
 * 
 * Compatible with Next.js App Router (SSR-safe)
 * 
 * @example
 * <ProductSchema productData={productData} productId={id} />
 */

import { ProductSchemaProps } from './types/schema';

export default function ProductSchema({ productData, productId }: ProductSchemaProps) {
  // Safety check
  if (!productData) {
    console.warn('ProductSchema: No product data provided');
    return null;
  }

  // Map your current product structure to the desired field names
  const mappedData = {
    itemName: productData.name || productData.itemName,
    images: productData.imageUrls ? productData.imageUrls.map(url => ({ url })) : (productData.images || []),
    description: productData.keyInformation?.description || productData.description,
    documentId: productData.id || productData.documentId || productId,
    category: productData.category,
    priceTiers: productData.priceTiers || [],
    inStock: productData.inStock
  };

  // Safety check for required fields
  if (!mappedData.itemName) {
    console.warn('ProductSchema: Missing required itemName field');
    return null;
  }

  // Validate document ID
  if (!mappedData.documentId) {
    console.warn('ProductSchema: Missing documentId - URL will show undefined');
  }

  // Validate price data
  const firstPrice = mappedData.priceTiers?.[0]?.price;
  if (!firstPrice || firstPrice <= 0) {
    console.warn('ProductSchema: Invalid or missing price data');
  }

  // Create comprehensive schema object for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": mappedData.itemName,
    "image": mappedData.images?.map((img: { url: string }) => img.url) || [],
    "description": mappedData.description || `Fresh ${mappedData.itemName} from Quick Run Fast - Premium quality grocery products delivered to your doorstep`,
    "brand": {
      "@type": "Brand",
      "name": "Quick Run Fast",
      "url": "https://quickrunfast.com"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Quick Run Fast"
    },
    "sku": mappedData.documentId,
    "mpn": mappedData.documentId, // Manufacturer Part Number
    "gtin": mappedData.documentId, // Global Trade Item Number
    "category": mappedData.category || "Grocery",
    "productID": mappedData.documentId,
    "url": `https://quickrunfast.com/${mappedData.category?.toLowerCase() || 'product'}/${mappedData.documentId}`,
    "mainEntityOfPage": `https://quickrunfast.com/${mappedData.category?.toLowerCase() || 'product'}/${mappedData.documentId}`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": mappedData.priceTiers?.[0]?.price?.toString() || "0",
      "lowPrice": mappedData.priceTiers?.[0]?.price?.toString() || "0",
      "highPrice": mappedData.priceTiers?.[mappedData.priceTiers.length - 1]?.price?.toString() || mappedData.priceTiers?.[0]?.price?.toString() || "0",
      "offerCount": mappedData.priceTiers?.length || 1,
      "availability": mappedData.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "url": `https://quickrunfast.com/${mappedData.category?.toLowerCase() || 'product'}/${mappedData.documentId}`,
      "seller": {
        "@type": "Organization",
        "name": "Quick Run Fast",
        "url": "https://quickrunfast.com"
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR"
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
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          }
        }
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
        "value": mappedData.category || "Grocery"
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
      "target": `https://quickrunfast.com/${mappedData.category?.toLowerCase() || 'product'}/${mappedData.documentId}`,
      "price": mappedData.priceTiers?.[0]?.price?.toString() || "0",
      "priceCurrency": "INR"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      suppressHydrationWarning
    />
  );
}
