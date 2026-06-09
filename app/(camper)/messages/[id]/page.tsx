"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Send, HelpCircle, Phone, Info } from "lucide-react";
import { DEMO_MODE } from "@/lib/demo-data";

interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

const DEMO_MESSAGES: Message[] = [
  { id: "m1", from: "them", text: "Hi! I'm Chidi, your assigned camp assistant. I can see you've booked the Buddy Duo tent — I'll have it all set up for you before you arrive.", time: "10:02 AM" },
  { id: "m2", from: "me",   text: "That's brilliant, thanks Chidi! Where exactly will the tent be pitched?", time: "10:04 AM" },
  { id: "m3", from: "them", text: "I'll set it up in Section B, Row 3, about 200m from the Main Stage. Really good spot — sheltered and close to the food court.", time: "10:06 AM" },
  { id: "m4", from: "me",   text: "Perfect. Will you be around on site if I need any help once I arrive?", time: "10:08 AM" },
  { id: "m5", from: "them", text: "Absolutely! I'm your dedicated assistant for the weekend. Just message me anytime or tap Get Assistance from the app.", time: "10:09 AM" },
  { id: "m6", from: "them", text: "I'm on my way — should be with you in about 5 minutes!", time: "2 min ago" },
];

export default function CamperChatPage() {
  const [messages, setMessages] = useState<Message[]>(DEMO_MODE ? DEMO_MESSAGES : []);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg: Message = { id: `m-${Date.now()}`, from: "me", text: text.trim(), time: "Just now" };
    setMessages(prev => [...prev, msg]);
    setText("");
    setSending(true);
    // Demo: auto-reply after 1.5s
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `m-${Date.now()}-r`,
        from: "them",
        text: "Got it! I'll sort that for you right away.",
        time: "Just now",
      }]);
      setSending(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f7f8fa" }}>
      {/* Header */}
      <div className="page-header justify-between">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <ChevronLeft size={18} className="text-gray-600" />
          </Link>
          <div className="relative">
            <div className="avatar avatar-md font-bold text-white text-[15px]"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>C</div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div>
            <p className="font-bold text-[14px]">Chidi Musa</p>
            <p className="text-[11px] text-green-600 font-medium">Active · Tent Setup</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <Phone size={15} className="text-gray-500" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <Info size={15} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Get Assistance Banner ── */}
      <Link href="/request-help"
        className="mx-4 mt-3 flex items-center justify-between rounded-2xl px-4 py-3 transition-all active:scale-97"
        style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 3px 14px rgba(22,163,74,0.28)" }}>
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-white" />
          <p className="text-white font-bold text-[13px]">Get Assistance</p>
        </div>
        <p className="text-white/70 text-[11px]">Request new help →</p>
      </Link>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-36">
        {/* Date separator */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-gray-200" />
          <p className="text-[11px] text-gray-400 font-medium">Today</p>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {messages.map((msg, i) => (
          <div key={msg.id}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${i * 30}ms` }}>
            {msg.from === "them" && (
              <div className="avatar avatar-sm font-bold text-white text-[11px] mr-2 flex-shrink-0 mt-1"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>C</div>
            )}
            <div>
              <div className={msg.from === "me" ? "bubble-sent" : "bubble-received"}>
                {msg.text}
              </div>
              <p className={`text-[10px] text-gray-400 mt-1 ${msg.from === "me" ? "text-right" : "text-left"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="avatar avatar-sm font-bold text-white text-[11px] mr-2 flex-shrink-0 mt-1"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>C</div>
            <div className="bubble-received flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animation: "pulseGlow 1s ease infinite" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animation: "pulseGlow 1s ease 0.2s infinite" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animation: "pulseGlow 1s ease 0.4s infinite" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{ background: "rgba(247,248,250,0.96)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <input
            className="flex-1 rounded-2xl px-4 py-3 text-[14px] border border-gray-200 bg-white focus:outline-none focus:border-green-400"
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 3px 12px rgba(22,163,74,0.35)" }}>
            <Send size={16} className="text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
