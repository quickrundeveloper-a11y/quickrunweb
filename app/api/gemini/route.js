// app/api/gemini/route.js
import { NextResponse } from "next/server";
import { systemPrompt } from "./systemPrompt";

function truncateText(s, max = 3000) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    // Build final prompt: system prompt (few-shot) + user message
    // Truncate the systemPrompt to protect request size if needed
    const sys = truncateText(systemPrompt, 4500);
    const safeUser = truncateText(message, 1500);

    const finalPrompt = `${sys}\nUser: ${safeUser}\nAssistant:`;

    // Use a Cloud-supported model (adjust if needed)
    const model = "models/gemini-2.0-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // We send the system prompt + message as parts (preserves order)
          contents: [
            { parts: [{ text: finalPrompt }] }
          ],
          // optional: set maxOutputTokens or safety settings if your API supports
          // e.g. "maxOutputTokens": 512
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Return detailed info for debugging (you can remove details in prod)
      return NextResponse.json(
        { error: data.error?.message || "API error", details: data },
        { status: 500 }
      );
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply from model.";

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: (err && err.message) || "Server error", stack: err?.stack },
      { status: 500 }
    );
  }
}
