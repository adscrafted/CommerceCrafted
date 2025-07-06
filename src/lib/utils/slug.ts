export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, '') // Remove trailing hyphens
}

export function generateProductSlug(title: string, asin?: string): string {
  const titleSlug = generateSlug(title)
  // Optionally append a portion of the ASIN for uniqueness
  if (asin) {
    const shortAsin = asin.slice(-4).toLowerCase()
    return `${titleSlug}-${shortAsin}`
  }
  return titleSlug
}