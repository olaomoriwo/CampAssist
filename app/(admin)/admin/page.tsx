"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import StatusBadge from "@/components/ui/StatusBadge";
import { LayoutDashboard, Tent, HelpCircle, Users, Map, Plus, Trash2, LogOut, Globe, CheckCircle, Clock, AlertCircle, Layers, ArrowRight, Flag, AlertTriangle, Ban, Eye, XCircle } from "lucide-react";
import { getRequestTypeLabel, getPOICategoryIcon } from "@/lib/utils";
import { DEMO_MODE, DEMO_ADMIN_BOOKINGS, DEMO_ADMIN_REQUESTS, DEMO_ADMIN_STAFF, DEMO_FESTIVAL, DEMO_ONBOARDED_FESTIVALS, DEMO_REPORTS, type AssistantReport, type ReportStatus } from "@/lib/demo-data";

type Tab = "bookings" | "requests" | "staff" | "map" | "festivals" | "reports";

const MISCONDUCT_CFG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  rude_behavior:    { emoji: "😤", label: "Rude / Unprofessional", color: "#b45309", bg: "#fffbeb" },
  no_show:          { emoji: "🚶", label: "No-show / Late",         color: "#6b7280", bg: "#f3f4f6" },
  damaged_property: { emoji: "🏚️", label: "Damaged Property",       color: "#dc2626", bg: "#fef2f2" },
  harassment:       { emoji: "🚨", label: "Harassment",             color: "#dc2626", bg: "#fef2f2" },
  theft:            { emoji: "🔓", label: "Theft",                  color: "#7c3aed", bg: "#ede9fe" },
  other:            { emoji: "📝", label: "Other",                  color: "#6b7280", bg: "#f3f4f6" },
};

const REPORT_STATUS_CFG: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  pending_review: { label: "Pending Review", color: "#b45309", bg: "#fffbeb" },
  under_review:   { label: "Under Review",   color: "#7c3aed", bg: "#ede9fe" },
  resolved:       { label: "Resolved",       color: "#16a34a", bg: "#f0fdf4" },
  dismissed:      { label: "Dismissed",      color: "#6b7280", bg: "#f3f4f6" },
};

function FestivalStatusBadge({ status }: { status: string }) {
  if (status === "active")       return <span className="badge badge-green text-[11px]"><CheckCircle size={10} /> Active</span>;
  if (status === "pending_plan") return <span className="badge badge-yellow text-[11px]"><Clock size={10} /> Awaiting Plan</span>;
  if (status === "review")       return <span className="badge badge-orange text-[11px]"><AlertCircle size={10} /> Under Review</span>;
  return <span className="badge badge-gray text-[11px]">{status}</span>;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [pois, setPois] = useState<any[]>([]);
  const [festivals, setFestivals] = useState<any[]>([]);
  const [reports, setReports] = useState<AssistantReport[]>([]);
  const [newPOI, setNewPOI] = useState({ name: "", category: "food", notes: "", lat: 500, lng: 500 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      setBookings(DEMO_ADMIN_BOOKINGS);
      setRequests(DEMO_ADMIN_REQUESTS);
      setStaff(DEMO_ADMIN_STAFF);
      setPois((DEMO_FESTIVAL.map_pois || []) as any[]);
      setFestivals(DEMO_ONBOARDED_FESTIVALS);
      setReports(DEMO_REPORTS);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [{ data: b }, { data: r }, { data: s }] = await Promise.all([
        supabase.from("bookings").select("*, tent_type:tent_types(*), camper:profiles!camper_id(name,phone)").order("created_at", { ascending: false }),
        supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("role", "assistant"),
      ]);
      setBookings(b || []); setRequests(r || []); setStaff(s || []);
      setLoading(false);
    };
    load();
  }, []);

  const addPOI = () => {
    if (!newPOI.name) return;
    const poi = { id: Date.now().toString(), ...newPOI };
    setPois(p => [...p, poi]);
    setNewPOI({ name: "", category: "food", notes: "", lat: 500, lng: 500 });
  };

  const handleLogout = async () => {
    if (!DEMO_MODE) await supabase.auth.signOut();
    router.push("/");
  };

  // ── Report mediation actions (demo: local state only) ─────────────────────
  const markUnderReview = (id: string) =>
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "under_review" as const } : r));

  const resolveReport = (id: string) =>
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" as const } : r));

  const dismissReport = (id: string) =>
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "dismissed" as const } : r));

  const suspendAssistant = (reportId: string, assistantId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: "under_review" as const } : r));
    setStaff(prev => prev.map(s =>
      s.profile?.id === assistantId
        ? { ...s, available: false, status: "suspended" as const }
        : s
    ));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f8fa" }}>
      <div className="w-9 h-9 spinner spinner-purple" />
    </div>
  );

  const pendingReportCount = reports.filter(r => r.status === "pending_review").length;

  const tabs: { key: Tab; icon: any; label: string; count?: number; alertCount?: number }[] = [
    { key: "bookings",  icon: Tent,           label: "Bookings",  count: bookings.length },
    { key: "requests",  icon: HelpCircle,     label: "Requests",  count: requests.filter(r => r.status === "pending").length },
    { key: "staff",     icon: Users,          label: "Staff" },
    { key: "map",       icon: Map,            label: "Map" },
    { key: "festivals", icon: Globe,          label: "Festivals", count: festivals.length },
    { key: "reports",   icon: Flag,           label: "Reports",   alertCount: pendingReportCount },
  ];

  return (
    <div className="min-h-screen pb-6" style={{ background: "#f7f8fa" }}>
      {/* ── Header ── */}
      <div className="page-header justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#ede9fe" }}>
            <LayoutDashboard size={16} style={{ color: "#7c3aed" }} />
          </div>
          <h1 className="font-bold text-[17px]">Admin Panel</h1>
        </div>
        <button onClick={handleLogout} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
          <LogOut size={16} className="text-gray-500" />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="px-4 pt-3 pb-1 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap"
              style={{
                background: tab === t.key ? "#7c3aed" : "#fff",
                color: tab === t.key ? "#fff" : "#6b7280",
                border: tab === t.key ? "none" : "1px solid #e5e7eb",
                boxShadow: tab === t.key ? "0 3px 10px rgba(124,58,237,0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
              }}>
              <t.icon size={14} />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: tab === t.key ? "rgba(255,255,255,0.25)" : "#ede9fe", color: tab === t.key ? "#fff" : "#7c3aed" }}>
                  {t.count}
                </span>
              )}
              {t.alertCount !== undefined && t.alertCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: tab === t.key ? "rgba(255,255,255,0.25)" : "#fef2f2", color: tab === t.key ? "#fff" : "#dc2626" }}>
                  {t.alertCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 animate-fade-in-up">

        {/* ── BOOKINGS ── */}
        {tab === "bookings" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card bg-white"><p className="text-2xl font-bold text-purple-600">{bookings.length}</p><p className="text-[11px] text-gray-400 mt-0.5">Total Bookings</p></div>
              <div className="stat-card bg-white"><p className="text-2xl font-bold text-green-600">£{bookings.length * 75}</p><p className="text-[11px] text-gray-400 mt-0.5">Revenue</p></div>
            </div>
            {bookings.map(b => (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[13px]">{b.camper?.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{b.tent_type?.name} · {b.arrival_date} – {b.departure_date}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── REQUESTS ── */}
        {tab === "requests" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card" style={{ background: "#fefce8" }}><p className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === "pending").length}</p><p className="text-[11px] text-gray-400 mt-0.5">Pending</p></div>
              <div className="stat-card" style={{ background: "#f0fdf4" }}><p className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === "complete").length}</p><p className="text-[11px] text-gray-400 mt-0.5">Complete</p></div>
            </div>
            {requests.map(r => (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[13px]">{getRequestTypeLabel(r.type)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{r.camper?.name} · {r.location_description}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── STAFF ── */}
        {tab === "staff" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card bg-white"><p className="text-2xl font-bold text-purple-600">{staff.length}</p><p className="text-[11px] text-gray-400 mt-0.5">Total Staff</p></div>
              <div className="stat-card bg-white"><p className="text-2xl font-bold text-green-600">{staff.filter(s => s.available).length}</p><p className="text-[11px] text-gray-400 mt-0.5">Available</p></div>
            </div>
            {staff.map((s, i) => (
              <div key={i} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-md font-bold text-white text-[15px]"
                    style={{ background: s.status === "suspended" ? "#fee2e2" : s.available ? "linear-gradient(135deg, #16a34a, #15803d)" : "#d1d5db" }}>
                    <span style={{ color: s.status === "suspended" ? "#dc2626" : "#fff" }}>
                      {(s.profile?.name || s.name)?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-[13px]">{s.profile?.name || s.name}</p>
                    <p className="text-[11px] text-gray-400">Camp Assistant</p>
                  </div>
                </div>
                {s.status === "suspended" ? (
                  <span className="badge text-[11px] flex items-center gap-1"
                    style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                    <Ban size={10} /> Suspended
                  </span>
                ) : (
                  <span className="badge text-[11px]"
                    style={{ background: s.available ? "#dcfce7" : "#f3f4f6", color: s.available ? "#14532d" : "#6b7280" }}>
                    {s.available ? "Available" : "Off Duty"}
                  </span>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── MAP ── */}
        {tab === "map" && (
          <>
            {/* Site Plan CTA */}
            <Link href="/admin/site-plan"
              className="flex items-center justify-between rounded-2xl p-4 transition-all active:scale-97"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Layers size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-[14px]">Set Up Site Plan</p>
                  <p className="text-white/70 text-[12px] mt-0.5">Upload & georeference your festival map</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-white/60" />
            </Link>

            <div className="card">
              <p className="font-bold text-[13px] mb-3">Add Location Pin</p>
              <input className="input mb-2" placeholder="Location name" value={newPOI.name} onChange={e => setNewPOI(p => ({ ...p, name: e.target.value }))} />
              <select className="input mb-2" value={newPOI.category} onChange={e => setNewPOI(p => ({ ...p, category: e.target.value }))}>
                {["food", "bar", "stage", "toilet", "first_aid", "water", "other"].map(c => (
                  <option key={c} value={c}>{c.replace("_", " ")}</option>
                ))}
              </select>
              <input className="input mb-3" placeholder="Notes (optional)" value={newPOI.notes} onChange={e => setNewPOI(p => ({ ...p, notes: e.target.value }))} />
              <button onClick={addPOI} disabled={!newPOI.name} className="btn-primary flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
                <Plus size={16} /> Add Pin
              </button>
            </div>
            <div className="rounded-2xl p-3 flex items-start gap-2"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <span className="text-[15px]">ℹ️</span>
              <p className="text-[12px] text-green-800 leading-relaxed">
                Pins added here appear on the camper map with a Google Maps navigate button and review flow.
              </p>
            </div>
            <p className="section-title">Current Pins ({pois.length})</p>
            {pois.map((p: any) => (
              <div key={p.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getPOICategoryIcon(p.category)}</span>
                  <div>
                    <p className="font-semibold text-[13px]">{p.name}</p>
                    {p.notes && <p className="text-[11px] text-gray-400">{p.notes}</p>}
                  </div>
                </div>
                <button onClick={() => setPois(ps => ps.filter(x => x.id !== p.id))}
                  className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            ))}
          </>
        )}

        {/* ── FESTIVALS ── */}
        {tab === "festivals" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="stat-card bg-white text-center">
                <p className="text-xl font-bold text-purple-600">{festivals.length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
              </div>
              <div className="stat-card text-center" style={{ background: "#f0fdf4" }}>
                <p className="text-xl font-bold text-green-600">{festivals.filter(f => f.status === "active").length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Active</p>
              </div>
              <div className="stat-card text-center" style={{ background: "#fefce8" }}>
                <p className="text-xl font-bold text-yellow-500">{festivals.filter(f => f.status !== "active").length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Pending</p>
              </div>
            </div>

            {/* Onboard CTA */}
            <Link href="/admin/festivals/new"
              className="flex items-center justify-between rounded-2xl p-4 transition-all active:scale-97"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
              <div>
                <p className="text-white font-bold text-[15px]">Onboard New Festival</p>
                <p className="text-white/70 text-[12px] mt-0.5">Self-service or admin-assisted setup</p>
              </div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <Plus size={20} className="text-white" />
              </div>
            </Link>

            {/* Festival List */}
            <p className="section-title">Onboarded Festivals</p>
            {festivals.map(f => (
              <div key={f.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-gray-900 truncate">{f.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{f.venue} · {f.location.split(",").slice(-2).join(",").trim()}</p>
                  </div>
                  <FestivalStatusBadge status={f.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 my-3">
                  {[
                    { label: "Attendance", value: f.expected_attendance >= 1000 ? `${(f.expected_attendance / 1000).toFixed(0)}k` : f.expected_attendance },
                    { label: "Vendors", value: f.expected_vendors },
                    { label: "Camp Zones", value: f.camping_zones },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl py-2 text-center" style={{ background: "#f7f8fa" }}>
                      <p className="font-bold text-[14px] text-gray-900">{stat.value}</p>
                      <p className="text-[10px] text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {(f.services as string[]).map(svc => (
                    <span key={svc} className="badge badge-purple text-[10px] px-2 py-0.5">
                      {svc.replace("_", " ")}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {f.site_plan_file ? (
                      <span className="badge badge-green text-[10px]"><CheckCircle size={9} /> Site plan uploaded</span>
                    ) : (
                      <span className="badge badge-yellow text-[10px]"><AlertCircle size={9} /> No site plan yet</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">{f.start_date} – {f.end_date}</p>
                </div>

                {f.notes && (
                  <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-50 leading-relaxed italic">{f.notes}</p>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── REPORTS ── */}
        {tab === "reports" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="stat-card bg-white text-center">
                <p className="text-xl font-bold text-purple-600">{reports.length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
              </div>
              <div className="stat-card text-center" style={{ background: "#fffbeb" }}>
                <p className="text-xl font-bold text-amber-600">{reports.filter(r => r.status === "pending_review").length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Pending</p>
              </div>
              <div className="stat-card text-center" style={{ background: "#f0fdf4" }}>
                <p className="text-xl font-bold text-green-600">{reports.filter(r => r.status === "resolved").length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Resolved</p>
              </div>
            </div>

            {/* Notice */}
            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
              <AlertTriangle size={14} style={{ color: "#dc2626", marginTop: "1px", flexShrink: 0 }} />
              <p className="text-[12px] text-red-800 leading-relaxed">
                <strong>All reports are confidential.</strong> The assistant is not informed of the camper&apos;s identity
                unless you decide to disclose it during mediation.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
                  <Flag size={26} className="text-gray-300" />
                </div>
                <p className="font-bold text-[15px] text-gray-700">No reports yet</p>
                <p className="text-[13px] text-gray-400 mt-1">Reports from campers will appear here</p>
              </div>
            ) : (
              /* Sort: pending first, then under_review, then resolved/dismissed */
              [...reports]
                .sort((a, b) => {
                  const order: Record<ReportStatus, number> = { pending_review: 0, under_review: 1, resolved: 2, dismissed: 3 };
                  return order[a.status] - order[b.status];
                })
                .map(report => {
                  const misconduct = MISCONDUCT_CFG[report.misconduct_type] ?? MISCONDUCT_CFG.other;
                  const statusCfg  = REPORT_STATUS_CFG[report.status];
                  const isClosed   = report.status === "resolved" || report.status === "dismissed";
                  const assistantSuspended = staff.find(s => s.profile?.id === report.assistant_id)?.status === "suspended";

                  return (
                    <div key={report.id} className="bg-white rounded-2xl overflow-hidden"
                      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)" }}>

                      {/* Card header */}
                      <div className="px-4 pt-4 pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl">{misconduct.emoji}</span>
                            <span className="px-2 py-1 rounded-xl text-[10px] font-bold"
                              style={{ background: misconduct.bg, color: misconduct.color }}>
                              {misconduct.label}
                            </span>
                            <span className="px-2 py-1 rounded-xl text-[10px] font-bold"
                              style={{ background: statusCfg.bg, color: statusCfg.color }}>
                              {statusCfg.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                            {new Date(report.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>

                        {/* People row */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                              style={{ background: "#16a34a" }}>
                              {report.camper_name.charAt(0)}
                            </div>
                            <p className="text-[12px] font-semibold text-gray-700">{report.camper_name}</p>
                          </div>
                          <span className="text-gray-300">→</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                              style={{ background: assistantSuspended ? "#fef2f2" : "#ede9fe", color: assistantSuspended ? "#dc2626" : "#7c3aed" }}>
                              {report.assistant_name.charAt(0)}
                            </div>
                            <p className="text-[12px] font-semibold text-gray-700">{report.assistant_name}</p>
                            {assistantSuspended && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                                style={{ background: "#fef2f2", color: "#dc2626" }}>
                                <Ban size={8} /> Suspended
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Job type */}
                        <p className="text-[11px] text-gray-400 mb-2">
                          Job: <span className="font-semibold text-gray-600">{getRequestTypeLabel(report.request_type as any)}</span>
                        </p>

                        {/* Description */}
                        <p className="text-[13px] text-gray-700 leading-relaxed">
                          {report.description}
                        </p>

                        {/* Image evidence */}
                        {report.image_url && (
                          <div className="mt-3 rounded-xl overflow-hidden" style={{ height: "160px" }}>
                            <img src={report.image_url} alt="Evidence" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Admin note */}
                        {report.admin_note && (
                          <div className="mt-3 rounded-xl p-3 flex items-start gap-2"
                            style={{ background: "#ede9fe", border: "1px solid #ddd6fe" }}>
                            <Eye size={12} style={{ color: "#7c3aed", flexShrink: 0, marginTop: "2px" }} />
                            <p className="text-[11px] text-purple-800 leading-relaxed">{report.admin_note}</p>
                          </div>
                        )}
                      </div>

                      {/* Action row */}
                      {!isClosed && (
                        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Admin actions</p>
                          <div className="flex flex-wrap gap-2">
                            {report.status === "pending_review" && (
                              <button onClick={() => markUnderReview(report.id)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[12px] transition-all active:scale-95"
                                style={{ background: "#ede9fe", color: "#7c3aed" }}>
                                <Eye size={12} /> Mark Under Review
                              </button>
                            )}
                            {report.status === "under_review" && !assistantSuspended && (
                              <button onClick={() => suspendAssistant(report.id, report.assistant_id)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[12px] transition-all active:scale-95"
                                style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                                <Ban size={12} /> Suspend Assistant
                              </button>
                            )}
                            {report.status === "under_review" && (
                              <button onClick={() => resolveReport(report.id)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[12px] transition-all active:scale-95"
                                style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                                <CheckCircle size={12} /> Resolve Case
                              </button>
                            )}
                            <button onClick={() => dismissReport(report.id)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[12px] transition-all active:scale-95"
                              style={{ background: "#f3f4f6", color: "#6b7280" }}>
                              <XCircle size={12} /> Dismiss
                            </button>
                          </div>
                        </div>
                      )}

                      {isClosed && (
                        <div className="px-4 pb-4 pt-3 border-t border-gray-50">
                          <p className="text-[11px] font-semibold"
                            style={{ color: report.status === "resolved" ? "#16a34a" : "#6b7280" }}>
                            {report.status === "resolved" ? "✓ This case has been resolved." : "This report was dismissed."}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </>
        )}

      </div>
    </div>
  );
}
