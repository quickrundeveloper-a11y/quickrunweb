import { db } from "@/lib/firebase"; // yahan tumhara firebase config hota hai
import { doc, getDoc } from "firebase/firestore";

export async function getProductById(id) {
  if (!id) return null;

  try {
    const docRef = doc(db, "products", id);   // "products" = tumhari collection ka naam
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data(),
    };
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}