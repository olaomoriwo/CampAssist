"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { RequestType } from "@/types";
import { DEMO_MODE, DEMO_PROFILE } from "@/lib/demo-data";

const REQUEST_TYPES: { value: RequestType; label: string; description: string; emoji: string }[] = [
  { value: "tent_setup", label: "Tent Setup", description: "Help setting up your tent", emoji: "⛺" },
  { value: "tent_collection", label: "Tent Collection", description: "Ready to leave, collect my tent", emoji: "📦" },
  { value: "general", label: "Help Navigating", description: "I\'m lost on site", emoji: "🧭" },
  { value: "other", label: "Other", description: "Something else", emoji: "💬" },
];

export default function RequestHelpPage() {
  const [type, setType] = useState<RequestType | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setLoading(true);
    setError("");
    if (DEMO_MODE) {
      setTimeout(() => { setSubmitted(true); setLoading(false); }, 800);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: profile } = await supabase.from("profiles").select("festival_id").eq("id", user.id).single();
    const { data, error: err } = await supabase.from("assistance_requests").insert({
      camper_id: user.id, festival_id: profile?.festival_id,
      type, description: description || "", location_description: location, status: "pending",
    }).select().single();
    if (err) { setError(err.message); setLoading(false); return; }
    await fetch("/api/pusher/trigger", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: `festival-${profile?.festival_id}-jobs`, event: "new-job", data: { requestId: data.id, type, location } }),
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className="page-container">
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center pb-24">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Request Sent!</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">An available assistant has been notified and will come to you shortly.</p>
        <div className="space-y-3 w-full max-w-xs">
          <Link href="/my-requests" className="btn-primary block text-center">Track My Request</Link>
          <Link href="/dashboard" className="btn-secondary block text-center">Back to Dashboard</Link>
        </div>
      </div>
      <BottomNav role="camper" />
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
        <h1 className="font-bold text-lg">Request Help</h1>
      </header>
      <form onSubmit={handleSubmit} className="px-4 py-6 pb-24 space-y-5">
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">What do you need help with?</p>
          <div className="grid grid-cols-2 gap-3">
            {REQUEST_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${type === t.value ? "border-primary-500 bg-primary-50" : "border-gray-100 bg-white"}`}>
                <span className="text-2xl block mb-2">{t.emoji}</span>
                <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
        {type === "general" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
            💡 Tip: You can also use the <strong>Map tab</strong> to search locations and navigate with Google Maps directly.
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Where are you? <span className="text-red-500">*</span></label>
          <textarea className="input resize-none" rows={2} required value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Near the main stage, section B, green tent with a blue flag" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Additional notes (optional)</label>
          <textarea className="input resize-none" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Any extra details..." />
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={!type || !location || loading} className="btn-primary">
          {loading ? "Sending request..." : "Send Request"}
        </button>
      </form>
      <BottomNav role="camper" />
    </div>
  );
}
