import type { FC } from "react";

type ArticleMetaProps = {
  date: string;
  views: number;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

const ArticleMeta: FC<ArticleMetaProps> = ({ date, views }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-white/70 md:text-base">
      <span>{formatDate(date)}</span>
      <span className="inline-flex items-center gap-1.5">
      </span>
    </div>
  );
};

export default ArticleMeta;
