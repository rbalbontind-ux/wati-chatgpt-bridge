{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import axios from "axios";\
\
const SYSTEM_PROMPT = `You are a concise, friendly fitness & food coach.`;\
\
export default async function handler(req, res) \{\
  if (req.method !== "POST") return res.status(405).json(\{ ok: false \});\
\
  try \{\
    const text = req.body?.text || "";\
    const waId = req.body?.waId || ""; // user's WhatsApp number\
\
    if (!text || !waId) \{\
      return res.status(200).json(\{ ok: true, note: "Empty or system webhook" \});\
    \}\
\
    // Ask ChatGPT\
    const ai = await axios.post("https://api.openai.com/v1/chat/completions", \{\
      model: "gpt-4o-mini",\
      messages: [\
        \{ role: "system", content: SYSTEM_PROMPT \},\
        \{ role: "user", content: text \}\
      ]\
    \},\{\
      headers: \{ Authorization: `Bearer $\{process.env.OPENAI_API_KEY\}` \}\
    \});\
\
    const reply = ai.data.choices[0].message.content.trim();\
\
    // Reply to user via Wati\
    await axios.post(`$\{process.env.WATI_BASE_URL\}/api/v1/sendSessionMessage`, \{\
      whatsappNumber: waId,\
      messageText: reply\
    \},\{\
      headers: \{ Authorization: `Bearer $\{process.env.WATI_API_KEY\}` \}\
    \});\
\
    res.status(200).json(\{ ok: true \});\
  \} catch (e) \{\
    console.error("Error:", e.message);\
    res.status(200).json(\{ ok: false, error: "processing_failed" \});\
  \}\
\}\
}