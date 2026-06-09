"use client";
import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { MessageCircle, ChevronRight, Zap, CheckCircle, MapPin, Send } from "lucide-react";
import { DEMO_MODE } from "@/lib/demo-data";

interface Conversation {
  id: string;
  camperId: string;
  camperName: string;
  camperInitial: string;
  jobType: string;
  jobId: string;
  status: "active" | "closed";
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  location: string;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    camperId: "demo-user-1",
    camperName: "Ola Omoriwo",
    camperInitial: "O",
    jobType: "Tent Setup",
    jobId: "demo-job-1",
    status: "active",
    lastMessage: "That's brilliant, thanks Chidi! Where exactly will the tent be pitched?",
    lastMessageTime: "2 min ago",
    unread: 1,
    location: "Section B, near Main Stage",
  },
  {
    id: "conv-2",
    camperId: "demo-user-2",
    camperName: "Marcus T.",
    camperInitial: "M",
    jobType: "Navigation Help",
    jobId: "demo-job-2",
    status: "active",
    lastMessage: "I'm near the food court in a yellow jacket. Can you find me?",
    lastMessageTime: "5 min ago",
    unread: 0,
    location: "Near food court, yellow jacket",
  },
  {
    id: "conv-3",
    camperId: "demo-user-3",
    camperName: "Priya S.",
    camperInitial: "P",
    jobType: "Tent Collection",
    jobId: "cj-1",
    status: "closed",
    lastMessage: "Thank you so much, you made leaving so much easier!",
    lastMessageTime: "Yesterday",
    unread: 0,
    location: "Water refill area",
  },
];

export default function AssistantMessagesPage() {
  const [conversations] = useState(DEMO_MODE ? DEMO_CONVERSATIONS : []);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [msgText, setMsgText] = useState("");
  const [messages, setMessages] = useState<{from:"me"|"them"; text:string; time:string}[]>([
    { from: "them", text: "That's brilliant, thanks Chidi! Where exactly will the tent be pitched?", time: "10:04 AM" },
    { from: "me", text: "I'll set it up in Section B, Row 3, about 200m from the Main Stage. Really good spot!", time: "10:06 AM" },
    { from: "them", text: "Perfect. Will you be around on site if I need any help once I arrive?", time: "10:08 AM" },
    { from: "me", text: "Absolutely! I'm your dedicated assistant for the weekend. Just message me anytime.", time: "10:09 AM" },
  ]);

  const sendMsg = () => {
    if (!msgText.trim()) return;
    setMessages(prev => [...prev, { from: "me", text: msgText.trim(), time: "Just now" }]);
    setMsgText("");
  };

  const active = conversations.filter(c => c.status === "active");
  const closed = conversations.filter(c => c.status === "closed");

  if (activeChat) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f7f8fa" }}>
        {/* Chat header */}
        <div className="page-header justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveChat(null)}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <ChevronRight size={18} className="text-gray-600 rotate-180" />
            </button>
            <div className="avatar avatar-md font-bold text-white text-[15px]"
              style={{ background: "linear-gradient(135deg, #ea580c, #c2410c)" }}>
              {activeChat.camperInitial}
            </div>
            <div>
              <p className="font-bold text-[14px]">{activeChat.camperName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-orange-500" />
                <p className="text-[11px] text-gray-500 truncate max-w-[180px]">{activeChat.location}</p>
              </div>
            </div>
          </div>
          <span className="badge badge-orange text-[11px]">
            <Zap size={10} /> {activeChat.jobType}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <p className="text-[11px] text-gray-400 font-medium">Today</p>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
              {msg.from === "them" && (
                <div className="avatar avatar-sm font-bold text-white text-[11px] mr-2 flex-shrink-0 mt-1"
                  style={{ background: "linear-gradient(135deg, #ea580c, #c2410c)" }}>
                  {activeChat.camperInitial}
                </div>
              )}
              <div>
                <div className={msg.from === "me"
                  ? "bubble-sent"
                  : "bubble-received"
                } style={msg.from === "me" ? { background: "linear-gradient(135deg, #ea580c, #c2410c)", boxShadow: "0 2px 8px rgba(234,88,12,0.2)" } : {}}>
                  {msg.text}
                </div>
                <p className={`text-[10px] text-gray-400 mt-1 ${msg.from === "me" ? "text-right" : "text-left"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input — NO Send Errand button */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
          style={{ background: "rgba(247,248,250,0.96)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-2xl px-4 py-3 text-[14px] border border-gray-200 bg-white focus:outline-none focus:border-orange-400"
              placeholder="Type a message…"
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMsg()}
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
            />
            <button
              onClick={sendMsg}
              disabled={!msgText.trim()}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #ea580c, #c2410c)", boxShadow: "0 3px 12px rgba(234,88,12,0.35)" }}>
              <Send size={16} className="text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="font-bold text-[17px]">Camper Messages</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Conversations linked to your active jobs</p>
        </div>
        {active.length > 0 && (
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: "#ea580c" }}>
            {active.length}
          </span>
        )}
      </div>

      <div className="px-4 pt-4 pb-2 space-y-4 animate-fade-in-up">

        {/* ── Active ── */}
        {active.length > 0 && (
          <div>
            <p className="section-title">Active Jobs</p>
            <div className="space-y-2">
              {active.map(conv => (
                <button key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className="card-hover w-full text-left flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="avatar avatar-md font-bold text-white text-[15px]"
                      style={{ background: "linear-gradient(135deg, #ea580c, #c2410c)" }}>
                      {conv.camperInitial}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-[13px] text-gray-900">{conv.camperName}</p>
                      <p className="text-[11px] text-gray-400">{conv.lastMessageTime}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="badge badge-orange text-[10px] px-1.5 py-0.5 inline-flex items-center gap-1">
                        <Zap size={9} /> {conv.jobType}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                        style={{ background: "#ea580c" }}>
                        {conv.unread}
                      </span>
                    )}
                    <ChevronRight size={15} className="text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Closed ── */}
        {closed.length > 0 && (
          <div>
            <p className="section-title">Completed Jobs</p>
            <div className="space-y-2">
              {closed.map(conv => (
                <div key={conv.id} className="card flex items-center gap-3" style={{ opacity: 0.55 }}>
                  <div className="avatar avatar-md font-bold text-white text-[15px] flex-shrink-0"
                    style={{ background: "#9ca3af" }}>
                    {conv.camperInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-[13px] text-gray-700">{conv.camperName}</p>
                      <p className="text-[11px] text-gray-400">{conv.lastMessageTime}</p>
                    </div>
                    <span className="badge badge-gray text-[10px] px-1.5 py-0.5 inline-flex items-center gap-1 mb-1">
                      <CheckCircle size={9} /> {conv.jobType} · Closed
                    </span>
                    <p className="text-[12px] text-gray-400 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty ── */}
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-gray-300" />
            </div>
            <p className="font-bold text-[15px] text-gray-700 mb-1">No conversations yet</p>
            <p className="text-[13px] text-gray-400 max-w-xs leading-relaxed">
              Conversations appear here when campers are assigned to you and their job is active.
            </p>
          </div>
        )}

      </div>

      <BottomNav role="assistant" />
    </div>
  );
}
