"use client";

import Link from "next/link";
import Script from "next/script";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Always prepend Home
  const allItems = [
    { label: "Home", href: "/" },
    ...items
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://www.quickrunfast.com${item.href}`
    }))
  };

  return (
    <nav aria-label="Breadcrumb" className="w-full mb-3 sm:mb-4">
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ol className="flex items-center flex-wrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          return (
            <li key={item.href + index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400" />
              )}
              
              {isLast ? (
                <span 
                  className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 max-w-[150px] sm:max-w-xs"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center"
                >
                  {index === 0 && <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                  <span className={index === 0 ? "hidden sm:inline" : ""}>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
