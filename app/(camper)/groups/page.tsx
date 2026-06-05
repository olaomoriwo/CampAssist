"use client";
import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { ArrowLeft, Plus, Users, Lock, Sparkles } from "lucide-react";

const DEMO_GROUPS = [
  { id: "g1", name: "The Enchanted Forest", theme: "Fairy", emoji: "🧚", members: 24, description: "A group of festival fairies. We move together, we shine together.", color: "#8b5cf6", bg: "#f3e8ff", tag: "Fantasy" },
  { id: "g2", name: "House of Flames", theme: "Dragon", emoji: "🐉", members: 18, description: "Bold, loud, unapologetically alive. Come if you can handle the heat.", color: "#dc2626", bg: "#fee2e2", tag: "Adventure" },
  { id: "g3", name: "Lunar Collective", theme: "Space", emoji: "🌙", members: 31, description: "Night owls and star gazers. We come alive after dark.", color: "#1d4ed8", bg: "#dbeafe", tag: "Night Life" },
  { id: "g4", name: "The Golden Grove", theme: "Nature Spirit", emoji: "🌿", members: 15, description: "Earth energy only. Barefoot, free, connected.", color: "#16a34a", bg: "#dcfce7", tag: "Chill" },
  { id: "g5", name: "Neon Rebellion", theme: "Cyberpunk", emoji: "⚡", members: 42, description: "We are the glitch in the matrix. Find us at the electronic arena.", color: "#0891b2", bg: "#e0f2fe", tag: "Electronic" },
];

const NICKNAME_PREVIEW: Record<string, string[]> = {
  g1: ["Petal Whisper", "Moonbloom", "Dewdancer", "Thistlewind"],
  g2: ["Emberclaw", "Ashroar", "Cinderscale", "Flamewing"],
  g3: ["Nebulashift", "Voidwalker", "Starweave", "Cometfall"],
  g4: ["Mosswhisper", "Rootsong", "Ferngleam", "Willowsigh"],
  g5: ["Neonpulse", "Glitchrunner", "Voltage", "Datadrift"],
};

export default function GroupsPage() {
  const [myGroups, setMyGroups] = useState<string[]>(["g1"]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const join = (id: string) => setMyGroups(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id]);

  if (showCreate) return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => setShowCreate(false)} className="text-gray-500 bg-none border-none cursor-pointer"><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">Create a Group</h1>
      </div>
      <div className="px-4 py-5 pb-24 space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-purple-800 mb-1">🎭 How it works</p>
          <p className="text-xs text-purple-700">Your group gets a theme. Everyone who joins gets a random nickname from that theme — protecting their real identity. Only the group admin can see if someone breaks community rules.</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Group name</label>
          <input className="input" placeholder="e.g. The Enchanted Forest" value={newName} onChange={e => setNewName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Theme</label>
          <input className="input" placeholder="e.g. Fairy, Dragon, Space, Cyberpunk..." value={newTheme} onChange={e => setNewTheme(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">The theme determines what nicknames members receive</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
          <textarea className="input resize-none" rows={2} placeholder="What is this group about?" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800">
          ⚠️ Groups with inappropriate names or descriptions will be flagged by admin and removed within 2 hours.
        </div>
        <button className="btn-primary" disabled={!newName.trim() || !newTheme.trim()} onClick={() => setShowCreate(false)}>
          Create Group
        </button>
      </div>
      <BottomNav role="camper" />
    </div>
  );

  if (preview) {
    const group = DEMO_GROUPS.find(g => g.id === preview)!;
    const nick = NICKNAME_PREVIEW[preview]?.[0] || "Starweave";
    const isJoined = myGroups.includes(preview);
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => setPreview(null)} className="text-gray-500 bg-none border-none cursor-pointer"><ArrowLeft size={20} /></button>
          <h1 className="font-bold text-lg">{group.name}</h1>
        </div>
        <div className="px-4 py-5 pb-24 space-y-4">
          <div className="rounded-3xl p-6 text-center" style={{ background: group.bg }}>
            <div className="text-5xl mb-3">{group.emoji}</div>
            <h2 className="font-bold text-xl text-gray-900">{group.name}</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block" style={{ background: group.color, color: "#fff" }}>{group.tag}</span>
            <p className="text-sm text-gray-600 mt-3">{group.description}</p>
            <div className="flex items-center justify-center gap-1 mt-3">
              <Users size={13} className="text-gray-400" />
              <span className="text-xs text-gray-500">{group.members} members</span>
            </div>
          </div>
          <div className="card">
            <p className="text-sm font-bold text-gray-900 mb-2">🎭 Your nickname in this group</p>
            <p className="text-xs text-gray-500 mb-3">If you join, you will be known as:</p>
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: group.bg }}>
              <span className="text-2xl">{group.emoji}</span>
              <div>
                <p className="font-bold text-base" style={{ color: group.color }}>{nick}</p>
                <p className="text-xs text-gray-500">Your masked identity in this group</p>
              </div>
            </div>
          </div>
          <div className="card">
            <p className="text-sm font-bold text-gray-900 mb-2">Sample nicknames</p>
            <div className="flex flex-wrap gap-2">
              {(NICKNAME_PREVIEW[preview] || []).map(n => (
                <span key={n} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: group.bg, color: group.color }}>{n}</span>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-800">
            <Lock size={12} className="inline mr-1" /> Members only see each other by nickname. Your real name is never shared in the group.
          </div>
          {isJoined ? (
            <Link href={`/groups/${preview}`} className="btn-primary block text-center">
              Enter Group Chat
            </Link>
          ) : (
            <button className="btn-primary" style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)` }}
              onClick={() => { join(preview); }}>
              Join as {nick}
            </button>
          )}
        </div>
        <BottomNav role="camper" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header justify-between">
        <div>
          <h1 className="font-bold text-xl">Camp Groups</h1>
          <p className="text-xs text-gray-500 mt-0.5">Flock with your people · Stay anonymous</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white border-none cursor-pointer"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
          <Plus size={14} /> Create
        </button>
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">
        {myGroups.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">My Groups</p>
            {DEMO_GROUPS.filter(g => myGroups.includes(g.id)).map(group => (
              <div key={group.id} onClick={() => setPreview(group.id)}
                className="rounded-2xl p-4 mb-3 cursor-pointer flex items-center justify-between" style={{ background: group.bg }}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{group.emoji}</span>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{group.name}</p>
                    <p className="text-xs" style={{ color: group.color }}>You are: {NICKNAME_PREVIEW[group.id]?.[0]}</p>
                  </div>
                </div>
                <Link href={`/groups/${group.id}`} onClick={e => e.stopPropagation()}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: group.color }}>
                  Chat
                </Link>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Discover Groups</p>
        {DEMO_GROUPS.filter(g => !myGroups.includes(g.id)).map(group => (
          <div key={group.id} onClick={() => setPreview(group.id)}
            className="card cursor-pointer active:scale-98 transition-transform">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: group.bg }}>
                {group.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-gray-900">{group.name}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: group.bg, color: group.color }}>{group.tag}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{group.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Users size={10} /> {group.members} members</span>
                  <span className="text-xs font-medium flex items-center gap-1" style={{ color: group.color }}><Sparkles size={10} /> Tap to preview</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
