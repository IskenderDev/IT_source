import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import ArticleMeta from "../../components/News/ArticleMeta";
import RichContent from "../../components/News/RichContent";
import { NEWS } from "../../app/data/news";
import { setPageTitle, updateMetaName, updateMetaProperty } from "../../lib/seo";

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = useMemo(
    () => NEWS.find((item) => item.slug === slug),
    [slug],
  );

  useEffect(() => {
    if (!article) {
      setPageTitle("Статья не найдена | ITSource");
      return;
    }

    setPageTitle(`${article.title} | ITSource`);
    updateMetaName("description", article.excerpt);

    const coverPath = `${import.meta.env.BASE_URL}${article.cover.replace(/^\//, "")}`;
    updateMetaProperty("og:title", `${article.title} | ITSource`);
    updateMetaProperty("og:type", "article");
    updateMetaProperty("og:image", coverPath);

    const isoDate = new Date(article.date);
    if (!Number.isNaN(isoDate.getTime())) {
      updateMetaProperty("article:published_time", isoDate.toISOString());
    }
  }, [article]);

  if (!article) {
    return (
      <main className="bg-[#0A171E] text-white">
        <div className="mx-auto flex min-h-[60vh] max-w-[1280px] flex-col items-center justify-center gap-6 px-4 py-16 text-center md:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold md:text-4xl">Статья не найдена</h1>
          <p className="max-w-xl text-white/70">
            Мы не нашли материал с таким адресом. Возможно, ссылка устарела или была удалена.
          </p>
          <Link
            to="/news"
            className="inline-flex items-center rounded-full bg-[#00C38A] px-5 py-2 font-semibold text-[#001b16] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00C38A] focus-visible:ring-offset-[#0A171E]"
          >
            Назад к новостям
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#0A171E] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6 lg:px-8">
        <div className="flex flex-col gap-10">
          <div className="aspect-[16/9] overflow-hidden rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <img
              src={`${import.meta.env.BASE_URL}${article.cover.replace(/^\//, "")}`}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6">
            <ArticleMeta date={article.date} views={article.views} />
            <h1 className="font-semibold text-3xl leading-tight text-white md:text-4xl">{article.title}</h1>
            <RichContent html={article.content} />
          </div>
        </div>
      </div>
    </main>
  );
}
