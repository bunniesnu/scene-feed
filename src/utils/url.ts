export function isInstagramUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr)

    const isInstagram = /(?:^|\.)instagram\.com$/.test(parsed.hostname)
    const isPost = /^\/(?:[\w.-]+\/)?(?:p|reel|tv|stories)\/[\w-]+/.test(parsed.pathname)

    return isInstagram && isPost
  } catch {
    return false
  }
}