"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function AssistantSignupPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", staffCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate staff code
    if (form.staffCode.toUpperCase() !== (process.env.NEXT_PUBLIC_STAFF_CODE || "CAMP2025")) {
      setError("Invalid staff access code. Please contact your manager.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, role: "assistant" },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ phone: form.phone }).eq("id", user.id);
      // Create availability record
      await supabase.from("assistant_availability").insert({
        assistant_id: user.id,
        is_available: false,
      });
    }

    router.push("/assistant-onboarding");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 mb-8 hover:text-gray-700">
          <ArrowLeft size={18} /> Back
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Briefcase size={20} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Camp Assistant Sign Up</h1>
            <p className="text-sm text-gray-500">Staff access only</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 mb-6">
          You need a staff access code from your manager to register as a camp assistant.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff access code</label>
            <input className="input font-mono tracking-wider" type="text" required value={form.staffCode}
              onChange={e => setForm(f => ({ ...f, staffCode: e.target.value }))}
              placeholder="Enter your staff code" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input className="input" type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className="input" type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input" type="tel" required value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+44 7xxx xxxxxx" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className="input" type="password" required minLength={6} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating account..." : "Create assistant account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered? <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
