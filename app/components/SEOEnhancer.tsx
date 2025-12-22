/**
 * SEO Enhancer Component
 * 
 * Adds additional structured data for better Google Rich Snippets
 * Works alongside ProductSchema for maximum SEO impact
 */

interface SEOEnhancerProps {
  productData: any;
  productId?: string;
  category?: string;
}

export default function SEOEnhancer({ productData, productId, category }: SEOEnhancerProps) {
  if (!productData) return null;

  const productUrl = `https://quickrunfast.com/${category?.toLowerCase() || 'product'}/${productId}`;
  
  // BreadcrumbList Schema for navigation
  const breadcrumbSchema = {
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
        "name": category || "Products",
        "item": `https://quickrunfast.com/${category?.toLowerCase() || 'products'}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": productData.name,
        "item": productUrl
      }
    ]
  };

  // Organization Schema for brand credibility
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Quick Run Fast",
    "url": "https://quickrunfast.com",
    "logo": "https://quickrunfast.com/logo.png",
    "sameAs": [
      "https://www.facebook.com/quickrunfast",
      "https://www.instagram.com/quickrunfast",
      "https://twitter.com/quickrunfast"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-XXXXXXXXXX",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    }
  };

  // WebSite Schema for search box
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Quick Run Fast",
    "url": "https://quickrunfast.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://quickrunfast.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        suppressHydrationWarning
      />
      
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        suppressHydrationWarning
      />
      
      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        suppressHydrationWarning
      />
    </>
  );
}