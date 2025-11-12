import { Link } from "react-router-dom";
import type { NewsItem } from "../../app/data/news";
import ArticleMeta from "./ArticleMeta";

type NewsCardProps = {
  item: NewsItem;
};

export default function NewsCard({ item }: NewsCardProps) {
  return (
    <article
      tabIndex={0}
      className="group flex flex-col gap-6 rounded-2xl transition duration-200 hover:translate-y-0.5 hover:ring-1 hover:ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C38A] lg:flex-row lg:items-stretch"
    >
      <div className="aspect-[16/9] flex-shrink-0 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:w-[420px]">
        <img
          src={`${import.meta.env.BASE_URL}${item.cover.replace(/^\//, "")}`}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between space-y-4 text-white">
        <div className="space-y-3">
          <ArticleMeta date={item.date} views={item.views} />
          <h2 className="font-semibold text-xl leading-snug text-white line-clamp-2 md:text-2xl">
            {item.title}
          </h2>
          <p className="text-base text-white/80 line-clamp-3 md:text-lg">{item.excerpt}</p>
        </div>
        <div>
          <Link
            to={`/news/${item.slug}`}
            className="inline-flex items-center rounded-full bg-[#00C38A] px-5 py-2 font-semibold text-[#001b16] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00C38A] focus-visible:ring-offset-[#0A171E]"
            aria-label={`Читать: ${item.title}`}
          >
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}
