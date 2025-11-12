import { useEffect, useRef } from "react";
import { FaServer } from "react-icons/fa";
import { useContactForm } from "../../Home/ContactForm/features/useContactForm";
import { Button } from "../../ui";

declare global {
  interface Window {
    turnstile?: {
      render?: (el: HTMLElement, opts: Record<string, unknown>) => void;
      reset?: () => void;
    };
  }
}

type CountryItem = { code: string; name: string };

// Фолбэк, если из useContactForm не придут коды
const DEFAULT_COUNTRY_CODES: CountryItem[] = [
  { code: "+996", name: "Kyrgyzstan" },
  { code: "+7",   name: "Russia" },
  { code: "+998", name: "Uzbekistan" },
];

export default function CustomServersSection() {
  const {
    formData,
    status,
    loading,
    notice,
    startTs,
    handleChange,
    handlePhoneChange,
    handleCodeChange,
    handleSubmit,
    COUNTRY_CODES,
    TURNSTILE_SITE_KEY,
  } = useContactForm();

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef<HTMLInputElement | null>(null);
  const renderedRef = useRef(false);

  // безопасные значения
  const codes: CountryItem[] =
    (Array.isArray(COUNTRY_CODES) ? COUNTRY_CODES : DEFAULT_COUNTRY_CODES) as CountryItem[];

  const safeName = formData?.name ?? "";
  const safePhone = formData?.phone ?? "";
  const safeCountry = formData?.countryCode ?? codes[0]?.code ?? "+996";

  useEffect(() => {
    // не трогаем, если уже есть сообщение
    if (!formData?.message) {
      const ev = {
        target: { name: "message", value: "Интересует сборка кастомного сервера." },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      try {
        handleChange?.(ev);
      } catch (e) {
        console.warn("handleChange failed to set default message:", e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.message]);

  useEffect(() => {
    const el = widgetRef.current;
    const hidden = tokenRef.current;
    if (!el || !hidden) return;
    if (renderedRef.current) return;
    renderedRef.current = true;

    const render = () => {
      try {
        window.turnstile?.render?.(el, {
          sitekey: TURNSTILE_SITE_KEY || "", // не даём undefined
          callback(token: string) { hidden.value = token; },
          "expired-callback": () => { hidden.value = ""; },
          "error-callback": () => { hidden.value = ""; console.warn("Turnstile error"); },
          theme: "dark",
          action: "custom-server",
          size: "flexible",
        });
      } catch (e) {
        console.error("Turnstile render failed:", e);
      }
    };

    if (window.turnstile?.render) {
      render();
    } else {
      const iv = setInterval(() => {
        if (window.turnstile?.render) {
          clearInterval(iv);
          render();
        }
      }, 50);
      const to = setTimeout(() => clearInterval(iv), 8000);
      return () => {
        clearInterval(iv);
        clearTimeout(to);
      };
    }
  }, [TURNSTILE_SITE_KEY]);

  return (
    <>
      <style>{`
        .cf-turnstile, .cf-turnstile iframe {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          display: block;
        }
      `}</style>

      <section className="relative bg-[#010B14] py-20 px-6 md:px-12 font-mono text-white">
        <div className="relative z-10 max-w-7xl mx-auto border border-white/10 px-6 md:px-12 bg-[#02111e] backdrop-blur-sm shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-center">
            <div className="space-y-6">
              <FaServer className="text-[#03CEA4] text-3xl" />
              <h2 className="text-2xl md:text-3xl font-semibold">Кастомные серверы</h2>
              <p className="text-white/80 leading-relaxed">
                Серверы, созданные в соответствии с конкретными требованиями
                заказчика, с индивидуальными конфигурациями аппаратного и
                программного обеспечения.
                <br />
                Свяжитесь с нами, чтобы мы собрали для вас кастомный сервер!
              </p>

              {status !== "idle" && (
                <div
                  role="status"
                  className={`mt-2 rounded-xl px-4 py-3 text-sm ${
                    status === "success"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                      : "bg-rose-500/15 text-rose-300 border border-rose-400/30"
                  }`}
                >
                  {notice}
                </div>
              )}
            </div>

            <div className="bg-[#02111e] h-full min-h-[240px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[420px] flex items-center justify-center p-4 md:p-6">
              <img
                src={`${import.meta.env.BASE_URL}assets/custom-server.png`}
                alt="Custom Server"
                className="h-full max-h-full w-auto object-contain"
                loading="lazy"
              />
            </div>

            <form className="flex flex-col gap-4 p-4 md:p-6 shadow-lg h-fit" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="name" className="text-xs md:text-sm text-white/70">Ваше имя</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Как к вам обращаться?"
                  value={safeName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className="w-full bg-[#0e1d29] border border-white/10 px-4 py-3 text-sm placeholder-[#57616a] focus:outline-none focus:ring-2 focus:ring-[#03CEA4]"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <label className="sr-only" htmlFor="countryCode">Код страны</label>
                <select
                  id="countryCode"
                  value={safeCountry}
                  onChange={handleCodeChange}
                  className="bg-[#0e1d29] border border-white/10 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#03CEA4]"
                  aria-label="Код страны"
                >
                  {codes.map((c) => (
                    <option key={c.code} value={c.code} title={`${c.name} (${c.code})`}>
                      {c.code}
                    </option>
                  ))}
                </select>

                <label className="sr-only" htmlFor="phone">Номер телефона</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Номер телефона"
                  value={safePhone}
                  onChange={handlePhoneChange}
                  required
                  className="w-full bg-[#0e1d29] border border-white/10 px-4 py-3 text-sm placeholder-[#57616a] focus:outline-none focus:ring-2 focus:ring-[#03CEA4]"
                />
              </div>

              <div className="mt-5 sm:mt-6">
                <div
                  ref={widgetRef}
                  className="w-full max-w-full overflow-hidden [--ts-gap:0] -ml-1 scale-[0.98] sm:ml-0 sm:scale-100"
                />
                <input ref={tokenRef} type="hidden" name="cfTurnstileToken" />
                <input
                  type="text"
                  name="company"
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                  value=""
                  onChange={() => {}}
                />
                <input type="hidden" name="ts" value={startTs ?? ""} />
                <noscript>
                  <div className="mt-3 text-sm text-rose-300">
                    Для отправки формы требуется включить JavaScript.
                  </div>
                </noscript>
              </div>

              <Button
                size="lg"
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="mt-auto w-full py-3 text-[#010B14] font-semibold bg-gradient-to-r from-[#03CEA4] to-[#00FFC6] transition-transform hover:scale-105 disabled:opacity-60"
              >
                {loading ? "Отправка..." : "Отправить"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
