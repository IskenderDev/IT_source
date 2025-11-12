import type { MouseEvent } from "react"

const DEFAULT_OFFSET = 80

const supportsMatchMedia =
  typeof window !== "undefined" && typeof window.matchMedia === "function"

function prefersReducedMotion() {
  return supportsMatchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function normalizeHashTarget(href: string): string | null {
  if (!href) return null
  if (href.startsWith("/#")) return href.slice(2) || null
  if (href.startsWith("#")) return href.slice(1) || null
  return null
}

export type ScrollOptions = {
  offset?: number
}

export function scrollToId(id: string, { offset = DEFAULT_OFFSET }: ScrollOptions = {}): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") return false
  if (!id) return false
  const el = document.getElementById(id)
  if (!el) return false
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" })
  return true
}
export function handleHashLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  options?: ScrollOptions
): boolean {
  const id = normalizeHashTarget(href)
  if (!id) return false
  event.preventDefault()
  return scrollToId(id, options)
}
