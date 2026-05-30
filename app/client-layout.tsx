"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./components/header";
import Footer from "./components/footer";
import WhatsAppButton from "./components/WhatsAppButton";
import PromoPopup from "./components/PromoPopup";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeaderFooter = pathname === "/login" || pathname === "/franchise-details";
  const isHomePage = pathname === "/";

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <main
        className={
          hideHeaderFooter
            ? "bg-white dark:bg-gray-800 text-foreground min-h-screen"
            : isHomePage
            ? "bg-white dark:bg-gray-800 text-foreground min-h-screen"
            : // Extra top padding for other pages
              "pt-[150px] sm:pt-32 lg:pt-28 bg-white dark:bg-gray-800 text-foreground min-h-screen"
        }
      >
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
      <WhatsAppButton />
      {isHomePage && <PromoPopup />}
    </>
  );
}