export const onRequest = async ({ request: req }: { request: Request }) => {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET" },
    });
  }

  try {
    const url = new URL(req.url).searchParams.get("url");

    if (!url) {
      return Response.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const targetUrl = decodeURIComponent(url);

    const match = targetUrl.match(/(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/i);
    if (!match) {
      return Response.json({ error: "Invalid X/Twitter status URL" }, { status: 400 });
    }

    const tweetId = match[1];
    const res = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
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