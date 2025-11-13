import { useEffect } from "react";
import NewsCard from "../../components/News/NewsCard";
import { NEWS } from "../../app/data/news";
import { setPageTitle, updateMetaName } from "../../lib/seo";

const META_DESCRIPTION = "Свежие статьи о внедрении и интеграциях";

export default function NewsList() {
  useEffect(() => {
    setPageTitle("Статьи | ITSource");
    updateMetaName("description", META_DESCRIPTION);
  }, []);

  return (
    <main className="bg-[#011627] min-h-screen w-full text-white pt-22">
      <div className="mx-auto flex flex-col gap-10 px-4 py-10 md:px-6 lg:px-8 ">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#00C38A]">Новости</p>
          <h1 className="max-w-2xl font-semibold text-3xl leading-tight text-white md:text-4xl">
            Экспертиза ITSource: внедрения, интеграции и автоматизация процессов
          </h1>
          <p className="max-w-3xl text-base text-white/75 md:text-lg">{META_DESCRIPTION}</p>
        </header>
        <div className="flex flex-col space-y-10">
          {NEWS.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
