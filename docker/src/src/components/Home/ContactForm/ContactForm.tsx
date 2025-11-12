import { useEffect, useRef } from "react"
import { Button } from "../../ui"
import { useContactForm } from "./features/useContactForm"

declare global {
  interface Window {
    turnstile?: {
      render?: (el: HTMLElement, opts: Record<string, unknown>) => void
      reset?: () => void
    }
  }
}

export default function ContactForm() {
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
  } = useContactForm()

  const formRef = useRef<HTMLFormElement | null>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const tokenRef = useRef<HTMLInputElement | null>(null)
  const renderedRef = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const mountTurnstile = () => {
    const el = widgetRef.current
    const hidden = tokenRef.current
    if (!el || !hidden) return
    if (!window.turnstile?.render) return

    el.innerHTML = ""
    hidden.value = ""

    window.turnstile.render?.(el, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      action: "contact",
      size: "flexible",
      callback(token: string) {
        hidden.value = token
      },
      "expired-callback": () => {
        hidden.value = ""
      },
      "error-callback": () => {
        hidden.value = ""
        console.warn("Turnstile error")
      },
    })
  }

  useEffect(() => {
    if (renderedRef.current) return
    const formEl = formRef.current
    if (!formEl) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !renderedRef.current) {
          renderedRef.current = true

          const tryRender = () => {
            if (window.turnstile?.render) {
              mountTurnstile()
            } else {
              const iv = setInterval(() => {
                if (window.turnstile?.render) {
                  clearInterval(iv)
                  mountTurnstile()
                }
              }, 80)
              const to = setTimeout(() => clearInterval(iv), 8000)
              return () => {
                clearInterval(iv)
                clearTimeout(to)
              }
            }
          }

          tryRender()
          observerRef.current?.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observerRef.current.observe(formEl)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [TURNSTILE_SITE_KEY])

  // Если sitekey сменится на лету — перерисуем виджет
  useEffect(() => {
    if (renderedRef.current && window.turnstile?.render) {
      mountTurnstile()
    }
  }, [TURNSTILE_SITE_KEY])

  return (
    <section
      id="contact"
      className="relative bg-transparent py-12 md:py-16 lg:py-20 flex items-center justify-center px-4 sm:px-5"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="relative z-10 w-full max-w-[720px] bg-[#010C15]/60 backdrop-blur-2xl rounded-2xl border border-white/15 p-5 sm:p-6 md:p-8 lg:p-10 shadow-xl text-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 w-[320px] h-[320px] bg-[#6A5ACD] rounded-full opacity-30 blur-[200px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-24 -right-24 w-[240px] h-[90px] bg-[#03CEA4] rounded-full opacity-40 blur-[140px]"
        />

        <div className="relative z-10 text-center space-y-3 sm:space-y-4">
          <h2 className="text-[22px] sm:text-3xl md:text-4xl font-semibold tracking-tight">
            Связаться с нами
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/70">
            Заполните форму — подберём решение под вашу задачу
          </p>
        </div>

        {/* статус отправки */}
        {status !== "idle" && (
          <div
            role="status"
            className={`mt-5 rounded-xl px-4 py-3 text-sm ${
              status === "success"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                : "bg-rose-500/15 text-rose-300 border border-rose-400/30"
            }`}
          >
            {notice}
          </div>
        )}

        {/* поля */}
        <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <label className="block">
            <span className="sr-only">Имя</span>
            <input
              name="name"
              type="text"
              placeholder="Имя"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              autoComplete="name"
              className="w-full rounded-xl bg-[#1F2733]/80 text-white placeholder:text-white/50 px-4 sm:px-5 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </label>

          <div className="flex items-stretch">
            <label className="sr-only" htmlFor="countryCode">
              Код страны
            </label>
            <select
              id="countryCode"
              value={formData.countryCode}
              onChange={handleCodeChange}
              className="rounded-l-2xl bg-[#1F2733]/80 text-white px-4 sm:px-5 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Код страны"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code} title={`${c.name} (${c.code})`}>
                  {c.code}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="phone">
              Номер телефона
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="Номер телефона"
              value={formData.phone}
              onChange={handlePhoneChange}
              autoComplete="tel"
              required
              className="w-full rounded-r-2xl bg-[#1F2733]/80 text-white placeholder:text-white/50 px-4 sm:px-5 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <label className="block sm:col-span-2">
            <span className="sr-only">Сообщение</span>
            <textarea
              name="message"
              placeholder="Опишите ваш вопрос"
              value={formData.message}
              onChange={handleChange}
              minLength={0}
              className="relative z-10 mt-1 w-full min-h-[120px] sm:min-h-[140px] md:min-h-[180px] rounded-xl bg-[#1F2733]/80 text-white placeholder:text-white/50 px-4 sm:px-5 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-white/20 resize-y"
            />
          </label>
        </div>

        <div className="mt-5 sm:mt-6">
          <div
            ref={widgetRef}
            className="w-full max-w-full overflow-hidden [--ts-gap:0] -ml-1 scale-[0.98] sm:ml-0 sm:scale-100"
          />
          <input ref={tokenRef} type="hidden" name="cfTurnstileToken" />

          {/* honeypot */}
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

          <input type="hidden" name="ts" value={startTs} />

          <noscript>
            <div className="mt-3 text-sm text-rose-300">
              Для отправки формы требуется включить JavaScript.
            </div>
          </noscript>
        </div>

        <div className="relative z-10 mt-4 sm:mt-5">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              className="mt-1 w-5 h-5 rounded-md border border-white/30 bg-[#1F2733]/80 accent-[#03CEA4] focus:outline-none "
              aria-required="true"
            />
            <label htmlFor="consent" className="text-xs sm:text-sm leading-relaxed text-white/80 select-none">
              Я даю согласие на обработку моих персональных данных и принимаю условия{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/30 hover:decoration-white/60"
              >
                Политики конфиденциальности
              </a>{" "}
              и{" "}
              <a
                href="/offer"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/30 hover:decoration-white/60"
              >
                Пользовательского соглашения
              </a>
              .
            </label>
          </div>
        </div>

        <div className="relative z-10 pt-4 sm:pt-5 flex flex-col items-center gap-2">
          <Button
            size="md"
            className="w-full sm:w-auto transition-shadow hover:shadow-[0_0_20px_#03CEA4]"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Отправка..." : "Отправить"}
          </Button>
        </div>
      </form>
    </section>
  )
}
