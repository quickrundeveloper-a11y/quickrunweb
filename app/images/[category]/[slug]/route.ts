import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string; slug: string } }
) {
  const { category, slug } = params;

  try {
    if (!category || !slug) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const q = query(
      collection(db, category),
      where("imageSlug", "==", slug),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = snapshot.docs[0].data();
    
    // Support both 'imageUrls' array (grocery/food) and single 'image' string (categories)
    const imageUrl = data.imageUrls?.[0] || data.image;

    if (!imageUrl) {
      return new NextResponse("Image URL missing", { status: 404 });
    }

    return NextResponse.redirect(imageUrl, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=31536000",
      },
    });

  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
