"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/Card";
import Button from "@/components/Button";

type Course = { id:string; slug:string; title:string; subtitle:string|null; price_kzt:number; is_published:boolean };

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ slug:"", title:"", subtitle:"", price_kzt:25000, is_published:true });
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await supabase.from("courses").select("*").order("created_at",{ascending:false});
    setCourses((data??[]) as Course[]);
  }
  useEffect(()=>{ load(); },[]);

  async function save() {
    setMsg("");
    const { error } = await supabase.from("courses").upsert(form);
    if (error) setMsg(error.message); else { setMsg("Сақталды"); setForm({ slug:"", title:"", subtitle:"", price_kzt:25000, is_published:true }); load(); }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-black">Admin • Курстар</h1>

      <Card>
        <h2 className="text-xl font-black">Жаңа курс</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <input className="border-2 border-ink rounded-xl px-3 py-2" placeholder="slug (latin)"
            value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})}/>
          <input className="border-2 border-ink rounded-xl px-3 py-2" placeholder="Атауы"
            value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <input className="border-2 border-ink rounded-xl px-3 py-2" placeholder="Сипаттама"
            value={form.subtitle} onChange={e=>setForm({...form, subtitle:e.target.value})}/>
          <input type="number" className="border-2 border-ink rounded-xl px-3 py-2" placeholder="Баға"
            value={form.price_kzt} onChange={e=>setForm({...form, price_kzt:+e.target.value})}/>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_published}
              onChange={e=>setForm({...form, is_published:e.target.checked})}/> Жариялау
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={save} variant="sun">Сақтау</Button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </Card>

      <div className="grid gap-3">
        {courses.map(c=>(
          <Card key={c.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black">{c.title}</p>
                <p className="text-xs opacity-80">{c.slug} • {c.price_kzt} ₸ • {c.is_published?"ON":"OFF"}</p>
              </div>
              <Button href={`/admin/lessons?course=${c.id}`} variant="ink">Сабақтар</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
