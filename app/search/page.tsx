import dynamic from "next/dynamic";

// Load the client component dynamically with no SSR so it won't run during prerender
const SearchClient = dynamic(() => import("./SearchClient"), { ssr: false });

export default function Page() {
  return <SearchClient />;
}
