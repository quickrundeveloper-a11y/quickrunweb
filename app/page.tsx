"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, []);
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">Welcome to My Next.js App 🚀</h1>

      <p className="text-lg text-gray-600 mb-4">
        Ye ek simple Next.js example page hai.
      </p>

      <a
        href="/api/hello"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Call API Route
      </a>
    </main>
  );
}