import type { FC } from "react";

type RichContentProps = {
  html: string;
};

const RichContent: FC<RichContentProps> = ({ html }) => {
  return (
    <div className="rich-content" dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export default RichContent;
