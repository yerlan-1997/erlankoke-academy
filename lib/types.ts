export type Course = {
  id: string; slug: string; title: string; subtitle: string | null;
  price_kzt: number; is_published: boolean;
};
export type Lesson = {
  id: string; course_id: string; title: string; sort_order: number;
  is_free: boolean; video_url: string | null; content_md: string | null;
  pdf_url: string | null;
};
