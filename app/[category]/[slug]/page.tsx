import { permanentRedirect } from "next/navigation";

// ⚠️ REDIRECT ONLY ROUTE ⚠️
// This route handles legacy URLs like /[category]/[slug] and redirects them to the
// canonical route /category/[cat]/[slug].
// DO NOT add metadata, schema, or product logic here.
// All product logic resides in app/category/[cat]/[slug]/page.tsx.

export default async function Page({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  permanentRedirect(`/category/${category}/${slug}`);
}
