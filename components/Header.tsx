"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-snow/90 backdrop-blur border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="no-underline">
          <div className="inline-flex items-center gap-2">
            <span className="bg-sun border-2 border-ink px-3 py-1 rounded-full font-black">erlankoke.kz</span>
            <span className="font-black">Academy</span>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-bold">
          <Link href="/courses" className="no-underline hover:opacity-80">Курстар</Link>
          {authed ? (
            <>
              <Link href="/dashboard" className="no-underline hover:opacity-80">Кабинет</Link>
              <Link href="/admin" className="no-underline hover:opacity-80">Admin</Link>
            </>
          ) : (
            <Link href="/auth" className="no-underline hover:opacity-80">Кіру</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
