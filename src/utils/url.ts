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