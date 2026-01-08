"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Course, Lesson } from "@/lib/types";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function CoursePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      const { data: c, error: e1 } = await supabase.from("courses").select("*").eq("slug", slug).single();
      if (e1) return setErr(e1.message);
      setCourse(c as Course);

      const { data: l, error: e2 } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", (c as any).id)
        .order("sort_order", { ascending: true });

      if (e2) return setErr(e2.message);
      setLessons((l ?? []) as Lesson[]);

      // progress
const { data: userData } = await supabase.auth.getUser();
if (userData.user) {
  const { data: pr } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .in("lesson_id", (l ?? []).map((x:any)=>x.id));
  const s = new Set<string>((pr ?? []).map((x:any)=>x.lesson_id));
  setCompletedIds(s);
}
    })();
  }, [slug]);

  const freeLesson = useMemo(() => lessons.find((x) => x.is_free), [lessons]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {err && <p className="text-sm">{err}</p>}
      {!course ? (
        <p className="opacity-80">Жүктелуде...</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-black">{course.title}</h1>
            {course.subtitle && <p className="mt-2 opacity-90">{course.subtitle}</p>}

            <div className="mt-6 space-y-3">
              <h2 className="text-xl font-black">Сабақтар</h2>
              {lessons.length === 0 ? (
                <p className="opacity-80 text-sm">Әзірше сабақтар жоқ (admin қосады).</p>
              ) : (
                <div className="space-y-2">
                  {lessons.map((ls) => (
                    <div key={ls.id} className="flex items-center justify-between border-2 border-ink rounded-xl px-3 py-2">
                      <div>
                        <p className="font-bold">{completedIds.has(ls.id) ? "✅ " : ""}{ls.title}</p>
                        <p className="text-xs opacity-80">{ls.is_free ? "Пробный • тегін" : "Негізгі • ақылы"}</p>
                      </div>
                      <Button href={`/learn/${course.slug}/${ls.id}`} variant={ls.is_free ? "sun" : "ink"}>
                        {ls.is_free ? "Көру" : "Ашу"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Card>
            <p className="text-sm opacity-80">Курс бағасы</p>
            <p className="text-sm mt-2 opacity-80">Прогресс: <span className="font-black">{lessons.length ? Math.round((completedIds.size/lessons.length)*100) : 0}%</span></p>
            <p className="text-3xl font-black mt-1">{course.price_kzt.toLocaleString("kk-KZ")} ₸</p>

            <div className="mt-4 space-y-2">
              {freeLesson ? (
                <Button href={`/learn/${course.slug}/${freeLesson.id}`} variant="sun" full>
                  Пробный сабақты көру
                </Button>
              ) : (
                <p className="text-sm opacity-80">Пробный сабақ қосылмаған.</p>
              )}
              <Button href="/dashboard" variant="ink" full>Кабинетке өту</Button>
            </div>

            <div className="mt-4 text-sm">
              <p className="font-bold">Төлем</p>
              <p className="opacity-80">Kaspi: {process.env.NEXT_PUBLIC_KASPI_PHONE || "87770977767"} • чек жүктеу → admin approve</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
