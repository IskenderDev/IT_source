function ensureDocument() {
  return typeof document !== "undefined" ? document : null;
}

function setMetaTag(attribute: "name" | "property", key: string, value: string) {
  const doc = ensureDocument();
  if (!doc) return;
  const selector = `meta[${attribute}="${key}"]`;
  let tag = doc.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = doc.createElement("meta");
    tag.setAttribute(attribute, key);
    doc.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

export function setPageTitle(title: string) {
  const doc = ensureDocument();
  if (!doc) return;
  doc.title = title;
}

export function updateMetaName(name: string, content: string) {
  setMetaTag("name", name, content);
}

export function updateMetaProperty(property: string, content: string) {
  setMetaTag("property", property, content);
}
