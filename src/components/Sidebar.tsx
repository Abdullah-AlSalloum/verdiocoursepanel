
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiBookOpen, FiVideo, FiEdit3, FiMenu } from "react-icons/fi";
import { useState } from "react";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: <FiHome size={20} /> },
  { href: "/courses", label: "الدورات", icon: <FiBookOpen size={20} /> },
  // Removed global videos and quizzes links
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-zinc-900 text-white p-2 rounded focus:outline-none shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="فتح القائمة الجانبية"
      >
        <FiMenu size={24} />
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-60 bg-zinc-900 text-white flex flex-col p-6 z-40 shadow-lg rounded-l-2xl transition-transform duration-200 md:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"} md:block`}
        style={{ minHeight: '100vh' }}
      >
        <h2 className="text-2xl font-bold mb-10 text-right tracking-tight">لوحة الإدارة</h2>
        <nav className="flex flex-col gap-3 text-right">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors duration-150 text-lg ${
                pathname === item.href
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-zinc-800 hover:text-blue-300"
              }`}
              style={{ direction: 'rtl' }}
              onClick={() => setOpen(false)}
            >
              <span className="ml-2">{item.icon}</span>
              <span>{item.label}</span>
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
