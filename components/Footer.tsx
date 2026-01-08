export default function Footer() {
  return (
    <footer className="border-t-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm flex flex-col gap-1">
        <p className="font-bold">© {new Date().getFullYear()} erlankoke.kz</p>
        <p className="opacity-80">Пробный сабақтар тегін. Негізгі сабақтар төлемнен кейін ашылады.</p>
      </div>
    </footer>
  );
}
