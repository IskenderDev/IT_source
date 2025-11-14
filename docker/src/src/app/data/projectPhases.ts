export type Stage = {
  number: number;
  title: string;
  subtitle: string;
  icon?: string
};

export const DEFAULT_STAGES: Stage[] = [
  {
    number: 1,
    title: "Анализ требований",
    subtitle: "изучение задач и особенностей объекта",
    icon: `${import.meta.env.BASE_URL}assets/icons/analytics.png`,
  },
  {
    number: 2,
    title: "Проектирование",
    subtitle: "создание технической документации и схем",
    icon: `${import.meta.env.BASE_URL}assets/icons/project.png`,
  },
  {
    number: 3,
    title: "Поставка оборудования",
    subtitle: "подбор совместимых и надежных решений",
    icon: `${import.meta.env.BASE_URL}assets/icons/server.png`,
  },
  {
    number: 4,
    title: "Монтаж и настройка",
    subtitle: "профессиональная установка силами сертифицированных специалистов",
    icon: `${import.meta.env.BASE_URL}assets/icons/settings.png`,
  },
  {
    number: 5,
    title: "Тестирование",
    subtitle: "комплексная проверка работоспособности систем",
    icon: `${import.meta.env.BASE_URL}assets/icons/test.png`,
  },
  {
    number: 6,
    title: "Обучение и поддержка",
    subtitle: "передача проекта заказчику с полной документацией, поддержка и техобслуживание",
    icon: `${import.meta.env.BASE_URL}assets/icons/help.png`,
  },
];
