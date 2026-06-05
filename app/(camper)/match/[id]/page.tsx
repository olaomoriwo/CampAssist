"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { ArrowLeft, Send, Video, Phone, Image as ImageIcon, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";

const MATCHED: Record<string, any> = {
  m1: { name: "Priya S.", nick: "Moonbloom", emoji: "🧚", age: 24, photo: "P", bio: "Festival photographer who loves jazz and bad puns.", ig: "@priya.festivals" },
  m2: { name: "Marcus T.", nick: "Emberclaw", emoji: "🐉", age: 27, photo: "M", bio: "Electronic music addict and adventure seeker.", ig: "@marcusatfestivals" },
};

const INIT_MSGS = [
  { id: 1, from: "them", text: "Hey! I cannot believe we matched! 💖", time: "16:00" },
  { id: 2, from: "me", text: "Haha same! I recognised you from the jazz tent 😄", time: "16:01" },
  { id: 3, from: "them", text: "Wait — you were there too?! Small world. Are you heading back tonight?", time: "16:02" },
];

export default function MatchChatPage() {
  const params = useParams();
  const person = MATCHED[(params.id as string) || "m1"] || MATCHED.m1;
  const [msgs, setMsgs] = useState(INIT_MSGS);
  const [input, setInput] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [videoState, setVideoState] = useState({ mic: true, cam: true });

  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { id: Date.now(), from: "me", text: input, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
    setTimeout(() => {
      setMsgs(m => [...m, { id: Date.now() + 1, from: "them", text: "That sounds amazing! Let us meet at the main stage entrance at 8pm?", time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1500);
  };

  if (showVideo) return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0f0f" }}>
      {/* Remote video (mock) */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-pink-800 flex items-center justify-center text-4xl mb-4">{person.emoji}</div>
            <p className="text-white font-bold text-lg">{person.name}</p>
            <p className="text-gray-400 text-sm mt-1">00:42</p>
          </div>
        </div>
        {/* Self preview */}
        <div className="absolute top-4 right-4 w-24 h-32 rounded-2xl bg-gray-800 flex items-center justify-center border-2 border-white/20">
          {videoState.cam ? (
            <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center font-bold text-white">O</div>
          ) : (
            <VideoOff size={20} className="text-gray-400" />
          )}
        </div>
        {/* Signal strength */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Video controls */}
      <div className="px-6 pb-10 pt-6" style={{ background: "#1a1a1a" }}>
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => setVideoState(s => ({ ...s, mic: !s.mic }))}
            className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-none"
            style={{ background: videoState.mic ? "rgba(255,255,255,0.1)" : "#ef4444" }}>
            {videoState.mic ? <Mic size={22} className="text-white" /> : <MicOff size={22} className="text-white" />}
          </button>
          <button onClick={() => setShowVideo(false)}
            className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-none"
            style={{ background: "#ef4444" }}>
            <PhoneOff size={26} className="text-white" />
          </button>
          <button onClick={() => setVideoState(s => ({ ...s, cam: !s.cam }))}
            className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-none"
            style={{ background: videoState.cam ? "rgba(255,255,255,0.1)" : "#ef4444" }}>
            {videoState.cam ? <Video size={22} className="text-white" /> : <VideoOff size={22} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="page-header justify-between" style={{ background: "linear-gradient(135deg, #fce7f3, #fff)" }}>
        <div className="flex items-center gap-3">
          <Link href="/match" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600">{person.photo}</div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#db2777" }}>{person.name}</p>
            <p className="text-xs text-gray-400">Matched · {person.ig}</p>
          </div>
        </div>
        <button onClick={() => setShowVideo(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
          style={{ background: "linear-gradient(135deg, #ec4899, #db2777)" }}>
          <Video size={16} className="text-white" />
        </button>
      </div>

      {/* Profile banner */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#fdf2f8" }}>
        <div className="text-2xl">{person.emoji}</div>
        <div>
          <p className="text-xs font-semibold text-gray-800">{person.name} · Age {person.age}</p>
          <p className="text-xs text-gray-500">{person.bio}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 pb-28 space-y-3 overflow-y-auto">
        {msgs.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            {msg.from === "them" && (
              <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5 font-bold text-pink-600">{person.photo}</div>
            )}
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "me" ? "text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"}`}
              style={msg.from === "me" ? { background: "linear-gradient(135deg, #ec4899, #db2777)" } : {}}>
              {msg.text}
              <p className={`text-[10px] mt-1 ${msg.from === "me" ? "text-white/60" : "text-gray-400"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center text-gray-400"><ImageIcon size={18} /></button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none"
            placeholder={`Message ${person.name}...`} />
          <button onClick={send} disabled={!input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #ec4899, #db2777)" }}>
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
