"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { ArrowLeft, Send, Lock, Users } from "lucide-react";

const GROUPS: Record<string, any> = {
  g1: { name: "The Enchanted Forest", emoji: "🧚", color: "#8b5cf6", bg: "#f3e8ff", myNick: "Petal Whisper" },
  g2: { name: "House of Flames", emoji: "🐉", color: "#dc2626", bg: "#fee2e2", myNick: "Emberclaw" },
  g3: { name: "Lunar Collective", emoji: "🌙", color: "#1d4ed8", bg: "#dbeafe", myNick: "Nebulashift" },
};

const INIT: Record<string, any[]> = {
  g1: [
    { id: 1, nick: "Moonbloom", text: "Anyone heading to the main stage later? 🎵", time: "14:20" },
    { id: 2, nick: "Dewdancer", text: "Yes! Meeting at the water refill point at 7pm ✨", time: "14:21" },
    { id: 3, nick: "Thistlewind", text: "I am in! See you all there 🧚", time: "14:22" },
  ],
  g3: [
    { id: 1, nick: "Voidwalker", text: "Electronic arena opens at 10pm tonight 🌙", time: "15:00" },
    { id: 2, nick: "Cometfall", text: "Already there! The queue is not too bad yet", time: "15:05" },
  ],
};

export default function GroupChatPage() {
  const params = useParams();
  const id = (params.id as string) || "g1";
  const group = GROUPS[id] || GROUPS.g1;
  const [msgs, setMsgs] = useState<any[]>(INIT[id] || INIT.g1);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { id: Date.now(), nick: group.myNick, text: input, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), isMe: true }]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="page-header justify-between">
        <div className="flex items-center gap-3">
          <Link href="/groups" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl" style={{ background: group.bg }}>{group.emoji}</div>
          <div>
            <p className="font-bold text-sm">{group.name}</p>
            <p className="text-xs flex items-center gap-1" style={{ color: group.color }}>
              <Lock size={9} /> You are: {group.myNick}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Users size={13} />
          <span>24</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-28 space-y-3 overflow-y-auto">
        <div className="text-center">
          <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">Identities are masked · Be kind</span>
        </div>
        {msgs.map(msg => (
          <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
            {!msg.isMe && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: group.bg }}>
                {group.emoji}
              </div>
            )}
            <div className={`max-w-[75%]`}>
              {!msg.isMe && <p className="text-[10px] font-semibold mb-1 ml-1" style={{ color: group.color }}>{msg.nick}</p>}
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.isMe ? "text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"}`}
                style={msg.isMe ? { background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)` } : {}}>
                {msg.text}
                <p className={`text-[10px] mt-1 ${msg.isMe ? "text-white/60" : "text-gray-400"}`}>{msg.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-base">{group.emoji}</div>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none"
            placeholder={`Message as ${group.myNick}...`} />
          <button onClick={send} disabled={!input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)` }}>
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
