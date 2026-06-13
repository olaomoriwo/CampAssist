import Link from "next/link";
import { Tent, MapPin, HelpCircle, Store, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%)" }}>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center text-white">

        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <Tent size={40} className="text-white" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <span className="text-xs text-green-200 font-semibold">✦ In It Together 2027</span>
        </div>

        <h1 className="text-4xl font-bold mb-3 tracking-tight">CampAssist</h1>
        <p className="text-lg mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>Your festival companion</p>
        <p className="text-sm mb-10 max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          Book a tent, get help on-site, discover what&apos;s on, and never get lost at a festival again.
        </p>

        {/* Feature pills */}
        <div className="flex flex-col gap-2.5 w-full max-w-xs mb-10">
          {[
            { icon: Tent,        text: "Pre-book your tent with extras",       sub: "Beds, stoves & gear" },
            { icon: HelpCircle,  text: "On-demand camp assistants",            sub: "Available throughout the festival" },
            { icon: MapPin,      text: "Interactive festival map",             sub: "Find & review any vendor" },
            { icon: Store,       text: "Vendor schedules & nano-events",       sub: "Discover what's on all weekend" },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{text}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/signup"
            className="flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-[15px] transition-all active:scale-97"
            style={{ background: "#fff", color: "#15803d", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
            Create an account <ArrowRight size={17} />
          </Link>
          <Link href="/login"
            className="flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl text-[15px] text-white transition-all"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
            Sign in
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>CampAssist · Making festivals better</p>
      </div>
    </main>
  );
}
