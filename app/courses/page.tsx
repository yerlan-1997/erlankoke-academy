"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Course } from "@/lib/types";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: true });

      if (error) setErr(error.message);
      else setCourses((data ?? []) as Course[]);
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black">Курстар</h1>
      {err && <p className="mt-3 text-sm">{err}</p>}

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {courses.map((c) => (
          <Card key={c.id}>
            <h2 className="text-2xl font-black">{c.title}</h2>
            {c.subtitle && <p className="mt-2 opacity-90">{c.subtitle}</p>}
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-black">{c.price_kzt.toLocaleString("kk-KZ")} ₸</p>
              <Button href={`/course/${c.slug}`} variant="sun">Ашу</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
