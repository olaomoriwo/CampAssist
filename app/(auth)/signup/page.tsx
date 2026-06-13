"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, Tent } from "lucide-react";
import { Festival } from "@/types";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    festival_id: "", arrival_date: "", departure_date: "",
  });
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.from("festivals").select("*").then(({ data }) => {
      if (data) setFestivals(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, role: "camper" },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile with extra details
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        phone: form.phone,
        festival_id: form.festival_id || null,
        arrival_date: form.arrival_date || null,
        departure_date: form.departure_date || null,
      }).eq("id", user.id);
    }

    router.push("/camper-onboarding");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 mb-8 hover:text-gray-700">
          <ArrowLeft size={18} /> Back
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Tent size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create account</h1>
            <p className="text-sm text-gray-500">Join CampAssist as a camper</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
            <input className="input" type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+44 7xxx xxxxxx" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className="input" type="password" required minLength={6} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
          </div>

          {festivals.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Festival attending</label>
                <select className="input" value={form.festival_id}
                  onChange={e => setForm(f => ({ ...f, festival_id: e.target.value }))}>
                  <option value="">Select festival (optional)</option>
                  {festivals.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {form.festival_id && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrival date</label>
                    <input className="input" type="date" value={form.arrival_date}
                      onChange={e => setForm(f => ({ ...f, arrival_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departure date</label>
                    <input className="input" type="date" value={form.departure_date}
                      onChange={e => setForm(f => ({ ...f, departure_date: e.target.value }))} />
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
