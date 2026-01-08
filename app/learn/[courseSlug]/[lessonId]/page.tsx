"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Course, Lesson } from "@/lib/types";
import { KASPI_PHONE, waLink, normalizeYouTubeEmbed } from "@/lib/payments";
import Card from "@/components/Card";
import Button from "@/components/Button";

type Gate = "loading" | "free" | "paid_ok" | "needs_payment" | "not_found";

export default function LearnPage() {
  const params = useParams<{ courseSlug: string; lessonId: string }>();
  const courseSlug = params.courseSlug;
  const lessonId = params.lessonId;

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [gate, setGate] = useState<Gate>("loading");
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [amount, setAmount] = useState<number>(25000);
  const [completed, setCompleted] = useState(false);
  const kaspi = KASPI_PHONE;

  useEffect(() => {
    (async () => {
      setErr(""); setGate("loading");
      const { data: c, error: e1 } = await supabase.from("courses").select("*").eq("slug", courseSlug).single();
      if (e1) { setErr(e1.message); setGate("not_found"); return; }
      setCourse(c as Course);

      const { data: l, error: e2 } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
      if (e2) { setErr("Сабақ табылмады немесе рұқсат жоқ."); setGate("not_found"); return; }
      setLesson(l as Lesson);

      const { data: userData2 } = await supabase.auth.getUser();
      if (userData2.user) {
        const { data: pr } = await supabase.from("lesson_progress").select("lesson_id").eq("lesson_id", lessonId).maybeSingle();
        setCompleted(!!pr);
      }

      if ((l as any).is_free) { setGate("free"); return; }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { window.location.href = "/auth"; return; }

      const { data: en } = await supabase
        .from("enrollments")
        .select("status")
        .eq("course_id", (c as any).id)
        .maybeSingle();

      if ((en as any)?.status === "active") setGate("paid_ok");
      else setGate("needs_payment");
    })();
  }, [courseSlug, lessonId]);

  const videoEmbed = useMemo(() => {
    if (!lesson?.video_url) return null;
    const url = normalizeYouTubeEmbed(lesson.video_url);
    const isEmbed = url.includes("youtube.com/embed") || url.includes("player.vimeo.com") || url.includes("embed");
    return { url, isEmbed };
  }, [lesson]);

  async function ensureEnrollment(courseId: string) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Auth керек");

    const { data: existing } = await supabase
      .from("enrollments")
      .select("id,status")
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) return existing;

    const { data, error } = await supabase
      .from("enrollments")
      .insert({ course_id: courseId, user_id: userData.user.id, status: "pending" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function uploadProof(file: File) {
    if (!course) return;
    setUploading(true); setErr("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { window.location.href = "/auth"; return; }

      await ensureEnrollment(course.id);

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userData.user.id}/${course.slug}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from("payment_proofs").upload(path, file, {
        upsert: false, contentType: file.type || "application/octet-stream",
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("payment_proofs").getPublicUrl(path);

      const { error: payErr } = await supabase.from("payments").insert({
        user_id: userData.user.id,
        course_id: course.id,
        amount_kzt: amount,
        method: "kaspi",
        proof_url: pub.publicUrl,
        status: "pending",
      });
      if (payErr) throw payErr;

      setErr("Чек жіберілді ✅ Admin растағаннан кейін сабақтар ашылады.");
    } catch (e: any) {
      setErr(e.message || "Қате");
    } finally {
      setUploading(false);
    }
  }

  async function toggleComplete() {
  setErr("");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) { window.location.href = "/auth"; return; }

  if (!completed) {
    const { error } = await supabase.from("lesson_progress").insert({
      user_id: userData.user.id,
      lesson_id: lessonId,
      completed: true
    });
    if (error && !String(error.message).toLowerCase().includes("duplicate")) return setErr(error.message);
    setCompleted(true);
  } else {
    const { error } = await supabase.from("lesson_progress").delete().eq("lesson_id", lessonId).eq("user_id", userData.user.id);
    if (error) return setErr(error.message);
    setCompleted(false);
  }
}

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {err && <p className="text-sm">{err}</p>}
      {!lesson || !course ? (
        <p className="opacity-80">Жүктелуде...</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl font-black">{lesson.title}</h1>
            <p className="text-sm opacity-80">
              Курс: <span className="font-bold">{course.title}</span> • {lesson.is_free ? "Пробный (тегін)" : "Негізгі (ақылы)"}
            </p>

            {(gate === "free" || gate === "paid_ok") ? (
              <Card>
                <h2 className="text-xl font-black">Сабақ</h2>

                {videoEmbed?.isEmbed ? (
                  <div className="mt-3 aspect-video border-2 border-ink rounded-2xl overflow-hidden">
                    <iframe className="w-full h-full" src={videoEmbed.url} allowFullScreen />
                  </div>
                ) : lesson.video_url ? (
                  <p className="mt-3 text-sm">Видео: <a href={lesson.video_url} target="_blank" className="no-underline">Сілтемені ашу</a></p>
                ) : (
                  <p className="mt-3 text-sm opacity-80">Видео әлі қойылмаған.</p>
                )}

                {lesson.content_md && <pre className="mt-4 whitespace-pre-wrap text-sm">{lesson.content_md}</pre>}

<div className="mt-4 grid sm:grid-cols-2 gap-2">
  <Button onClick={toggleComplete} variant={completed ? "ink" : "sun"} full>
    {completed ? "Өтілді: алып тастау" : "Өтілді деп белгілеу"}
  </Button>
  {lesson.pdf_url ? (
    <a
      href={lesson.pdf_url}
      target="_blank"
      className="inline-flex items-center justify-center rounded-xl border-2 border-ink px-4 py-2 font-black no-underline bg-sun text-ink"
    >
      PDF / Материал
    </a>
  ) : (
    <div className="text-xs opacity-80 flex items-center justify-center border-2 border-ink rounded-xl px-3 py-2">
      PDF жоқ
    </div>
  )}
</div>
              </Card>
            ) : gate === "needs_payment" ? (
              <Card>
                <h2 className="text-xl font-black">Төлем керек</h2>
                <p className="text-sm opacity-80 mt-1">Бұл — ақылы сабақ. Kaspi арқылы төлем жасап, чек жүктеңіз.</p>

                <div className="mt-4 grid sm:grid-cols-2 gap-3 items-center">
  <div className="border-2 border-ink rounded-xl p-3">

                  <p className="text-sm opacity-80">Kaspi номер</p>
                  <p className="text-2xl font-black">{kaspi}</p>
                  <p className="text-xs opacity-80 mt-1">Төлем мақсаты: “{course.title}”</p>
                </div>
  <div className="border-2 border-ink rounded-xl p-3 flex items-center justify-center">
    <img src="/kaspi-qr.png" alt="Kaspi QR" className="w-40 h-40 object-contain" />
  </div>
</div>

<div className="mt-3">
  <Button
    href={waLink(`Сәлеметсіз бе! Мен "${course.title}" курсына ${amount} ₸ төледім. Сабақ: "${lesson.title}".`)}
    variant="sun"
    full
  >
    WhatsApp: Төлем жасадым
  </Button>
</div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3 items-end">

                  <div>
                    <label className="text-sm font-bold">Сома (₸)</label>
                    <input type="number" className="w-full mt-1 border-2 border-ink rounded-xl px-3 py-2"
                      value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))} min={0} />
                    <p className="text-xs opacity-80 mt-1">Әдепкі: 25000 ₸</p>
                  </div>

                  <div>
                    <label className="text-sm font-bold">Чек/скрин жүктеу</label>
                    <input type="file" accept="image/*,.pdf" className="w-full mt-1" disabled={uploading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProof(f); }} />
                    <p className="text-xs opacity-80 mt-1">{uploading ? "Жүктелуде..." : "PNG/JPG/PDF"}</p>
                  </div>
                </div>

                <div className="mt-4"><Button href="/dashboard" variant="ink">Кабинетке қайту</Button></div>
              </Card>
            ) : (
              <p className="opacity-80">Тексеру...</p>
            )}
          </div>

          <Card>
            <h2 className="text-xl font-black">Навигация</h2>
            <div className="mt-3 space-y-2">
              <Button href={`/course/${course.slug}`} variant="sun" full>Курс беті</Button>
              <Button href="/courses" variant="ink" full>Барлық курстар</Button>
              <Button href="/dashboard" variant="ink" full>Кабинет</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
