import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { customerId, name } = await req.json();

    if (!customerId || !name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    const ref = doc(db, "Customer", customerId);

    await updateDoc(ref, {
      name: name.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Name updated successfully",
    });

  } catch (err) {
    console.error("UPDATE NAME ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update name" },
      { status: 500 }
    );
  }
}
