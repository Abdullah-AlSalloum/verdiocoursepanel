
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import AuthButton from "../components/AuthButton";
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-zinc-100 dark:from-zinc-900 dark:to-black font-sans" dir="rtl" style={{fontFamily: 'Cairo, Noto Sans Arabic, sans-serif'}}>
      <main className="w-full max-w-2xl flex flex-col items-center justify-center gap-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2">مرحبًا بك في لوحة التحكم</h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-200 mb-6 text-center">يمكنك إدارة الدورات، الفيديوهات، والاختبارات من خلال القائمة الجانبية.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-blue-100 dark:bg-blue-900/40 rounded-xl p-4 flex flex-col items-center shadow">
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-200">الدورات</span>
            <span className="text-zinc-500 dark:text-zinc-300 mt-2">إدارة جميع الدورات</span>
          </div>
          <div className="bg-green-100 dark:bg-green-900/40 rounded-xl p-4 flex flex-col items-center shadow">
            <span className="text-2xl font-bold text-green-700 dark:text-green-200">الفيديوهات</span>
            <span className="text-zinc-500 dark:text-zinc-300 mt-2">إضافة وتنظيم الفيديوهات</span>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded-xl p-4 flex flex-col items-center shadow">
            <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">الاختبارات</span>
            <span className="text-zinc-500 dark:text-zinc-300 mt-2">إدارة أسئلة الاختبارات</span>
          </div>
        </div>
      </main>
    </div>
  );
}
