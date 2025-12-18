import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req) {
  try {
    console.log("NODE_ENV:", process.env.NODE_ENV);

    let { phone } = await req.json();

    // 1️⃣ Validate phone exists
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    // 2️⃣ Remove everything except digits
    phone = phone.replace(/\D/g, ""); // removes +, spaces, -, etc.

    // 3️⃣ Handle 91 prefix (12-digit)
    if (phone.length === 12 && phone.startsWith("91")) {
      phone = phone.substring(2);
    }

    // 4️⃣ Handle leading 0 (11-digit)
    if (phone.length === 11 && phone.startsWith("0")) {
      phone = phone.substring(1);
    }

    // 5️⃣ Final validation → must be exactly 10 digits
    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    // cleanPhone is final number
    const cleanPhone = phone;

    // 6️⃣ Twilio client
// 🔥 LOCALHOST BYPASS
if (process.env.NODE_ENV === "development") {
  console.log("DEV MODE: OTP bypassed for", cleanPhone);

  return NextResponse.json({
    success: true,
    message: "OTP bypassed in development",
    status: "approved",
    devOtp: "123456", // optional
  });
}

// 🔒 PRODUCTION FLOW (UNCHANGED)
const client = twilio(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

const response = await client.verify.v2
  .services(process.env.SERVICES_SID)
  .verifications.create({
    to: `+91${cleanPhone}`,
    channel: "sms",
  });

return NextResponse.json({
  success: true,
  message: "OTP sent successfully",
  status: response.status,
});

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
