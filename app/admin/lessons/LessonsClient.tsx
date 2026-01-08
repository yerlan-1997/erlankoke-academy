"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type LessonForm = {
  title: string;
  sort_order: number;
  is_free: boolean;
  video_url: string;
  pdf_url: string;
  content_md: string;
};

export default function LessonsClient() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("course");

  const [form, setForm] = useState<LessonForm>({
    title: "",
    sort_order: 1,
    is_free: false,
    video_url: "",
    pdf_url: "",
    content_md: "",
  });

  const [msg, setMsg] = useState("");

  async function load() {
    // кейін керек болады
  }

  async function save() {
    if (!courseId) {
      setMsg("courseId жоқ");
      return;
    }

    const { error } = await supabase.from("lessons").insert({
      ...form,
      course_id: courseId,
    });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg("Қосылды");
      setForm({
        title: "",
        sort_order: 1,
        is_free: false,
        video_url: "",
        pdf_url: "",
        content_md: "",
      });
      load();
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Lessons</h1>

      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <button onClick={save}>Save</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
