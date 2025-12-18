// Universal slug converter (category, name, brand etc)
export function slugify(text: string = "") {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Product slug (name + id)
export function generateSlug(name: string, id: string) {
  return `${slugify(name)}-${id}`;
}