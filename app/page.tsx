import Link from "next/link";
import { Tent, MapPin, HelpCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-green-800 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center text-white">
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6">
          <Tent size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3">CampAssist</h1>
        <p className="text-lg text-white/80 mb-10 max-w-xs">
          Your festival companion. Book a tent, get help on-site, and never get lost again.
        </p>

        {/* Feature pills */}
        <div className="flex flex-col gap-3 w-full max-w-xs mb-12">
          {[
            { icon: Tent, text: "Pre-book your tent" },
            { icon: HelpCircle, text: "On-demand camp assistance" },
            { icon: MapPin, text: "Navigate the festival site" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <Icon size={18} className="text-white/80 shrink-0" />
              <span className="text-sm text-white/90">{text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 bg-white text-primary-700 font-bold py-4 px-6 rounded-2xl text-base hover:bg-primary-50 transition-colors"
          >
            Get Started <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-4 px-6 rounded-2xl text-base hover:bg-white/20 transition-colors border border-white/20"
          >
            I already have an account
          </Link>
        </div>
      </div>

      {/* Staff link */}
      <div className="text-center pb-8">
        <Link href="/assistant-signup" className="text-white/50 text-sm hover:text-white/80 transition-colors">
          Are you a camp assistant? Sign up here
        </Link>
      </div>
    </main>
  );
}
