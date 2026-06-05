"use client";
import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { ArrowLeft, Send, ShoppingBag, MapPin, CheckCircle, Mic, Paperclip } from "lucide-react";

const GUIDE = { name: "Chidi Musa", rating: 4.9, jobs: 62, avatar: "C", status: "online" };

const INIT_MESSAGES = [
  { id: 1, from: "guide", text: "Hey! I'm your assigned camp assistant. Let me know if you need anything.", time: "10:02" },
  { id: 2, from: "me", text: "Hi Chidi! Can you help me find the jazz tent later?", time: "10:04" },
  { id: 3, from: "guide", text: "Of course! I can walk you there or you can use the map tab to navigate yourself. Just let me know which you prefer 😊", time: "10:05" },
];

const ERRAND_TEMPLATES = [
  { emoji: "🍕", label: "Get food", desc: "Send guide to pick up food for you" },
  { emoji: "🍺", label: "Get drinks", desc: "Send guide to get drinks from a bar" },
  { emoji: "🛒", label: "Pick up item", desc: "Any item from any vendor on site" },
  { emoji: "💊", label: "Get supplies", desc: "Toiletries, phone charger, etc." },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [showErrand, setShowErrand] = useState(false);
  const [errandStep, setErrandStep] = useState<"choose"|"detail"|"sent">("choose");
  const [errandType, setErrandType] = useState<any>(null);
  const [errandDetail, setErrandDetail] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { id: Date.now(), from: "me", text: input, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now() + 1, from: "guide", text: "Got it! I'll get on that right away.", time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
  };

  const sendErrand = () => {
    if (!errandDetail.trim()) return;
    setMessages(m => [...m,
      { id: Date.now(), from: "me", text: `${errandType.emoji} Errand request: ${errandDetail}`, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setErrandStep("sent");
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now() + 1, from: "guide", text: "On it! I am heading there now. I will let you know when I am on my way back to you.", time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1500);
  };

  if (showErrand && errandStep === "sent") return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => { setShowErrand(false); setErrandStep("choose"); }} className="text-gray-500 bg-none border-none cursor-pointer"><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">Errand Sent</h1>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-600" /></div>
        <h2 className="text-xl font-bold mb-2">Errand Request Sent! 🏃</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">Chidi has accepted your errand and is heading to get it now.</p>
        <div className="card w-full max-w-xs text-left mb-6">
          <p className="text-xs text-gray-400 mb-1">Your errand</p>
          <p className="font-semibold text-sm">{errandType?.emoji} {errandDetail}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-green-600 font-semibold">Chidi is on his way</p>
          </div>
        </div>
        <button onClick={() => { setShowErrand(false); setErrandStep("choose"); setErrandDetail(""); setErrandType(null); }} className="btn-primary max-w-xs">Back to Chat</button>
      </div>
      <BottomNav role="camper" />
    </div>
  );

  if (showErrand) return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => { setShowErrand(false); setErrandStep("choose"); }} className="text-gray-500 bg-none border-none cursor-pointer"><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">Send an Errand</h1>
      </div>
      <div className="px-4 py-5 pb-24">
        {errandStep === "choose" ? (
          <>
            <p className="text-sm text-gray-500 mb-4">What do you need? Your guide will pick it up and bring it to you.</p>
            <div className="grid grid-cols-2 gap-3">
              {ERRAND_TEMPLATES.map(e => (
                <button key={e.label} onClick={() => { setErrandType(e); setErrandStep("detail"); }}
                  className="card text-left cursor-pointer hover:border-primary-300 transition-colors border-none" style={{ border: "1px solid #e5e7eb" }}>
                  <span className="text-3xl block mb-2">{e.emoji}</span>
                  <p className="font-bold text-sm text-gray-900">{e.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.desc}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5 p-3 bg-primary-50 rounded-2xl">
              <span className="text-2xl">{errandType?.emoji}</span>
              <div>
                <p className="font-bold text-sm">{errandType?.label}</p>
                <p className="text-xs text-gray-500">{errandType?.desc}</p>
              </div>
            </div>
            <label className="block text-sm font-bold text-gray-900 mb-2">What exactly do you need?</label>
            <textarea className="input resize-none mb-3" rows={3}
              placeholder={`e.g. A large pepperoni pizza from Pizza Republic, and 2 cans of Coke`}
              value={errandDetail} onChange={e => setErrandDetail(e.target.value)} />
            <label className="block text-sm font-bold text-gray-900 mb-2">Where should they bring it?</label>
            <input className="input mb-4" placeholder="e.g. My tent, section B, near main stage" />
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-4">
              <p className="text-xs text-yellow-800 font-semibold">💡 Important</p>
              <p className="text-xs text-yellow-700 mt-1">You pay the vendor directly when your guide returns. The guide does not handle payment. A small errand fee applies.</p>
            </div>
            <button className="btn-primary" disabled={!errandDetail.trim()} onClick={sendErrand}>Send Errand to Chidi</button>
          </>
        )}
      </div>
      <BottomNav role="camper" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="page-header justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm">{GUIDE.avatar}</div>
          <div>
            <p className="font-bold text-sm text-gray-900">{GUIDE.name}</p>
            <p className="text-xs text-green-500 font-medium">● Online · Your camp guide</p>
          </div>
        </div>
        <button onClick={() => setShowErrand(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white border-none cursor-pointer"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
          <ShoppingBag size={13} /> Send Errand
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 pb-28 space-y-3 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            {msg.from === "guide" && (
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 mr-2 flex-shrink-0 mt-0.5">C</div>
            )}
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.from === "me"
                ? "text-white rounded-br-sm"
                : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
            }`} style={msg.from === "me" ? { background: "linear-gradient(135deg, #16a34a, #15803d)" } : {}}>
              {msg.text}
              <p className={`text-[10px] mt-1 ${msg.from === "me" ? "text-white/60" : "text-gray-400"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center text-gray-400 flex-shrink-0">
            <Paperclip size={18} />
          </button>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none"
            placeholder="Message Chidi..." />
          {input.trim() ? (
            <button onClick={send} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
              <Send size={15} className="text-white" />
            </button>
          ) : (
            <button className="w-9 h-9 flex items-center justify-center text-gray-400 flex-shrink-0">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
