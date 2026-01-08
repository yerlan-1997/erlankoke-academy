import Card from "@/components/Card";
import Button from "@/components/Button";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 bg-sun text-ink border-2 border-ink px-3 py-1 rounded-full font-black">
            Жарқын дизайн • Ақ + Сары + Қара
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">Дұрыс математик & Шексперимент</h1>
          <p className="text-lg opacity-90">Пробный сабақтар тегін. Негізгі сабақтар төлемнен кейін ашылады.</p>
          <div className="flex gap-3 flex-wrap">
            <Button href="/courses" variant="sun">Курстарды көру</Button>
            <Button href="/auth" variant="ink">Телефонмен кіру</Button>
          </div>
          <p className="text-sm opacity-80">Төлем: Kaspi (қолмен растау) • Чек жүктейсіз → Admin approve → сабақтар ашылады</p>
        </div>

        <Card>
          <h2 className="text-2xl font-black">Функциялар</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>✅ Телефонмен OTP кіру</li>
            <li>✅ Пробный сабақ — тегін</li>
            <li>✅ Ақылы сабақ — тек төлемнен кейін</li>
            <li>✅ Admin панель: төлемді растау</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
