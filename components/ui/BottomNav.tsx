"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, HelpCircle, User, Briefcase, History, LayoutDashboard } from "lucide-react";
import { UserRole } from "@/types";

interface BottomNavProps {
  role: UserRole;
}

const camperLinks = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/map", icon: MapPin, label: "Map" },
  { href: "/request-help", icon: HelpCircle, label: "Help" },
  { href: "/profile", icon: User, label: "Profile" },
];

const assistantLinks = [
  { href: "/assistant-dashboard", icon: Briefcase, label: "Jobs" },
  { href: "/job-history", icon: History, label: "History" },
];

const adminLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Admin" },
];

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const links = role === "camper" ? camperLinks : role === "assistant" ? assistantLinks : adminLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                active ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
