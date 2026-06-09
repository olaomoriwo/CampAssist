"use client";
import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { MessageCircle, ChevronRight, HelpCircle, Clock, CheckCircle, Zap } from "lucide-react";
import { DEMO_MODE } from "@/lib/demo-data";

const DEMO_CONVERSATIONS = [
  {
    id: "conv-1",
    assistantId: "demo-assistant-1",
    assistantName: "Chidi Musa",
    assistantInitial: "C",
    assistantColor: "#16a34a",
    jobType: "Tent Setup",
    status: "active" as const,
    lastMessage: "I'm on my way — should be with you in about 5 minutes!",
    lastMessageTime: "2 min ago",
    unread: 2,
  },
  {
    id: "conv-2",
    assistantId: "demo-assistant-2",
    assistantName: "Amara Lewis",
    assistantInitial: "A",
    assistantColor: "#7c3aed",
    jobType: "Navigation Help",
    status: "closed" as const,
    lastMessage: "Glad I could help you find the Jazz tent. Enjoy the show!",
    lastMessageTime: "Yesterday",
    unread: 0,
  },
];

export default function CamperMessagesPage() {
  const [conversations] = useState(DEMO_MODE ? DEMO_CONVERSATIONS : []);

  const active = conversations.filter(c => c.status === "active");
  const closed = conversations.filter(c => c.status === "closed");

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="font-bold text-[17px]">Messages</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Active assistant conversations only</p>
        </div>
        {active.length > 0 && (
          <span className="w-6 h-6 rounded-full bg-green-600 text-white text-[11px] font-bold flex items-center justify-center">
            {active.length}
          </span>
        )}
      </div>

      <div className="px-4 pt-4 pb-2 space-y-4 animate-fade-in-up">

        {/* ── Get Assistance CTA ── */}
        <Link href="/request-help"
          className="block rounded-2xl p-4 transition-all active:scale-97"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 4px 18px rgba(22,163,74,0.28)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-[15px]">Get Assistance</p>
              <p className="text-white/70 text-[12px] mt-0.5">Request a camp assistant right now</p>
            </div>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <HelpCircle size={20} className="text-white" />
            </div>
          </div>
        </Link>

        {/* ── Active Conversations ── */}
        {active.length > 0 && (
          <div>
            <p className="section-title">Active Chats</p>
            <div className="space-y-2">
              {active.map(conv => (
                <Link key={conv.id} href={`/messages/${conv.id}`}
                  className="card-hover flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="avatar avatar-md font-bold text-white text-[15px]"
                      style={{ background: `linear-gradient(135deg, ${conv.assistantColor}, ${conv.assistantColor}cc)` }}>
                      {conv.assistantInitial}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-[13px] text-gray-900">{conv.assistantName}</p>
                      <p className="text-[11px] text-gray-400">{conv.lastMessageTime}</p>
                    </div>
                    <div className="mb-1">
                      <span className="badge badge-green text-[10px] px-1.5 py-0.5 inline-flex items-center gap-1">
                        <Zap size={9} /> {conv.jobType}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                  {/* Unread + chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                    <ChevronRight size={15} className="text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Closed Conversations ── */}
        {closed.length > 0 && (
          <div>
            <p className="section-title">Past Conversations</p>
            <div className="space-y-2">
              {closed.map(conv => (
                <div key={conv.id} className="card flex items-center gap-3"
                  style={{ opacity: 0.55 }}>
                  <div className="avatar avatar-md font-bold text-white text-[15px] flex-shrink-0"
                    style={{ background: "#9ca3af" }}>
                    {conv.assistantInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-[13px] text-gray-700">{conv.assistantName}</p>
                      <p className="text-[11px] text-gray-400">{conv.lastMessageTime}</p>
                    </div>
                    <div className="mb-1">
                      <span className="badge badge-gray text-[10px] px-1.5 py-0.5 inline-flex items-center gap-1">
                        <CheckCircle size={9} /> {conv.jobType} · Closed
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-400 truncate">{conv.lastMessage}</p>
                  </div>
                  <Clock size={14} className="text-gray-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-gray-300" />
            </div>
            <p className="font-bold text-[15px] text-gray-700 mb-1">No conversations yet</p>
            <p className="text-[13px] text-gray-400 max-w-xs leading-relaxed mb-6">
              When you request an assistant, your chat with them will appear here. Only active jobs stay open.
            </p>
            <Link href="/request-help" className="btn-primary max-w-xs">
              Request Your First Assistant
            </Link>
          </div>
        )}

      </div>

      <BottomNav role="camper" />
    </div>
  );
}
