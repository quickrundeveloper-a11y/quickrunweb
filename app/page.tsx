import HomeClient from "./home/HomeClient";
import Script from "next/script";

export const metadata = {
  title: "QuickRun Delivers Fresh Groceries & Daily Needs",
  description:
    "Quickrun Delivers Fresh Groceries And Daily Essentials To Your Doorstep Within Minutes. Enjoy Fast, Reliable, And Convenient Online Shopping Anytime You Need It.",
  keywords: [
    "Online Grocery Delivery",
    "Fresh Fruits and Vegetables",
    "Daily Essentials Online",
    "Quick Grocery Delivery",
    "Buy Groceries Near Me",
  ],
  alternates: {
    canonical: "https://www.quickrunfast.com/",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.quickrunfast.com/#organization",
        "name": "QuickRun",
        "url": "https://www.quickrunfast.com/",
        "logo": "https://www.quickrunfast.com/logo.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-0120-690-9586",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["Hindi", "English"]
        },
        "sameAs": [
          "https://www.facebook.com/quickrun1",
          "https://www.instagram.com/quickrunofficial/",
          "https://www.youtube.com/@QuickRunfast",
          "https://x.com/quickrunfast",
          "https://play.google.com/store/apps/details?id=com.quick.quick_run",
          "https://apps.apple.com/app/quickrun-instant-delivery/id6755721618"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.quickrunfast.com/#website",
        "url": "https://www.quickrunfast.com/",
        "name": "QuickRun",
        "publisher": { "@id": "https://www.quickrunfast.com/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.quickrunfast.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "ItemList",
        "name": "QuickRun Product Categories",
        "description": "QuickRun par Grocery, Dairy, Fruits aur Vegetables ki instant delivery payein.",
        "itemListElement": [
          { "@type": "SiteNavigationElement", "position": 1, "name": "Grocery Products", "url": "https://www.quickrunfast.com/category/grocery" },
          { "@type": "SiteNavigationElement", "position": 2, "name": "Rajdhani Products", "url": "https://www.quickrunfast.com/category/rajdhani-products" },
          { "@type": "SiteNavigationElement", "position": 3, "name": "Dairy, Bread & Eggs", "url": "https://www.quickrunfast.com/category/dairy-bread-eggs" },
          { "@type": "SiteNavigationElement", "position": 4, "name": "Fruits & Vegetables", "url": "https://www.quickrunfast.com/category/fruits-and-vegetables" },
          { "@type": "SiteNavigationElement", "position": 5, "name": "Wellness & Pharma", "url": "https://www.quickrunfast.com/category/wellness-and-pharma" },
          { "@type": "SiteNavigationElement", "position": 6, "name": "Cleaning Essentials", "url": "https://www.quickrunfast.com/category/cleaning-essentials" },
          { "@type": "SiteNavigationElement", "position": 7, "name": "Skin & Health Care", "url": "https://www.quickrunfast.com/category/skin-care-and-health-care" },
          { "@type": "SiteNavigationElement", "position": 8, "name": "Sauces & Spreads", "url": "https://www.quickrunfast.com/category/sauces-and-spread" },
          { "@type": "SiteNavigationElement", "position": 9, "name": "Bakery & Biscuits", "url": "https://www.quickrunfast.com/category/bakery-and-biscuits" },
          { "@type": "SiteNavigationElement", "position": 10, "name": "Snacks", "url": "https://www.quickrunfast.com/category/snacks" },
          { "@type": "SiteNavigationElement", "position": 11, "name": "Our Franchises", "url": "https://www.quickrunfast.com/franchise" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "QuickRun - Instant Delivery",
        "operatingSystem": "ANDROID, IOS",
        "applicationCategory": "ShoppingApplication",
        "installUrl": "https://play.google.com/store/apps/details?id=com.quick.quick_run",
        "author": { "@id": "https://www.quickrunfast.com/#organization" },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "1250"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "description": "Free Instant Delivery"
        }
      }
    ]
  };
  return (
    <>
      <Script
        id="home-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
