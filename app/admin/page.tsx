"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { waLink } from "@/lib/payments";

type PaymentRow = {
  id: string; amount_kzt: number; proof_url: string | null; status: string; created_at: string; user_id: string; course_id: string;
};

export default function AdminPage() {
  const [err, setErr] = useState("");
  const [role, setRole] = useState<string>("");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setErr("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { window.location.href = "/auth"; return; }

    const { data: prof, error: e1 } = await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
    if (e1) { setErr(e1.message); setLoading(false); return; }
    const r = (prof as any)?.role || "user";
    setRole(r);

    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message);
    setPayments((data ?? []) as any);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(p: PaymentRow) {
    setErr("");
    try {
      const { error: e1 } = await supabase.from("payments").update({ status: "approved" }).eq("id", p.id);
      if (e1) throw e1;

      const { data: enr } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", p.user_id)
        .eq("course_id", p.course_id)
        .maybeSingle();

      if (!enr) {
        const { error: e2 } = await supabase.from("enrollments").insert({ user_id: p.user_id, course_id: p.course_id, status: "active" });
        if (e2) throw e2;
      } else {
        const { error: e3 } = await supabase.from("enrollments").update({ status: "active" }).eq("id", (enr as any).id);
        if (e3) throw e3;
      }

      await load();
    } catch (e: any) {
      setErr(e.message || "Қате");
    }
  }

  async function reject(p: PaymentRow) {
    setErr("");
    try {
      const { error } = await supabase.from("payments").update({ status: "rejected" }).eq("id", p.id);
      if (error) throw error;
      await load();
    } catch (e: any) {
      setErr(e.message || "Қате");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black">Admin</h1>
      <div className="mt-3 flex gap-2">
        <a href="/admin/courses" className="no-underline font-black border-2 border-ink rounded-xl px-3 py-1">Курстар</a>
      </div>
      <p className="mt-2 text-sm opacity-80">Role: {role || "—"} (admin болу үшін profiles.role='admin')</p>
      {err && <p className="mt-3 text-sm">{err}</p>}

      {loading ? (
        <p className="mt-6 opacity-80">Жүктелуде...</p>
      ) : role !== "admin" ? (
        <Card>
          <p className="font-bold">Қол жеткізу жоқ</p>
          <p className="text-sm opacity-80 mt-1">Supabase-та профиліңізге admin рөлін беріңіз.</p>
        </Card>
      ) : (
        <div className="grid gap-4 mt-6">
          {payments.length === 0 ? (
            <Card><p className="opacity-80">Төлемдер жоқ.</p></Card>
          ) : (
            payments.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-black">{p.amount_kzt.toLocaleString("kk-KZ")} ₸ • <span className="uppercase">{p.status}</span></p>
                    <p className="text-xs opacity-80 mt-1">{new Date(p.created_at).toLocaleString()}</p>
                    {p.proof_url && (
                      <p className="text-sm mt-2">Чек: <a className="no-underline" href={p.proof_url} target="_blank">ашу</a></p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
  {p.status === "approved" && (
    <>
      <a
        className="no-underline font-black border-2 border-ink rounded-xl px-3 py-2 bg-sun text-ink"
        href={waLink(`Сәлеметсіз бе! Төлеміңіз расталды ✅ Курс ашылды. Уuid: ${p.user_id}`)}
        target="_blank"
      >
        Notify WhatsApp
      </a>
      <a
        className="no-underline font-black border-2 border-ink rounded-xl px-3 py-2 bg-ink text-snow"
        href={`mailto:?subject=${encodeURIComponent("Төлем расталды")}&body=${encodeURIComponent("Сәлеметсіз бе! Төлеміңіз расталды ✅ Курс ашылды.")}`}
      >
        Email
      </a>
    </>
  )}
                    <Button onClick={() => approve(p)} variant="sun">Approve</Button>
                    <Button onClick={() => reject(p)} variant="ink">Reject</Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
