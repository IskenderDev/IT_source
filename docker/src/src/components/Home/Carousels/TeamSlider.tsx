import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Command from './images/command/IMG_3799.jpg'
import Aleksandr from './images/command/aleksandr-ostashenko.jpg'
import Anatoliy from './images/command/anatoliy-kolomeytsev.jpg'
import Evgeniy from './images/command/evgeniy-makarov.jpg'
import Pavel from './images/command/pavel-makarov.jpg'
import Ruslan from './images/command/ruslan-koso-ogly.jpg'
import Uluqbek from './images/command/uluqbek-tenizbaev.jpg'

type TeamMember = {
  name: string;
  role: string;
  img: string;
};

// Массивы сотрудников с реальными импортами изображений

const teamTop: TeamMember[] = [
  {
    name: "Анатолий Коломейцев",
    role: "Технический директор",
    img: Anatoliy,
  },
  {
    name: "Макаров Евгений",
    role: "Операционный директор",
    img: Evgeniy,
  },
  {
    name: "Данилов Александр",
    role: "Коммерческий директор",
    img: Aleksandr,
  },
];

const teamBottom: TeamMember[] = [
  {
    name: "Тенизбаев Улукбек",
    role: "IT специалист",
    img: Uluqbek,
  },
  {
    name: "Косо Оглы Руслан",
    role: "IT специалист",
    img: Ruslan,
  },
  {
    name: "Осташенко Александр",
    role: "Координатор",
    img: Aleksandr,
  },
  {
    name: "Макаров Павел",
    role: "Начальник IT-отдела",
    img: Pavel,
  },
];


const TeamSlider: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 8000, stopOnInteraction: false })]
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
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  return (
    <section className="w-full py-10 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок секции, если нужен */}
        <div className="md:mb-12 text-center">
          <p className="text-sm mb-10 md:text-base text-white/80 max-w-2xl mx-auto">
            Люди, которые каждый день отвечают за стабильную работу сервиса и
            развитие компании.
          </p>
        </div>

        {/* Слайдер */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {/* СЛАЙД 1 — большая фотка + текст */}
            <div className="flex-[0_0_100%]">
              <article
                className="
                  relative w-full
                  min-h-[260px] sm:min-h-[320px] md:min-h-[360px]
                  rounded-[24px] md:rounded-[28px]
                  px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12
                  text-white
                  flex flex-col md:flex-row items-center gap-8 md:gap-10
                  bg-gradient-to-br from-[#041c31] via-[#031223] to-[#01070f]
                  border border-white/10
                "
              >
                {/* Текстовая часть */}
                <div className="w-full md:w-1/2 flex flex-col gap-2 text-center md:text-left text-lg sm:text-xl md:text-2xl leading-relaxed">
                  <p>Уже больше 10 лет мы создаём надёжную</p>
                  <p className="text-[#49d7bf]">ИТ-инфраструктуру для бизнеса любого масштаба.</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-1 text-base sm:text-lg">
                    <p>Команда</p>
                    <p className="text-[#49d7bf]">IT Source</p>
                    <p>— инженеры, архитекторы</p>
                  </div>
                  <p>цифровой инфраструктуры, которые знают, как</p>
                  <p>превратить сложные системы в работающие решения.</p>
                </div>

                {/* Фото */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[460px] lg:max-w-[520px]">
                    <div className="aspect-[4/3] rounded-[18px] border border-white/10 overflow-hidden shadow-xl">
                      <img
                        src={Command}
                        alt="Наша команда"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>

                {/* Стрелки */}
                <NavButtons
                  onPrev={() => emblaApi?.scrollPrev()}
                  onNext={() => emblaApi?.scrollNext()}
                />
              </article>
            </div>

            {/* СЛАЙД 2 — блок команды (3 сверху, 4 снизу) */}
            <div className="flex-[0_0_100%]">
              <article
                className="
    relative w-full
    min-h-[520px]
    rounded-[24px] md:rounded-[28px]
    px-4 py-8 sm:px-6 md:px-8 md:py-10
    text-white
    flex flex-col items-center gap-12
    bg-gradient-to-bl from-[#031a2d] via-[#021224] to-[#010810]
    border border-white/10
  "
              >
                <div className="flex w-full flex-col items-center gap-12">
                  {/* Верхний ряд */}
                  <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
                    {teamTop.map((person, i) => (
                      <TeamCard key={`top-${i}`} member={person} />
                    ))}
                  </div>

                  {/* Нижний ряд */}
                  <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
                    {teamBottom.map((person, i) => (
                      <TeamCard key={`bottom-${i}`} member={person} />
                    ))}
                  </div>
                </div>


                {/* Стрелки */}
                <NavButtons
                  onPrev={() => emblaApi?.scrollPrev()}
                  onNext={() => emblaApi?.scrollNext()}
                />
              </article>
            </div>
          </div>
        </div>

        {/* Точки-переключатели */}
        <div className="mt-6 flex w-full items-center justify-center gap-2">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Перейти к слайду ${i + 1}`}
              className={`h-1.5 rounded-full transition ${selectedIndex === i
                ? "w-8"
                : "w-1.5 "
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className="flex w-full flex-col items-center text-center max-w-[240px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[260px] mx-auto">
    <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] rounded-full overflow-hidden mb-4 border border-white/10 shadow-lg">
      <img
        src={member.img}
        alt={member.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <p className="text-xs sm:text-sm text-white/70 tracking-[0.08em] uppercase mb-1">
      {member.role}
    </p>
    <p className="text-sm sm:text-base text-white leading-snug">{member.name}</p>
  </div>
);

const NavButtons: React.FC<{ onPrev: () => void; onNext: () => void }> = ({
  onPrev,
  onNext,
}) => (
  <>
    <button
      onClick={onPrev}
      aria-label="Предыдущий слайд"
      className="
        hidden md:flex absolute left-4 top-1/2 -translate-y-1/2
        h-11 w-11 rounded-full bg-white text-[#03CEA4]
        items-center justify-center hover:bg-white/90 active:scale-95 transition
      "
    >
      <ChevronLeft />
    </button>

    <button
      onClick={onNext}
      aria-label="Следующий слайд"
      className="
        hidden md:flex absolute right-4 top-1/2 -translate-y-1/2
        h-11 w-11 rounded-full bg-white text-[#03CEA4]
        items-center justify-center hover:bg-white/90 active:scale-95 transition
      "
    >
      <ChevronRight />
    </button>
  </>
);

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
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
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
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default TeamSlider;
