// src/components/common/WhatsAppFab.tsx
import { useMemo } from "react";
// если нет react-icons, см. вариант с inline SVG ниже
import { FaWhatsapp } from "react-icons/fa";

type Props = {
  /** Номер в формате 996XXXYYYZZZ (без +, пробелов и скобок) */
  phone?: string;
  /** Предзаполненный текст сообщения */
  message?: string;
  className?: string;
};

export default function WhatsAppFab({
  phone = import.meta.env.VITE_WHATSAPP_PHONE, // можно задать через .env
  message = "Здравствуйте! Хочу получить консультацию.",
  className = "",
}: Props) {
  const href = useMemo(() => {
    const digits = (phone || "").replace(/\D/g, "");
    const text = encodeURIComponent(message || "");
    // Универсальная ссылка: на телефоне откроет приложение, на десктопе — Web WhatsApp
    return digits
      ? `https://wa.me/${digits}?text=${text}`
      : `https://wa.me/?text=${text}`;
  }, [phone, message]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в WhatsApp"
      className={[
        "fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50",
        "inline-flex items-center justify-center",
        "h-14 w-14 md:h-16 md:w-16 rounded-full",
        "bg-[#25D366] text-white shadow-xl ring-1 ring-black/5",
        "transition-transform hover:scale-105 hover:shadow-2xl",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40",
        "pb-[env(safe-area-inset-bottom)]", // безопасная зона iOS
        className,
      ].join(" ")}
    >
      <FaWhatsapp className="h-8 w-8 md:h-9 md:w-9" />
      <span className="sr-only">Открыть WhatsApp</span>
    </a>
  );
}
