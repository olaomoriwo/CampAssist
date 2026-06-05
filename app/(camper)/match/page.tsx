"use client";
import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { ArrowLeft, Heart, X, Star, Lock, Shield } from "lucide-react";

const PROFILES = [
  { id: "m1", nick: "Moonbloom", emoji: "🧚", group: "The Enchanted Forest", age: 24, bio: "Festival photographer. Love jazz and bad puns. Always up for an adventure after midnight.", interests: ["Jazz", "Photography", "Night walks"], vibe: "Adventurous" },
  { id: "m2", nick: "Emberclaw", emoji: "🐉", group: "House of Flames", age: 27, bio: "I find the electronic arena and I do not leave. Come find me if you dare.", interests: ["Electronic", "Dancing", "Food runs"], vibe: "Wild" },
  { id: "m3", nick: "Nebulashift", emoji: "🌙", group: "Lunar Collective", age: 22, bio: "Stargaze with me. Talk about everything and nothing. Sunset chasers only.", interests: ["Stargazing", "Chill vibes", "Good conversations"], vibe: "Thoughtful" },
  { id: "m4", nick: "Mosswhisper", emoji: "🌿", group: "The Golden Grove", age: 25, bio: "Barefoot in the grass, heart in the music. Homemade lemonade and main stage front row.", interests: ["Nature", "Live music", "Lemonade"], vibe: "Grounded" },
];

export default function MatchPage() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [dob, setDob] = useState("");
  const [ageError, setAgeError] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [passed, setPassed] = useState<string[]>([]);
  const [matched, setMatched] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  const verifyAge = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) { setAgeError("You must be 18 or over to use this feature."); return; }
    setAgeVerified(true);
  };

  const like = () => {
    const p = PROFILES[cardIndex];
    setLiked(l => [...l, p.id]);
    if (cardIndex === 1) { setMatched(p.id); setShowMatch(true); }
    setCardIndex(i => i + 1);
  };

  const pass = () => {
    setPassed(l => [...l, PROFILES[cardIndex].id]);
    setCardIndex(i => i + 1);
  };

  const remaining = PROFILES.filter((_, i) => i >= cardIndex);

  if (!ageVerified) return (
    <div className="page-container">
      <div className="page-header">
        <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
        <h1 className="font-bold text-lg">CampMatch</h1>
      </div>
      <div className="px-6 py-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6" style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }}>💖</div>
        <h2 className="text-2xl font-bold mb-2">CampMatch</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">Meet fellow campers from anonymous groups. Your identity stays masked until you both match.</p>
        <div className="w-full max-w-xs space-y-4">
          <div className="flex items-start gap-3 text-left bg-pink-50 rounded-2xl p-4">
            <Lock size={16} className="text-pink-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-pink-700">Your real name, photo and details are only revealed <strong>after a mutual match</strong>. You are seen only by your group nickname until then.</p>
          </div>
          <div className="flex items-start gap-3 text-left bg-amber-50 rounded-2xl p-4">
            <Shield size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">This feature is for adults only. Please confirm your date of birth to continue.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 text-left">Date of birth</label>
            <input type="date" className="input" value={dob} onChange={e => { setDob(e.target.value); setAgeError(""); }} />
            {ageError && <p className="text-xs text-red-500 mt-1">{ageError}</p>}
          </div>
          <button className="btn-primary" style={{ background: "linear-gradient(135deg, #ec4899, #db2777)" }} disabled={!dob} onClick={verifyAge}>
            I confirm I am 18+ · Continue
          </button>
        </div>
      </div>
      <BottomNav role="camper" />
    </div>
  );

  if (showMatch && matched) {
    const p = PROFILES.find(x => x.id === matched)!;
    return (
      <div className="page-container">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "linear-gradient(160deg, #fce7f3, #ede9fe, #dbeafe)" }}>
          <div className="text-6xl mb-4 animate-bounce">💖</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#db2777" }}>It is a Match!</h1>
          <p className="text-gray-600 text-sm mb-6">You and {p.nick} both liked each other. Your real identities are now revealed.</p>
          <div className="flex gap-4 mb-8">
            {["You", p.nick].map((name, i) => (
              <div key={name} className="w-20 h-20 rounded-full flex items-center justify-center text-2xl" style={{ background: i === 0 ? "#dcfce7" : "#fce7f3", border: "3px solid white", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}>
                {i === 0 ? "O" : p.emoji}
              </div>
            ))}
          </div>
          <div className="card w-full max-w-xs mb-6 text-left">
            <p className="text-xs text-gray-400 mb-2">Real identity revealed</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-lg">{p.emoji}</div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#db2777" }}>Their name: Hidden until you chat</p>
                <p className="text-xs text-gray-500">Tap Start Chatting to see their full profile</p>
              </div>
            </div>
          </div>
          <Link href={`/match/${matched}`} className="btn-primary max-w-xs w-full block text-center mb-3" style={{ background: "linear-gradient(135deg, #ec4899, #db2777)" }}>
            Start Chatting
          </Link>
          <button onClick={() => setShowMatch(false)} className="text-sm text-gray-400">Maybe later</button>
        </div>
      </div>
    );
  }

  if (remaining.length === 0) return (
    <div className="page-container">
      <div className="page-header">
        <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
        <h1 className="font-bold text-lg">CampMatch</h1>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2">You have seen everyone!</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">Check back as more campers join groups and unlock matching.</p>
        <Link href="/groups" className="btn-primary max-w-xs w-full block text-center">Explore More Groups</Link>
      </div>
      <BottomNav role="camper" />
    </div>
  );

  const card = remaining[0];

  return (
    <div className="page-container" style={{ background: "linear-gradient(180deg, #fdf2f8, #f9fafb)" }}>
      <div className="page-header">
        <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
        <h1 className="font-bold text-lg">CampMatch</h1>
        <span className="ml-auto text-xs text-gray-400">{PROFILES.length - cardIndex} profiles left</span>
      </div>
      <div className="px-4 py-4 pb-24">
        {/* Profile card */}
        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ background: "#fff" }}>
          <div className="h-48 flex items-center justify-center text-7xl" style={{ background: `linear-gradient(135deg, #fce7f3, #ede9fe)` }}>
            {card.emoji}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#db2777" }}>{card.nick}</h2>
                <p className="text-sm text-gray-500">Age {card.age} · From {card.group}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#fce7f3", color: "#db2777" }}>{card.vibe}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{card.bio}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {card.interests.map((i: string) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{i}</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <Lock size={11} className="text-gray-300" />
              <span className="text-xs text-gray-400">Real identity hidden until mutual match</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <button onClick={pass}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-md border border-gray-200 bg-white cursor-pointer"
            style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
            <X size={28} className="text-gray-400" />
          </button>
          <button onClick={like}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg cursor-pointer border-none"
            style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", boxShadow: "0 6px 20px rgba(236, 72, 153, 0.4)" }}>
            <Heart size={32} className="text-white fill-white" />
          </button>
          <button className="w-16 h-16 rounded-full flex items-center justify-center shadow-md bg-white border border-gray-200 cursor-pointer">
            <Star size={24} className="text-yellow-400 fill-yellow-400" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">Pass · Like · Super Like</p>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
