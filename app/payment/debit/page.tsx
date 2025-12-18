"use client";
import { useState } from "react";
import Image from "next/image";

export default function DebitCardPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCVV] = useState("");
  const [mm, setMM] = useState("");
  const [yy, setYY] = useState("");
  const [password, setPassword] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [cardError, setCardError] = useState("");

  return (
    <div className="bg-gradient-to-br from-white  flex items-center justify-center">

        {/* LEFT SIDE – FORM */}
        <div className="p-10 relative">
          {/* Branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center">
              <Image
                src="/qr2.png"
                alt="QuickRun Logo"
                width={58}
                height={58}
                className="object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">QuickRun</h1>
          </div>

          {/* Timer */}
          <div className="absolute top-10 right-10 flex gap-2">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-lg font-semibold">0</div>
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-lg font-semibold">1</div>
            <span className="text-gray-700 text-lg font-bold">:</span>
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-lg font-semibold">1</div>
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-lg font-semibold">9</div>
          </div>

          {/* Card Number */}
          <div className="mb-6">
            <label className="font-semibold text-gray-700">Card Number</label>
            <p className="text-sm text-gray-500 mb-2">
              Enter the 16 digit card number on the card
            </p>

            <div
              className={`flex items-center justify-between bg-gray-100 p-4 rounded-xl border ${
                cardError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <input
                type="text"
                placeholder="2412 - 7512 - 3412 - 3456"
                className="bg-transparent w-full outline-none text-gray-700"
                value={cardNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 16) value = value.slice(0, 16);
                  const formatted = value.replace(/(.{4})/g, "$1 ").trim();
                  setCardNumber(formatted);
                  if (value.length === 16) {
                    const bin = value.slice(0, 6);

                    fetch(`/api/binlookup?bin=${bin}`)
                      .then(res => res.json())
                      .then(data => {
                        const brand = data.scheme ? data.scheme.charAt(0).toUpperCase() + data.scheme.slice(1) : "";
                        const type = data.type || "";

                        setCardBrand(brand);

                        if (type === "debit") {
                          setCardError("");
                        } else if (type === "credit") {
                          setCardError("Credit cards are not allowed on this page.");
                        } else {
                          setCardError("Invalid or unsupported card.");
                        }
                      })
                      .catch(() => {
                        setCardBrand("");
                        setCardError("Card verification failed.");
                      });
                  } else {
                    setCardBrand("");
                    setCardError("");
                  }
                }}
              />
              <div className="h-7 w-10 bg-blue-100 rounded flex items-center justify-center text-blue-800 text-xs font-bold ml-2">
                {cardBrand ? cardBrand.charAt(0) : "?"}
              </div>
            </div>
            {cardError && (
              <p className="text-sm text-red-600 mt-1">{cardError}</p>
            )}
          </div>

          {/* CVV + Expiry */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-semibold text-gray-700">CVV Number</label>
              <p className="text-sm text-gray-500 mb-2">Enter the 3 or 4 digit number on the card</p>

              <input
                type="password"
                placeholder="***"
                maxLength={3}
                className="bg-gray-100 w-full p-4 rounded-xl border border-gray-200 outline-none text-gray-700"
                value={cvv}
                onChange={(e) => setCVV(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">Expiry Date</label>
              <p className="text-sm text-gray-500 mb-2">Enter the expiration date of the card</p>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="09"
                  maxLength={2}
                  className="bg-gray-100 w-1/2 p-4 rounded-xl border border-gray-200 outline-none text-gray-700"
                  value={mm}
                  onChange={(e) => setMM(e.target.value)}
                />
                <span className="flex items-center font-bold text-gray-700">/</span>
                <input
                  type="text"
                  placeholder="22"
                  maxLength={2}
                  className="bg-gray-100 w-1/2 p-4 rounded-xl border border-gray-200 outline-none text-gray-700"
                  value={yy}
                  onChange={(e) => setYY(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="font-semibold text-gray-700">Enter your name</label>
            <p className="text-sm text-gray-500 mb-2">Enter your name that is mentioned in the card</p>

            <input
              placeholder="Enter your name"
              className="bg-gray-100 w-full p-4 rounded-xl border border-gray-200 outline-none text-gray-700"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>

          {/* Pay Button */}
          <button className="w-full bg-blue-600 text-white py-4 rounded-xl mt-10 font-semibold text-center hover:bg-blue-700 transition">
            Pay Now
          </button>
        </div>

        {/* RIGHT SIDE – RECEIPT */}
        <div className="bg-gray p-10 flex flex-col items-center relative">
          {/* Fake Card */}
          <div className="relative bg-white shadow-md rounded-3xl p-6 w-64 h-80 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute -top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-br from-gray-200 to-gray-50"></div>
              <div className="absolute top-16 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-gray-100 to-gray-50"></div>
            </div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="w-10 h-8 bg-gray-300 rounded-md"></div>
              <div className="w-6 h-6 border-2 border-gray-400 rounded-full border-t-transparent"></div>
            </div>

            <div className="relative z-10">
              <p className="font-semibold text-gray-900 text-lg">{cardName || "Your Name"}</p>
              <p className="text-base text-gray-800 mt-2 tracking-widest">
                {cardNumber || "•••• •••• •••• ••••"}
              </p>
            </div>

            <div className="flex justify-between text-sm mt-8 relative z-10 px-1">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">VALID THRU</span>
                <span className="font-semibold text-gray-900 text-base">{mm || "MM"}/{yy || "YY"}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-gray-500 text-xs">CVV</span>
                <span className="font-semibold text-gray-900 text-base">{cvv || "***"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10 mb-2">
              <div className="h-6 w-6 bg-red-600 rounded-full opacity-90"></div>
              <div className="h-6 w-6 bg-yellow-400 rounded-full -ml-3 opacity-90"></div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="relative w-[270px] mt-4 mx-auto">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-26 h-3  bg-gray-300/60 rounded-b-2xl"></div>

            <div className="relative bg-[#eef2ff]/60 backdrop-blur-xl rounded-3xl px-5 pt-10 pb-10 border border-white/40 w-full min-h-[00px]">

              <div className="absolute -left-4 top-[54%] w-7 h-7 bg-[#ffffff] rounded-full"></div>
              <div className="absolute -right-4 top-[54%] w-7 h-7 bg-[#ffffff] rounded-full"></div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Company</span>
                  <span className="font-medium">Apple</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-medium">1266201</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Product</span>
                  <span className="font-medium">MacBook Air</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (20%)</span>
                  <span className="font-medium">$100.00</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4 flex justify-between items-center">
                <span className="text-gray-600">You have to Pay</span>
                <div className="text-right flex items-center gap-2">
                  <p className="text-2xl font-bold">549.99 USD</p>
                  <div className="w-6 h-6 bg-gray-300 rounded-md opacity-70"></div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
  );
}