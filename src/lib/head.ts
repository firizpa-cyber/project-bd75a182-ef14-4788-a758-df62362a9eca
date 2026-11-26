export const pageHead = (title: string, description: string) => ({
  meta: [
    { title: `${title} — Мой склад` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Мой склад` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
