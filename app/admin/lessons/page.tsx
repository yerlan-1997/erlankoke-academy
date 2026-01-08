"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";

type Lesson = { id:string; title:string; sort_order:number; is_free:boolean; video_url:string|null; content_md:string|null };

export default function AdminLessons() {
  const params = useSearchParams();
  const courseId = params.get("course");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState({ title:"", sort_order:1, is_free:false, video_url:"", content_md:"", pdf_url:"" });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    if (!courseId) return;
    const { data } = await supabase.from("lessons").select("*").eq("course_id", courseId).order("sort_order",{ascending:true});
    setLessons((data??[]) as Lesson[]);
  }
  useEffect(()=>{ load(); },[courseId]);

  async function save() {
    setMsg("");
    if (!courseId) return;
    let pdf_url = form.pdf_url;
if (pdfFile) {
  const path = `course-${courseId}/${Date.now()}-${pdfFile.name}`;
  const up = await supabase.storage.from("lesson_files").upload(path, pdfFile, { upsert: false });
  if (up.error) { setMsg(up.error.message); return; }
  const { data: pub } = supabase.storage.from("lesson_files").getPublicUrl(path);
  pdf_url = pub.publicUrl;
}

const { error } = await supabase.from("lessons").insert({ ...form, pdf_url, course_id: courseId });
    if (error) setMsg(error.message); else { setMsg("Қосылды"); setForm({ title:"", sort_order:1, is_free:false, video_url:"", pdf_url: "", content_md:"" }); load(); }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-black">Admin • Сабақтар</h1>

      <Card>
        <h2 className="text-xl font-black">Жаңа сабақ</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <input className="border-2 border-ink rounded-xl px-3 py-2" placeholder="Атауы"
            value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <input type="number" className="border-2 border-ink rounded-xl px-3 py-2" placeholder="Реті"
            value={form.sort_order} onChange={e=>setForm({...form, sort_order:+e.target.value})}/>
          <input className="border-2 border-ink rounded-xl px-3 py-2" placeholder="YouTube link (unlisted)"
            value={form.video_url} onChange={e=>setForm({...form, video_url:e.target.value})}/>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_free}
              onChange={e=>setForm({...form, is_free:e.target.checked})}/> Тегін (пробный)
          </label>
          <div className="md:col-span-2">
  <label className="text-sm font-bold">PDF / материал (міндетті емес)</label>
  <input type="file" accept=".pdf" className="w-full mt-1"
    onChange={e=>setPdfFile(e.target.files?.[0] ?? null)} />
  <p className="text-xs opacity-80 mt-1">Bucket: lesson_files</p>
</div>

<textarea className="border-2 border-ink rounded-xl px-3 py-2 md:col-span-2" rows={4}
            placeholder="Мәтін / тапсырма"
            value={form.content_md} onChange={e=>setForm({...form, content_md:e.target.value})}/>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={save} variant="sun">Қосу</Button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </Card>

      <div className="grid gap-3">
        {lessons.map(l=>(
          <Card key={l.id}>
            <p className="font-black">{l.sort_order}. {l.title}</p>
            <p className="text-xs opacity-80">{l.is_free?"FREE":"PAID"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
