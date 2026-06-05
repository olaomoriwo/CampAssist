"use client";
import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { ArrowLeft, Heart, MessageCircle, Share2, Camera, Plus, Flame } from "lucide-react";

const POSTS = [
  { id: 1, user: "Marcus T.", avatar: "M", time: "2m ago", text: "The main stage sound system just absolutely hits different tonight. You can feel it in your chest 50 metres back 🎵🔥", likes: 47, comments: 12, liked: false, img: "stage" },
  { id: 2, user: "Priya S.", avatar: "P", time: "15m ago", text: "Unpopular opinion: the jazz tent is actually the best stage at the whole festival. Smaller crowd, better vibes, incredible musicians. Change my mind.", likes: 89, comments: 31, liked: true, img: null },
  { id: 3, user: "Chidi M.", avatar: "C", time: "32m ago", text: "PSA: Big Smoke Burgers has NO queue right now. I repeat. Zero queue. GO NOW before the main stage set ends 🍔🏃", likes: 234, comments: 56, liked: false, img: null },
  { id: 4, user: "Funke A.", avatar: "F", time: "1h ago", text: "My tent is set up, the sun is going down, and I have a cold drink in hand. This is what life is about. In It Together forever 🏕️✨", likes: 156, comments: 28, liked: true, img: "sunset" },
  { id: 5, user: "Dele O.", avatar: "D", time: "2h ago", text: "Found the most insane vintage jacket at the festival market. The seller was an absolute legend and it was only £15. Festival fashion on point 🛍️", likes: 61, comments: 14, liked: false, img: null },
];

const COLORS: Record<string, string> = { M: "#2563eb", P: "#db2777", C: "#16a34a", F: "#d97706", D: "#7c3aed", O: "#0891b2" };

const IMG_PLACEHOLDER: Record<string, { emoji: string; bg: string }> = {
  stage: { emoji: "🎵", bg: "linear-gradient(135deg, #1e1b4b, #312e81)" },
  sunset: { emoji: "🌅", bg: "linear-gradient(135deg, #f97316, #fbbf24, #fce7f3)" },
};

export default function SocialPage() {
  const [posts, setPosts] = useState(POSTS);
  const [showCompose, setShowCompose] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "trending">("feed");

  const toggleLike = (id: number) => {
    setPosts(p => p.map(post => post.id === id ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } : post));
  };

  const submitPost = () => {
    if (!newPost.trim()) return;
    setPosts(p => [{ id: Date.now(), user: "Ola O.", avatar: "O", time: "Just now", text: newPost, likes: 0, comments: 0, liked: false, img: null }, ...p]);
    setNewPost("");
    setShowCompose(false);
  };

  if (showCompose) return (
    <div className="page-container">
      <div className="page-header justify-between">
        <button onClick={() => setShowCompose(false)} className="text-gray-500 bg-none border-none cursor-pointer"><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">New Post</h1>
        <button onClick={submitPost} disabled={!newPost.trim()}
          className="text-sm font-bold disabled:opacity-40 border-none cursor-pointer px-4 py-2 rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
          Post
        </button>
      </div>
      <div className="px-4 py-5 pb-24">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">O</div>
          <div>
            <p className="font-bold text-sm">Ola Omoriwo</p>
            <p className="text-xs text-gray-400">In It Together 2027</p>
          </div>
        </div>
        <textarea className="w-full bg-transparent text-base outline-none resize-none min-h-32 text-gray-900"
          placeholder="What is happening at the festival? 🎵"
          value={newPost} onChange={e => setNewPost(e.target.value)} autoFocus />
        <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
          <div className="flex gap-4">
            <button className="text-primary-600 flex items-center gap-1.5 text-sm font-medium bg-none border-none cursor-pointer">
              <Camera size={18} /> Photo
            </button>
          </div>
          <p className="text-xs text-gray-400">{280 - newPost.length} chars left</p>
        </div>
      </div>
      <BottomNav role="camper" />
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="font-bold text-xl">CampFeed</h1>
          <p className="text-xs text-gray-500 mt-0.5">In It Together 2027</p>
        </div>
        <button onClick={() => setShowCompose(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer text-white"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
          <Plus size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 px-4">
        {([{ id: "feed", label: "Live Feed" }, { id: "trending", label: "🔥 Trending" }] as const).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex-1 py-3 text-sm font-semibold transition-all border-none bg-transparent cursor-pointer"
            style={{ color: activeTab === t.id ? "#16a34a" : "#9ca3af", borderBottom: activeTab === t.id ? "2.5px solid #16a34a" : "2.5px solid transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="pb-24">
        {(activeTab === "trending" ? [...posts].sort((a, b) => b.likes - a.likes) : posts).map(post => (
          <div key={post.id} className="bg-white border-b border-gray-100">
            {/* Post header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                style={{ background: COLORS[post.avatar] || "#374151" }}>
                {post.avatar}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">{post.user}</p>
                <p className="text-xs text-gray-400">{post.time}</p>
              </div>
              {post.likes > 100 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full text-orange-600 bg-orange-50 flex items-center gap-1">
                  <Flame size={11} /> Trending
                </span>
              )}
            </div>

            {/* Image */}
            {post.img && (
              <div className="mx-4 mb-3 rounded-2xl overflow-hidden h-44 flex items-center justify-center" style={{ background: IMG_PLACEHOLDER[post.img]?.bg }}>
                <span className="text-6xl">{IMG_PLACEHOLDER[post.img]?.emoji}</span>
              </div>
            )}

            {/* Text */}
            <p className="px-4 pb-3 text-sm text-gray-800 leading-relaxed">{post.text}</p>

            {/* Actions */}
            <div className="flex items-center gap-1 px-4 pb-4 border-t border-gray-50 pt-3">
              <button onClick={() => toggleLike(post.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border-none cursor-pointer"
                style={{ background: post.liked ? "#fce7f3" : "#f3f4f6", color: post.liked ? "#db2777" : "#6b7280" }}>
                <Heart size={15} style={{ fill: post.liked ? "#db2777" : "none" }} />
                {post.likes}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 border-none cursor-pointer">
                <MessageCircle size={15} />
                {post.comments}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 border-none cursor-pointer ml-auto">
                <Share2 size={15} /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
