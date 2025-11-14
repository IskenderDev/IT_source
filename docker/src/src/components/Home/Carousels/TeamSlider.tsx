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
      <div className=" mx-auto px-4">
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
                  min-h-[200px] md:min-h-[300px]
                  rounded-[24px] md:rounded-[28px]
                  px-6 py-8 md:px-10 md:py-12
                  text-white
                  flex flex-col md:flex-row items-center gap-8 md:gap-10
                "
                style={{
                  background:
                    "",
                }}
              >
                {/* Текстовая часть */}
                <div className="w-full flex flex-col gap-2 text-center text-2xl ml-5 md:w-1/2">
                  <p>
                    Уже больше 10 лет мы создаём надёжную
                  </p>
                  <p className="text-[#49d7bf]">ИТ-инфраструктуру для бизнеса любого масштаба.</p>
                  <div className="flex gap-2 justify-center">
                    <p>Команда</p>
                    <p className="text-[#49d7bf]">IT Source</p>
                    <p> - инженеры, архитекторы</p>
                  </div>
                  <p>цифровой инфраструктуры, которые знают, как</p>
                  <p>превратить сложные системы в работающие решения.</p>
                </div>

                {/* Фото */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative w-[420px] h-[340px] sm:w-[480px] sm:h-[380px] md:w-[520px] md:h-[400px]">
                    <div className="absolute inset-0 rounded-[12%] " />
                    <img
                      src={Command}
                      alt="Наша команда"
                      className="
      relative z-10 w-full h-full object-cover
      rounded-[10%]
      border border-white/15
    "
                      loading="lazy"
                    />
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
    px-4 py-8 md:px-8 md:py-10
    text-white
    flex flex-col items-center gap-12
    -translate-y-[40px] md:-translate-y-[60px]
  "
              >
                <div className="flex flex-col items-center gap-16 -translate-y-[20px] md:-translate-y-[-20px]">
                  {/* Верхний ряд — немного приподнят */}
                  <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-24 -translate-y-[-20px]">
                    {teamTop.map((person, i) => (
                      <TeamCard key={i} member={person} />
                    ))}
                  </div>

                  {/* Нижний ряд — чуть ближе к центру */}
                  <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-20 -translate-y-[20px]">
                    {teamBottom.map((person, i) => (
                      <TeamCard key={i} member={person} />
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
  <div className="flex flex-col items-center text-center w-[260px]">
    <div className="w-[180px] h-[180px] rounded-full overflow-hidden mb-4">
      <img
        src={member.img}
        alt={member.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <p className="text-sm text-white/80 tracking-[0.06em] uppercase mb-1">
      {member.role}
    </p>
    <p className="text-base text-white">{member.name}</p>
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
