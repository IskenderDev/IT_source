import { useMemo, useState } from "react"
import {
  apiUrl,
  COUNTRY_CODES,
  isErrorLike,
  TURNSTILE_SITE_KEY,
  type LeadFail,
  type LeadResponse,
  type Status,
} from "./types"

type FormDataShape = {
  name: string
  countryCode: string
  phone: string
  message: string
}

function normalizedPhone(raw: string) {
  return raw.replace(/[^\d]/g, "")
}

export function useContactForm() {
  const [formData, setFormData] = useState<FormDataShape>({
    name: "",
    countryCode: "+996",
    phone: "",
    message: "",
  })

  const [status, setStatus] = useState<Status>("idle")
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState("")
  const [startTs] = useState(() => Date.now().toString())

  const initialUtm = useMemo(() => {
    if (typeof window === "undefined") return {}
    const qs = new URLSearchParams(window.location.search)
    return Object.fromEntries(qs.entries())
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((s) => ({ ...s, [name]: value }))
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/[^\d]/g, "")
    setFormData((s) => ({ ...s, phone: digitsOnly }))
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFormData((s) => ({ ...s, countryCode: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setStatus("idle")
    setNotice("")

    const form = e.currentTarget
    const tokenEl = form.querySelector('input[name="cfTurnstileToken"]') as HTMLInputElement | null
    const turnstileToken = tokenEl?.value || ""

    if (!turnstileToken) {
      setLoading(false)
      setStatus("error")
      setNotice("Подтвердите, что вы не робот.")
      return
    }

    const name = formData.name.trim()
    const phoneDigits = normalizedPhone(formData.phone)

    if (name.length < 2) {
      setLoading(false)
      setStatus("error")
      setNotice("Укажите корректное имя (минимум 2 символа).")
      return
    }
    if (phoneDigits.length < 6) {
      setLoading(false)
      setStatus("error")
      setNotice("Проверьте номер телефона.")
      return
    }

    try {
      const fullPhone = `${formData.countryCode} ${phoneDigits}`
      const body = {
        name,
        phone: fullPhone,
        message: formData.message.trim(),
        page: typeof window !== "undefined" ? window.location.href : "",
        utm: initialUtm,
        cfTurnstileToken: turnstileToken,
        ts: startTs,
        company: "",
      }

      const r = await fetch(apiUrl("b24-lead.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      })

      let data: LeadResponse | null = null
      const contentType = r.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        try { data = (await r.json()) as LeadResponse } catch { data = null }
      }

      if (!r.ok) {
        const msg = (data && "error" in data && data.error) || `HTTP ${r.status}`
        throw new Error(msg)
      }

      if (data && data.ok) {
        setStatus("success")
        setNotice("Благодарим за ваше обращение, мы свяжемся с вами в ближайшее рабочее время!")
        setFormData({ name: "", countryCode: "+996", phone: "", message: "" })
      } else if (data && !data.ok) {
        console.error("Bitrix24 error:", (data as LeadFail).error, (data as LeadFail).raw)
        setStatus("error")
        setNotice("Ошибка отправки. Попробуйте позже.")
      } else {
        setStatus("success")
        setNotice("Благодарим за ваше обращение, мы свяжемся с вами в ближайшее рабочее время!")
        setFormData({ name: "", countryCode: "+996", phone: "", message: "" })
      }
    } catch (err: unknown) {
      console.error("Network/API error:", isErrorLike(err) ? err.message : String(err))
      setStatus("error")
      setNotice("Ошибка сети. Попробуйте позже.")
    } finally {
      setLoading(false)
      if (typeof window !== "undefined") window.turnstile?.reset?.()
    }
  }

  return {
    formData, setFormData,
    status, loading, notice, startTs,
    handleChange, handlePhoneChange, handleCodeChange, handleSubmit,
    COUNTRY_CODES, TURNSTILE_SITE_KEY,
  }
}
