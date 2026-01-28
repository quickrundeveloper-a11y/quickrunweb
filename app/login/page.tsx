"use client";

import Image from "next/image";
import { Lexend } from "next/font/google";
import { useState } from "react";
import { openDB } from "idb";
import { useRouter } from "next/navigation";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [otpEnabled, setOtpEnabled] = useState<boolean>(false);
  const [snack, setSnack] = useState<string>("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [docId, setDocId] = useState<string>("");
  const [askName, setAskName] = useState<boolean>(false);

  const saveLoginToDB = async (uid: string, phone: string | null) => {
    const db = await openDB("QuickRunDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("user")) {
          db.createObjectStore("user");
        }
      },
    });

    await db.put("user", uid, "uid");
    await db.put("user", phone, "phone");


  };

  const sendOtp = async () => {
    if (phone.length !== 10) {
      setSnack("Please enter a valid 10-digit phone number");
      setTimeout(() => setSnack(""), 2000);
      return;
    }

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+91" + phone }),
      });

      const data = await res.json();

      if (data.success) {
        setOtpEnabled(true);
        setSnack("OTP Sent Successfully");
      } else {
        setSnack(data.message || "OTP send failed");
      }

      setTimeout(() => setSnack(""), 2000);
    } catch (err: any) {
      setSnack(err?.message || "OTP Send Error");
      setTimeout(() => setSnack(""), 2000);
    }
  };

  const verifyOtp = async () => {
    const otp = otpValues.join("");

    if (otp.length !== 6) {
      setSnack("Enter full OTP");
      setTimeout(() => setSnack(""), 2000);
      return;
    }

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+91" + phone, otp, name }),
      });

      const data = await res.json();

      if (data.success) {
        setDocId(data.customerId);

        if (data.newUser) {
          setAskName(true);
          return;
        }

        localStorage.setItem("currentUser", data.customerId);
        await saveLoginToDB(data.customerId, "+91" + phone);
        setSnack("Login successful!");
        router.push("/");
      } else {
        setSnack(data.message || "Invalid OTP");
      }

      setTimeout(() => setSnack(""), 2000);
    } catch (err) {
      setSnack("Invalid OTP");
      setTimeout(() => setSnack(""), 2000);
    }
  };

  const saveNameToDB = async () => {
    if (!name.trim()) {
      setSnack("Please enter your name");
      setTimeout(() => setSnack(""), 2000);
      return;
    }

    try {
      const res = await fetch("/api/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  customerId: docId,
  name,
  phone: "+91" + phone
}),

      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("currentUser", docId);
        await saveLoginToDB(docId, "+91" + phone);
        router.push("/");
      } else {
        setSnack(data.message || "Name update failed");
      }

      setTimeout(() => setSnack(""), 2000);
    } catch (err) {
      setSnack("Name update failed");
      setTimeout(() => setSnack(""), 2000);
    }
  };

  return (
    <div className={`${lexend.className} w-full h-screen flex items-center justify-center bg-background`}>
      <div className="w-[95%] h-[100%] bg-white dark:bg-gray-900 rounded-3xl overflow-hidden flex max-[600px]:flex-col border border-gray-200 dark:border-gray-700">

        {/* LEFT SECTION */}
        <div className="w-1/2 h-full relative flex items-center bg-white dark:bg-gray-900 max-[600px]:hidden">
          <div className="w-full h-[90%] px-6 py-10 relative flex justify-center">
            <Image
              src="/food_login2.png"
              alt="Food Banner"
              fill
              sizes="100vw"
              className="object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-black opacity-35 rounded-3xl"></div>
          </div>
          <div className="absolute bottom-20 left-10 text-white font-bold text-5xl leading-tight drop-shadow-xl">
            Get the food and grocery <br /> delivered in minutes.
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-1/2 h-full bg-white dark:bg-gray-900 px-20 py-30 flex flex-col relative max-[600px]:w-full max-[600px]:px-6 max-[600px]:py-10">
          <h1 className="text-5xl font-regular mb-4 max-[600px]:text-4xl text-gray-900 dark:text-gray-100">Get Started Now</h1>
          <p className="text-gray-500 dark:text-gray-400 font-light mb-10 max-[600px]:text-base">
            Please login into your account to continue
          </p>


          {askName && (
            <>
              <label className="text-sm font-light text-gray-700 dark:text-gray-300">Enter your name</label>
<div className="relative w-full">
 <input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full h-12 px-4 mt-2 mb-6 outline-none"
  placeholder="Full Name"
/>
</div>

              <button
                onClick={saveNameToDB}
                className="w-full bg-red-600 text-white py-4 rounded-lg text-lg font-semibold active:scale-95 transition"
              >
                SAVE NAME
              </button>
            </>
          )}

          {/* Phone number */}
          <label className="text-sm font-light text-gray-700 dark:text-gray-300">Phone number</label>
          <div className="relative w-full">
            <input
              type="text"
              maxLength={10}
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^0-9]/g, "").slice(-10))
              }
              className="border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full h-15 px-4 mt-2 mb-6 outline-none"
              placeholder="Enter phone number"
            />

            {phone.length > 0 && (
              <span
                onClick={sendOtp}
                className="absolute mb-4 right-4 inset-y-0 flex items-center text-blue-600 text-sm cursor-pointer"
              >
                Get OTP
              </span>
            )}
          </div>

          {otpEnabled && (
            <>
              {/* OTP */}
              <label className="text-sm font-light text-gray-700 dark:text-gray-300">OTP</label>
              <div className="flex gap-4 mt-2 mb-6 max-[600px]:gap-2">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={val}
                    onChange={(e) => {
                      const newOtp = [...otpValues];
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      newOtp[i] = v;
                      setOtpValues(newOtp);

                      // Auto shift to next
                      if (v && i < otpValues.length - 1) {
                        const nextBox = document.getElementById(`otp-${i + 1}`);
                        nextBox && nextBox.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpValues[i] && i > 0) {
                        const prevBox = document.getElementById(`otp-${i - 1}`);
                        prevBox && prevBox.focus();
                      }
                    }}
                    id={`otp-${i}`}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-14 h-14 rounded-lg text-center text-lg outline-none max-[600px]:w-10 max-[600px]:h-10"
                  />
                ))}
              </div>

              {/* Terms */}
              <div className="flex items-center gap-2 mb-18">
                <input
                  type="checkbox"
                  className="w-6 h-6 border border-[#8D8D8D] rounded-md cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Please accept our <strong>Terms & Condition</strong>
                </span>
              </div>
            </>
          )}

          {/* Login button */}
          {!askName && (
            <button
              onClick={verifyOtp}
              className="w-full bg-red-600 text-white py-4 rounded-lg text-lg font-semibold active:scale-95 transition"
            >
              LOG IN
            </button>
          )}

          {docId && (
            <div className="mt-4 text-black text-sm font-medium">
              Doc ID: {docId}
            </div>
          )}

          {snack && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg">
              {snack}
            </div>
          )}

          {/* QR Logo */}
          <Image
            src="/qr.png"
            alt="QR Logo"
            width={140}
            height={140}
            className="absolute bottom-6 right-6 opacity-40 max-[600px]:hidden"
          />
        </div>
      </div>
    </div>
  );
}
