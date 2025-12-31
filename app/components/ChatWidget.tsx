// app/components/QuickRunChatWidget.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_URL = "/logo.png";

type Msg = {
  id: string;
  from: "user" | "bot" | "system";
  text: string;
};

// ⭐ FIX 1 — Add type for onClose (build error fix)
export default function QuickRunChatWidget({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ⭐ FIX 2 — Explicitly type recognitionRef (to avoid TS build warning)
  const recognitionRef = useRef<any>(null);

  /* ---------------- INITIAL BOT MESSAGE ---------------- */
  useEffect(() => {
    setMessages([
      {
        id: "m0",
        from: "system",
        text: "Hi — I'm QuickRun Assistant. How can I help you today?",
      },
    ]);
  }, []);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ---------------- VOICE SETUP ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const win: any = window;
    const SpeechRecognition =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript;
      if (text) setInput((prev) => (prev ? prev + " " + text : text));
    };

    recognitionRef.current = rec;

    return () => rec.stop();
  }, []);

  /* ---------------- ADD MESSAGE ---------------- */
  function addMessage(msg: Msg) {
    setMessages((m) => [...m, msg]);
  }

  /* ---------------- SEND MESSAGE ---------------- */
  async function sendMessage() {
    if (!input.trim() || loading) return;

    const text = input.trim();

    addMessage({
      id: Date.now().toString(),
      from: "user",
      text,
    });

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({
        error: "Invalid response",
      }));

      const reply =
        data.reply ||
        data.message ||
        data.text ||
        data.error ||
        "Sorry, I couldn't process that.";

      addMessage({
        id: "bot_" + Date.now(),
        from: "bot",
        text: reply,
      });
    } catch (err: any) {
      addMessage({
        id: "err_" + Date.now(),
        from: "bot",
        text: "Network error: " + err.message,
      });
    }

    setLoading(false);
  }

  /* ---------------- VOICE CONTROL ---------------- */
  function startListening() {
    try {
      recognitionRef.current?.start();
    } catch {}
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch {}
  }

  /* ---------------- UI ---------------- */
  return (
    <div
      className="
        w-[350px]
        h-[550px]
        bg-white dark:bg-gray-800
        rounded-2xl
        shadow-xl
        border border-gray-200 dark:border-gray-700
        p-4
        fixed
        bottom-10
        right-10
        z-[9999]
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="QuickRun"
            className="w-10 h-10 rounded-full shadow"
          />
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">QuickRun Assistant</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Ask anything, I'm here.</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      {/* MESSAGES */}
      <div className="rounded-xl p-3 overflow-y-auto h-[400px] bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className={`flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2 rounded-2xl text-sm shadow ${
                    msg.from === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : msg.from === "system"
                      ? "bg-yellow-50 dark:bg-yellow-900/30 text-gray-800 dark:text-yellow-200"
                      : "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
                <div className="text-sm text-gray-500 dark:text-gray-400">Assistant typing...</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={scrollRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />

         
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          disabled={loading}
          className={`px-5 py-3 rounded-full font-semibold shadow-md ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {loading ? "…" : "Send"}
        </motion.button>
      </div>
    </div>
  );
}
