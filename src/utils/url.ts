export function isInstagramUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr)
    return (
      (parsed.hostname === "instagram.com" || parsed.hostname.endsWith(".instagram.com")) &&
      /^\/(p|reel|tv|stories)\/[\w-]+/.test(parsed.pathname)
    )
  } catch {
    return false
  }
}