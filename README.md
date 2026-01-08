# erlankoke.kz • Academy (starter)

Ақ+сары+қара дизайн, телефонмен OTP, пробный сабақтар тегін, ақылы сабақтар төлемнен кейін ашылады (admin approve).

## Орнату
```bash
npm i
cp .env.example .env.local
# .env.local ішіне SUPABASE keys қойыңыз
npm run dev
```

## Supabase setup
1) Auth → Phone: ENABLE
2) Storage → bucket: `payment_proofs` → Public: ON (MVP үшін)
3) SQL: `supabase/schema.sql`, `supabase/seed.sql`, `supabase/rls.sql` орындаңыз
4) Өз профиліңізді admin қылу: Table editor → profiles → role='admin'

Kaspi номер: 87770977767
Баға: 25000 ₸


## WhatsApp батырмасы
`NEXT_PUBLIC_SUPPORT_WHATSAPP=87770977767`

## YouTube (жабық/unlisted)
Сабаққа видео қою үшін `lessons.video_url` өрісіне YouTube сілтемесін (watch/short/youtu.be) қойсаңыз болады — сайт өзі embed форматына келтіреді.


## Қосымша Storage bucket (PDF/файл)
Supabase → Storage → bucket жасаңыз:
- Name: `lesson_files`
- Public: **ON** (MVP үшін)

> Кейін Public OFF жасап, signed URL-ға көшеміз.


## Deploy (Vercel) + erlankoke.kz
1) GitHub-қа push
2) Vercel → New Project → repo таңдаңыз
3) Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_KASPI_PHONE=87770977767
- NEXT_PUBLIC_SUPPORT_WHATSAPP=87770977767
4) Deploy
5) Vercel → Domains → `erlankoke.kz` қосыңыз (DNS жазбаларын Vercel көрсетеді)
