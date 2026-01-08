insert into public.courses (slug, title, subtitle, price_kzt, is_published)
values
  ('durys-matematik', 'Дұрыс математик', 'Математика курсы • жүйелі дайындық', 25000, true),
  ('sheksperiment', 'Шексперимент', 'Математикалық сауаттылық • практикалық есептер', 25000, true)
on conflict (slug) do update
set title=excluded.title, subtitle=excluded.subtitle, price_kzt=excluded.price_kzt, is_published=excluded.is_published;

do $$
declare c record;
begin
  for c in select id, slug from public.courses loop
    insert into public.lessons (course_id, title, sort_order, is_free, video_url, content_md)
    values
      (c.id, 'Пробный сабақ: Кіріспе', 1, true, null, 'Бұл пробный сабақ. Мұнда қысқаша таныстыру және 2-3 үлгі есеп болады.'),
      (c.id, 'Негізгі сабақ 1', 2, false, null, 'Ақылы сабақ: толық түсіндірме + тапсырма.'),
      (c.id, 'Негізгі сабақ 2', 3, false, null, 'Ақылы сабақ: практика + тест.')
    on conflict do nothing;
  end loop;
end $$;
