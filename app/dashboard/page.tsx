"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/Card";
import { KASPI_PHONE, waLink } from "@/lib/payments";

import Button from "@/components/Button";
import type { Course } from "@/lib/types";

type EnrollmentRow = { id: string; status: string; courses: Course };

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string>("");
  const [enrolls, setEnrolls] = useState<EnrollmentRow[]>([]);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { window.location.href = "/auth"; return; }

      const { data: p } = await supabase.from("profiles").select("phone").eq("id", userData.user.id).maybeSingle();
      setPhone((p as any)?.phone ?? (userData.user.phone ?? ""));

      const { data: e, error } = await supabase
        .from("enrollments")
        .select("id,status,courses(*)")
        .order("created_at", { ascending: false });

      if (error) setErr(error.message);
      setEnrolls((e ?? []) as any);

      // overall progress (all lessons you can see)
      const { data: allLessons } = await supabase.from('lessons').select('id');
      const { data: done } = await supabase.from('lesson_progress').select('lesson_id');
      const total = (allLessons ?? []).length;
      const d = (done ?? []).length;
      setProgressPct(total ? Math.round((d/total)*100) : 0);
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black">Жеке кабинет</h1>
          <p className="mt-2 text-sm opacity-80">Пайдаланушы: {phone || "—"}</p>
        </div>
        <div className="flex gap-3">
          <Button href="/courses" variant="sun">Курстар</Button>
          <Button onClick={signOut} variant="ink">Шығу</Button>
        </div>
      </div>

      {err && <p className="mt-4 text-sm">{err}</p>}
      {loading ? (
        <p className="mt-6 opacity-80">Жүктелуде...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <h2 className="text-xl font-black">Менің курстарым</h2>
            <p className="text-sm mt-2 opacity-80">Жалпы прогресс: <span className="font-black">{progressPct}%</span></p>
            <p className="text-sm opacity-80 mt-1">Төлем жасасаңыз — статус active болады.</p>
            <div className="mt-4 space-y-2">
              {enrolls.length === 0 ? (
                <p className="text-sm opacity-80">Әзірге жазылым жоқ.</p>
              ) : (
                enrolls.map((x) => (
                  <div key={x.id} className="border-2 border-ink rounded-xl p-3">
                    <p className="font-black">{x.courses.title}</p>
                    <p className="text-xs opacity-80">Статус: {x.status}</p>
                    <div className="mt-2">
                      <Button href={`/course/${x.courses.slug}`} variant="sun">Ашу</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black">Kaspi төлем</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 items-center">
  <div className="border-2 border-ink rounded-xl p-3">
    <p className="text-sm opacity-80">Kaspi номер</p>
    <p className="text-2xl font-black">{KASPI_PHONE}</p>
    <p className="text-xs opacity-80 mt-1">Төлем мақсаты: “Курс • {phone || "телефон"}”</p>
  </div>
  <div className="border-2 border-ink rounded-xl p-3 flex items-center justify-center">
    <img src="/kaspi-qr.png" alt="Kaspi QR" className="w-40 h-40 object-contain" />
  </div>
</div>

<div className="mt-3">
  <Button
    href={waLink(`Сәлеметсіз бе! Мен erlankoke.kz курсқа 25 000 ₸ төледім. Телефон: ${phone || ""}`)}
    variant="sun"
    full
  >
    WhatsApp: Төлем жасадым
  </Button>
</div>

</Card>
        </div>
      )}
    </div>
  );
}
