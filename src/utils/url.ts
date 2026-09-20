export function cleanUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl)
    const trackingParams = [
      "igsh", "utm_source", "utm_medium", "utm_campaign",
      "utm_term", "utm_content", "s", "t", "ref_src"
    ]
    trackingParams.forEach((param) => parsed.searchParams.delete(param))
    return parsed.toString()
  } catch {
    return rawUrl
  }
}

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

export function isXUrl(urlStr: string): boolean {
  try {
    const { hostname, pathname } = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    const host = hostname.replace(/^www\./, "");
    return (host === "x.com" || host === "twitter.com") && /^\/[^/]+\/status\/\d+/.test(pathname);
  } catch {
    return false;
  }
}

export function isYouTubeUrl(urlStr: string): boolean {
  try {
    const url = new URL(
      urlStr.startsWith("http") ? urlStr : `https://${urlStr}`,
    )
    const host = url.hostname.replace(/^www\./, "")
    const path = url.pathname

    if (!["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) {
      return false
    }

    if (host === "youtu.be") return /^\/[\w-]{11}$/.test(path)
    if (path === "/watch") return /^[\w-]{11}$/.test(url.searchParams.get("v") ?? "")
    if (/^\/(?:shorts|live)\/[\w-]{11}$/.test(path)) return true
    if (path === "/playlist") return /^[\w-]+$/.test(url.searchParams.get("list") ?? "")
    if (/^\/(?:post|channel)\/[\w@.-]+$/.test(path)) return true
    if (/^\/(?:@|c\/|user\/)[\w@.-]+$/.test(path)) return true

    return false
  } catch {
    return false
  }
}