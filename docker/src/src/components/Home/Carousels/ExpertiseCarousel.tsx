import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button, SectionTitle } from "../../ui";
import { EXPERTISE_SLIDES } from "../../../app/data/slides";

export type Slide = {
  title: string;
  text: string;
  image: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  imageAlt?: string;
  background?: string;
  imgMaxHMobile?: number;
  imgMaxHDesktop?: number;
  imgRightPx?: number;
};

type Props = {
  slides?: Slide[];
  heading?: string;
  subheading?: string;
  options?: EmblaOptionsType;
  autoplay?: boolean;
  autoplayDelayMs?: number;
  className?: string;

  showGlow?: boolean;
  glowColor?: string;
  glowSize?: number;

  mobileImageTop?: boolean;

  mobileSlideMinH?: number;
  imageMaxHMobile?: number;
  imageMaxHDesktop?: number;
  imageRightPx?: number;

  showArrows?: boolean;
  showDots?: boolean;
};

export default function ExpertiseSection({
  slides = EXPERTISE_SLIDES,
  heading = "Экспертиза",
  subheading = "Наша команда проводит комплексную диагностику, выявляет проблемы и предлагает решения для оптимизации, безопасности и масштабирования.",
  options,
  autoplay = true,
  autoplayDelayMs = 10000,
  className = "",

  showGlow = false,
  glowColor = "#FFEE53",
  glowSize = 200,

  mobileImageTop = true,

  imageMaxHMobile = 300,
  imageMaxHDesktop = 480,
  imageRightPx = 50,

  showArrows = true,
  showDots = true,
}: Props) {
  const plugins = useMemo(
    () =>
      autoplay
        ? [Autoplay({ delay: autoplayDelayMs, stopOnInteraction: false })]
        : [],
    [autoplay, autoplayDelayMs]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", ...options },
    plugins
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
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi?.off("select", onSelect);
      emblaApi?.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  return (
    <section id="expertise" className={`relative w-full font-sans p-4 ${className}`}>
      <div className="mb-12 md:mb-16 relative">
        <SectionTitle heading={heading} subheading={subheading} />
        {showGlow && (
          <div
            className="pointer-events-none hidden md:block absolute rounded-full"
            style={{
              width: glowSize,
              height: glowSize,
              right: -glowSize * 0.25,
              top: 100,
              zIndex: 0,
              background: glowColor,
              opacity: 0.35,
              filter: "blur(128px)",
            }}
          />
        )}
      </div>

      <div
        ref={emblaRef}
        className="overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="Экспертиза — слайдер"
      >
        <div className="flex gap-4 md:gap-5 lg:gap-6">
          {slides.map((s, i) => {
            const mMax = s.imgMaxHMobile ?? imageMaxHMobile;
            const dMax = s.imgMaxHDesktop ?? imageMaxHDesktop;
            const dRight = s.imgRightPx ?? imageRightPx;

            const showImgDesktop = Boolean(s.image);
            const showImgMobile = Boolean(s.image) && i !== 0;

            return (
              <div key={i} className="flex-[0_0_100%] flex justify-center">
                <article
                  className="
      relative w-full max-w-[360px] md:max-w-full
      h-[1024px] md:h-[520px] lg:h-[560px]
      rounded-[24px] md:rounded-[28px]
      p-4 md:p-8 lg:p-9
      text-white shadow-[0_8px_40px_rgba(0,0,0,0.35)]
      overflow-hidden flex flex-col
    "
                  style={{
                    background:
                      s.background ?? "linear-gradient(280.68deg, #054277 1.65%, #01192A 97.64%)",
                  }}
                >
                  {/* Мобильная версия */}
                  <div className="md:hidden flex flex-col items-center">
                    {mobileImageTop && showImgMobile && (
                      <img
                        src={s.image}
                        alt={s.imageAlt ?? ""}
                        className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
                        style={{ maxHeight: `${mMax}px` }} // <- используем mMax
                      />
                    )}

                    <h3 className="mt-4 text-[24px] sm:text-[28px] font-bold">{s.title}</h3>
                    <p className="mt-2 text-[14px] text-center">{s.text}</p>
                    <CTAButtons primary={s.primary} secondary={s.secondary} />
                  </div>

                  {/* Десктопная версия */}
                  <div className="hidden md:flex h-full items-center gap-8 relative">
                    <div className="flex-1 ml-20">
                      <h3 className="text-[32px] lg:text-[40px] font-bold">{s.title}</h3>
                      <p className="mt-4 text-[15px] text-white font-light">{s.text}</p>
                      <CTAButtons primary={s.primary} secondary={s.secondary} />
                    </div>

                    {showArrows && (
                      <>
                        <button
                          onClick={() => emblaApi?.scrollPrev()}
                          aria-label="Предыдущий слайд"
                          className="absolute top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white text-[#03CEA4] flex items-center justify-center hover:bg-white/90 active:scale-95 transition"
                        >
                          <ChevronLeft />
                        </button>
                        {showImgDesktop && (
                          <div className="flex-1 flex justify-end relative">
                            <img
                              src={s.image}
                              alt={s.imageAlt ?? ""}
                              className="object-contain"
                              style={{ maxHeight: `${dMax}px`, marginRight: `${dRight}px` }}
                            />
                          </div>
                        )}
                        <button
                          onClick={() => emblaApi?.scrollNext()}
                          aria-label="Следующий слайд"
                          className="absolute right-[10px] top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white text-[#03CEA4] flex items-center justify-center hover:bg-white/90 active:scale-95 transition"
                        >
                          <ChevronRight />
                        </button>
                      </>
                    )}
                  </div>

                </article>
              </div>

            );
          })}
        </div>
      </div>

      {showDots && (
        <div className="mt-4 hidden md:flex w-full items-center justify-center gap-2" aria-label="Навигация по слайдам">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              aria-label={`Перейти к слайду ${i + 1}`}
              aria-current={selectedIndex === i}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition ${selectedIndex === i ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CTAButtons({ primary, secondary }: { primary?: { label: string; href: string }; secondary?: { label: string; href: string }; center?: boolean }) {
  if (!primary && !secondary) return null;

  const secondaryHref = secondary?.href ?? `${import.meta.env.BASE_URL}assets/check-lists/check-list_1.pdf`;
  const isPdf = /\.pdf($|\?)/i.test(secondaryHref);

  return (
    <div className={`mt-4 md:mt-6 flex flex-wrap gap-3`}>
      {primary && <Button size="lg" href="#contact">{primary.label}</Button>}
      {secondary && (
        <a href={secondaryHref} {...(isPdf ? { download: "" } : {})} className="inline-block">
          <Button size="lg" variant="outline">{secondary.label}</Button>
        </a>
      )}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
