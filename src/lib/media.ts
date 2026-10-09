export function isUsableMediaUrl(url: string): boolean {
  if (!url) return false
  if (url.includes('example.com')) return false
  if (url.includes('placeholder')) return false
  return /^https?:\/\//i.test(url)
}
