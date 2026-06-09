"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Users, Tent, MessageCircle } from "lucide-react";
import { UserRole } from "@/types";

interface BottomNavProps { role: UserRole; }

const camperLinks = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/tents", icon: Tent, label: "Tents" },
  { href: "/map", icon: MapPin, label: "Map" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/groups", icon: Users, label: "Groups" },
];

const assistantLinks = [
  { href: "/assistant-dashboard", icon: Home, label: "Jobs" },
  { href: "/assistant-messages", icon: MessageCircle, label: "Messages" },
  { href: "/job-history", icon: Users, label: "History" },
];

const adminLinks = [
  { href: "/admin", icon: Home, label: "Admin" },
];

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const links = role === "camper" ? camperLinks : role === "assistant" ? assistantLinks : adminLinks;
  const activeColor = role === "camper" ? "#16a34a" : role === "assistant" ? "#ea580c" : "#7c3aed";

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(0,0,0,0.06)",
      zIndex: 50,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <div style={{ display: "flex", alignItems: "center", padding: "6px 4px 10px", maxWidth: "430px", margin: "0 auto" }}>
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && href !== "/assistant-dashboard" && href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                textDecoration: "none", padding: "0 2px",
                color: active ? activeColor : "#9ca3af",
                transition: "color 0.15s",
              }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "11px",
                background: active ? `${activeColor}18` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span style={{ fontSize: "9px", fontWeight: active ? "700" : "500", letterSpacing: "0.025em" }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
