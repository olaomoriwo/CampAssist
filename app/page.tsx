import Link from "next/link";
import { Tent, MapPin, HelpCircle, ArrowRight, Store } from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%)" }}>
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center text-white">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <Tent size={40} className="text-white" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <span className="text-xs text-green-200 font-semibold">✦ In It Together 2027</span>
        </div>

        <h1 className="text-4xl font-bold mb-3 tracking-tight">CampAssist</h1>
        <p className="text-lg mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>Your festival companion</p>
        <p className="text-sm mb-10 max-w-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          Book a tent, get help on-site, and never get lost at a festival again.
        </p>

        {/* Feature pills */}
        <div className="flex flex-col gap-2.5 w-full max-w-xs mb-10">
          {[
            { icon: Tent, text: "Pre-book your tent with extras", sub: "Beds, stoves & gear" },
            { icon: HelpCircle, text: "On-demand camp assistants", sub: "Available throughout the festival" },
            { icon: MapPin, text: "Interactive festival map", sub: "Find & review any vendor" },
            { icon: Store, text: "Vendor schedules & nano-events", sub: "Discover what's on all weekend" },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{text}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {DEMO_MODE ? (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Try the demo</p>
            <Link href="/dashboard"
              className="flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm transition-all"
              style={{ background: "#fff", color: "#15803d", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              <Tent size={17} /> Explore as Camper
            </Link>
            <Link href="/assistant-dashboard"
              className="flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl text-sm transition-all text-white"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              Explore as Camp Assistant
            </Link>
            <Link href="/admin"
              className="flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl text-sm transition-all text-white"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              Explore as Admin
            </Link>
            <Link href="/vendor-dashboard"
              className="flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl text-sm transition-all"
              style={{ background: "rgba(217,119,6,0.25)", border: "1px solid rgba(217,119,6,0.4)", color: "#fde68a" }}>
              <Store size={16} /> Explore as Vendor
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/signup"
              className="flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm"
              style={{ background: "#fff", color: "#15803d", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              Get Started <ArrowRight size={17} />
            </Link>
            <Link href="/login"
              className="flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl text-sm text-white"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              I already have an account
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        {!DEMO_MODE && (
          <div className="flex flex-col gap-1.5">
            <Link href="/assistant-signup" className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Are you a camp assistant? Sign up here
            </Link>
            <Link href="/vendor-signup" className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Are you a vendor? Join the platform
            </Link>
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>CampAssist · Making festivals better</p>
      </div>
    </main>
  );
}
