import { NextResponse } from "next/server";
import twilio from "twilio";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    let { phone, otp, name } = await req.json();

    // Normalize phone
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    let cleanPhone = phone.replace("+91", "").trim();

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // 🔥 LOCALHOST BYPASS
if (process.env.NODE_ENV === "development") {
  console.log("DEV MODE: OTP auto-approved for", cleanPhone);

  // pretend OTP is always correct
  const phoneWithCode = `+91${cleanPhone}`;

  const q = query(
    collection(db, "Customer"),
    where("phone", "==", phoneWithCode)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    const newUser = await addDoc(collection(db, "Customer"), {
      phone: phoneWithCode,
      name: "",
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      newUser: true,
      customerId: newUser.id,
      dev: true,
    });
  }

  return NextResponse.json({
    success: true,
    newUser: false,
    customerId: snapshot.docs[0].id,
    dev: true,
  });
}


    const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

    // Check OTP
    const check = await client.verify.v2
      .services(process.env.SERVICES_SID)
      .verificationChecks.create({
        to: `+91${cleanPhone}`,
        code: otp,
      });

    if (check.status === "approved") {
      const phoneWithCode = `+91${cleanPhone}`;

      // Check if user exists
      const q = query(
        collection(db, "Customer"),
        where("phone", "==", phoneWithCode)
      );
      const snapshot = await getDocs(q);

      // New user
      if (snapshot.empty) {
        const newUser = await addDoc(collection(db, "Customer"), {
          phone: phoneWithCode,
          name: "",
          createdAt: Date.now(),
        });

        return NextResponse.json({
          success: true,
          newUser: true,
          customerId: newUser.id,
        });
      }

      // Existing user
      return NextResponse.json({
        success: true,
        newUser: false,
        customerId: snapshot.docs[0].id,
      });
    }

    return NextResponse.json(
      { success: false, message: "Incorrect OTP" },
      { status: 401 }
    );

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify OTP", error: error.message },
      { status: 500 }
    );
  }
}
