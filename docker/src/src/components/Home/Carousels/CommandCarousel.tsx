import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { COMMAND_SLIDES } from "../../../app/data/slides";

export default function CommandCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const highlightText = (text: string, highlights: string[]) => {
    if (!text) return null;
    const regex = new RegExp(`(${highlights.join("|")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      highlights.some(h => h.toLowerCase() === part.toLowerCase()) ? (
        <span key={i} className="text-[#03CEA4] font-semibold">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <section className="relative w-full  py-10 md:py-16 overflow-visible">
      <div className="relative w-full max-w-[1400px] mx-auto px-4">

        {/* Кнопки */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-[#03CEA4] items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition z-10"
          aria-label="Назад"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-[#03CEA4] items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition z-10"
          aria-label="Вперед"
        >
          <ChevronRight />
        </button>

        {/* Слайды */}
        <div ref={emblaRef} className="overflow-visible">
          <div className="flex mt-10">
            {COMMAND_SLIDES.map((slide, i) => (
              <div key={i} className="flex-[0_0_100%] px-2 md:px-4">
                {slide.type === "intro" ? (
                  // --- Слайд с фото и текстом ---
                  <div className="flex flex-col md:flex-row items-center justify-between w-full  rounded-[28px] overflow-hidden p-4 md:p-10">
                    <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
                      <img
                        src={slide.image}
                        alt="Команда"
                        className="rounded-[28px] w-full max-w-[700px] object-cover shadow-lg"
                      />
                    </div>
                    <div className="w-full md:w-1/2 text-white text-center md:text-left px-4 md:px-8">
                      <p className="text-base sm:text-lg md:text-xl leading-relaxed">
                        {highlightText(slide.text ?? "", [
                          "IT Source",
                          "ИТ-инфраструктуру для бизнеса любого масштаба",
                        ])}
                      </p>
                    </div>
                  </div>
                ) : (
                  // --- Слайд с карточками команды (ромб) ---
                  <div className="relative bg-gradient-to-b rounded-[28px] py-24 px-4 md:px-12 flex flex-col items-center min-h-[800px] overflow-visible">
                    <div className="relative w-full max-w-[900px] mx-auto mt-10">
                      {/* Центральная структура */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-0">
                        <TeamCard {...slide.cards?.[0]} />
                      </div>

                      <div className="absolute left-[8%] top-[25%]">
                        <TeamCard {...slide.cards?.[1]} />
                      </div>

                      <div className="absolute right-[8%] top-[25%]">
                        <TeamCard {...slide.cards?.[2]} />
                      </div>

                      <div className="absolute left-[22%] bottom-[10%]">
                        <TeamCard {...slide.cards?.[3]} />
                      </div>

                      <div className="absolute right-[22%] bottom-[10%]">
                        <TeamCard {...slide.cards?.[4]} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Индикаторы */}
        <div className="mt-6 flex w-full justify-center gap-2">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Слайд ${i + 1}`}
              className={`h-1.5 rounded-full transition ${
                selectedIndex === i
                  ? "w-8 bg-emerald-400"
                  : "w-1.5 bg-gray-500 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Компонент карточки сотрудника --- */
function TeamCard({
  image,
  username,
  role,
}: {
  image?: string;
  username?: string;
  role?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center text-white transform hover:scale-105 transition">
      <img
        src={image}
        alt={username}
        className="w-32 h-32 md:w-36 md:h-36 object-cover rounded-full mb-3 shadow-xl border-4 border-[#012B3F]"
      />
      <h3 className="text-base md:text-lg font-semibold">{role}</h3>
      <p className="text-sm text-gray-300 mt-1">{username}</p>
    </div>
  );
}

/* --- Иконки --- */
function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M15 18l-6-6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M9 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
