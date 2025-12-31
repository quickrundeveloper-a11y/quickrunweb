// app/layout.tsx (SERVER COMPONENT)
import "./globals.css";
import { Lexend } from "next/font/google";
import ClientLayout from "./client-layout";
import { ReactNode } from "react";
import { LocationProvider } from "./LocationProvider";
import Script from "next/script";



export const metadata = {
  other: {
    "google-site-verification": "CQy0QZoa95ovFQfnyJHPs6c4Pbd0VXuR6Uvs5X2-09s",
  },
    icons: {
    icon: "/favicon.ico?v=5",
  },

};

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>

      {/* ✅ Google Tag Manager */}
<Script
  id="gtm"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MPMJ33XW');`,
  }}
/>


        {/* ⭐ GMB / LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "QuickRun",
  "image": "https://www.quickrunfast.com/logo.png",
  "url": "https://www.quickrunfast.com",
  "telephone": "0120 690 9586",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "I-Thum Heights, Office No. 407, 4th Floor, Tower-A, Plot No. A-16, Sector 62",
    "addressLocality": "Noida",
    "addressRegion": "Uttar Pradesh",
    "postalCode": "201301",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "28.628465",
    "longitude": "77.370126"
  },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
    ],
    "opens": "08:00",
    "closes": "22:00"
  }],
  "sameAs": [
    "https://www.facebook.com/quickrun1",
    "https://www.instagram.com/quickrunofficial"
  ],
  "priceRange": "₹10 - ₹9000",
  "description": "QuickRun is Noida’s fastest online shopping and delivery platform offering groceries, electronics, daily essentials and more with instant delivery.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "154"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Amit Sharma"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Super fast delivery! QuickRun always delivers fresh products and the service quality is amazing."
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Priya Singh"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Loved the experience! Fast delivery, great support, and excellent packing. Highly recommended!"
    }
  ]
}
`,
          }}
        />
      </head>

      <body className={`${lexend.className} bg-white dark:bg-gray-800`}>
        
          {/* ✅ Google Tag Manager (noscript) */}
  <noscript>
    <iframe
      src="https://www.googletagmanager.com/ns.html?id=GTM-MPMJ33XW"
      height="0"
      width="0"
      style={{ display: "none", visibility: "hidden" }}
    />
  </noscript>
        <LocationProvider>
  <ClientLayout>{children}</ClientLayout>
</LocationProvider>

      </body>
    </html>
  );
}
