export type Status = "idle" | "success" | "error";

export type LeadOk = { ok: true; leadId: number; leadUrl?: string };
export type LeadFail = { ok: false; error: string; raw?: unknown };
export type LeadResponse = LeadOk | LeadFail;

export function isErrorLike(x: unknown): x is { message?: string } {
  return typeof x === "object" && x !== null && "message" in x;
}

export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

export function apiUrl(path: string) {
  return `${String(API_BASE).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

export const COUNTRY_CODES = [
  { code: "+996", name: "Кыргызстан" },
  { code: "+7",   name: "Казахстан/Россия" },
  { code: "+998", name: "Узбекистан" },
  { code: "+992", name: "Таджикистан" },
  { code: "+993", name: "Туркменистан" },
  { code: "+994", name: "Азербайджан" },
  { code: "+995", name: "Грузия" },
  { code: "+374", name: "Армения" },
  { code: "+90",  name: "Турция" },
  { code: "+380", name: "Украина" },
];
