"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./components/header";
import Footer from "./components/footer";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideHeaderFooter = pathname === "/login" || pathname === "/franchise-details";

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <main
        className={
          hideHeaderFooter
            ? ""
            : // Extra top padding so content never hides behind the fixed header + download strip,
              // tuned for mobile first and slightly smaller on larger screens.
              "pt-[150px] sm:pt-32 lg:pt-28"
        }
      >
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}