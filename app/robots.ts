export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      }
    ],
    sitemap: "https://www.quickrunfast.com/sitemap.xml",
  };
}