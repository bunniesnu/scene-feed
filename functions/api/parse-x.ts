export const onRequest = async ({ request: req }: { request: Request }) => {
  try {
    const reqUrl = new URL(req.url);
    const body = req.method !== "GET" ? await req.json().catch(() => ({})) : {};
    const targetUrl = reqUrl.searchParams.get("url") || body.url;

    if (!targetUrl) {
      return Response.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const match = targetUrl.match(/(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/i);
    if (!match) {
      return Response.json({ error: "Invalid X/Twitter status URL" }, { status: 400 });
    }

    const tweetId = match[1];
    const res = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
    if (!res.ok) {
      return Response.json({ error: "Failed to fetch tweet data" }, { status: res.status });
    }

    const data = (await res.json()) as {
      code: number;
      message: string;
      tweet?: {
        text: string;
        created_timestamp?: number;
        author?: {
          name: string;
          url: string;
        };
      };
    };

    const tweet = data.tweet;
    if (!tweet) {
      return Response.json({ error: data.message || "Tweet not found" }, { status: 404 });
    }

    // FxTwitter already strips the trailing pic.twitter.com media link
    const cleanCaption = tweet.text?.trim() ?? null;

    const timestamp = tweet.created_timestamp
      ? new Date(tweet.created_timestamp * 1000).toISOString()
      : new Date(Number((BigInt(tweetId) >> 22n) + 1288834974657n)).toISOString();

    return Response.json({
      caption: cleanCaption,
      author: tweet.author?.name ?? null,
      authorUrl: tweet.author?.url ?? null,
      timestamp,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
};