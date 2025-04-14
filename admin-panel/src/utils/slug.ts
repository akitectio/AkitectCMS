export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalize to decompose diacritics (e.g., accents)
    .replace(/\p{Diacritic}/gu, '') // Remove diacritics using Unicode property escapes
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim() // Trim leading/trailing spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
};