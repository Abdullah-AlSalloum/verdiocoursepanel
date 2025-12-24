
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import AuthButton from "../components/AuthButton";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div dir="rtl" style={{fontFamily: 'Cairo, Noto Sans Arabic, sans-serif'}}>جاري التحميل...</div>;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black" dir="rtl" style={{fontFamily: 'Cairo, Noto Sans Arabic, sans-serif'}}>
        <main className="flex flex-col items-center justify-center gap-8 bg-white dark:bg-black p-8 rounded shadow">
          <h1 className="text-2xl font-bold">تسجيل الدخول للوحة التحكم</h1>
          <AuthButton />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black" dir="rtl" style={{fontFamily: 'Cairo, Noto Sans Arabic, sans-serif'}}>
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="self-end mb-4"><AuthButton /></div>
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="شعار نكست جي إس"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-right">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            مرحبًا بك في لوحة التحكم!
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            لقد سجلت الدخول باستخدام جوجل. ستظهر ميزات لوحة التحكم هنا.
          </p>
        </div>
      </main>
    </div>
  );
}
