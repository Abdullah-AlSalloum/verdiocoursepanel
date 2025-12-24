"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "لوحة التحكم" },
  { href: "/courses", label: "الدورات" },
  { href: "/videos", label: "الفيديوهات" },
  { href: "/quizzes", label: "الاختبارات" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-zinc-900 text-white p-2 rounded focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-56 bg-zinc-900 text-white flex flex-col p-4 z-40 transition-transform duration-200 md:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
        style={{ minHeight: '100vh' }}
      >
        <h2 className="text-xl font-bold mb-8 text-right">لوحة الإدارة</h2>
        <nav className="flex flex-col gap-4 text-right">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded transition-colors ${
                pathname === item.href ? "bg-zinc-700" : "hover:bg-zinc-800"
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
