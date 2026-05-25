// Gallery helpers — handle both legacy strings and {url, caption, year} objects

export const galleryUrl     = (item) => typeof item === "string" ? item : (item?.url     || "");
export const galleryCaption = (item) => typeof item === "string" ? "" : (item?.caption || "");
export const galleryYear    = (item) => typeof item === "string" ? null : (item?.year   || null);

// Group gallery by year (desc), items without year go last.
// Returns { groups: [{year, items}], flat: [...allItemsSorted] }
export function computeGallery(gallery) {
  const byYear = {};
  gallery.forEach(item => {
    const y = galleryYear(item) || 0; // 0 = no year
    (byYear[y] = byYear[y] || []).push(item);
  });
  const sortedKeys = Object.keys(byYear).map(Number)
    .sort((a, b) => a === 0 ? 1 : b === 0 ? -1 : b - a);
  const groups = sortedKeys.map(y => ({ year: y || null, items: byYear[y] }));
  const flat = groups.flatMap(g => g.items);
  return { groups, flat };
}
